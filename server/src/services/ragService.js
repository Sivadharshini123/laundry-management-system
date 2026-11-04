import { pool } from '../db/index.js';
import { generateLocalEmbedding } from '../../scripts/index-docs.js';
import { config } from '../config.js';

export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchPublicChunks(queryText, topK = 4) {
  const queryEmbedding = generateLocalEmbedding(queryText, config.rag.embeddingDim);

  try {
    // Check if pgvector is available
    const vectorTypeCheck = await pool.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'knowledge_chunks' AND column_name = 'embedding'
    `);
    const isVectorType = vectorTypeCheck.rows.length > 0 && vectorTypeCheck.rows[0].data_type === 'USER-DEFINED';

    if (isVectorType) {
      // Use pgvector cosine distance operator <=>
      const vectorStr = `[${queryEmbedding.join(',')}]`;
      const res = await pool.query(`
        SELECT doc_slug, title, section_heading, content, 
               (1 - (embedding <=> $1::vector)) as similarity
        FROM knowledge_chunks
        WHERE audience = 'public'
        ORDER BY embedding <=> $1::vector ASC
        LIMIT $2
      `, [vectorStr, topK]);

      return res.rows.map(r => ({
        docSlug: r.doc_slug,
        title: r.title,
        heading: r.section_heading,
        content: r.content,
        similarity: parseFloat(r.similarity || '0')
      }));
    }

    // Fallback: in-database/in-memory cosine similarity over public chunks
    const res = await pool.query(`
      SELECT doc_slug, title, section_heading, content, embedding
      FROM knowledge_chunks
      WHERE audience = 'public'
    `);

    const scored = res.rows.map(row => {
      let emb = row.embedding;
      if (typeof emb === 'string') {
        try { emb = JSON.parse(emb); } catch (e) { emb = []; }
      }
      const score = Array.isArray(emb) && emb.length > 0 
        ? cosineSimilarity(queryEmbedding, emb)
        : 0;
      return {
        docSlug: row.doc_slug,
        title: row.title,
        heading: row.section_heading,
        content: row.content,
        similarity: score
      };
    });

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  } catch (err) {
    console.error('Error during RAG search:', err);
    return [];
  }
}

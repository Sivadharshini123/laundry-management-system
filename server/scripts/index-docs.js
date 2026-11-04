import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { pool } from '../src/db/index.js';
import { config } from '../src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deterministic semantic embedding generator (1024-dim unit vector)
// Provides clean cosine similarity without requiring external paid API during local dev/tests
export function generateLocalEmbedding(text, dim = 1024) {
  const vec = new Float64Array(dim);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  
  if (words.length === 0) {
    vec[0] = 1.0;
    return Array.from(vec);
  }

  // Generate word and bi-gram hash projections
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let h1 = 5381;
    for (let c = 0; c < word.length; c++) {
      h1 = ((h1 << 5) + h1) ^ word.charCodeAt(c);
    }
    const idx1 = Math.abs(h1) % dim;
    vec[idx1] += 1.0;

    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let h2 = 5381;
      for (let c = 0; c < bigram.length; c++) {
        h2 = ((h2 << 5) + h2) ^ bigram.charCodeAt(c);
      }
      const idx2 = Math.abs(h2) % dim;
      vec[idx2] += 1.5;
    }
  }

  // Normalize vector to unit length (L2 norm)
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] /= norm;
    }
  }

  return Array.from(vec);
}

// Split markdown into chunks of 200-400 words while preserving section headings
export function chunkMarkdown(content, docTitle) {
  const sections = content.split(/(?=^#{1,3}\s+)/m);
  const chunks = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^#{1,3}\s+(.+)$/m);
    const heading = headingMatch ? headingMatch[1].trim() : docTitle;

    const words = trimmed.split(/\s+/);
    if (words.length <= 400) {
      chunks.push({
        heading,
        content: trimmed
      });
    } else {
      // Split into windows of 250 words
      for (let i = 0; i < words.length; i += 250) {
        const slice = words.slice(i, i + 350).join(' ');
        chunks.push({
          heading,
          content: `${heading}\n\n${slice}`
        });
      }
    }
  }

  return chunks;
}

export async function indexDocuments() {
  const docsDir = path.join(__dirname, '../../docs');
  if (!fs.existsSync(docsDir)) {
    console.error(`Docs directory not found at ${docsDir}`);
    return;
  }

  const client = await pool.connect();
  try {
    console.log('Indexing documentation into knowledge_chunks...');
    
    // Check if knowledge_chunks table has vector type
    const vectorTypeCheck = await client.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'knowledge_chunks' AND column_name = 'embedding'
    `);
    const isVectorType = vectorTypeCheck.rows.length > 0 && vectorTypeCheck.rows[0].data_type === 'USER-DEFINED';

    function scanFiles(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(scanFiles(fullPath));
        } else if (file.endsWith('.md') && file !== 'README.md') {
          results.push(fullPath);
        }
      }
      return results;
    }

    const docFiles = scanFiles(docsDir);
    console.log(`Found ${docFiles.length} markdown documents to index.`);

    for (const filePath of docFiles) {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content } = matter(rawContent);

      const relPath = path.relative(docsDir, filePath).replace(/\\/g, '/');
      const docSlug = relPath.replace(/\.md$/, '');
      const title = frontmatter.title || docSlug;
      const audience = frontmatter.audience || 'public';
      const version = parseInt(frontmatter.version || '1', 10);

      console.log(`Processing [${audience}] ${docSlug} (v${version})`);

      // Delete existing chunks for this document slug
      await client.query('DELETE FROM knowledge_chunks WHERE doc_slug = $1', [docSlug]);

      // Chunk document
      const chunks = chunkMarkdown(content, title);
      for (const chunk of chunks) {
        const embedding = generateLocalEmbedding(chunk.content, config.rag.embeddingDim);
        
        if (isVectorType) {
          // Format vector string for pgvector: '[0.01, 0.02, ...]'
          const vectorStr = `[${embedding.join(',')}]`;
          await client.query(`
            INSERT INTO knowledge_chunks (doc_slug, title, section_heading, audience, version, content, embedding)
            VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
          `, [docSlug, title, chunk.heading, audience, version, chunk.content, vectorStr]);
        } else {
          // Format as JSONB
          await client.query(`
            INSERT INTO knowledge_chunks (doc_slug, title, section_heading, audience, version, content, embedding)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [docSlug, title, chunk.heading, audience, version, chunk.content, JSON.stringify(embedding)]);
        }
      }
      console.log(`  Indexed ${chunks.length} chunks for ${docSlug}`);
    }

    console.log('Documentation indexing completed successfully.');
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  indexDocuments()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error during document indexing:', err);
      process.exit(1);
    });
}

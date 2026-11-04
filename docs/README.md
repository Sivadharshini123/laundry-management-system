# Campus Laundry Knowledge Base & RAG Documentation

This directory contains the markdown documentation that powers the campus laundry knowledge base and the Anthropic Claude RAG (Retrieval-Augmented Generation) assistant.

## Document Front Matter

Every document must begin with YAML front matter specifying the title, intended audience, version number, and review date:

```markdown
---
title: Document Title
audience: public | staff
version: 1
last_reviewed: 2026-11-05
---
```

### Audience Rules
- **public**: Available to students and public search via the AI assistant (`POST /api/chat`). RAG searches are strictly filtered to `audience = 'public'` so staff procedures are never exposed.
- **staff**: Restricted to staff and administrators. Used by campus operations and maintenance teams for audits, reconciliation, and hardware troubleshooting.

## Document Directory Structure
- `policies/`: Public rules on booking, cancellation, refunds, and privacy.
- `machines/`: Machine specifications, cycle durations, slot rules, and status meanings.
- `offline-behavior/`: Guidance on poor connectivity and network resilience.
- `faq/`: Frequently asked questions and answers for students.
- `fabric-care/`: Guidance on sorting, temperature settings, and fabric care.
- `staff-only/`: Internal operational guidelines for machine maintenance and refund reconciliation.

## How to Reindex Documents

When a document is added, modified, or updated:
1. Ensure the YAML front matter is intact with the correct audience and version.
2. From the `server/` directory, run:
   ```bash
   npm run index-docs
   ```
3. The indexing script (`server/scripts/index-docs.js`):
   - Reads every markdown file in `docs/`.
   - Chunks content into semantic sections of 200–400 words while preserving section headings.
   - Computes 1024-dimensional vector embeddings.
   - Deletes old chunks for that document slug and inserts the new version into the `knowledge_chunks` database table.

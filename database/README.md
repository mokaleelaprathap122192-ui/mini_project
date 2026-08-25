# Database Schemas — Cross-Lingual Fairness Audit Platform

This folder contains the reference data definitions and migrations for the
three database layers of the platform.

```
database/
├── mongodb/        Operational store (documents)
│   ├── schemas/    JSON-Schema for each collection (validation)
│   └── migrations/ Index + seeding scripts
├── neo4j/          Knowledge graph (nodes + edges + Cypher constraints)
└── chromadb/       Vector store schema (GraphRAG embeddings)
```

No databases need to be running to demo the frontend — the Next.js app has
high-fidelity mock generators. Use the `backend/` FastAPI services to swap in
live databases when GPU/inference is enabled.

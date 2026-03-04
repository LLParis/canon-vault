# Canon Vault Web

Next.js frontend for Canon Vault.

## Status

The current backend is functional and exposed at `http://localhost:8001`.
The frontend in this directory is still an early shell and does not yet expose the full operator workflow.

## Run

```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Next Step

Phase 3 is to replace the placeholder pages with a real UI that consumes the API for:

- universe selection
- character browsing and detail views
- YAML ingest
- changelog review
- prompt template rendering

### Iacula

## Landing page module

The repository now includes a dedicated web module for the landing page in `web/landing`.

- Run locally: `npm run landing:dev`
- Run tests: `npm run landing:test`
- Build static files: `npm run landing:build`

### Landing page deploy

Changes to `web/landing/**` pushed to `main` automatically trigger a Vercel **preview** deploy via `.github/workflows/landing-vercel-preview.yml`. The workflow can also be triggered manually from the Actions tab (`workflow_dispatch`).

**Required repository secrets:**

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Personal access token from [Vercel Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Team/org ID (run `vercel link` in `web/landing` then check `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Project ID (same file as above) |

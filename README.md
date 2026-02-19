### iacula

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
| `VERCEL_ORG_ID` | Team/org ID (`team_dkmiIFvJlLjV7YFcPAlwHo8L`) |
| `VERCEL_PROJECT_ID` | Project ID (`prj_14mAUOGsGFYiU2IlWJjKCJg9hift`) |

Add these in GitHub repo Settings > Secrets and variables > Actions.

### Iacula

## Linux installation

Each [release](https://github.com/gabrielttavares/iacula/releases) ships two Linux packages:

- **AppImage** (any distro): `chmod +x Iacula-*.AppImage && ./Iacula-*.AppImage`
- **RPM** (Fedora, RHEL, CentOS Stream and other dnf-based distros):

  ```bash
  sudo dnf install ./iacula-*.x86_64.rpm
  ```

  This installs the app to `/opt/Iacula` and adds it to the application menu. To remove it: `sudo dnf remove iacula`.

### Building the RPM locally

First compile the app: `npm ci && npm run prebuild && npx tsc`. Then run `npx electron-builder --linux rpm`, which requires `rpmbuild` (`sudo dnf install rpm-build` or `sudo apt-get install rpm`).
On hosts with rpm >= 4.20 (Fedora 41+), the fpm version bundled with electron-builder 24 fails with `File not found` errors; build inside an Ubuntu container instead, the same way CI does:

```bash
podman run --rm -v "$PWD":/app:Z -w /app ubuntu:24.04 bash -c \
  "apt-get update && apt-get install -y nodejs npm rpm && npx electron-builder --linux rpm --publish never"
```

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

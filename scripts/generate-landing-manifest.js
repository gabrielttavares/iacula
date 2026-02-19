const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    args[key] = value;
    i += 1;
  }
  return args;
}

function findFirst(files, predicate) {
  for (const file of files) {
    if (predicate(file)) {
      return file;
    }
  }
  return null;
}

function main() {
  const args = parseArgs(process.argv);
  const artifactsDir = args['artifacts-dir'];
  const output = args.output;
  const version = args.version || 'latest';
  const fallbackUrl = args['fallback-url'] || 'https://github.com/gabrielttavares/iacula/releases';
  const owner = args.owner || 'gabrielttavares';
  const repo = args.repo || 'iacula';

  if (!artifactsDir || !output) {
    throw new Error('Usage: node scripts/generate-landing-manifest.js --artifacts-dir <dir> --output <path> [--version vX.Y.Z]');
  }

  const files = fs.readdirSync(artifactsDir);
  const normalizedVersion = version.startsWith('v') ? version.slice(1) : version;
  const releaseBase = `https://github.com/${owner}/${repo}/releases/download/${version}`;

  const windowsAsset = findFirst(files, (name) => name.endsWith('.exe') && !name.endsWith('.exe.blockmap'));
  const linuxAsset = findFirst(files, (name) => name.endsWith('.AppImage'));
  const macAsset = findFirst(files, (name) => name.endsWith('.dmg') || name.endsWith('.zip'));

  const manifest = {
    version: normalizedVersion,
    assets: {
      ...(windowsAsset ? { windows: `${releaseBase}/${encodeURIComponent(windowsAsset)}` } : {}),
      ...(linuxAsset ? { linux: `${releaseBase}/${encodeURIComponent(linuxAsset)}` } : {}),
      ...(macAsset ? { macos: `${releaseBase}/${encodeURIComponent(macAsset)}` } : {}),
    },
    fallbackUrl,
  };

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(manifest, null, 2));
  console.log(`[landing-manifest] generated ${output}`);
}

main();

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(cmd, options = {}) {
  return execSync(cmd, {
    stdio: options.stdio || 'pipe',
    encoding: 'utf8',
  });
}

function runCapture(cmd) {
  return run(cmd, { stdio: 'pipe' }).trim();
}

function readPackageVersion() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const content = fs.readFileSync(packagePath, 'utf8');
  const pkg = JSON.parse(content);
  return pkg.version;
}

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported version format "${version}". Expected X.Y.Z`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatSemver(v) {
  return `${v.major}.${v.minor}.${v.patch}`;
}

function bump(version, type) {
  const next = { ...version };
  if (type === 'patch') {
    next.patch += 1;
    return next;
  }
  if (type === 'minor') {
    next.minor += 1;
    next.patch = 0;
    return next;
  }
  if (type === 'major') {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
    return next;
  }
  throw new Error(`Invalid release type "${type}". Use patch, minor, or major.`);
}

function localTagExists(tag) {
  try {
    run(`git rev-parse -q --verify "refs/tags/${tag}"`);
    return true;
  } catch {
    return false;
  }
}

function remoteTagExists(tag) {
  try {
    const output = run(`git ls-remote --tags origin "refs/tags/${tag}"`);
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

function getDirtyFiles() {
  try {
    const output = runCapture('git status --porcelain');
    if (!output) {
      return [];
    }
    return output.split('\n').map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function findNextAvailableVersion(startVersion, type) {
  let candidate = bump(startVersion, type);
  while (true) {
    const version = formatSemver(candidate);
    const tag = `v${version}`;
    if (!localTagExists(tag) && !remoteTagExists(tag)) {
      return version;
    }
    candidate = bump(candidate, 'patch');
  }
}

function main() {
  const releaseType = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');

  if (!releaseType) {
    throw new Error('Missing release type. Use: node scripts/release.js <patch|minor|major>');
  }

  const currentVersion = parseSemver(readPackageVersion());
  const nextVersion = findNextAvailableVersion(currentVersion, releaseType);
  const nextTag = `v${nextVersion}`;

  console.log(`[release] current version: ${formatSemver(currentVersion)}`);
  console.log(`[release] next available version: ${nextVersion}`);
  console.log(`[release] next tag: ${nextTag}`);

  if (dryRun) {
    console.log('[release] dry-run enabled, no changes were made.');
    return;
  }

  const dirtyFiles = getDirtyFiles();
  if (dirtyFiles.length > 0) {
    console.error('[release] aborted: git working tree is not clean.');
    console.error('[release] commit or stash your changes before releasing.');
    console.error('[release] dirty files:');
    for (const file of dirtyFiles) {
      console.error(`  ${file}`);
    }
    process.exit(1);
  }

  run(`npm version ${nextVersion}`, { stdio: 'inherit' });
  run('git push origin main --follow-tags', { stdio: 'inherit' });
}
try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[release] failed: ${message}`);
  process.exit(1);
}

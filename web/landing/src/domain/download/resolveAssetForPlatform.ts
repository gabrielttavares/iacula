import { Platform } from './detectPlatform';
import { DownloadManifest } from './types';

interface DownloadAsset {
  platform: Exclude<Platform, 'unknown'>;
  url: string;
}

export function resolveAssetForPlatform(
  manifest: DownloadManifest,
  platform: Platform,
): DownloadAsset | null {
  if (platform === 'unknown') {
    return null;
  }

  const url = manifest.assets[platform];
  if (!url) {
    return null;
  }

  return { platform, url };
}

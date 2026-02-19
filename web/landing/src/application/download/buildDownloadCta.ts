import { Platform } from '../../domain/download/detectPlatform';
import { resolveAssetForPlatform } from '../../domain/download/resolveAssetForPlatform';
import { DownloadManifest } from '../../domain/download/types';

interface DownloadCta {
  kind: 'download' | 'fallback';
  label: string;
  href: string;
}

const PLATFORM_LABEL: Record<Exclude<Platform, 'unknown'>, string> = {
  windows: 'Baixar para Windows',
  linux: 'Baixar para Linux',
  macos: 'Baixar para macOS',
};

export function buildDownloadCta(
  manifest: DownloadManifest,
  platform: Platform,
  fallbackUrl: string,
): DownloadCta {
  const asset = resolveAssetForPlatform(manifest, platform);

  if (!asset) {
    return {
      kind: 'fallback',
      label: 'Ver downloads',
      href: fallbackUrl,
    };
  }

  return {
    kind: 'download',
    label: PLATFORM_LABEL[asset.platform],
    href: asset.url,
  };
}

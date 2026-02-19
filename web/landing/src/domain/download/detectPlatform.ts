export type Platform = 'windows' | 'linux' | 'macos' | 'unknown';

export function detectPlatform(userAgent: string): Platform {
  const normalizedUserAgent = userAgent.toLowerCase();

  if (normalizedUserAgent.includes('windows')) {
    return 'windows';
  }

  if (normalizedUserAgent.includes('mac os') || normalizedUserAgent.includes('macintosh')) {
    return 'macos';
  }

  if (normalizedUserAgent.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
}

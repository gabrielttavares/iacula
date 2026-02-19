import { Platform } from './detectPlatform';

export interface DownloadManifest {
  version: string;
  assets: Partial<Record<Exclude<Platform, 'unknown'>, string>>;
}

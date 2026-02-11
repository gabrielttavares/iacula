/**
 * Infrastructure: FileSettingsRepository
 * Implementação concreta de ISettingsRepository usando sistema de arquivos.
 */

import fs from 'fs';
import path from 'path';
import { ISettingsRepository } from '../../application/ports/ISettingsRepository';
import { Settings, SettingsProps } from '../../domain/entities/Settings';

export class FileSettingsRepository implements ISettingsRepository {
  private readonly configPath: string;

  constructor(userDataPath: string) {
    this.configPath = path.join(userDataPath, 'config.json');
  }

  async load(): Promise<Settings> {
    try {
      if (!fs.existsSync(this.configPath)) {
        console.log('Config file not found, creating default settings');
        const defaultSettings = Settings.create({});
        await this.save(defaultSettings);
        return defaultSettings;
      }

      const configData = fs.readFileSync(this.configPath, 'utf-8');
      let loadedConfig = JSON.parse(configData) as Partial<SettingsProps>;

      // Handle potential nested config object (legacy format)
      if ((loadedConfig as any).config && typeof (loadedConfig as any).config === 'object') {
        loadedConfig = { ...loadedConfig, ...(loadedConfig as any).config };
        delete (loadedConfig as any).config;
      }

      return Settings.create(loadedConfig);
    } catch (error) {
      console.error('Error loading settings:', error);
      return Settings.create({});
    }
  }

  async save(settings: Settings): Promise<void> {
    try {
      const dirPath = path.dirname(this.configPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(
        this.configPath,
        JSON.stringify(settings.toPlainObject(), null, 2)
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error(`Failed to save settings: ${error}`);
    }
  }

  async exists(): Promise<boolean> {
    return fs.existsSync(this.configPath);
  }
}

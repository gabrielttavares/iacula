/**
 * Infrastructure: FileAssetService
 * Implementação concreta de IAssetService usando sistema de arquivos.
 */

import fs from 'fs';
import path from 'path';
import { IAssetService } from '../../application/ports/IAssetService';
import { QuotesCollection } from '../../domain/entities/Quote';
import { PrayerCollection } from '../../domain/entities/Prayer';

export class FileAssetService implements IAssetService {
  private readonly assetsPath: string;
  private readonly isDevelopment: boolean;

  constructor(resourcesPath: string, isDevelopment: boolean = false) {
    this.isDevelopment = isDevelopment;

    if (isDevelopment) {
      this.assetsPath = path.join(process.cwd(), 'assets');
    } else {
      this.assetsPath = path.join(resourcesPath, 'assets');
    }
  }

  private getAssetPath(relativePath: string): string {
    return path.join(this.assetsPath, relativePath);
  }

  async loadQuotes(language: string): Promise<QuotesCollection> {
    try {
      const quotesPath = this.getAssetPath(`quotes/${language}/quotes.json`);
      const data = fs.readFileSync(quotesPath, 'utf-8');
      return JSON.parse(data) as QuotesCollection;
    } catch (error) {
      console.error(`Error loading quotes for language ${language}:`, error);
      throw new Error(`Failed to load quotes: ${error}`);
    }
  }

  async loadPrayers(language: string): Promise<PrayerCollection> {
    try {
      const prayersPath = this.getAssetPath(`prayers/${language}/angelus.json`);
      const data = fs.readFileSync(prayersPath, 'utf-8');
      return JSON.parse(data) as PrayerCollection;
    } catch (error) {
      console.error(`Error loading prayers for language ${language}:`, error);
      throw new Error(`Failed to load prayers: ${error}`);
    }
  }

  async getImagePath(dayOfWeek: number): Promise<string | null> {
    try {
      const images = await this.listDayImages(dayOfWeek);
      if (images.length === 0) {
        return null;
      }
      return images[0];
    } catch (error) {
      console.error(`Error getting image for day ${dayOfWeek}:`, error);
      return null;
    }
  }

  async listDayImages(dayOfWeek: number): Promise<string[]> {
    try {
      const imagesDir = this.getAssetPath(`images/ordinary/${dayOfWeek}`);

      if (!fs.existsSync(imagesDir)) {
        return [];
      }

      const files = fs.readdirSync(imagesDir);
      return files
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map(file => `file://${path.join(imagesDir, file)}`);
    } catch (error) {
      console.error(`Error listing images for day ${dayOfWeek}:`, error);
      return [];
    }
  }

  async getAngelusImagePath(): Promise<string> {
    return `file://${this.getAssetPath('images/angelus/J.jpg')}`;
  }

  async getReginaCaeliImagePath(): Promise<string> {
    return `file://${this.getAssetPath('images/reginaCaeli/Regina caeli.jpg')}`;
  }
}

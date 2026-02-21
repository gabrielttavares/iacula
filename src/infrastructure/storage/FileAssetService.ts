/**
 * Infrastructure: FileAssetService
 * Implementação concreta de IAssetService usando sistema de arquivos.
 */

import fs from 'fs';
import path from 'path';
import { IAssetService } from '../../application/ports/IAssetService';
import { QuotesCollection } from '../../domain/entities/Quote';
import { PrayerCollection } from '../../domain/entities/Prayer';
import { LiturgicalSeason } from '../../application/ports/ILiturgicalSeasonService';

export class FileAssetService implements IAssetService {
  private readonly assetsPath: string;
  private readonly isDevelopment: boolean;
  private seasonalImageIndex: Partial<Record<Exclude<LiturgicalSeason, 'ordinary'>, number>> = {};
  private feastImageIndex: Record<string, number> = {};

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

  async loadQuotes(language: string, season: LiturgicalSeason = 'ordinary'): Promise<QuotesCollection> {
    try {
      const seasonalQuoteFiles: Record<Exclude<LiturgicalSeason, 'ordinary'>, string> = {
        advent: 'advent.json',
        lent: 'lent.json',
        easter: 'easter.json',
        christmas: 'christmas.json',
      };

      const isSeasonal = season !== 'ordinary';
      const quotesPath = isSeasonal
        ? this.getAssetPath(`quotes/pt-br/${seasonalQuoteFiles[season]}`)
        : this.getAssetPath(`quotes/${language}/quotes.json`);

      const data = fs.readFileSync(quotesPath, 'utf-8');
      return JSON.parse(data) as QuotesCollection;
    } catch (error) {
      console.error(`Error loading quotes for language ${language} and season ${season}:`, error);

      // Fallback to ordinary quotes for requested language if seasonal file is missing.
      if (season !== 'ordinary') {
        const fallbackPath = this.getAssetPath(`quotes/${language}/quotes.json`);
        const data = fs.readFileSync(fallbackPath, 'utf-8');
        return JSON.parse(data) as QuotesCollection;
      }

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

  async getImagePath(dayOfWeek: number, season: LiturgicalSeason = 'ordinary'): Promise<string | null> {
    try {
      if (season !== 'ordinary') {
        const seasonalImages = this.readSeasonalFlatImages(season);
        if (seasonalImages.length > 0) {
          const currentIndex = this.seasonalImageIndex[season] ?? 0;
          const selectedIndex = currentIndex % seasonalImages.length;
          this.seasonalImageIndex[season] = currentIndex + 1;
          return seasonalImages[selectedIndex];
        }
      }

      const images = await this.listDayImages(dayOfWeek, season);
      if (images.length === 0) {
        return null;
      }
      return images[0];
    } catch (error) {
      console.error(`Error getting image for day ${dayOfWeek}:`, error);
      return null;
    }
  }

  async listDayImages(dayOfWeek: number, season: LiturgicalSeason = 'ordinary'): Promise<string[]> {
    try {
      if (season !== 'ordinary') {
        const seasonalImages = this.readSeasonalFlatImages(season);
        if (seasonalImages.length > 0) {
          return seasonalImages;
        }

        const seasonalLegacyByDay = this.readImageFilesFromDirectory(this.getAssetPath(`images/${season}/${dayOfWeek}`));
        if (seasonalLegacyByDay.length > 0) {
          console.warn(`[FileAssetService] Deprecated image layout in use for season=${season}: images/${season}/${dayOfWeek}. Move files to images/${season}/.`);
          return seasonalLegacyByDay;
        }

        console.log(`[FileAssetService] No images found for season=${season}, day=${dayOfWeek}. Falling back to ordinary.`);
      }

      return this.readImageFilesFromDirectory(this.getAssetPath(`images/ordinary/${dayOfWeek}`));
    } catch (error) {
      console.error(`Error listing images for day ${dayOfWeek}:`, error);
      return [];
    }
  }

  async loadFeastQuotes(slug: string): Promise<string[] | null> {
    try {
      const feastQuotesPath = this.getAssetPath(`quotes/pt-br/feasts/${slug}.json`);
      if (!fs.existsSync(feastQuotesPath)) {
        return null;
      }

      const data = fs.readFileSync(feastQuotesPath, 'utf-8');
      const parsed = JSON.parse(data) as { quotes?: string[] };
      if (!Array.isArray(parsed.quotes)) {
        return null;
      }

      const quotes = parsed.quotes
        .filter((quote): quote is string => typeof quote === 'string' && quote.trim().length > 0)
        .map(quote => quote.trim());

      return quotes.length > 0 ? quotes : null;
    } catch (error) {
      console.error(`Error loading feast quotes for ${slug}:`, error);
      return null;
    }
  }

  async getFeastImagePath(slug: string): Promise<string | null> {
    try {
      const feastImages = this.readImageFilesFromDirectory(this.getAssetPath(`images/feasts/${slug}`));
      if (feastImages.length === 0) {
        return null;
      }

      const currentIndex = this.feastImageIndex[slug] ?? 0;
      const selectedIndex = currentIndex % feastImages.length;
      this.feastImageIndex[slug] = currentIndex + 1;
      return feastImages[selectedIndex];
    } catch (error) {
      console.error(`Error getting feast image for ${slug}:`, error);
      return null;
    }
  }

  private readImageFilesFromDirectory(imagesDir: string): string[] {
    if (!fs.existsSync(imagesDir)) {
      return [];
    }

    const files = fs.readdirSync(imagesDir);
    return files
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => `file://${path.join(imagesDir, file)}`);
  }

  private readSeasonalFlatImages(season: Exclude<LiturgicalSeason, 'ordinary'>): string[] {
    return this.readImageFilesFromDirectory(this.getAssetPath(`images/${season}`));
  }

  async getAngelusImagePath(): Promise<string> {
    return `file://${this.getAssetPath('images/angelus/J.jpg')}`;
  }

  async getReginaCaeliImagePath(): Promise<string> {
    return `file://${this.getAssetPath('images/reginaCaeli/Regina caeli.jpg')}`;
  }
}

/**
 * Infrastructure: FileIndicesRepository
 * Implementação concreta de IIndicesRepository usando sistema de arquivos.
 */

import fs from 'fs';
import path from 'path';
import { IIndicesRepository } from '../../application/ports/IIndicesRepository';
import { QuoteIndices, QuoteSelector } from '../../domain/services/QuoteSelector';
import { DayOfWeek } from '../../domain/entities/Quote';
import { PrayerScheduler } from '../../domain/services/PrayerScheduler';

export class FileIndicesRepository implements IIndicesRepository {
  private readonly indicesPath: string;

  constructor(userDataPath: string) {
    this.indicesPath = path.join(userDataPath, 'indices.json');
  }

  async load(): Promise<QuoteIndices> {
    try {
      const currentDay = PrayerScheduler.getDayOfWeek() as DayOfWeek;

      if (!fs.existsSync(this.indicesPath)) {
        return QuoteSelector.createEmptyIndices(currentDay);
      }

      const data = JSON.parse(fs.readFileSync(this.indicesPath, 'utf-8')) as QuoteIndices;

      // Reset indices if it's a new day
      if (QuoteSelector.shouldResetIndices(data.lastDay, currentDay)) {
        return QuoteSelector.createEmptyIndices(currentDay);
      }

      return data;
    } catch (error) {
      console.error('Error loading indices:', error);
      const currentDay = PrayerScheduler.getDayOfWeek() as DayOfWeek;
      return QuoteSelector.createEmptyIndices(currentDay);
    }
  }

  async save(indices: QuoteIndices): Promise<void> {
    try {
      const dirPath = path.dirname(this.indicesPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const currentDay = PrayerScheduler.getDayOfWeek();
      const dataToSave: QuoteIndices = {
        ...indices,
        lastDay: currentDay,
      };

      fs.writeFileSync(this.indicesPath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Error saving indices:', error);
      throw new Error(`Failed to save indices: ${error}`);
    }
  }
}

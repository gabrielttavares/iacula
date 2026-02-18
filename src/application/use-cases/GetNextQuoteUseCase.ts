/**
 * Use Case: GetNextQuoteUseCase
 * Obtém a próxima jaculatória/citação na sequência.
 */

import { ISettingsRepository } from '../ports/ISettingsRepository';
import { IAssetService } from '../ports/IAssetService';
import { IIndicesRepository } from '../ports/IIndicesRepository';
import { QuoteDTO } from '../dto/QuoteDTO';
import { QuoteSelector } from '../../domain/services/QuoteSelector';
import { PrayerScheduler } from '../../domain/services/PrayerScheduler';
import { DayOfWeek } from '../../domain/entities/Quote';
import { ILiturgicalSeasonService } from '../ports/ILiturgicalSeasonService';

export class GetNextQuoteUseCase {
  constructor(
    private readonly settingsRepository: ISettingsRepository,
    private readonly assetService: IAssetService,
    private readonly indicesRepository: IIndicesRepository,
    private readonly liturgicalSeasonService: ILiturgicalSeasonService
  ) {}

  async execute(): Promise<QuoteDTO> {
    const settings = await this.settingsRepository.load();
    const indices = await this.indicesRepository.load();
    const season = await this.liturgicalSeasonService.getCurrentSeason();

    const dayOfWeek = PrayerScheduler.getDayOfWeek() as DayOfWeek;
    const quotes = await this.assetService.loadQuotes(settings.language, season);
    const images = await this.assetService.listDayImages(dayOfWeek, season);

    console.log(`[GetNextQuoteUseCase] Day: ${dayOfWeek}, Quotes found: ${quotes[dayOfWeek.toString()]?.quotes?.length}, Images found: ${images.length}`);

    const dayData = quotes[dayOfWeek.toString()];
    if (!dayData || !dayData.quotes || dayData.quotes.length === 0) {
      throw new Error(`No quotes found for day ${dayOfWeek}`);
    }

    // Get current quote index
    const currentQuoteIndex = indices.quoteIndices[dayOfWeek] ?? 0;
    const { nextIndex: nextQuoteIndex } = QuoteSelector.getNextQuoteIndex(
      dayOfWeek,
      dayData.quotes.length,
      currentQuoteIndex
    );

    // Get current image index
    const currentImageIndex = indices.imageIndices[dayOfWeek] ?? 0;
    let imagePath: string | null = null;
    let nextImageIndex = 0;

    if (images.length > 0) {
      const imageResult = QuoteSelector.getNextImageIndex(
        dayOfWeek,
        images.length,
        currentImageIndex
      );
      imagePath = images[imageResult.currentIndex];
      nextImageIndex = imageResult.nextIndex;
    }

    // Get the quote text
    const quoteText = QuoteSelector.selectQuote(quotes, dayOfWeek, currentQuoteIndex);
    if (!quoteText) {
      throw new Error(`Failed to select quote for day ${dayOfWeek}`);
    }

    // Update indices for next time
    const updatedIndices = {
      ...indices,
      quoteIndices: {
        ...indices.quoteIndices,
        [dayOfWeek]: nextQuoteIndex,
      },
      imageIndices: {
        ...indices.imageIndices,
        [dayOfWeek]: nextImageIndex,
      },
    };

    await this.indicesRepository.save(updatedIndices);

    return {
      text: quoteText,
      imagePath,
      dayOfWeek,
      theme: dayData.theme,
      season,
    };
  }
}

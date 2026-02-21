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
import { DayOfWeek, QuotesCollection } from '../../domain/entities/Quote';
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
    const context = await this.liturgicalSeasonService.getCurrentContext();

    const dayOfWeek = PrayerScheduler.getDayOfWeek() as DayOfWeek;
    const seasonalQuotes = await this.assetService.loadQuotes(settings.language, context.season);

    const feastQuotes = context.feast
      ? await this.assetService.loadFeastQuotes(context.feast)
      : null;

    const mergedFeastQuotes = this.mergeDedup(feastQuotes ?? [], context.apiQuotes);
    const shouldUseFeastQuotes = mergedFeastQuotes.length > 0;

    const quotePool: QuotesCollection = shouldUseFeastQuotes
      ? {
          [dayOfWeek.toString()]: {
            day: seasonalQuotes[dayOfWeek.toString()]?.day ?? 'Dia',
            theme: context.feastName ?? seasonalQuotes[dayOfWeek.toString()]?.theme ?? 'Festa',
            quotes: mergedFeastQuotes,
          },
        }
      : seasonalQuotes;

    const seasonalImages = await this.assetService.listDayImages(dayOfWeek, context.season);
    const feastImagePath = context.feast ? await this.assetService.getFeastImagePath(context.feast) : null;

    console.log(`[GetNextQuoteUseCase] Day: ${dayOfWeek}, Feast: ${context.feast ?? 'none'}, Feast quotes: ${mergedFeastQuotes.length}, Seasonal images: ${seasonalImages.length}`);

    const dayData = quotePool[dayOfWeek.toString()];
    if (!dayData || !dayData.quotes || dayData.quotes.length === 0) {
      throw new Error(`No quotes found for day ${dayOfWeek}`);
    }

    const currentQuoteIndex = indices.quoteIndices[dayOfWeek] ?? 0;
    const { nextIndex: nextQuoteIndex } = QuoteSelector.getNextQuoteIndex(
      dayOfWeek,
      dayData.quotes.length,
      currentQuoteIndex
    );

    const currentImageIndex = indices.imageIndices[dayOfWeek] ?? 0;
    let imagePath: string | null = feastImagePath;
    let nextImageIndex = 0;

    if (!imagePath && seasonalImages.length > 0) {
      const imageResult = QuoteSelector.getNextImageIndex(
        dayOfWeek,
        seasonalImages.length,
        currentImageIndex
      );
      imagePath = seasonalImages[imageResult.currentIndex];
      nextImageIndex = imageResult.nextIndex;
    }

    const quoteText = QuoteSelector.selectQuote(quotePool, dayOfWeek, currentQuoteIndex);
    if (!quoteText) {
      throw new Error(`Failed to select quote for day ${dayOfWeek}`);
    }

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
      season: context.season,
      feast: shouldUseFeastQuotes ? context.feast : undefined,
      feastName: shouldUseFeastQuotes ? context.feastName : undefined,
    };
  }

  private mergeDedup(curated: string[], apiQuotes: string[]): string[] {
    const merged = [...curated, ...apiQuotes];
    const seen = new Set<string>();
    const deduped: string[] = [];

    for (const quote of merged) {
      const normalized = quote
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!normalized || seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      deduped.push(quote);
    }

    return deduped;
  }
}

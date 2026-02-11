/**
 * Domain Service: QuoteSelector
 * Lógica pura para seleção sequencial de jaculatórias.
 */

import { DayOfWeek, QuotesCollection } from '../entities/Quote';

export interface QuoteIndices {
  quoteIndices: Record<number, number>;
  imageIndices: Record<number, number>;
  lastDay: number;
}

export class QuoteSelector {
  /**
   * Obtém o próximo índice de citação para um dia específico.
   * Retorna o índice atual e o próximo índice (circular).
   */
  static getNextQuoteIndex(
    dayOfWeek: DayOfWeek,
    totalQuotes: number,
    currentIndex: number = 0
  ): { currentIndex: number; nextIndex: number } {
    const validIndex = currentIndex >= 0 && currentIndex < totalQuotes ? currentIndex : 0;
    const nextIndex = (validIndex + 1) % totalQuotes;

    return {
      currentIndex: validIndex,
      nextIndex,
    };
  }

  /**
   * Obtém o próximo índice de imagem para um dia específico.
   */
  static getNextImageIndex(
    dayOfWeek: DayOfWeek,
    totalImages: number,
    currentIndex: number = 0
  ): { currentIndex: number; nextIndex: number } {
    const validIndex = currentIndex >= 0 && currentIndex < totalImages ? currentIndex : 0;
    const nextIndex = (validIndex + 1) % totalImages;

    return {
      currentIndex: validIndex,
      nextIndex,
    };
  }

  /**
   * Verifica se os índices devem ser resetados (novo dia).
   */
  static shouldResetIndices(lastDay: number, currentDay: DayOfWeek): boolean {
    return lastDay !== currentDay;
  }

  /**
   * Cria índices vazios/iniciais.
   */
  static createEmptyIndices(currentDay: DayOfWeek): QuoteIndices {
    return {
      quoteIndices: {},
      imageIndices: {},
      lastDay: currentDay,
    };
  }

  /**
   * Seleciona uma citação da coleção baseado no dia e índice.
   */
  static selectQuote(
    collection: QuotesCollection,
    dayOfWeek: DayOfWeek,
    index: number
  ): string | null {
    const dayKey = dayOfWeek.toString();
    const dayData = collection[dayKey];

    if (!dayData || !dayData.quotes || dayData.quotes.length === 0) {
      return null;
    }

    const validIndex = index >= 0 && index < dayData.quotes.length ? index : 0;
    return dayData.quotes[validIndex];
  }
}

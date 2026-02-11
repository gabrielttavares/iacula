import { QuoteSelector, QuoteIndices } from '../../../src/domain/services/QuoteSelector';
import { DayOfWeek, QuotesCollection } from '../../../src/domain/entities/Quote';

describe('QuoteSelector Service', () => {
  describe('getNextQuoteIndex', () => {
    it('should return current index 0 and next index 1 when starting', () => {
      const result = QuoteSelector.getNextQuoteIndex(1, 10, 0);

      expect(result.currentIndex).toBe(0);
      expect(result.nextIndex).toBe(1);
    });

    it('should wrap around to 0 when reaching the end', () => {
      const result = QuoteSelector.getNextQuoteIndex(1, 5, 4);

      expect(result.currentIndex).toBe(4);
      expect(result.nextIndex).toBe(0);
    });

    it('should handle single quote collection', () => {
      const result = QuoteSelector.getNextQuoteIndex(1, 1, 0);

      expect(result.currentIndex).toBe(0);
      expect(result.nextIndex).toBe(0);
    });

    it('should reset to 0 when currentIndex is out of bounds (negative)', () => {
      const result = QuoteSelector.getNextQuoteIndex(1, 10, -1);

      expect(result.currentIndex).toBe(0);
      expect(result.nextIndex).toBe(1);
    });

    it('should reset to 0 when currentIndex is out of bounds (too large)', () => {
      const result = QuoteSelector.getNextQuoteIndex(1, 5, 10);

      expect(result.currentIndex).toBe(0);
      expect(result.nextIndex).toBe(1);
    });

    it('should use default currentIndex of 0 when not provided', () => {
      const result = QuoteSelector.getNextQuoteIndex(1, 10);

      expect(result.currentIndex).toBe(0);
      expect(result.nextIndex).toBe(1);
    });
  });

  describe('getNextImageIndex', () => {
    it('should behave the same as getNextQuoteIndex', () => {
      const quoteResult = QuoteSelector.getNextQuoteIndex(1, 10, 5);
      const imageResult = QuoteSelector.getNextImageIndex(1, 10, 5);

      expect(imageResult.currentIndex).toBe(quoteResult.currentIndex);
      expect(imageResult.nextIndex).toBe(quoteResult.nextIndex);
    });

    it('should wrap around correctly', () => {
      const result = QuoteSelector.getNextImageIndex(1, 3, 2);

      expect(result.currentIndex).toBe(2);
      expect(result.nextIndex).toBe(0);
    });
  });

  describe('shouldResetIndices', () => {
    it('should return true when days are different', () => {
      expect(QuoteSelector.shouldResetIndices(1, 2)).toBe(true);
      expect(QuoteSelector.shouldResetIndices(7, 1)).toBe(true);
    });

    it('should return false when days are the same', () => {
      expect(QuoteSelector.shouldResetIndices(1, 1)).toBe(false);
      expect(QuoteSelector.shouldResetIndices(5, 5)).toBe(false);
    });
  });

  describe('createEmptyIndices', () => {
    it('should create indices with empty objects and current day', () => {
      const indices = QuoteSelector.createEmptyIndices(3);

      expect(indices.quoteIndices).toEqual({});
      expect(indices.imageIndices).toEqual({});
      expect(indices.lastDay).toBe(3);
    });

    it('should work for all days of the week', () => {
      const days: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

      days.forEach((day) => {
        const indices = QuoteSelector.createEmptyIndices(day);
        expect(indices.lastDay).toBe(day);
      });
    });
  });

  describe('selectQuote', () => {
    const mockCollection: QuotesCollection = {
      '1': {
        day: 'Domingo',
        theme: 'Ressurreicao',
        quotes: ['Quote 1', 'Quote 2', 'Quote 3'],
      },
      '2': {
        day: 'Segunda',
        theme: 'Defuntos',
        quotes: ['Monday Quote 1', 'Monday Quote 2'],
      },
      '7': {
        day: 'Sabado',
        theme: 'Nossa Senhora',
        quotes: ['Saturday Quote'],
      },
    };

    it('should return quote at specified index', () => {
      expect(QuoteSelector.selectQuote(mockCollection, 1, 0)).toBe('Quote 1');
      expect(QuoteSelector.selectQuote(mockCollection, 1, 1)).toBe('Quote 2');
      expect(QuoteSelector.selectQuote(mockCollection, 1, 2)).toBe('Quote 3');
    });

    it('should return quote from different days', () => {
      expect(QuoteSelector.selectQuote(mockCollection, 2, 0)).toBe('Monday Quote 1');
      expect(QuoteSelector.selectQuote(mockCollection, 7, 0)).toBe('Saturday Quote');
    });

    it('should return null for non-existent day', () => {
      expect(QuoteSelector.selectQuote(mockCollection, 3, 0)).toBeNull();
    });

    it('should reset to index 0 when index is out of bounds', () => {
      expect(QuoteSelector.selectQuote(mockCollection, 1, 10)).toBe('Quote 1');
      expect(QuoteSelector.selectQuote(mockCollection, 1, -1)).toBe('Quote 1');
    });

    it('should return null for empty quotes array', () => {
      const emptyCollection: QuotesCollection = {
        '1': {
          day: 'Domingo',
          theme: 'Test',
          quotes: [],
        },
      };

      expect(QuoteSelector.selectQuote(emptyCollection, 1, 0)).toBeNull();
    });

    it('should return null when dayData has no quotes property', () => {
      const invalidCollection = {
        '1': {
          day: 'Domingo',
          theme: 'Test',
          quotes: undefined as unknown as string[],
        },
      } as QuotesCollection;

      expect(QuoteSelector.selectQuote(invalidCollection, 1, 0)).toBeNull();
    });
  });
});

import { Quote, DayOfWeek } from '../../../src/domain/entities/Quote';

describe('Quote Entity', () => {
  describe('create', () => {
    it('should create a quote with valid text and day of week', () => {
      const quote = Quote.create('Gloria ao Pai', 1);

      expect(quote.text).toBe('Gloria ao Pai');
      expect(quote.dayOfWeek).toBe(1);
    });

    it('should trim whitespace from text', () => {
      const quote = Quote.create('  Gloria ao Pai  ', 1);

      expect(quote.text).toBe('Gloria ao Pai');
    });

    it('should accept all valid days of week', () => {
      const days: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

      days.forEach((day) => {
        const quote = Quote.create('Test quote', day);
        expect(quote.dayOfWeek).toBe(day);
      });
    });
  });

  describe('validation', () => {
    it('should throw error when text is empty', () => {
      expect(() => Quote.create('', 1)).toThrow('Quote text cannot be empty');
    });

    it('should throw error when text is only whitespace', () => {
      expect(() => Quote.create('   ', 1)).toThrow('Quote text cannot be empty');
    });

    it('should throw error when text is null/undefined', () => {
      expect(() => Quote.create(null as any, 1)).toThrow('Quote text cannot be empty');
      expect(() => Quote.create(undefined as any, 1)).toThrow('Quote text cannot be empty');
    });
  });

  describe('getters', () => {
    it('should return correct text', () => {
      const quote = Quote.create('Ave Maria', 7);
      expect(quote.text).toBe('Ave Maria');
    });

    it('should return correct day of week', () => {
      const quote = Quote.create('Ave Maria', 7);
      expect(quote.dayOfWeek).toBe(7);
    });
  });
});

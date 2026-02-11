import { Prayer, PrayerCollection, PrayerVerse } from '../../../src/domain/entities/Prayer';

describe('Prayer Entity', () => {
  const validVerse: PrayerVerse = {
    verse: 'O anjo do Senhor anunciou a Maria.',
    response: 'E Ela concebeu do Espirito Santo.',
  };

  const validPrayerProps = {
    title: 'Angelus',
    verses: [validVerse],
    prayer: 'Oremos. Infundi, Senhor...',
    type: 'angelus' as const,
  };

  describe('create', () => {
    it('should create a prayer with valid props', () => {
      const prayer = Prayer.create(validPrayerProps);

      expect(prayer.title).toBe('Angelus');
      expect(prayer.verses).toHaveLength(1);
      expect(prayer.prayer).toBe('Oremos. Infundi, Senhor...');
      expect(prayer.type).toBe('angelus');
    });

    it('should create prayer with multiple verses', () => {
      const verses: PrayerVerse[] = [
        { verse: 'Verse 1', response: 'Response 1' },
        { verse: 'Verse 2', response: 'Response 2' },
        { verse: 'Verse 3', response: 'Response 3' },
      ];

      const prayer = Prayer.create({
        ...validPrayerProps,
        verses,
      });

      expect(prayer.verses).toHaveLength(3);
    });
  });

  describe('validation', () => {
    it('should throw error when title is empty', () => {
      expect(() =>
        Prayer.create({
          ...validPrayerProps,
          title: '',
        })
      ).toThrow('Prayer title cannot be empty');
    });

    it('should throw error when title is only whitespace', () => {
      expect(() =>
        Prayer.create({
          ...validPrayerProps,
          title: '   ',
        })
      ).toThrow('Prayer title cannot be empty');
    });

    it('should throw error when verses array is empty', () => {
      expect(() =>
        Prayer.create({
          ...validPrayerProps,
          verses: [],
        })
      ).toThrow('Prayer must have at least one verse');
    });

    it('should throw error when prayer text is empty', () => {
      expect(() =>
        Prayer.create({
          ...validPrayerProps,
          prayer: '',
        })
      ).toThrow('Prayer final text cannot be empty');
    });

    it('should throw error with multiple validation errors', () => {
      expect(() =>
        Prayer.create({
          title: '',
          verses: [],
          prayer: '',
          type: 'angelus',
        })
      ).toThrow('Invalid prayer');
    });
  });

  describe('fromCollection', () => {
    const collection: PrayerCollection = {
      regular: {
        title: 'Angelus',
        verses: [{ verse: 'Regular verse', response: 'Regular response' }],
        prayer: 'Regular prayer',
      },
      easter: {
        title: 'Regina Caeli',
        verses: [{ verse: 'Easter verse', response: 'Easter response' }],
        prayer: 'Easter prayer',
      },
    };

    it('should create Angelus prayer when isEasterTime is false', () => {
      const prayer = Prayer.fromCollection(collection, false);

      expect(prayer.title).toBe('Angelus');
      expect(prayer.type).toBe('angelus');
      expect(prayer.isAngelus).toBe(true);
      expect(prayer.isReginaCaeli).toBe(false);
    });

    it('should create Regina Caeli prayer when isEasterTime is true', () => {
      const prayer = Prayer.fromCollection(collection, true);

      expect(prayer.title).toBe('Regina Caeli');
      expect(prayer.type).toBe('reginaCaeli');
      expect(prayer.isAngelus).toBe(false);
      expect(prayer.isReginaCaeli).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return a copy of verses array', () => {
      const prayer = Prayer.create(validPrayerProps);
      const verses1 = prayer.verses;
      const verses2 = prayer.verses;

      expect(verses1).not.toBe(verses2);
      expect(verses1).toEqual(verses2);
    });

    it('should return correct type helpers', () => {
      const angelus = Prayer.create({ ...validPrayerProps, type: 'angelus' });
      const reginaCaeli = Prayer.create({ ...validPrayerProps, type: 'reginaCaeli' });

      expect(angelus.isAngelus).toBe(true);
      expect(angelus.isReginaCaeli).toBe(false);

      expect(reginaCaeli.isAngelus).toBe(false);
      expect(reginaCaeli.isReginaCaeli).toBe(true);
    });
  });
});

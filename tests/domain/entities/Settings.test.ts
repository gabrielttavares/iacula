import { Settings, SettingsProps } from '../../../src/domain/entities/Settings';

describe('Settings Entity', () => {
  describe('create', () => {
    it('should create settings with default values when no props provided', () => {
      const settings = Settings.create({});

      expect(settings.interval).toBe(15);
      expect(settings.duration).toBe(10);
      expect(settings.autostart).toBe(true);
      expect(settings.easterTime).toBe(false);
      expect(settings.language).toBe('pt-br');
    });

    it('should create settings with provided values', () => {
      const settings = Settings.create({
        interval: 30,
        duration: 15,
        autostart: false,
        easterTime: true,
        language: 'en',
      });

      expect(settings.interval).toBe(30);
      expect(settings.duration).toBe(15);
      expect(settings.autostart).toBe(false);
      expect(settings.easterTime).toBe(true);
      expect(settings.language).toBe('en');
    });

    it('should merge partial props with defaults', () => {
      const settings = Settings.create({
        interval: 20,
        language: 'la',
      });

      expect(settings.interval).toBe(20);
      expect(settings.duration).toBe(10); // default
      expect(settings.autostart).toBe(true); // default
      expect(settings.easterTime).toBe(false); // default
      expect(settings.language).toBe('la');
    });
  });

  describe('validation', () => {
    it('should throw error when interval is less than 1', () => {
      expect(() => Settings.create({ interval: 0 })).toThrow('Invalid settings');
      expect(() => Settings.create({ interval: -1 })).toThrow('Interval must be between 1 and 60 minutes');
    });

    it('should throw error when interval is greater than 60', () => {
      expect(() => Settings.create({ interval: 61 })).toThrow('Interval must be between 1 and 60 minutes');
    });

    it('should throw error when duration is less than 5', () => {
      expect(() => Settings.create({ duration: 4 })).toThrow('Duration must be between 5 and 30 seconds');
    });

    it('should throw error when duration is greater than 30', () => {
      expect(() => Settings.create({ duration: 31 })).toThrow('Duration must be between 5 and 30 seconds');
    });

    it('should throw error for unsupported language', () => {
      expect(() => Settings.create({ language: 'fr' })).toThrow('Language must be one of: pt-br, en, la');
    });

    it('should accept valid boundary values', () => {
      expect(() => Settings.create({ interval: 1 })).not.toThrow();
      expect(() => Settings.create({ interval: 60 })).not.toThrow();
      expect(() => Settings.create({ duration: 5 })).not.toThrow();
      expect(() => Settings.create({ duration: 30 })).not.toThrow();
    });
  });

  describe('computed properties', () => {
    it('should calculate intervalInMs correctly', () => {
      const settings = Settings.create({ interval: 15 });
      expect(settings.intervalInMs).toBe(15 * 60 * 1000);
    });

    it('should calculate durationInMs correctly', () => {
      const settings = Settings.create({ duration: 10 });
      expect(settings.durationInMs).toBe(10 * 1000);
    });
  });

  describe('update', () => {
    it('should return new Settings instance with updated values', () => {
      const original = Settings.create({ interval: 15, duration: 10 });
      const updated = original.update({ interval: 30 });

      expect(updated.interval).toBe(30);
      expect(updated.duration).toBe(10); // unchanged
      expect(original.interval).toBe(15); // original unchanged
    });

    it('should validate updated values', () => {
      const settings = Settings.create({});
      expect(() => settings.update({ interval: 100 })).toThrow();
    });
  });

  describe('toPlainObject', () => {
    it('should return a plain object with all properties', () => {
      const settings = Settings.create({
        interval: 20,
        duration: 15,
        autostart: false,
        easterTime: true,
        language: 'en',
      });

      const plain = settings.toPlainObject();

      expect(plain).toEqual({
        interval: 20,
        duration: 15,
        autostart: false,
        easterTime: true,
        language: 'en',
      });
    });

    it('should return a copy, not a reference', () => {
      const settings = Settings.create({});
      const plain1 = settings.toPlainObject();
      const plain2 = settings.toPlainObject();

      expect(plain1).not.toBe(plain2);
      expect(plain1).toEqual(plain2);
    });
  });

  describe('defaults', () => {
    it('should return correct default values', () => {
      const defaults = Settings.defaults;

      expect(defaults).toEqual({
        interval: 15,
        duration: 10,
        autostart: true,
        easterTime: false,
        language: 'pt-br',
      });
    });
  });
});

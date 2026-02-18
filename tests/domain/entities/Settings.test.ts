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
      expect(settings.liturgyReminderSoundEnabled).toBe(true);
      expect(settings.liturgyReminderSoundVolume).toBe(0.35);
      expect(settings.laudesEnabled).toBe(false);
      expect(settings.vespersEnabled).toBe(false);
      expect(settings.complineEnabled).toBe(false);
      expect(settings.oraMediaEnabled).toBe(false);
      expect(settings.laudesTime).toBe('06:00');
      expect(settings.vespersTime).toBe('18:00');
      expect(settings.complineTime).toBe('21:00');
      expect(settings.oraMediaTime).toBe('12:30');
    });

    it('should create settings with provided values', () => {
      const settings = Settings.create({
        interval: 30,
        duration: 15,
        autostart: false,
        easterTime: true,
        language: 'en',
        liturgyReminderSoundEnabled: false,
        liturgyReminderSoundVolume: 0.8,
        laudesEnabled: true,
        vespersEnabled: true,
        complineEnabled: true,
        oraMediaEnabled: true,
        laudesTime: '05:30',
        vespersTime: '18:30',
        complineTime: '21:30',
        oraMediaTime: '12:15',
      });

      expect(settings.interval).toBe(30);
      expect(settings.duration).toBe(15);
      expect(settings.autostart).toBe(false);
      expect(settings.easterTime).toBe(true);
      expect(settings.language).toBe('en');
      expect(settings.liturgyReminderSoundEnabled).toBe(false);
      expect(settings.liturgyReminderSoundVolume).toBe(0.8);
      expect(settings.laudesEnabled).toBe(true);
      expect(settings.vespersEnabled).toBe(true);
      expect(settings.complineEnabled).toBe(true);
      expect(settings.oraMediaEnabled).toBe(true);
      expect(settings.laudesTime).toBe('05:30');
      expect(settings.vespersTime).toBe('18:30');
      expect(settings.complineTime).toBe('21:30');
      expect(settings.oraMediaTime).toBe('12:15');
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
      expect(settings.liturgyReminderSoundEnabled).toBe(true); // default
      expect(settings.liturgyReminderSoundVolume).toBe(0.35); // default
      expect(settings.laudesEnabled).toBe(false); // default
      expect(settings.vespersEnabled).toBe(false); // default
      expect(settings.complineEnabled).toBe(false); // default
      expect(settings.oraMediaEnabled).toBe(false); // default
      expect(settings.laudesTime).toBe('06:00'); // default
      expect(settings.vespersTime).toBe('18:00'); // default
      expect(settings.complineTime).toBe('21:00'); // default
      expect(settings.oraMediaTime).toBe('12:30'); // default
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
      expect(() => Settings.create({ liturgyReminderSoundVolume: 0 })).not.toThrow();
      expect(() => Settings.create({ liturgyReminderSoundVolume: 1 })).not.toThrow();
    });

    it('should throw error when liturgy reminder sound volume is out of range', () => {
      expect(() => Settings.create({ liturgyReminderSoundVolume: -0.1 })).toThrow(
        'Liturgy reminder sound volume must be between 0 and 1'
      );
      expect(() => Settings.create({ liturgyReminderSoundVolume: 1.1 })).toThrow(
        'Liturgy reminder sound volume must be between 0 and 1'
      );
    });

    it('should throw error for invalid liturgy hours time format', () => {
      expect(() => Settings.create({ laudesTime: '6:00' })).toThrow('Laudes time must be in HH:MM format');
      expect(() => Settings.create({ vespersTime: '24:00' })).toThrow('Vespers time must be in HH:MM format');
      expect(() => Settings.create({ complineTime: 'ab:cd' })).toThrow('Compline time must be in HH:MM format');
      expect(() => Settings.create({ oraMediaTime: '99:00' })).toThrow('Ora Media time must be in HH:MM format');
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
        liturgyReminderSoundEnabled: false,
        liturgyReminderSoundVolume: 0.75,
        laudesEnabled: true,
        vespersEnabled: true,
        complineEnabled: true,
        oraMediaEnabled: true,
        laudesTime: '05:30',
        vespersTime: '18:30',
        complineTime: '21:30',
        oraMediaTime: '12:00',
      });

      const plain = settings.toPlainObject();

      expect(plain).toEqual({
        interval: 20,
        duration: 15,
        autostart: false,
        easterTime: true,
        language: 'en',
        liturgyReminderSoundEnabled: false,
        liturgyReminderSoundVolume: 0.75,
        laudesEnabled: true,
        vespersEnabled: true,
        complineEnabled: true,
        oraMediaEnabled: true,
        laudesTime: '05:30',
        vespersTime: '18:30',
        complineTime: '21:30',
        oraMediaTime: '12:00',
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
        liturgyReminderSoundEnabled: true,
        liturgyReminderSoundVolume: 0.35,
        laudesEnabled: false,
        vespersEnabled: false,
        complineEnabled: false,
        oraMediaEnabled: false,
        laudesTime: '06:00',
        vespersTime: '18:00',
        complineTime: '21:00',
        oraMediaTime: '12:30',
      });
    });
  });
});

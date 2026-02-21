import { GetPrayerUseCase } from '../../../src/application/use-cases/GetPrayerUseCase';
import { ISettingsRepository } from '../../../src/application/ports/ISettingsRepository';
import { IAssetService } from '../../../src/application/ports/IAssetService';
import { Settings } from '../../../src/domain/entities/Settings';
import { PrayerCollection } from '../../../src/domain/entities/Prayer';
import { ILiturgicalSeasonService } from '../../../src/application/ports/ILiturgicalSeasonService';

describe('GetPrayerUseCase', () => {
  let useCase: GetPrayerUseCase;
  let mockSettingsRepository: jest.Mocked<ISettingsRepository>;
  let mockAssetService: jest.Mocked<IAssetService>;
  let mockLiturgicalSeasonService: jest.Mocked<ILiturgicalSeasonService>;

  const mockPrayerCollection: PrayerCollection = {
    regular: {
      title: 'Angelus',
      verses: [
        { verse: 'O anjo do Senhor anunciou a Maria.', response: 'E Ela concebeu do Espirito Santo.' },
      ],
      prayer: 'Oremos. Infundi, Senhor...',
    },
    easter: {
      title: 'Regina Caeli',
      verses: [
        { verse: 'Rainha do Ceu, alegrai-Vos.', response: 'Porque quem merecestes trazer...' },
      ],
      prayer: 'Oremos. O Deus, que Vos dignastes...',
    },
  };

  beforeEach(() => {
    mockSettingsRepository = {
      load: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
    };

    mockAssetService = {
      loadQuotes: jest.fn(),
      loadPrayers: jest.fn(),
      getImagePath: jest.fn(),
      listDayImages: jest.fn(),
      loadFeastQuotes: jest.fn(),
      getFeastImagePath: jest.fn(),
      getAngelusImagePath: jest.fn(),
      getReginaCaeliImagePath: jest.fn(),
    };

    mockLiturgicalSeasonService = {
      getCurrentSeason: jest.fn().mockResolvedValue('ordinary'),
      getCurrentContext: jest.fn().mockResolvedValue({
        season: 'ordinary',
        rank: 'weekday',
        apiQuotes: [],
      }),
    };

    useCase = new GetPrayerUseCase(
      mockSettingsRepository,
      mockAssetService,
      mockLiturgicalSeasonService
    );
  });

  describe('when season is not easter', () => {
    it('should return Angelus prayer', async () => {
      const settings = Settings.create({ language: 'pt-br' });
      mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('lent');
      mockSettingsRepository.load.mockResolvedValue(settings);
      mockAssetService.loadPrayers.mockResolvedValue(mockPrayerCollection);
      mockAssetService.getAngelusImagePath.mockResolvedValue('/path/to/angelus.jpg');

      const result = await useCase.execute();

      expect(result.title).toBe('Angelus');
      expect(result.type).toBe('angelus');
      expect(result.imagePath).toBe('/path/to/angelus.jpg');
    });

    it('should call getAngelusImagePath', async () => {
      const settings = Settings.create({});
      mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('advent');
      mockSettingsRepository.load.mockResolvedValue(settings);
      mockAssetService.loadPrayers.mockResolvedValue(mockPrayerCollection);
      mockAssetService.getAngelusImagePath.mockResolvedValue('/path/to/angelus.jpg');

      await useCase.execute();

      expect(mockAssetService.getAngelusImagePath).toHaveBeenCalled();
      expect(mockAssetService.getReginaCaeliImagePath).not.toHaveBeenCalled();
    });
  });

  describe('when season is easter', () => {
    it('should return Regina Caeli prayer', async () => {
      const settings = Settings.create({ language: 'pt-br' });
      mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('easter');
      mockSettingsRepository.load.mockResolvedValue(settings);
      mockAssetService.loadPrayers.mockResolvedValue(mockPrayerCollection);
      mockAssetService.getReginaCaeliImagePath.mockResolvedValue('/path/to/regina.jpg');

      const result = await useCase.execute();

      expect(result.title).toBe('Regina Caeli');
      expect(result.type).toBe('reginaCaeli');
      expect(result.imagePath).toBe('/path/to/regina.jpg');
    });

    it('should call getReginaCaeliImagePath', async () => {
      const settings = Settings.create({});
      mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('easter');
      mockSettingsRepository.load.mockResolvedValue(settings);
      mockAssetService.loadPrayers.mockResolvedValue(mockPrayerCollection);
      mockAssetService.getReginaCaeliImagePath.mockResolvedValue('/path/to/regina.jpg');

      await useCase.execute();

      expect(mockAssetService.getReginaCaeliImagePath).toHaveBeenCalled();
      expect(mockAssetService.getAngelusImagePath).not.toHaveBeenCalled();
    });
  });

  describe('forceEasterTime parameter', () => {
    it('should override settings.easterTime when forceEasterTime is true', async () => {
      const settings = Settings.create({});
      mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('ordinary');
      mockSettingsRepository.load.mockResolvedValue(settings);
      mockAssetService.loadPrayers.mockResolvedValue(mockPrayerCollection);
      mockAssetService.getReginaCaeliImagePath.mockResolvedValue('/path/to/regina.jpg');

      const result = await useCase.execute(true);

      expect(result.type).toBe('reginaCaeli');
    });

    it('should override settings.easterTime when forceEasterTime is false', async () => {
      const settings = Settings.create({});
      mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('easter');
      mockSettingsRepository.load.mockResolvedValue(settings);
      mockAssetService.loadPrayers.mockResolvedValue(mockPrayerCollection);
      mockAssetService.getAngelusImagePath.mockResolvedValue('/path/to/angelus.jpg');

      const result = await useCase.execute(false);

      expect(result.type).toBe('angelus');
    });
  });

  it('should load prayers with correct language', async () => {
    const settings = Settings.create({ language: 'en' });
    mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('ordinary');
    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadPrayers.mockResolvedValue(mockPrayerCollection);
    mockAssetService.getAngelusImagePath.mockResolvedValue('/path/to/angelus.jpg');

    await useCase.execute();

    expect(mockAssetService.loadPrayers).toHaveBeenCalledWith('en');
  });

  it('should return complete prayer DTO', async () => {
    const settings = Settings.create({});
    mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('ordinary');
    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadPrayers.mockResolvedValue(mockPrayerCollection);
    mockAssetService.getAngelusImagePath.mockResolvedValue('/path/to/angelus.jpg');

    const result = await useCase.execute();

    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('verses');
    expect(result).toHaveProperty('prayer');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('imagePath');
    expect(Array.isArray(result.verses)).toBe(true);
  });
});

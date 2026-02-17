import { GetNextQuoteUseCase } from '../../../src/application/use-cases/GetNextQuoteUseCase';
import { ISettingsRepository } from '../../../src/application/ports/ISettingsRepository';
import { IAssetService } from '../../../src/application/ports/IAssetService';
import { IIndicesRepository } from '../../../src/application/ports/IIndicesRepository';
import { Settings } from '../../../src/domain/entities/Settings';
import { QuotesCollection } from '../../../src/domain/entities/Quote';
import { QuoteIndices } from '../../../src/domain/services/QuoteSelector';
import { PrayerScheduler } from '../../../src/domain/services/PrayerScheduler';
import { ILiturgicalSeasonService } from '../../../src/application/ports/ILiturgicalSeasonService';

// Mock PrayerScheduler to control day of week
jest.mock('../../../src/domain/services/PrayerScheduler', () => ({
  PrayerScheduler: {
    getDayOfWeek: jest.fn(),
  },
}));

describe('GetNextQuoteUseCase', () => {
  let useCase: GetNextQuoteUseCase;
  let mockSettingsRepository: jest.Mocked<ISettingsRepository>;
  let mockAssetService: jest.Mocked<IAssetService>;
  let mockIndicesRepository: jest.Mocked<IIndicesRepository>;
  let mockLiturgicalSeasonService: jest.Mocked<ILiturgicalSeasonService>;

  const mockQuotesCollection: QuotesCollection = {
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
      getAngelusImagePath: jest.fn(),
      getReginaCaeliImagePath: jest.fn(),
    };

    mockIndicesRepository = {
      load: jest.fn(),
      save: jest.fn(),
    };

    mockLiturgicalSeasonService = {
      getCurrentSeason: jest.fn().mockResolvedValue('ordinary'),
    };

    useCase = new GetNextQuoteUseCase(
      mockSettingsRepository,
      mockAssetService,
      mockIndicesRepository,
      mockLiturgicalSeasonService
    );

    // Default mock for day of week (Sunday = 1)
    (PrayerScheduler.getDayOfWeek as jest.Mock).mockReturnValue(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return quote DTO with correct properties', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue(['/path/to/image1.jpg', '/path/to/image2.jpg']);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('imagePath');
    expect(result).toHaveProperty('dayOfWeek');
    expect(result).toHaveProperty('theme');
    expect(result).toHaveProperty('season');
  });

  it('should return first quote when indices are empty', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result.text).toBe('Quote 1');
    expect(result.dayOfWeek).toBe(1);
    expect(result.theme).toBe('Ressurreicao');
  });

  it('should return next quote based on current index', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    const indices: QuoteIndices = { quoteIndices: { 1: 1 }, imageIndices: {}, lastDay: 1 };

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result.text).toBe('Quote 2');
  });

  it('should update indices after getting quote', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    const indices: QuoteIndices = { quoteIndices: { 1: 0 }, imageIndices: {}, lastDay: 1 };

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue(['/img1.jpg', '/img2.jpg']);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    await useCase.execute();

    expect(mockIndicesRepository.save).toHaveBeenCalledTimes(1);
    const savedIndices = mockIndicesRepository.save.mock.calls[0][0];
    expect(savedIndices.quoteIndices[1]).toBe(1); // Next index
  });

  it('should throw error when no quotes found for day', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    // Mock day 3 which doesn't exist in collection
    (PrayerScheduler.getDayOfWeek as jest.Mock).mockReturnValue(3);

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);

    await expect(useCase.execute()).rejects.toThrow('No quotes found for day 3');
  });

  it('should load quotes with correct language', async () => {
    const settings = Settings.create({ language: 'en' });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    await useCase.execute();

    expect(mockAssetService.loadQuotes).toHaveBeenCalledWith('en', 'ordinary');
  });

  it('should load seasonal quotes when season is advent', async () => {
    const settings = Settings.create({ language: 'en' });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockLiturgicalSeasonService.getCurrentSeason.mockResolvedValue('advent');
    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    await useCase.execute();

    expect(mockAssetService.loadQuotes).toHaveBeenCalledWith('en', 'advent');
    expect(mockAssetService.listDayImages).toHaveBeenCalledWith(1, 'advent');
  });

  it('should return image path when images are available', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue(['/path/to/image1.jpg', '/path/to/image2.jpg']);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result.imagePath).toBe('/path/to/image1.jpg');
  });

  it('should return null imagePath when no images available', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result.imagePath).toBeNull();
  });

  it('should wrap around quote index when reaching end', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    // Index 2 is the last quote (Quote 3), next should be 0
    const indices: QuoteIndices = { quoteIndices: { 1: 2 }, imageIndices: {}, lastDay: 1 };

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result.text).toBe('Quote 3');

    const savedIndices = mockIndicesRepository.save.mock.calls[0][0];
    expect(savedIndices.quoteIndices[1]).toBe(0); // Wrapped to 0
  });
});

import { GetNextQuoteUseCase } from '../../../src/application/use-cases/GetNextQuoteUseCase';
import { ISettingsRepository } from '../../../src/application/ports/ISettingsRepository';
import { IAssetService } from '../../../src/application/ports/IAssetService';
import { IIndicesRepository } from '../../../src/application/ports/IIndicesRepository';
import { Settings } from '../../../src/domain/entities/Settings';
import { QuotesCollection } from '../../../src/domain/entities/Quote';
import { QuoteIndices } from '../../../src/domain/services/QuoteSelector';
import { PrayerScheduler } from '../../../src/domain/services/PrayerScheduler';
import { ILiturgicalSeasonService } from '../../../src/application/ports/ILiturgicalSeasonService';

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
      loadFeastQuotes: jest.fn(),
      getFeastImagePath: jest.fn(),
      getAngelusImagePath: jest.fn(),
      getReginaCaeliImagePath: jest.fn(),
    };

    mockIndicesRepository = {
      load: jest.fn(),
      save: jest.fn(),
    };

    mockLiturgicalSeasonService = {
      getCurrentSeason: jest.fn().mockResolvedValue('ordinary'),
      getCurrentContext: jest.fn().mockResolvedValue({
        season: 'ordinary',
        rank: 'weekday',
      }),
    };

    useCase = new GetNextQuoteUseCase(
      mockSettingsRepository,
      mockAssetService,
      mockIndicesRepository,
      mockLiturgicalSeasonService
    );

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
    mockAssetService.loadFeastQuotes.mockResolvedValue(null);
    mockAssetService.getFeastImagePath.mockResolvedValue(null);
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
    mockAssetService.loadFeastQuotes.mockResolvedValue(null);
    mockAssetService.getFeastImagePath.mockResolvedValue(null);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result.text).toBe('Quote 1');
    expect(result.dayOfWeek).toBe(1);
    expect(result.theme).toBe('Ressurreicao');
  });

  it('should load quotes with correct language and season from context', async () => {
    const settings = Settings.create({ language: 'en', useLiturgicalSeasonForQuotes: true });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockLiturgicalSeasonService.getCurrentContext.mockResolvedValue({
      season: 'advent',
      rank: 'weekday',
    });
    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockAssetService.loadFeastQuotes.mockResolvedValue(null);
    mockAssetService.getFeastImagePath.mockResolvedValue(null);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    await useCase.execute();

    expect(mockAssetService.loadQuotes).toHaveBeenCalledWith('en', 'advent');
    expect(mockAssetService.listDayImages).toHaveBeenCalledWith(1, 'advent');
  });

  it('should prefer feast image over seasonal images when feast image exists', async () => {
    const settings = Settings.create({ language: 'pt-br', useLiturgicalSeasonForQuotes: true });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockLiturgicalSeasonService.getCurrentContext.mockResolvedValue({
      season: 'easter',
      feast: 'pentecost',
      feastName: 'pentecostes',
      rank: 'solemnity',
    });

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.loadFeastQuotes.mockResolvedValue(['Veni Sancte Spiritus']);
    mockAssetService.getFeastImagePath.mockResolvedValue('/images/feasts/pentecost/1.jpg');
    mockAssetService.listDayImages.mockResolvedValue(['/seasonal/1.jpg']);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(mockAssetService.loadFeastQuotes).toHaveBeenCalledWith('pentecost');
    expect(mockAssetService.getFeastImagePath).toHaveBeenCalledWith('pentecost');
    expect(result.imagePath).toBe('/images/feasts/pentecost/1.jpg');
    expect(result.feast).toBe('pentecost');
    expect(result.feastName).toBe('pentecostes');
    expect(result.theme).toBe('pentecostes');
  });

  it('should use only curated feast quotes when feast has asset quotes', async () => {
    const settings = Settings.create({ language: 'pt-br', useLiturgicalSeasonForQuotes: true });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockLiturgicalSeasonService.getCurrentContext.mockResolvedValue({
      season: 'ordinary',
      feast: 'all-saints',
      feastName: 'todos os santos',
      rank: 'solemnity',
    });

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.loadFeastQuotes.mockResolvedValue(['Sede santos', 'Rogai por nos']);
    mockAssetService.getFeastImagePath.mockResolvedValue(null);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result.feast).toBe('all-saints');
    expect(result.text).toBe('Sede santos');
    const savedIndices = mockIndicesRepository.save.mock.calls[0][0];
    expect(savedIndices.quoteIndices[1]).toBe(1);
  });

  it('should fallback to seasonal quotes when feast and api quote pools are empty', async () => {
    const settings = Settings.create({ language: 'pt-br', useLiturgicalSeasonForQuotes: true });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockLiturgicalSeasonService.getCurrentContext.mockResolvedValue({
      season: 'lent',
      feast: 'holy-thursday',
      feastName: 'quinta-feira santa',
      rank: 'solemnity',
    });

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.loadFeastQuotes.mockResolvedValue(null);
    mockAssetService.getFeastImagePath.mockResolvedValue(null);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(result.feast).toBe('holy-thursday');
    expect(result.feastName).toBe('quinta-feira santa');
    expect(result.season).toBe('lent');
    expect(result.text).toBe('Quote 1');
  });

  it('when useLiturgicalSeasonForQuotes is false, loads ordinary quotes and images but DTO season follows calendar', async () => {
    const settings = Settings.create({ language: 'en', useLiturgicalSeasonForQuotes: false });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockLiturgicalSeasonService.getCurrentContext.mockResolvedValue({
      season: 'lent',
      rank: 'weekday',
    });

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.listDayImages.mockResolvedValue(['/ord/1.jpg']);
    mockAssetService.loadFeastQuotes.mockResolvedValue(null);
    mockAssetService.getFeastImagePath.mockResolvedValue(null);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(mockLiturgicalSeasonService.getCurrentContext).toHaveBeenCalledTimes(1);
    expect(mockAssetService.loadQuotes).toHaveBeenCalledWith('en', 'ordinary');
    expect(mockAssetService.listDayImages).toHaveBeenCalledWith(1, 'ordinary');
    expect(mockAssetService.loadFeastQuotes).not.toHaveBeenCalled();
    expect(result.season).toBe('lent');
    expect(result.text).toBe('Quote 1');
  });

  it('when useLiturgicalSeasonForQuotes is false, skips feast assets but keeps calendar feast labels', async () => {
    const settings = Settings.create({ language: 'pt-br', useLiturgicalSeasonForQuotes: false });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    mockLiturgicalSeasonService.getCurrentContext.mockResolvedValue({
      season: 'easter',
      feast: 'pentecost',
      feastName: 'pentecostes',
      rank: 'solemnity',
    });

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.loadFeastQuotes.mockResolvedValue(['Veni Sancte Spiritus']);
    mockAssetService.getFeastImagePath.mockResolvedValue('/images/feasts/pentecost/1.jpg');
    mockAssetService.listDayImages.mockResolvedValue(['/ord/a.jpg']);
    mockIndicesRepository.load.mockResolvedValue(indices);
    mockIndicesRepository.save.mockResolvedValue();

    const result = await useCase.execute();

    expect(mockAssetService.loadQuotes).toHaveBeenCalledWith('pt-br', 'ordinary');
    expect(mockAssetService.loadFeastQuotes).not.toHaveBeenCalled();
    expect(mockAssetService.getFeastImagePath).not.toHaveBeenCalled();
    expect(result.imagePath).toBe('/ord/a.jpg');
    expect(result.season).toBe('easter');
    expect(result.feast).toBe('pentecost');
    expect(result.feastName).toBe('pentecostes');
    expect(result.text).toBe('Quote 1');
  });

  it('should throw error when no quotes found for day', async () => {
    const settings = Settings.create({ language: 'pt-br' });
    const indices: QuoteIndices = { quoteIndices: {}, imageIndices: {}, lastDay: 1 };

    (PrayerScheduler.getDayOfWeek as jest.Mock).mockReturnValue(3);

    mockSettingsRepository.load.mockResolvedValue(settings);
    mockAssetService.loadQuotes.mockResolvedValue(mockQuotesCollection);
    mockAssetService.loadFeastQuotes.mockResolvedValue(null);
    mockAssetService.listDayImages.mockResolvedValue([]);
    mockAssetService.getFeastImagePath.mockResolvedValue(null);
    mockIndicesRepository.load.mockResolvedValue(indices);

    await expect(useCase.execute()).rejects.toThrow('No quotes found for day 3');
  });
});

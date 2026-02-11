import { GetSettingsUseCase } from '../../../src/application/use-cases/GetSettingsUseCase';
import { ISettingsRepository } from '../../../src/application/ports/ISettingsRepository';
import { Settings } from '../../../src/domain/entities/Settings';

describe('GetSettingsUseCase', () => {
  let useCase: GetSettingsUseCase;
  let mockSettingsRepository: jest.Mocked<ISettingsRepository>;

  beforeEach(() => {
    mockSettingsRepository = {
      load: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
    };

    useCase = new GetSettingsUseCase(mockSettingsRepository);
  });

  it('should return settings DTO from repository', async () => {
    const settings = Settings.create({
      interval: 20,
      duration: 15,
      autostart: false,
      easterTime: true,
      language: 'en',
    });

    mockSettingsRepository.load.mockResolvedValue(settings);

    const result = await useCase.execute();

    expect(result).toEqual({
      interval: 20,
      duration: 15,
      autostart: false,
      easterTime: true,
      language: 'en',
    });
  });

  it('should return default settings when repository returns defaults', async () => {
    const settings = Settings.create({});
    mockSettingsRepository.load.mockResolvedValue(settings);

    const result = await useCase.execute();

    expect(result).toEqual({
      interval: 15,
      duration: 10,
      autostart: true,
      easterTime: false,
      language: 'pt-br',
    });
  });

  it('should call repository load method once', async () => {
    mockSettingsRepository.load.mockResolvedValue(Settings.create({}));

    await useCase.execute();

    expect(mockSettingsRepository.load).toHaveBeenCalledTimes(1);
  });
});

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
      liturgyReminderSoundEnabled: false,
      liturgyReminderSoundVolume: 0.6,
      laudesEnabled: true,
      vespersEnabled: true,
      complineEnabled: false,
      oraMediaEnabled: true,
      laudesTime: '05:30',
      vespersTime: '18:30',
      complineTime: '21:00',
      oraMediaTime: '12:00',
    });

    mockSettingsRepository.load.mockResolvedValue(settings);

    const result = await useCase.execute();

    expect(result).toEqual({
      interval: 20,
      duration: 15,
      autostart: false,
      easterTime: true,
      language: 'en',
      liturgyReminderSoundEnabled: false,
      liturgyReminderSoundVolume: 0.6,
      laudesEnabled: true,
      vespersEnabled: true,
      complineEnabled: false,
      oraMediaEnabled: true,
      laudesTime: '05:30',
      vespersTime: '18:30',
      complineTime: '21:00',
      oraMediaTime: '12:00',
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

  it('should call repository load method once', async () => {
    mockSettingsRepository.load.mockResolvedValue(Settings.create({}));

    await useCase.execute();

    expect(mockSettingsRepository.load).toHaveBeenCalledTimes(1);
  });
});

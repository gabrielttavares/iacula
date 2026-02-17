import { UpdateSettingsUseCase } from '../../../src/application/use-cases/UpdateSettingsUseCase';
import { ISettingsRepository } from '../../../src/application/ports/ISettingsRepository';
import { IAutoStartService } from '../../../src/application/ports/IAutoStartService';
import { Settings } from '../../../src/domain/entities/Settings';

describe('UpdateSettingsUseCase', () => {
  let useCase: UpdateSettingsUseCase;
  let mockSettingsRepository: jest.Mocked<ISettingsRepository>;
  let mockAutoStartService: jest.Mocked<IAutoStartService>;

  beforeEach(() => {
    mockSettingsRepository = {
      load: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
    };

    mockAutoStartService = {
      setup: jest.fn(),
      isEnabled: jest.fn(),
    };

    useCase = new UpdateSettingsUseCase(mockSettingsRepository, mockAutoStartService);
  });

  it('should update settings and return success', async () => {
    const currentSettings = Settings.create({
      interval: 15,
      duration: 10,
      easterTime: false,
    });

    mockSettingsRepository.load.mockResolvedValue(currentSettings);
    mockSettingsRepository.save.mockResolvedValue();

    const result = await useCase.execute({ interval: 30 });

    expect(result.success).toBe(true);
    expect(result.settings.interval).toBe(30);
    expect(result.settings.duration).toBe(10); // unchanged
  });

  it('should detect easterTime change', async () => {
    const currentSettings = Settings.create({ easterTime: false });
    mockSettingsRepository.load.mockResolvedValue(currentSettings);
    mockSettingsRepository.save.mockResolvedValue();

    const result = await useCase.execute({ easterTime: true });

    expect(result.easterTimeChanged).toBe(true);
  });

  it('should not report easterTime change when unchanged', async () => {
    const currentSettings = Settings.create({ easterTime: false });
    mockSettingsRepository.load.mockResolvedValue(currentSettings);
    mockSettingsRepository.save.mockResolvedValue();

    const result = await useCase.execute({ interval: 20 });

    expect(result.easterTimeChanged).toBe(false);
  });

  it('should call autoStartService.setup when autostart is provided', async () => {
    const currentSettings = Settings.create({});
    mockSettingsRepository.load.mockResolvedValue(currentSettings);
    mockSettingsRepository.save.mockResolvedValue();
    mockAutoStartService.setup.mockResolvedValue();

    await useCase.execute({ autostart: true });

    expect(mockAutoStartService.setup).toHaveBeenCalledWith(true);
  });

  it('should not call autoStartService.setup when autostart is not provided', async () => {
    const currentSettings = Settings.create({});
    mockSettingsRepository.load.mockResolvedValue(currentSettings);
    mockSettingsRepository.save.mockResolvedValue();

    await useCase.execute({ interval: 20 });

    expect(mockAutoStartService.setup).not.toHaveBeenCalled();
  });

  it('should save updated settings to repository', async () => {
    const currentSettings = Settings.create({});
    mockSettingsRepository.load.mockResolvedValue(currentSettings);
    mockSettingsRepository.save.mockResolvedValue();

    await useCase.execute({ interval: 25, duration: 20 });

    expect(mockSettingsRepository.save).toHaveBeenCalledTimes(1);
    const savedSettings = mockSettingsRepository.save.mock.calls[0][0];
    expect(savedSettings.interval).toBe(25);
    expect(savedSettings.duration).toBe(20);
  });

  it('should return updated settings in result', async () => {
    const currentSettings = Settings.create({
      interval: 15,
      duration: 10,
      autostart: true,
      easterTime: false,
      language: 'pt-br',
      laudesEnabled: false,
      vespersEnabled: false,
      complineEnabled: false,
      oraMediaEnabled: false,
      laudesTime: '06:00',
      vespersTime: '18:00',
      complineTime: '21:00',
      oraMediaTime: '12:30',
    });
    mockSettingsRepository.load.mockResolvedValue(currentSettings);
    mockSettingsRepository.save.mockResolvedValue();

    const result = await useCase.execute({
      interval: 30,
      language: 'en',
    });

    expect(result.settings).toEqual({
      interval: 30,
      duration: 10,
      autostart: true,
      easterTime: false,
      language: 'en',
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

import { TimerManager, TimerCallbacks } from '../../../src/main/bootstrap/TimerManager';
import { PrayerScheduler } from '../../../src/domain/services/PrayerScheduler';
import { Settings } from '../../../src/domain/entities/Settings';
import { powerMonitor } from 'electron';

// Mock do Electron
jest.mock('electron', () => ({
  powerMonitor: {
    on: jest.fn(),
  },
}));

// Mock do PrayerScheduler
jest.mock('../../../src/domain/services/PrayerScheduler');

describe('TimerManager Integration Tests', () => {
  let timerManager: TimerManager;
  let mockCallbacks: TimerCallbacks;
  let mockSettings: Settings;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockCallbacks = {
      onPopupInterval: jest.fn(),
      onAngelusTime: jest.fn(),
    };

    mockSettings = Settings.create({
      interval: 30,
      duration: 10,
      autostart: true,
      easterTime: false,
      language: 'pt-br',
    });

    timerManager = new TimerManager(mockCallbacks);
  });

  afterEach(() => {
    timerManager.destroy();
    jest.useRealTimers();
  });

  describe('setupAngelusTimer', () => {
    it('should schedule Angelus timer for next noon', () => {
      const mockNextNoon = new Date('2024-01-15T12:00:00');
      const mockDelayMs = 60 * 60 * 1000; // 1 hour

      (PrayerScheduler.calculateNextNoon as jest.Mock).mockReturnValue({
        nextTriggerTime: mockNextNoon,
        delayMs: mockDelayMs,
      });

      (PrayerScheduler.isNoonTime as jest.Mock).mockReturnValue(true);

      timerManager.setup(mockSettings);

      expect(PrayerScheduler.calculateNextNoon).toHaveBeenCalled();
      expect(mockCallbacks.onAngelusTime).not.toHaveBeenCalled();

      // Avança o tempo até o próximo meio-dia
      jest.advanceTimersByTime(mockDelayMs);

      expect(PrayerScheduler.isNoonTime).toHaveBeenCalled();
      expect(mockCallbacks.onAngelusTime).toHaveBeenCalledTimes(1);
    });

    it('should validate noon time before triggering callback', () => {
      const mockDelayMs = 60 * 60 * 1000;

      (PrayerScheduler.calculateNextNoon as jest.Mock).mockReturnValue({
        nextTriggerTime: new Date(),
        delayMs: mockDelayMs,
      });

      // Simula que não é realmente meio-dia (wake-from-sleep scenario)
      (PrayerScheduler.isNoonTime as jest.Mock).mockReturnValue(false);

      timerManager.setup(mockSettings);

      jest.advanceTimersByTime(mockDelayMs);

      // Callback não deve ser chamado se não for realmente meio-dia
      expect(mockCallbacks.onAngelusTime).not.toHaveBeenCalled();
      expect(PrayerScheduler.isNoonTime).toHaveBeenCalled();
    });

    it('should setup daily interval after first trigger', () => {
      const mockDelayMs = 60 * 60 * 1000;
      const dailyInterval = 24 * 60 * 60 * 1000;

      (PrayerScheduler.calculateNextNoon as jest.Mock).mockReturnValue({
        nextTriggerTime: new Date(),
        delayMs: mockDelayMs,
      });

      (PrayerScheduler.isNoonTime as jest.Mock).mockReturnValue(true);
      (PrayerScheduler.dailyIntervalMs as unknown as number) = dailyInterval;

      timerManager.setup(mockSettings);

      // Primeiro disparo
      jest.advanceTimersByTime(mockDelayMs);
      expect(mockCallbacks.onAngelusTime).toHaveBeenCalledTimes(1);

      // Segundo disparo (24h depois)
      jest.advanceTimersByTime(dailyInterval);
      expect(mockCallbacks.onAngelusTime).toHaveBeenCalledTimes(2);

      // Terceiro disparo (mais 24h)
      jest.advanceTimersByTime(dailyInterval);
      expect(mockCallbacks.onAngelusTime).toHaveBeenCalledTimes(3);
    });

    it('should reschedule if daily interval fires outside noon window', () => {
      const mockDelayMs = 60 * 60 * 1000;
      const dailyInterval = 24 * 60 * 60 * 1000;

      (PrayerScheduler.calculateNextNoon as jest.Mock).mockReturnValue({
        nextTriggerTime: new Date(),
        delayMs: mockDelayMs,
      });

      (PrayerScheduler.dailyIntervalMs as unknown as number) = dailyInterval;

      // Primeiro disparo: válido
      (PrayerScheduler.isNoonTime as jest.Mock).mockReturnValueOnce(true);
      // Segundo disparo: inválido (wake-from-sleep)
      (PrayerScheduler.isNoonTime as jest.Mock).mockReturnValueOnce(false);

      timerManager.setup(mockSettings);

      // Primeiro disparo
      jest.advanceTimersByTime(mockDelayMs);
      expect(mockCallbacks.onAngelusTime).toHaveBeenCalledTimes(1);

      // Segundo disparo (inválido)
      jest.advanceTimersByTime(dailyInterval);
      expect(mockCallbacks.onAngelusTime).toHaveBeenCalledTimes(1); // Não incrementa

      // Verifica que resetAngelusTimer foi chamado (via calculateNextNoon novamente)
      expect(PrayerScheduler.calculateNextNoon).toHaveBeenCalledTimes(2);
    });
  });

  describe('resetAngelusTimer', () => {
    it('should clear existing timer and setup new one', () => {
      const mockDelayMs = 60 * 60 * 1000;
      const mockDelayMsAfterReset = 120 * 60 * 1000; // 2 horas

      (PrayerScheduler.calculateNextNoon as jest.Mock)
        .mockReturnValueOnce({
          nextTriggerTime: new Date(),
          delayMs: mockDelayMs,
        })
        .mockReturnValueOnce({
          nextTriggerTime: new Date(),
          delayMs: mockDelayMsAfterReset,
        });

      (PrayerScheduler.isNoonTime as jest.Mock).mockReturnValue(true);

      timerManager.setup(mockSettings);

      // Reset antes do timer disparar
      timerManager.resetAngelusTimer();

      // Avança o tempo original (que foi cancelado)
      jest.advanceTimersByTime(mockDelayMs);

      // Callback não deve ser chamado porque o timer foi resetado
      expect(mockCallbacks.onAngelusTime).not.toHaveBeenCalled();

      // Avança até o novo tempo agendado
      jest.advanceTimersByTime(mockDelayMsAfterReset - mockDelayMs);

      // Agora o callback deve ter sido chamado
      expect(mockCallbacks.onAngelusTime).toHaveBeenCalledTimes(1);

      // calculateNextNoon deve ter sido chamado 2 vezes (setup + reset)
      expect(PrayerScheduler.calculateNextNoon).toHaveBeenCalledTimes(2);
    });
  });

  describe('powerMonitor integration', () => {
    it('should setup power monitor listener on setup', () => {
      timerManager.setup(mockSettings);

      expect(powerMonitor.on).toHaveBeenCalledWith('resume', expect.any(Function));
    });

    it('should reset Angelus timer when system resumes from sleep', () => {
      const mockDelayMs = 60 * 60 * 1000;

      (PrayerScheduler.calculateNextNoon as jest.Mock).mockReturnValue({
        nextTriggerTime: new Date(),
        delayMs: mockDelayMs,
      });

      timerManager.setup(mockSettings);

      // Captura o callback do powerMonitor
      const powerMonitorCallback = (powerMonitor.on as jest.Mock).mock.calls[0][1];

      // Simula o sistema acordando do sleep
      powerMonitorCallback();

      // calculateNextNoon deve ser chamado novamente (setup + resume)
      expect(PrayerScheduler.calculateNextNoon).toHaveBeenCalledTimes(2);
    });
  });

  describe('setupPopupTimer', () => {
    it('should trigger popup callback at configured interval', () => {
      timerManager.setup(mockSettings);

      expect(mockCallbacks.onPopupInterval).not.toHaveBeenCalled();

      // Avança o tempo até o primeiro intervalo
      jest.advanceTimersByTime(mockSettings.intervalInMs);
      expect(mockCallbacks.onPopupInterval).toHaveBeenCalledTimes(1);

      // Avança mais um intervalo
      jest.advanceTimersByTime(mockSettings.intervalInMs);
      expect(mockCallbacks.onPopupInterval).toHaveBeenCalledTimes(2);
    });

    it('should reset popup timer when settings are updated', () => {
      timerManager.setup(mockSettings);

      // Avança metade do intervalo
      jest.advanceTimersByTime(mockSettings.intervalInMs / 2);

      // Atualiza as configurações com novo intervalo
      const newSettings = mockSettings.update({ interval: 60 });

      timerManager.updateSettings(newSettings);

      // Avança o tempo restante do intervalo antigo
      jest.advanceTimersByTime(mockSettings.intervalInMs / 2);

      // Callback não deve ter sido chamado ainda
      expect(mockCallbacks.onPopupInterval).not.toHaveBeenCalled();

      // Avança o novo intervalo completo
      jest.advanceTimersByTime(newSettings.intervalInMs);
      expect(mockCallbacks.onPopupInterval).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy', () => {
    it('should clear all timers', () => {
      const mockDelayMs = 60 * 60 * 1000;

      (PrayerScheduler.calculateNextNoon as jest.Mock).mockReturnValue({
        nextTriggerTime: new Date(),
        delayMs: mockDelayMs,
      });

      timerManager.setup(mockSettings);
      timerManager.destroy();

      // Avança o tempo
      jest.advanceTimersByTime(mockDelayMs);
      jest.advanceTimersByTime(mockSettings.intervalInMs);

      // Nenhum callback deve ser chamado
      expect(mockCallbacks.onAngelusTime).not.toHaveBeenCalled();
      expect(mockCallbacks.onPopupInterval).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle updateSettings after setup', () => {
      // Não deve lançar erro
      expect(() => {
        const manager = new TimerManager(mockCallbacks);
        manager.setup(mockSettings);
        manager.updateSettings(mockSettings);
      }).not.toThrow();
    });

    it('should handle multiple resets in sequence', () => {
      (PrayerScheduler.calculateNextNoon as jest.Mock).mockReturnValue({
        nextTriggerTime: new Date(),
        delayMs: 1000,
      });

      timerManager.setup(mockSettings);
      timerManager.resetAngelusTimer();
      timerManager.resetAngelusTimer();
      timerManager.resetAngelusTimer();

      // calculateNextNoon deve ter sido chamado 4 vezes (1 setup + 3 resets)
      expect(PrayerScheduler.calculateNextNoon).toHaveBeenCalledTimes(4);
    });
  });
});

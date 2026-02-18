/**
 * Bootstrap: TimerManager
 * Gerencia os timers para popups e orações.
 */

import { powerMonitor } from 'electron';
import { PrayerScheduler } from '../../domain/services/PrayerScheduler';
import { Settings } from '../../domain/entities/Settings';

export interface TimerCallbacks {
  onPopupInterval: () => void;
  onAngelusTime: () => void;
  onFirstUnlockOfDay: () => void;
}

export class TimerManager {
  private popupIntervalTimer: NodeJS.Timeout | null = null;
  private angelusTimer: NodeJS.Timeout | null = null;
  private currentSettings: Settings | null = null;
  private powerMonitorRegistered = false;
  private lastUnlockPopupDateKey: string | null = null;

  constructor(private readonly callbacks: TimerCallbacks) {}

  setup(settings: Settings): void {
    this.currentSettings = settings;
    this.setupPopupTimer();
    this.setupAngelusTimer();
    this.setupPowerMonitor();
  }

  updateSettings(settings: Settings): void {
    this.currentSettings = settings;
    this.clearPopupTimer();
    this.setupPopupTimer();
  }

  resetAngelusTimer(): void {
    this.clearAngelusTimer();
    this.setupAngelusTimer();
  }

  destroy(): void {
    this.clearPopupTimer();
    this.clearAngelusTimer();
  }

  markFirstUnlockPopupShownToday(date: Date = new Date()): void {
    this.lastUnlockPopupDateKey = this.toLocalDateKey(date);
  }

  private setupPopupTimer(): void {
    if (!this.currentSettings) return;

    console.log('Setting up popup interval timer:', this.currentSettings.interval, 'minutes');

    this.popupIntervalTimer = setInterval(() => {
      console.log('Interval timer triggered, showing popup');
      this.callbacks.onPopupInterval();
    }, this.currentSettings.intervalInMs);
  }

  private setupAngelusTimer(): void {
    const { nextTriggerTime, delayMs } = PrayerScheduler.calculateNextNoon();

    console.log(
      `Setting up Angelus/Regina Caeli timer for ${nextTriggerTime.toLocaleString()}, in ${delayMs / 1000 / 60} minutes`
    );

    this.angelusTimer = setTimeout(() => {
      console.log('Noon timer triggered');

      // Validate it's actually noon (protection against wake-from-sleep)
      if (PrayerScheduler.isNoonTime()) {
        this.callbacks.onAngelusTime();
      } else {
        console.log('Timer fired but not noon time, rescheduling...');
        this.resetAngelusTimer();
        return;
      }

      // Setup daily interval for subsequent days
      this.angelusTimer = setInterval(() => {
        console.log('Daily noon timer triggered');

        if (PrayerScheduler.isNoonTime()) {
          this.callbacks.onAngelusTime();
        } else {
          console.log('Interval timer fired but not noon time, resetting timer...');
          this.resetAngelusTimer();
        }
      }, PrayerScheduler.dailyIntervalMs);
    }, delayMs);
  }

  private setupPowerMonitor(): void {
    if (this.powerMonitorRegistered) {
      return;
    }

    powerMonitor.on('resume', () => {
      console.log('System resumed from sleep, resetting Angelus timer');
      this.resetAngelusTimer();
      this.handleFirstUnlockOfDay('resume');
    });

    powerMonitor.on('unlock-screen', () => {
      this.handleFirstUnlockOfDay('unlock-screen');
    });

    this.powerMonitorRegistered = true;
  }

  private handleFirstUnlockOfDay(source: 'resume' | 'unlock-screen'): void {
    const todayKey = this.toLocalDateKey(new Date());
    if (this.lastUnlockPopupDateKey === todayKey) {
      console.log(`[TimerManager] ${source}: popup already shown today (${todayKey}), skipping.`);
      return;
    }

    this.lastUnlockPopupDateKey = todayKey;
    console.log(`[TimerManager] ${source}: first unlock of day (${todayKey}), showing popup.`);
    this.callbacks.onFirstUnlockOfDay();
  }

  private toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private clearPopupTimer(): void {
    if (this.popupIntervalTimer) {
      clearInterval(this.popupIntervalTimer);
      this.popupIntervalTimer = null;
    }
  }

  private clearAngelusTimer(): void {
    if (this.angelusTimer) {
      clearTimeout(this.angelusTimer);
      clearInterval(this.angelusTimer);
      this.angelusTimer = null;
    }
  }
}

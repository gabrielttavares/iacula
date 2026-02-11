import { PrayerScheduler } from '../../../src/domain/services/PrayerScheduler';

describe('PrayerScheduler Service', () => {
  describe('calculateNextNoon', () => {
    it('should return same day noon when current time is before noon', () => {
      const morning = new Date('2024-01-15T08:30:00');
      const result = PrayerScheduler.calculateNextNoon(morning);

      expect(result.nextTriggerTime.getHours()).toBe(12);
      expect(result.nextTriggerTime.getMinutes()).toBe(0);
      expect(result.nextTriggerTime.getDate()).toBe(15);
    });

    it('should return next day noon when current time is after noon', () => {
      const afternoon = new Date('2024-01-15T14:30:00');
      const result = PrayerScheduler.calculateNextNoon(afternoon);

      expect(result.nextTriggerTime.getHours()).toBe(12);
      expect(result.nextTriggerTime.getMinutes()).toBe(0);
      expect(result.nextTriggerTime.getDate()).toBe(16);
    });

    it('should return next day noon when current time is exactly noon', () => {
      const noon = new Date('2024-01-15T12:00:00');
      const result = PrayerScheduler.calculateNextNoon(noon);

      expect(result.nextTriggerTime.getDate()).toBe(16);
    });

    it('should calculate correct delay in milliseconds', () => {
      const morning = new Date('2024-01-15T11:00:00');
      const result = PrayerScheduler.calculateNextNoon(morning);

      // 1 hour = 3600000 ms
      expect(result.delayMs).toBe(60 * 60 * 1000);
    });

    it('should handle midnight correctly', () => {
      const midnight = new Date('2024-01-15T00:00:00');
      const result = PrayerScheduler.calculateNextNoon(midnight);

      expect(result.nextTriggerTime.getDate()).toBe(15);
      expect(result.delayMs).toBe(12 * 60 * 60 * 1000); // 12 hours
    });

    it('should handle edge case at 11:59:59', () => {
      const justBeforeNoon = new Date('2024-01-15T11:59:59');
      const result = PrayerScheduler.calculateNextNoon(justBeforeNoon);

      expect(result.nextTriggerTime.getDate()).toBe(15);
      expect(result.delayMs).toBe(1000); // 1 second
    });
  });

  describe('isNoonTime', () => {
    it('should return true at exactly 12:00', () => {
      const noon = new Date('2024-01-15T12:00:00');
      expect(PrayerScheduler.isNoonTime(noon)).toBe(true);
    });

    it('should return true at 12:01', () => {
      const noonPlusOne = new Date('2024-01-15T12:01:00');
      expect(PrayerScheduler.isNoonTime(noonPlusOne)).toBe(true);
    });

    it('should return true at 12:00:30', () => {
      const noonHalf = new Date('2024-01-15T12:00:30');
      expect(PrayerScheduler.isNoonTime(noonHalf)).toBe(true);
    });

    it('should return false at 12:02', () => {
      const noonPlusTwo = new Date('2024-01-15T12:02:00');
      expect(PrayerScheduler.isNoonTime(noonPlusTwo)).toBe(false);
    });

    it('should return false at 11:59', () => {
      const beforeNoon = new Date('2024-01-15T11:59:00');
      expect(PrayerScheduler.isNoonTime(beforeNoon)).toBe(false);
    });

    it('should return false at 13:00', () => {
      const afterNoon = new Date('2024-01-15T13:00:00');
      expect(PrayerScheduler.isNoonTime(afterNoon)).toBe(false);
    });

    it('should return false at midnight', () => {
      const midnight = new Date('2024-01-15T00:00:00');
      expect(PrayerScheduler.isNoonTime(midnight)).toBe(false);
    });

    it('should return true at 12:01:59 (edge case)', () => {
      const noonEdge = new Date('2024-01-15T12:01:59');
      expect(PrayerScheduler.isNoonTime(noonEdge)).toBe(true);
    });

    it('should return false at 12:02:00 exactly', () => {
      const afterWindow = new Date('2024-01-15T12:02:00');
      expect(PrayerScheduler.isNoonTime(afterWindow)).toBe(false);
    });

    it('should return false at 11:59:59 (just before noon)', () => {
      const beforeNoon = new Date('2024-01-15T11:59:59');
      expect(PrayerScheduler.isNoonTime(beforeNoon)).toBe(false);
    });
  });

  describe('dailyIntervalMs', () => {
    it('should return 24 hours in milliseconds', () => {
      const expected = 24 * 60 * 60 * 1000; // 86400000
      expect(PrayerScheduler.dailyIntervalMs).toBe(expected);
    });
  });

  describe('getDayOfWeek', () => {
    it('should return 1 for Sunday', () => {
      // Create date with explicit time to avoid timezone issues
      const sunday = new Date(2024, 0, 14, 12, 0, 0); // Jan 14, 2024 is a Sunday
      expect(PrayerScheduler.getDayOfWeek(sunday)).toBe(1);
    });

    it('should return 2 for Monday', () => {
      const monday = new Date(2024, 0, 15, 12, 0, 0); // Jan 15, 2024 is a Monday
      expect(PrayerScheduler.getDayOfWeek(monday)).toBe(2);
    });

    it('should return 7 for Saturday', () => {
      const saturday = new Date(2024, 0, 20, 12, 0, 0); // Jan 20, 2024 is a Saturday
      expect(PrayerScheduler.getDayOfWeek(saturday)).toBe(7);
    });

    it('should return values between 1 and 7', () => {
      for (let i = 0; i < 7; i++) {
        const date = new Date(2024, 0, 14, 12, 0, 0); // Sunday
        date.setDate(date.getDate() + i);
        const dayOfWeek = PrayerScheduler.getDayOfWeek(date);
        expect(dayOfWeek).toBeGreaterThanOrEqual(1);
        expect(dayOfWeek).toBeLessThanOrEqual(7);
      }
    });
  });
});

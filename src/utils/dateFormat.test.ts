import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime, isToday } from '@/utils/dateFormat';

describe('dateFormat utils', () => {
  describe('formatDate', () => {
    it('should format date in default format', () => {
      const date = '2026-02-16T10:30:00Z';
      const result = formatDate(date);
      expect(result).toMatch(/Feb(ruary)?\s+16,?\s+2026/);
    });

    it('should format date in short format', () => {
      const date = '2026-02-16T10:30:00Z';
      const result = formatDate(date, 'short');
      expect(result).toContain('Feb');
      expect(result).toContain('16');
      expect(result).toContain('2026');
    });

    it('should format date in relative format for recent dates', () => {
      const now = new Date();
      const result = formatDate(now.toISOString(), 'relative');
      expect(result).toBe('just now');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid date');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      const result = formatRelativeTime(now.toISOString());
      expect(result).toBe('just now');
    });

    it('should return minutes ago for recent timestamps', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTime(fiveMinutesAgo.toISOString());
      expect(result).toBe('5 minutes ago');
    });

    it('should return hours ago for older timestamps', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoHoursAgo.toISOString());
      expect(result).toBe('2 hours ago');
    });

    it('should return days ago for even older timestamps', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(threeDaysAgo.toISOString());
      expect(result).toBe('3 days ago');
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const now = new Date();
      const result = isToday(now.toISOString());
      expect(result).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = isToday(yesterday.toISOString());
      expect(result).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = isToday(tomorrow.toISOString());
      expect(result).toBe(false);
    });
  });
});

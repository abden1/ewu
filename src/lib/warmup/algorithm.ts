import type { WarmupSpeed } from "@prisma/client";

interface DayRange {
  dayStart: number;
  dayEnd: number;
  min: number;
  max: number;
}

const DAILY_TARGETS: Record<WarmupSpeed, DayRange[]> = {
  SLOW: [
    { dayStart: 1, dayEnd: 3, min: 3, max: 7 },
    { dayStart: 4, dayEnd: 7, min: 8, max: 12 },
    { dayStart: 8, dayEnd: 14, min: 15, max: 22 },
    { dayStart: 15, dayEnd: 21, min: 25, max: 35 },
    { dayStart: 22, dayEnd: 30, min: 40, max: 55 },
  ],
  MEDIUM: [
    { dayStart: 1, dayEnd: 3, min: 5, max: 10 },
    { dayStart: 4, dayEnd: 7, min: 15, max: 20 },
    { dayStart: 8, dayEnd: 14, min: 25, max: 35 },
    { dayStart: 15, dayEnd: 21, min: 40, max: 50 },
    { dayStart: 22, dayEnd: 30, min: 60, max: 80 },
  ],
  FAST: [
    { dayStart: 1, dayEnd: 3, min: 8, max: 12 },
    { dayStart: 4, dayEnd: 7, min: 20, max: 28 },
    { dayStart: 8, dayEnd: 14, min: 35, max: 45 },
    { dayStart: 15, dayEnd: 21, min: 55, max: 65 },
    { dayStart: 22, dayEnd: 30, min: 70, max: 90 },
  ],
};

export function getDailyTarget(day: number, speed: WarmupSpeed): number {
  const ranges = DAILY_TARGETS[speed];
  for (const range of ranges) {
    if (day >= range.dayStart && day <= range.dayEnd) {
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
  }
  return 0;
}

export function getTargetForWindow(
  dailyTarget: number,
  windowMinutes: number,
  totalWindowMinutes: number
): number {
  const proportion = windowMinutes / totalWindowMinutes;
  return Math.max(0, Math.round(dailyTarget * proportion));
}

interface ScheduleConfig {
  timezone: string;
  businessHoursOnly: boolean;
  startHour: number;
  endHour: number;
}

export function isWithinSchedule(
  config: ScheduleConfig,
  now: Date = new Date()
): boolean {
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();

  if (config.businessHoursOnly) {
    if (utcDay === 0 || utcDay === 6) return false;
    return utcHour >= config.startHour && utcHour < config.endHour;
  }

  return utcHour >= config.startHour && utcHour < config.endHour;
}

export function getActiveWindowMinutes(config: ScheduleConfig): number {
  return (config.endHour - config.startHour) * 60;
}

export function shouldAdvanceDay(startedAt: Date, currentDay: number): boolean {
  const now = new Date();
  const daysSinceStart = Math.floor(
    (now.getTime() - startedAt.getTime()) / (24 * 60 * 60 * 1000)
  );
  return daysSinceStart > currentDay;
}

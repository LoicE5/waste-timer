import AppStorage from "./AppStorage";
import type { StorageItem } from "./AppStorage";

export interface DayStats {
  day: string;
  total: string;
  history: StorageItem[];
  raw: {
    day: number;
    total: number;
  };
  cost?: number | string;
}

/**
 * Format minutes into human-readable time string
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minute${
      remainingMinutes > 1 ? "s" : ""
    }`;
  } else {
    return `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
  }
}

/**
 * Format date as "DD Month YYYY"
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Get midnight timestamp for a given date
 */
export function getMidnightTimestamp(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Calculate cost based on rate and time
 */
export function calculateCost(
  totalMinutes: number,
  rate: number,
  currency?: string
): number | string {
  const hours = totalMinutes / 60;
  const cost = hours * rate;

  if (currency) {
    return `${cost.toFixed(2)}${currency}`;
  }

  return cost;
}

/**
 * Generate statistics from storage data
 */
export async function generateStats(
  rate?: number,
  currency?: string
): Promise<DayStats[]> {
  const storage = new AppStorage("waste-timer");
  const allItems = await storage.getAllItems();

  // Group items by day
  const itemsByDay = new Map<number, StorageItem[]>();

  for (const item of allItems) {
    const dayTimestamp = getMidnightTimestamp(item.timestamp);
    if (!itemsByDay.has(dayTimestamp)) {
      itemsByDay.set(dayTimestamp, []);
    }
    itemsByDay.get(dayTimestamp)!.push(item);
  }

  // Convert to array and sort by day (newest first)
  const stats: DayStats[] = Array.from(itemsByDay.entries())
    .sort(([a], [b]) => b - a) // Sort by timestamp descending
    .map(([dayTimestamp, items]) => {
      const totalMinutes = items.reduce((sum, item) => sum + item.wasted, 0);
      const dayStats: DayStats = {
        day: formatDate(dayTimestamp),
        total: formatTime(totalMinutes),
        history: items.sort((a, b) => a.timestamp - b.timestamp), // Sort history by timestamp ascending
        raw: {
          day: dayTimestamp,
          total: totalMinutes,
        },
      };

      // Add cost if rate is provided
      if (rate !== undefined && rate !== null) {
        dayStats.cost = calculateCost(totalMinutes, rate, currency);
      }

      return dayStats;
    });

  return stats;
}

/**
 * Generate stats JSON string
 */
export async function generateStatsJSON(
  rate?: number,
  currency?: string
): Promise<string> {
  const stats = await generateStats(rate, currency);
  return JSON.stringify(stats, null, 2);
}

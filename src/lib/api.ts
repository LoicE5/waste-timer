import { generateStats, type DayStats } from "../utils/stats";

/**
 * Client-side API to get stats as JSON
 * This works with static deployment since it runs in the browser
 */
export async function getStatsAPI(
  rate?: number,
  currency?: string
): Promise<DayStats[]> {
  try {
    return await generateStats(rate, currency);
  } catch (error) {
    console.error("Error getting stats:", error);
    throw new Error("Failed to generate statistics");
  }
}

/**
 * Get stats as JSON string
 */
export async function getStatsJSON(
  rate?: number,
  currency?: string
): Promise<string> {
  const stats = await getStatsAPI(rate, currency);
  return JSON.stringify(stats, null, 2);
}

/**
 * Create a downloadable JSON file
 */
export async function downloadStatsJSON(
  rate?: number,
  currency?: string,
  filename: string = "waste-timer-stats.json"
): Promise<void> {
  const jsonString = await getStatsJSON(rate, currency);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

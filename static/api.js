/**
 * Waste Timer API - Client-side JavaScript
 * Use this to get JSON data from your waste timer app
 *
 * Usage:
 *   const stats = await WasteTimerAPI.getStats();
 *   const statsWithRate = await WasteTimerAPI.getStats(50, '$');
 */

window.WasteTimerAPI = {
  /**
   * Get stats as JSON data
   * @param {number} rate - Optional hourly rate for cost calculation
   * @param {string} currency - Optional currency symbol
   * @returns {Promise<Array>} Array of day statistics
   */
  async getStats(rate, currency) {
    try {
      // This will work when the page is loaded
      if (typeof window !== "undefined" && window.svelteKit) {
        // If we're in a SvelteKit context, use the utility
        const { generateStats } = await import("/src/utils/stats.js");
        return await generateStats(rate, currency);
      } else {
        // Fallback: try to get data from localStorage or IndexedDB
        console.warn(
          "SvelteKit context not available. This API requires the full app to be loaded."
        );
        return [];
      }
    } catch (error) {
      console.error("Error getting stats:", error);
      throw new Error("Failed to get statistics");
    }
  },

  /**
   * Get stats as JSON string
   * @param {number} rate - Optional hourly rate for cost calculation
   * @param {string} currency - Optional currency symbol
   * @returns {Promise<string>} JSON string
   */
  async getStatsJSON(rate, currency) {
    const stats = await this.getStats(rate, currency);
    return JSON.stringify(stats, null, 2);
  },

  /**
   * Download stats as JSON file
   * @param {number} rate - Optional hourly rate for cost calculation
   * @param {string} currency - Optional currency symbol
   * @param {string} filename - Optional filename (default: waste-timer-stats.json)
   */
  async downloadStats(rate, currency, filename = "waste-timer-stats.json") {
    const jsonString = await this.getStatsJSON(rate, currency);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// Example usage:
console.log("Waste Timer API loaded. Usage:");
console.log("  const stats = await WasteTimerAPI.getStats();");
console.log('  const statsWithRate = await WasteTimerAPI.getStats(50, "$");');
console.log('  await WasteTimerAPI.downloadStats(50, "$", "my-stats.json");');

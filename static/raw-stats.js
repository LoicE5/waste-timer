/**
 * Raw Stats API - Pure JSON endpoint
 * This provides a simple way to get raw JSON data from the waste timer
 *
 * Usage:
 *   const jsonData = await getRawStats();
 *   const jsonWithRate = await getRawStats(50, '$');
 */

window.getRawStats = async function (rate, currency) {
  try {
    // Import the stats utility
    const { generateStats } = await import("/src/utils/stats.js");

    // Generate stats
    const stats = await generateStats(rate, currency);

    // Return as JSON string
    return JSON.stringify(stats, null, 2);
  } catch (error) {
    console.error("Error getting raw stats:", error);
    throw new Error("Failed to get raw statistics");
  }
};

// Example usage:
console.log("Raw Stats API loaded. Usage:");
console.log("  const jsonData = await getRawStats();");
console.log('  const jsonWithRate = await getRawStats(50, "$");');
console.log("  console.log(jsonData);");

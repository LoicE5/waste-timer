export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatTime(minutes: number): string {
  if (minutes === 0) return "0 minutes";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts = [];

  if (hours > 0) {
    parts.push(hours + " hour" + (hours > 1 ? "s" : ""));
  }

  if (mins > 0) {
    parts.push(mins + " minute" + (mins > 1 ? "s" : ""));
  }

  return parts.join(" and ");
}

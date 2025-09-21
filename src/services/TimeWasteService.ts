import type { StorageItem } from "../utils/AppStorage";
import AppStorage from "../utils/AppStorage";

export class TimeWasteService {
  private storage: AppStorage;
  private syncTimeout: number | null = null;
  private isSyncing = false;
  private hasLoadedInitialData = false;

  constructor() {
    this.storage = new AppStorage("waste-timer");
  }

  /**
   * Check if a timestamp is from today (since midnight)
   */
  private isFromToday(timestamp: number): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayMidnight = today.getTime();

    return timestamp >= todayMidnight;
  }

  /**
   * Initialize the service by loading data from storage
   */
  async initialize(): Promise<{
    timeWasted: number;
    timeWastedHistory: StorageItem[];
  }> {
    try {
      const storedItems = await this.storage.getAllItems();
      // Filter to only include entries from today
      const todayItems = storedItems.filter((item) =>
        this.isFromToday(item.timestamp)
      );
      const timeWasted = todayItems.reduce(
        (total, item) => total + item.wasted,
        0
      );
      this.hasLoadedInitialData = true;

      return {
        timeWasted,
        timeWastedHistory: todayItems,
      };
    } catch (error) {
      console.error("Failed to load from storage:", error);
      this.hasLoadedInitialData = true;
      return { timeWasted: 0, timeWastedHistory: [] };
    }
  }

  /**
   * Add a new time waste entry
   */
  addTimeWaste(wasted: number): StorageItem {
    const newItem: StorageItem = {
      timestamp: Date.now(),
      wasted,
    };

    return newItem;
  }

  /**
   * Remove the last time waste entry
   */
  removeLastTimeWaste(history: StorageItem[]): {
    newHistory: StorageItem[];
    removedWasted: number;
  } {
    if (history.length === 0) {
      return { newHistory: [], removedWasted: 0 };
    }

    const lastItem = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    return {
      newHistory,
      removedWasted: lastItem.wasted,
    };
  }

  /**
   * Sync history changes to storage (debounced)
   */
  syncToStorage(history: StorageItem[]): void {
    if (!this.hasLoadedInitialData) return;

    this.debouncedSync(history);
  }

  /**
   * Force immediate sync (for critical operations like undo)
   */
  async forceSync(history: StorageItem[]): Promise<void> {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    await this.performSync(history);
  }

  /**
   * Get the total count of stored items in IndexedDB
   */
  async getTotalStoredItemsCount(): Promise<number> {
    try {
      const storedItems = await this.storage.getAllItems();
      return storedItems.length;
    } catch (error) {
      console.error("Failed to get stored items count:", error);
      return 0;
    }
  }

  /**
   * Clear all data from IndexedDB storage
   */
  async clearAllStorage(): Promise<void> {
    try {
      await this.storage.clearAllStorage();
      console.info("All storage data cleared successfully");
    } catch (error) {
      console.error("Failed to clear storage:", error);
      throw error;
    }
  }

  private debouncedSync(history: StorageItem[]): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      if (!this.isSyncing) {
        this.performSync(history);
      }
    }, 100);
  }

  private async performSync(history: StorageItem[]): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;
    try {
      const storedItems = await this.storage.getAllItems();
      // Filter stored items to only include today's entries for comparison
      const todayStoredItems = storedItems.filter((item) =>
        this.isFromToday(item.timestamp)
      );

      // Create composite keys for comparison
      const historyKeys = new Set(
        history.map((item) => `${item.timestamp}-${item.wasted}`)
      );
      const storedKeys = new Set(
        todayStoredItems.map((item) => `${item.timestamp}-${item.wasted}`)
      );

      const operations: Promise<void>[] = [];

      // Add new items to storage
      for (const item of history) {
        const itemKey = `${item.timestamp}-${item.wasted}`;
        if (!storedKeys.has(itemKey)) {
          operations.push(this.storage.upsertItem(item));
        }
      }

      // Remove items from storage that are no longer in history (only today's items)
      for (const item of todayStoredItems) {
        const itemKey = `${item.timestamp}-${item.wasted}`;
        if (!historyKeys.has(itemKey)) {
          operations.push(this.storage.deleteItem(item.timestamp));
        }
      }

      if (operations.length > 0) {
        await Promise.all(operations);
        console.info(`Synced ${operations.length} operations to storage`);
      }
    } catch (error) {
      console.error("Failed to sync history with storage:", error);
    } finally {
      this.isSyncing = false;
    }
  }
}

// Export a singleton instance
export const timeWasteService = new TimeWasteService();

export interface StorageItem {
  timestamp: number;
  wasted: number;
}

export default class AppStorage {
  readonly databaseName: string;

  constructor(databaseName: string) {
    this.databaseName = databaseName;
  }

  openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, 6); // Incremented version again
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        // Delete the old object store if it exists
        if (database.objectStoreNames.contains("store")) {
          database.deleteObjectStore("store");
        }

        // Create the new object store with timestamp as keyPath (unique)
        database.createObjectStore("store", {
          keyPath: "timestamp",
        });
        console.log("Database upgraded to version 6 with timestamp keyPath");
      };
      request.onsuccess = () => {
        console.log("Database opened successfully");
        resolve(request.result);
      };
      request.onerror = () => {
        console.error("Failed to open database:", request.error);
        reject(request.error);
      };
    });
  }

  async upsertItem(item: StorageItem): Promise<void> {
    console.log("Attempting to store item:", item);
    console.log("Item timestamp:", item.timestamp);
    console.log("Item wasted:", item.wasted);

    // Store only the wasted value as the main data, with timestamp as metadata
    const cleanItem = {
      wasted: item.wasted,
      timestamp: item.timestamp,
    };

    console.log("Clean item for storage:", cleanItem);
    console.log("Clean item wasted (key):", cleanItem.wasted);

    try {
      const database = await this.openDB();
      console.log("Database opened, creating transaction");

      return await new Promise<void>((resolve, reject) => {
        const transcation = database.transaction("store", "readwrite");
        const store = transcation.objectStore("store");

        console.log("Putting item into store");
        const putRequest = store.put(cleanItem);

        putRequest.onsuccess = () => {
          console.log("Item stored successfully");
          resolve();
        };

        putRequest.onerror = () => {
          console.error("Failed to store item:", putRequest.error);
          reject(putRequest.error);
        };

        transcation.oncomplete = () => {
          console.log("Transaction completed");
          resolve();
        };

        transcation.onerror = () => {
          console.error("Transaction failed:", transcation.error);
          reject(transcation.error);
        };
      });
    } catch (error) {
      console.error("Error in upsertItem:", error);
      throw error;
    }
  }

  async getAllItems(): Promise<StorageItem[]> {
    const database = await this.openDB();
    return await new Promise<StorageItem[]>((resolve, reject) => {
      const transcation = database.transaction("store", "readonly");
      const req = transcation.objectStore("store").getAll();
      req.onsuccess = () => resolve(req.result as StorageItem[]);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteItem(id: number): Promise<void> {
    const database = await this.openDB();
    return await new Promise<void>((resolve, reject) => {
      const transcation = database.transaction("store", "readwrite");
      transcation.objectStore("store").delete(id);
      transcation.oncomplete = () => resolve();
      transcation.onerror = () => reject(transcation.error);
    });
  }

  async deleteLatest(): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("store", "readwrite");
      const store = tx.objectStore("store");
      const request = store.getAllKeys();

      request.onsuccess = () => {
        const keys = request.result as number[];
        if (keys.length === 0) {
          return resolve();
        }
        const latestKey = Math.max(...keys);
        const deleteRequest = store.delete(latestKey);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

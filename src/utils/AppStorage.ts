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
      const request = indexedDB.open(this.databaseName, 7); // Incremented version for plain number storage
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        // Delete the old object store if it exists
        if (database.objectStoreNames.contains("store")) {
          database.deleteObjectStore("store");
        }

        // Create the new object store without keyPath (we'll use timestamp as key directly)
        database.createObjectStore("store");
        console.info(
          "Database upgraded to version 7 with plain number storage"
        );
      };
      request.onsuccess = () => {
        console.info("Database opened successfully");
        resolve(request.result);
      };
      request.onerror = () => {
        console.error("Failed to open database:", request.error);
        reject(request.error);
      };
    });
  }

  async upsertItem(item: StorageItem): Promise<void> {
    console.info("Attempting to store item:", item);
    console.info("Item timestamp:", item.timestamp);
    console.info("Item wasted:", item.wasted);

    // Store only the wasted value as plain number, with timestamp as key
    console.info(
      "Storing plain number:",
      item.wasted,
      "with key:",
      item.timestamp
    );

    try {
      const database = await this.openDB();
      console.info("Database opened, creating transaction");

      return await new Promise<void>((resolve, reject) => {
        const transcation = database.transaction("store", "readwrite");
        const store = transcation.objectStore("store");

        console.info("Putting plain number into store");
        const putRequest = store.put(item.wasted, item.timestamp);

        putRequest.onsuccess = () => {
          console.info("Item stored successfully");
          resolve();
        };

        putRequest.onerror = () => {
          console.error("Failed to store item:", putRequest.error);
          reject(putRequest.error);
        };

        transcation.oncomplete = () => {
          console.info("Transaction completed");
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
      const store = transcation.objectStore("store");

      // Get all keys (timestamps) and values (wasted numbers)
      const keysRequest = store.getAllKeys();
      const valuesRequest = store.getAll();

      Promise.all([
        new Promise<number[]>((res, rej) => {
          keysRequest.onsuccess = () => res(keysRequest.result as number[]);
          keysRequest.onerror = () => rej(keysRequest.error);
        }),
        new Promise<number[]>((res, rej) => {
          valuesRequest.onsuccess = () => res(valuesRequest.result as number[]);
          valuesRequest.onerror = () => rej(valuesRequest.error);
        }),
      ])
        .then(([keys, values]) => {
          // Reconstruct StorageItem objects from keys and values
          const items: StorageItem[] = keys.map((timestamp, index) => ({
            timestamp,
            wasted: values[index],
          }));
          resolve(items);
        })
        .catch(reject);
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

  async clearAllStorage(): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("store", "readwrite");
      const store = tx.objectStore("store");
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        console.info("All storage data cleared successfully");
        resolve();
      };

      clearRequest.onerror = () => {
        console.error("Failed to clear storage:", clearRequest.error);
        reject(clearRequest.error);
      };

      tx.oncomplete = () => {
        console.info("Clear transaction completed");
        resolve();
      };

      tx.onerror = () => {
        console.error("Clear transaction failed:", tx.error);
        reject(tx.error);
      };
    });
  }
}

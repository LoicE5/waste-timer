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
      const request = indexedDB.open(this.databaseName, 7);
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        if (database.objectStoreNames.contains("store")) {
          database.deleteObjectStore("store");
        }

        database.createObjectStore("store");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async upsertItem(item: StorageItem): Promise<void> {
    const database = await this.openDB();
    return await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("store", "readwrite");
      const store = transaction.objectStore("store");
      const putRequest = store.put(item.wasted, item.timestamp);

      putRequest.onerror = () => reject(putRequest.error);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getAllItems(): Promise<StorageItem[]> {
    const database = await this.openDB();
    return await new Promise<StorageItem[]>((resolve, reject) => {
      const transaction = database.transaction("store", "readonly");
      const store = transaction.objectStore("store");

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
      const transaction = database.transaction("store", "readwrite");
      transaction.objectStore("store").delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async clearAllStorage(): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("store", "readwrite");
      const clearRequest = tx.objectStore("store").clear();

      clearRequest.onerror = () => reject(clearRequest.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

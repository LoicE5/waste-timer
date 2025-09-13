interface Item {
    id: number
    name: string
}

class AppStorage {

    readonly databaseName: string

    constructor(databaseName: string) {
        this.databaseName = databaseName
    }

    openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.databaseName, 1)
            request.onupgradeneeded = (event) => {
                const database = (event.target as IDBOpenDBRequest).result
                if (!database.objectStoreNames.contains('store')) {
                    database.createObjectStore('store', {
                        keyPath: 'id'
                    })
                }
            }
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    async upsertItem(item: Item): Promise<void> {
        const database = await this.openDB()
        return await new Promise<void> ((resolve, reject) => {
            const transcation = database.transaction('store', 'readwrite')
            transcation.objectStore('store').put(item)
            transcation.oncomplete = () => resolve()
            transcation.onerror = () => reject(transcation.error)
        })
    }

    async getAllItems(): Promise<Item[]> {
        const database = await this.openDB()
        return await new Promise<Item[]> ((resolve, reject) => {
            const transcation = database.transaction('store', 'readonly')
            const req = transcation.objectStore('store').getAll()
            req.onsuccess = () => resolve(req.result as Item[])
            req.onerror = () => reject(req.error)
        })
    }

    async deleteItem(id: number): Promise<void> {
        const database = await this.openDB()
        return await new Promise<void> ((resolve, reject) => {
            const transcation = database.transaction('store', 'readwrite')
            transcation.objectStore('store').delete(id)
            transcation.oncomplete = () => resolve()
            transcation.onerror = () => reject(transcation.error)
        })
    }

    async deleteLatest(): Promise <void> {
    const db = await this.openDB()
    return new Promise <void> ((resolve, reject) => {
        const tx = db.transaction('store', 'readwrite')
        const store = tx.objectStore('store')
        const request = store.getAllKeys()

        request.onsuccess = () => {
        const keys = request.result as number[]
        if (keys.length === 0) {
            return resolve()
        }
        const latestKey = Math.max(...keys)
        const deleteRequest = store.delete(latestKey)
        deleteRequest.onsuccess = () => resolve()
        deleteRequest.onerror = () => reject(deleteRequest.error)
        }

        request.onerror = () => reject(request.error)
  })
}
}
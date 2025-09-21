<script lang="ts">
    import MainButton from "../components/MainButton.svelte";
    import UndoButton from "../components/UndoButton.svelte";
    import { formatTime } from "../utils/functions";
    import type { StorageItem } from "../utils/AppStorage";
    import AppStorage from "../utils/AppStorage";

    let timeWasted = $state(0)
    let timeWastedHistory: StorageItem[] = $state([])
    const storage = new AppStorage('waste-timer')
    
    // Track if we've loaded initial data to prevent loops
    let hasLoadedInitialData = $state(false)
    let syncTimeout: number | null = null
    let isSyncing = $state(false)
    
    // Load initial data from storage on component mount (only once)
    $effect(() => {
        if (!hasLoadedInitialData) {
            loadFromStorage()
        }
    })
    
    // Sync history changes to storage (debounced)
    $effect(() => {
        // Only sync if we've loaded initial data and have items
        if (hasLoadedInitialData && timeWastedHistory.length > 0) {
            console.log('Triggering sync for', timeWastedHistory.length, 'items');
            debouncedSync()
        }
    })
    
    function debouncedSync() {
        // Clear existing timeout
        if (syncTimeout) {
            clearTimeout(syncTimeout)
        }
        
        // Set new timeout - only sync after 100ms of no changes (faster response)
        syncTimeout = setTimeout(() => {
            if (!isSyncing) {
                syncHistoryToStorage()
            }
        }, 100)
    }
    
    async function loadFromStorage() {
        try {
            const storedItems = await storage.getAllItems()
            timeWastedHistory = storedItems
            timeWasted = storedItems.reduce((total, item) => total + item.wasted, 0)
            hasLoadedInitialData = true
        } catch (error) {
            console.error('Failed to load from storage:', error)
            hasLoadedInitialData = true // Still mark as loaded to prevent retries
        }
    }
    
    async function syncHistoryToStorage() {
        if (isSyncing) {
            console.log('Sync already in progress, skipping');
            return // Prevent concurrent syncs
        }
        
        console.log('Starting sync with', timeWastedHistory.length, 'items');
        isSyncing = true
        try {
            // Get current storage items
            const storedItems = await storage.getAllItems()
            console.log('Retrieved', storedItems.length, 'items from storage');
            
            // Find the difference between current history and stored items
            const historyKeys = new Set(timeWastedHistory.map(item => `${item.timestamp}-${item.wasted}`))
            const storedKeys = new Set(storedItems.map(item => `${item.timestamp}-${item.wasted}`))
            
            console.log('History keys:', Array.from(historyKeys));
            console.log('Stored keys:', Array.from(storedKeys));
            
            // Batch operations for better performance
            const operations: Promise<void>[] = []
            
            // Add new items to storage
            for (const item of timeWastedHistory) {
                const itemKey = `${item.timestamp}-${item.wasted}`;
                if (!storedKeys.has(itemKey)) {
                    console.log('Adding item to sync:', item);
                    operations.push(storage.upsertItem(item))
                }
            }
            
            // Remove items from storage that are no longer in history
            for (const item of storedItems) {
                const itemKey = `${item.timestamp}-${item.wasted}`;
                if (!historyKeys.has(itemKey)) {
                    console.log('Removing item from storage:', item);
                    operations.push(storage.deleteItem(item.timestamp))
                }
            }
            
            // Execute all operations in parallel
            if (operations.length > 0) {
                console.log('Executing', operations.length, 'operations');
                await Promise.all(operations)
                console.log(`Synced ${operations.length} operations to storage`)
            } else {
                console.log('No operations needed');
            }
        } catch (error) {
            console.error('Failed to sync history with storage:', error)
        } finally {
            isSyncing = false
        }
    }
    
    // Force immediate sync for critical operations (like undo)
    function forceSync() {
        if (syncTimeout) {
            clearTimeout(syncTimeout)
        }
        syncHistoryToStorage()
    }
</script>

<style lang="scss">
    h1, p {
        width: max-content;
        margin: 0 auto 0 auto;
    }

    h1 {
        margin-top: 3vh;
    }

    p {
        margin-top: 5vh;
        max-width: 80vw;
        text-align: center;
    }
</style>

<h1>Waste timer</h1>

<p>
    {#if timeWasted > 0}
        Today, you lost <b>{formatTime(timeWasted)}</b> of productivity.
    {:else}
        No time wasted today, good job!
    {/if}
</p>

<MainButton 
    bind:timeWasted={timeWasted} 
    bind:timeWastedHistory={timeWastedHistory} 
/>

<UndoButton 
    bind:timeWasted={timeWasted} 
    bind:timeWastedHistory={timeWastedHistory}
    onUndo={forceSync}
/>
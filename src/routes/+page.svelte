<script lang="ts">
    import MainButton from "../components/MainButton.svelte"
    import UndoButton from "../components/UndoButton.svelte"
    import StorageWarning from "../components/StorageWarning.svelte"
    import StatsButton from "../components/StatsButton.svelte"
    import { formatTime } from "../utils/functions"
    import { timeWasteService } from "../services/TimeWasteService"
    import type { StorageItem } from "../utils/AppStorage"

    // State management
    let timeWasted = $state(0)
    let timeWastedHistory: StorageItem[] = $state([])
    let isInitialized = $state(false)
    let showStorageWarning = $state(false)

    // Initialize on mount
    $effect(() => {
        if (!isInitialized) {
            initialize()
        }
    })

    // Handle storage cleared callback
    function handleStorageCleared() {
        // Reset the local state when storage is cleared
        timeWasted = 0
        timeWastedHistory = []
        showStorageWarning = false
        console.info("App state reset after storage clear")
    }

    // Auto-sync to storage when history changes
    $effect(() => {
        if (isInitialized && timeWastedHistory.length > 0) {
            timeWasteService.syncToStorage(timeWastedHistory)
            // Check storage warning after sync
            checkStorageWarning()
        }
    })

    async function initialize() {
        const data = await timeWasteService.initialize()
        timeWasted = data.timeWasted
        timeWastedHistory = data.timeWastedHistory
        isInitialized = true
        
        // Check storage count and show warning if needed
        checkStorageWarning()
    }

    async function checkStorageWarning() {
        const totalItems = await timeWasteService.getTotalStoredItemsCount()
        showStorageWarning = totalItems > 100
    }

    function removeLastTimeWaste() {
        if (timeWastedHistory.length === 0) return

        const { newHistory, removedWasted } = timeWasteService.removeLastTimeWaste(timeWastedHistory)
        
        timeWasted = Math.max(0, timeWasted - removedWasted)
        timeWastedHistory = newHistory
        
        // Force immediate sync for undo operations
        timeWasteService.forceSync(timeWastedHistory)
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
    onUndo={removeLastTimeWaste}
/>

<StorageWarning bind:isVisible={showStorageWarning} onStorageCleared={handleStorageCleared} />

{#if timeWastedHistory.length > 0}
    <StatsButton bind:timeWastedHistory={timeWastedHistory} />
{/if}
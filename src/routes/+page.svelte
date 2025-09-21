<script lang="ts">
    import MainButton from "../components/MainButton.svelte"
    import UndoButton from "../components/UndoButton.svelte"
    import { formatTime } from "../utils/functions"
    import { timeWasteService } from "../services/TimeWasteService"
    import type { StorageItem } from "../utils/AppStorage"

    // State management
    let timeWasted = $state(0)
    let timeWastedHistory: StorageItem[] = $state([])
    let isInitialized = $state(false)

    // Initialize on mount
    $effect(() => {
        if (!isInitialized) {
            initialize()
        }
    })

    // Auto-sync to storage when history changes
    $effect(() => {
        if (isInitialized && timeWastedHistory.length > 0) {
            timeWasteService.syncToStorage(timeWastedHistory)
        }
    })

    async function initialize() {
        const data = await timeWasteService.initialize()
        timeWasted = data.timeWasted
        timeWastedHistory = data.timeWastedHistory
        isInitialized = true
    }

    function addTimeWaste(wasted: number = 5) {
        const newItem = timeWasteService.addTimeWaste(wasted)
        timeWasted += wasted
        timeWastedHistory.push(newItem)
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
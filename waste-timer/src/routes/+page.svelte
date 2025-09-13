<script lang="ts">
    import MainButton from "../components/MainButton.svelte";
    import UndoButton from "../components/UndoButton.svelte";
    import { formatTime } from "../utils/functions";

    let timeWasted = 0
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

<MainButton bind:timeWasted={timeWasted} />

<UndoButton bind:timeWasted={timeWasted} />
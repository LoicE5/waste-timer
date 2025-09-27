<script lang="ts">
    import { goto } from '$app/navigation'

    let {
        timeWastedHistory = $bindable()
    } = $props()

    function handleClick(): void {
        goto('/stats')
    }
</script>

<style lang="scss">
    button {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 50px;
        height: 50px;
        border: none;
        background-color: #D4A574;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        z-index: 10;
    }

    button:hover {
        background-color: #C1965F;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    button:active {
        transform: scale(0.95);
    }

    .stats-icon {
        width: 24px;
        height: 24px;
        fill: white;
    }
</style>

<button onclick={handleClick} title="View Statistics" aria-label="View Statistics">
    <svg class="stats-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-6h2v16h-2V5z"/>
    </svg>
</button>

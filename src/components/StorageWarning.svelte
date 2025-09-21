<script lang="ts">
    let { isVisible = $bindable() } = $props()
    
    function handleClick() {
        // Emit a custom event that the parent can listen to
        const event = new CustomEvent('clearStorage');
        document.dispatchEvent(event);
    }
</script>

<style lang="scss">
    .storage-warning {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #87CEEB, #B0E0E6);
        color: #2c3e50;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        box-shadow: 0 4px 12px rgba(135, 206, 235, 0.4);
        z-index: 1000;
        max-width: 90vw;
        animation: slideUp 0.3s ease-out;
        border: 1px solid rgba(135, 206, 235, 0.3);
        cursor: pointer;
        transition: all 0.2s ease;
        /* Remove default button styles */
        border: 1px solid rgba(135, 206, 235, 0.3);
        outline: none;
        font-family: inherit;
    }

    .storage-warning:hover {
        background: linear-gradient(135deg, #7BC4E8, #A8DDE8);
        box-shadow: 0 6px 16px rgba(135, 206, 235, 0.5);
        transform: translateX(-50%) translateY(-2px);
    }

    .storage-warning::before {
        content: "⚠️";
        margin-right: 8px;
    }

    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }

    /* Mobile-specific adjustments */
    @media (max-width: 768px) {
        .storage-warning {
            bottom: 15px;
            padding: 10px 16px;
            font-size: 13px;
            border-radius: 20px;
        }
    }
</style>

{#if isVisible}
    <button class="storage-warning" onclick={handleClick} type="button">
        Storage is getting full! Click to clear old data.
    </button>
{/if}

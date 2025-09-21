<script lang="ts">
    import backarrow from '$lib/assets/back-arrow.svg'

    let {
        timeWasted = $bindable(),
        timeWastedHistory = $bindable(),
        onUndo = () => {}
    } = $props()

    const delayUntilHidden = 5000
    let visibility = $state('hidden')
    let visibilityTimeout = 0
    let hasUserInteracted = $state(false) // Track if user has clicked main button in this session
    let initialHistoryLength = $state(0) // Store initial history length on mount

    // Set initial history length on mount
    $effect(() => {
        if (timeWastedHistory.length > 0 && initialHistoryLength === 0) {
            initialHistoryLength = timeWastedHistory.length
        }
    })

    $effect(()=> {
        // Only show undo button if user has interacted AND there's time wasted
        if(timeWasted > 0 && hasUserInteracted) {
            setVisibility(true)

            if(visibilityTimeout > 0)
                clearTimeout(visibilityTimeout)

            visibilityTimeout = setTimeout(() => setVisibility(false), delayUntilHidden)
        }
    })

    // Watch for changes in timeWastedHistory to detect user interaction
    $effect(() => {
        // If history length increased from initial, user must have clicked the main button
        if(timeWastedHistory.length > initialHistoryLength) {
            hasUserInteracted = true
        }
    })

    function setVisibility(status: boolean): void {
        visibility = status ? 'visible' : 'hidden'
    }

    function handleClick(): void {
        setVisibility(false)
        clearTimeout(visibilityTimeout)
        
        // Let the page handle the undo logic
        onUndo()
    }
</script>

<style lang="scss">
    button {
        outline: none;
        background-color: tomato;
        border: none;
        border-radius: 999px;
        padding: 10px 0;
        display: flex;
        margin: 40px auto 0 auto;
        width: 150px;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: visibility ease-in-out 0.5s;
    }

    button:active {
        background-color: red;
    }

    img {
        $size: 30px;
        width: $size;
        height: $size;
        display: inline-block;
    }

    .blinking-dot {
        $size: 8px;
        width: $size;
        height: $size;
        background-color: darkred;
        border-radius: 100%;
        display: inline-block;
        position: absolute;
        left: 25%;
        animation: opacityPulse 0.5s infinite alternate;
    }

    @keyframes opacityPulse {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0.25;
        }
    }
</style>

<button onclick={handleClick} style="visibility: {visibility}">
    <div class="blinking-dot"></div>
    <img src={backarrow} alt="undo action"/>
</button>
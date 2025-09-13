<script lang="ts">
    import backarrow from '$lib/assets/back-arrow.svg'
    let {timeWasted = $bindable()} = $props()
    let visibility = $state('hidden')
    const delayUntilHidden = 5000
    let visibilityTimeout = 0

    $effect(()=> {
        if(timeWasted > 0) {
            setVisibility(true)

            if(visibilityTimeout > 0)
                clearTimeout(visibilityTimeout)

            visibilityTimeout = setTimeout(() => setVisibility(false), delayUntilHidden)
        }
    })

    function setVisibility(status: boolean): void {
        visibility = status ? 'visible' : 'hidden'
    }

    function handleClick(): void {
        if(timeWasted >= 5)
            timeWasted -= 5
        else if(timeWasted > 0)
            timeWasted = 0
        setVisibility(false)
        clearTimeout(visibilityTimeout)
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

<button onclick={handleClick} style="visibility: {visibility};">
    <div class="blinking-dot"></div>
    <img src={backarrow} alt="undo action"/>
</button>
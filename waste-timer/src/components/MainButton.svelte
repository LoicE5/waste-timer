<script lang="ts">
    import { randomEmoji } from "../utils/emojis";
    import { randomInt } from "../utils/functions";

    let rotation: number = $state(0)
    const messages: string[] = $state([])
    let {timeWasted = $bindable()} = $props()

    function handleClick(): void {
        rotate();
        messages.push(`${randomEmoji()} Five minutes away...`)
        timeWasted += 5
    }

    function rotate(): void {
        rotation += 360;
    }
</script>

<style lang="scss">

    button {
        $dimension: 200px;
        height: $dimension;
        width: $dimension;
        margin: 20vh auto 0 auto;
        display: flex;
        border: none;
        background-color: #AC7F5E;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        font-size: 1.5rem;
        transition: transform 1s;
        outline: none;
    }

    button>div {
        color: white;
        width: max-content;
        font-weight: bold;
    }

    button:active {
        background-color: #a6612f;
    }

    .message {
        position: absolute;
        top: 30vh;
        left: 50vw;
        transform: translateX(-50%);
        color: black;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        pointer-events: none;
        animation: floatUp 2s ease-out forwards;
        z-index: 2;
        font-size: 1.6rem;
    }

  @keyframes floatUp {
    0% {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateX(-50%) translateY(-100px);
      opacity: 0;
    }
  }
</style>

<button style="transform: rotate({rotation}deg)" onclick={handleClick}><div>Just lost time...</div></button>

{#each messages as message}
    <div class="message" style="left:{randomInt(40,60)}vw;">{message}</div>
{/each}
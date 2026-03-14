<script lang="ts">
  import { onMount } from 'svelte';
  import { generateStats } from '../../../utils/stats';

  let jsonString = '';
  let loading = true;
  let error = '';

  async function generateRawStats() {
    try {
      loading = true;
      error = '';

      if (typeof window === 'undefined') {
        loading = false;
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const rate = urlParams.get('rate');
      const currency = urlParams.get('currency');
      const rateValue = rate ? parseFloat(rate) : undefined;

      const stats = await generateStats(rateValue, currency || undefined);
      jsonString = JSON.stringify(stats, null, 2);
    } catch (err) {
      console.error('Error generating raw stats:', err);
      error = 'Failed to generate statistics';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    generateRawStats();
  });
</script>

<svelte:head>
  <title>Raw Stats - Waste Timer</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if loading}
  <div style="padding: 20px; text-align: center; font-family: monospace;">
    Loading raw JSON...
  </div>
{:else if error}
  <div style="padding: 20px; text-align: center; color: red; font-family: monospace;">
    Error: {error}
  </div>
{:else}
  <pre style="margin: 0; padding: 20px; white-space: pre-wrap; background: #f5f5f5; min-height: 100vh;">{jsonString}</pre>
{/if}

<script lang="ts">
  import { onMount } from 'svelte';
  import { generateStats } from '../../../utils/stats';

  let jsonString = '';
  let loading = true;
  let error = '';

  /**
   * Generate raw JSON stats
   */
  async function generateRawStats() {
    try {
      loading = true;
      error = '';
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const rate = urlParams.get('rate');
      const currency = urlParams.get('currency');
      const rateValue = rate ? parseFloat(rate) : undefined;
      
      // Generate stats
      const stats = await generateStats(rateValue, currency || undefined);
      jsonString = JSON.stringify(stats, null, 2);
      
      // Set proper content type and replace the entire page content
      document.title = 'Raw Stats - Waste Timer';
      
      // Replace the entire body with just the JSON
      document.body.innerHTML = `<pre style="margin: 0; padding: 20px; font-family: monospace; white-space: pre-wrap; background: #f5f5f5;">${jsonString}</pre>`;
      
      // Set content type header (this won't work in static deployment, but it's good practice)
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Type');
      meta.setAttribute('content', 'application/json');
      document.head.appendChild(meta);
      
    } catch (err) {
      console.error('Error generating raw stats:', err);
      error = 'Failed to generate statistics';
      document.body.innerHTML = `<pre style="margin: 20px; padding: 20px; font-family: monospace; color: red;">Error: ${error}</pre>`;
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
  <meta http-equiv="Content-Type" content="application/json" />
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
  <pre style="margin: 0; padding: 20px; font-family: monospace; white-space: pre-wrap; background: #f5f5f5; min-height: 100vh;">{jsonString}</pre>
{/if}

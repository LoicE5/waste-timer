<script lang="ts">
  import { onMount } from 'svelte';
  import { generateStats, type DayStats } from '../../utils/stats';
  import { getStatsJSON, downloadStatsJSON } from '../../lib/api';

  let stats: DayStats[] = [];
  let loading = true;
  let error = '';
  let jsonString = '';
  let showRawJson = false;

  /**
   * Generate stats from storage data
   */
  async function loadStats() {
    try {
      loading = true;
      error = '';
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const rate = urlParams.get('rate');
      const currency = urlParams.get('currency');
      const rateValue = rate ? parseFloat(rate) : undefined;
      
      stats = await generateStats(rateValue, currency || undefined);
      jsonString = await getStatsJSON(rateValue, currency || undefined);
      
      // Set content type to JSON and display as plain text
      document.title = 'Stats - Waste Timer';
      
    } catch (err) {
      console.error('Error generating stats:', err);
      error = 'Failed to generate statistics';
    } finally {
      loading = false;
    }
  }

  /**
   * Download stats as JSON file
   */
  async function downloadStats() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const rate = urlParams.get('rate');
      const currency = urlParams.get('currency');
      const rateValue = rate ? parseFloat(rate) : undefined;
      
      await downloadStatsJSON(rateValue, currency || undefined);
    } catch (err) {
      console.error('Error downloading stats:', err);
      error = 'Failed to download statistics';
    }
  }

  /**
   * Copy JSON to clipboard
   */
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(jsonString);
      alert('JSON copied to clipboard!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      error = 'Failed to copy to clipboard';
    }
  }

  onMount(() => {
    loadStats();
  });
</script>

<svelte:head>
  <title>Stats - Waste Timer</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if loading}
  <div style="padding: 20px; text-align: center;">
    <p>Loading statistics...</p>
  </div>
{:else if error}
  <div style="padding: 20px; text-align: center; color: red;">
    <p>Error: {error}</p>
  </div>
{:else}
  <div style="padding: 20px;">
    <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <button 
        on:click={() => showRawJson = !showRawJson}
        style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        {showRawJson ? 'Hide' : 'Show'} Raw JSON
      </button>
      <button 
        on:click={copyToClipboard}
        style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Copy JSON
      </button>
      <button 
        on:click={downloadStats}
        style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Download JSON
      </button>
    </div>

    {#if showRawJson}
      <pre style="white-space: pre-wrap; font-family: monospace; padding: 20px; background: #f5f5f5; border-radius: 4px; margin: 20px 0; overflow-x: auto; font-size: 14px; line-height: 1.4;">{jsonString}</pre>
    {:else}
      <div style="background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px;">
        <h2 style="margin-top: 0;">Waste Timer Statistics</h2>
        {#each stats as dayStat}
          <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">{dayStat.day}</h3>
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #007bff;">Total: {dayStat.total}</p>
            {#if dayStat.cost}
              <p style="margin: 5px 0; font-size: 16px; color: #28a745;">Cost: {dayStat.cost}</p>
            {/if}
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Entries: {dayStat.history.length}</p>
            <details style="margin-top: 10px;">
              <summary style="cursor: pointer; color: #007bff;">View History</summary>
              <ul style="margin: 10px 0 0 20px; font-size: 12px; color: #666;">
                {#each dayStat.history as entry}
                  <li>{new Date(entry.timestamp).toLocaleTimeString()}: {entry.wasted} minutes</li>
                {/each}
              </ul>
            </details>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  pre {
    font-size: 14px;
    line-height: 1.4;
  }
  
  button:hover {
    opacity: 0.9;
  }
  
  button:active {
    transform: translateY(1px);
  }
</style>

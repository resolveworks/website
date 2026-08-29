<script>
  import { loadEmbeddings, embeddingChart } from '$lib/visualization.js';

  let { embeddingsKey } = $props();
</script>

<!-- The chart is fully data-driven: {#await} resolves the shared embeddings
     (client-side only; the pending state renders nothing), {#if} keeps
     articles without embeddings out of the DOM entirely, and the attachment
     creates/destroys the D3 chart whenever the selected data changes —
     which happens on article -> article navigation, since that reuses this
     component instance. -->
{#await loadEmbeddings() then byKey}
  {#if byKey[embeddingsKey]?.nodes.length}
    <div class="visualization" {@attach embeddingChart(byKey[embeddingsKey])}></div>
  {/if}
{/await}

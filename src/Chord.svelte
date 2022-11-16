<script>
  export let fingers = null;
  export let frets = null;
  export let shift = null;
  export let name = null;
  export let scale = 1;
  import { onMount } from "svelte";
  let element;

  onMount(() => {
    element.style.setProperty(`--scale`, scale.toString());
    frets = frets.map((i) => (i < 0 ? i : i + (shift || 0)));
    console.log(window.chordDiagram, { frets });
    try {
      element.innerHTML = window.chordDiagram.build_diagram(
        frets,
        fingers ? fingers : undefined
      ).innerHTML;
    } catch (e) {}
  });
</script>

<div class="chord">
  {#if name}<h2>{name}</h2>{/if}
  <div class="cont"><div class="chord-diagram" bind:this={element} /></div>
</div>

<style>
  .chord {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1.2em 0.8em;
  }
  @media print {
    :global(.chord) {
      page-break-inside: avoid;
    }
  }
  h2 {
    margin: 0;
    font-size: 1.3em;
    margin-bottom: 0.3em;
    font-weight: 300;
  }
</style>

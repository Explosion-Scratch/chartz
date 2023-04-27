<script>
  import realbook from "./font.js";
  import { tick } from "svelte";
  import Chord from "./Chord.svelte";
  import Chordjs from "./chordjs.svelte";
  import { onMount } from "svelte";
  let useFont = false;
  let chordtext = `# Chords for The Girl from Ipanema
Fmaj7  8879xx
G7     10,10,9,10,x,x
Gm7    10,10,8,10,x,x
F7     9989xx

GbMaj7 9,9,8,10,x,x
#      ^ Use commas for higher frets

B7     7978xx
F#m7   9979xx
D7     5545xx
Eb7    6656xx
D7b9   5x454x

Fmaj7      132211    132111
#^ Title   ^ Frets   ^ Fingerings

# Lines that start with "#" are ignored
# Follow me on GitHub @Explosion-Scratch`;

  let printing = false;

  onMount(() => {
    if (localStorage.chordText){
      chordText = localStorage.chordText;
    }

    window.addEventListener("beforeprint", () => {
      printing = true;
    });
    window.addEventListener("afterprint", () => {
      printing = false;
    });

    let font = new FontFace("realbook", `url(${JSON.stringify(realbook)})`);
    font.load().then(() => {
      document.fonts.add(font);
    });
  });

  $: chords = chordtext
    .trim()
    .split("\n")
    .map((i) => i.replace(/\s+/g, " "))
    .filter((i) => !i.startsWith("#"))
    .map((i) => i.trim().split(" "))
    .filter((i) => i.length >= 2)
    .map((i) => {
      if (i[0] === "!empty") {
        return {
          type: "empty",
        };
      }
      let out = {
        name: i[0].replaceAll("_", " "),
        frets: i[1].split("").map((i) => parseInt(i, 10)),
        fingers: i[2]
          ?.split("")
          .map((i) => i.toLowerCase() === "x" ? "0" : i)
          .map((i) => parseInt(i, 10))
          .filter((i) => !isNaN(i)),
        shift: parseInt(i[3], 10) || 0,
      };
      if (i[1]?.includes(",")) {
        let b = thing(i[1]);
        console.log(b, i);
        out.frets = b.frets;
        out.shift = out.shift + b.shift;
      }
      out.frets = out.frets
        .map((i) => {
          if (typeof i === "string") {
            return -1;
          }
          return i;
        })
        .map((i) => (isNaN(i) ? -1 : i));
      return out;
      function thing(a) {
        const formatted = a.split(",").map((i) => parseInt(i, 10));
        const min = Math.min(...formatted.filter((i) => !isNaN(i)));
        return {
          frets: formatted.map((i, idx) => (isNaN(i) ? a[idx] : i - min)),
          shift: min,
        };
      }
    });
  function group(num, array) {
    const group = [];

    for (let i = 0; i < array.length; i += num) {
      group.push(array.slice(i, i + num));
    }

    return group;
  }
  function save(){
    localStorage.chordText = chordtext;
  }
  let title = "The Girl from Ipanema";
</script>

<Chordjs />
<a
  href="https://github.com/explosion-scratch/chartz"
  class="github-corner"
  aria-label="View source on GitHub"
  ><svg
    width="80"
    height="80"
    viewBox="0 0 250 250"
    style="fill:#64CEAA; color:#fff; position: absolute; top: 0; border: 0; right: 0;"
    aria-hidden="true"
    ><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" /><path
      d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
      fill="currentColor"
      style="transform-origin: 130px 106px;"
      class="octo-arm"
    /><path
      d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
      fill="currentColor"
      class="octo-body"
    /></svg
  ></a
>
<div class="container" class:print={printing} class:realbook={useFont}>
  <div class="mask">
    Printing...
    <span class="cancel" on:click={() => (printing = false)}
      >I'm done printing</span
    >
  </div>
  <div class="left">
    <h2>Enter some chords</h2>
    <span class="desc"
      >Use one line per chord. The first section is the chord name, the second
      section is the frets (you can also separate by commas for higher frets),
      the third segment is fingering, and the 4th segment is the displayed
      shift.</span
    >
    <label>
      <input type="checkbox" bind:checked={useFont} /> Use real book font
    </label>
    <textarea bind:value={chordtext} on:keyup={save} />
    <button
      class="coolbutton"
      on:click={() => ((printing = true), tick().then(() => window.print()))}
    >
      <span class="text">Print</span>
    </button>
  </div>
  <div class="right">
    {#each group(36, chords) as group, group_idx}
      <div class="group">
        {#if group_idx === 0}
          <input bind:value={title} />
          <span class="description">Click the title to edit</span>
        {:else}
          <input readonly value="{title} (page {group_idx + 1})" />
        {/if}
        <div class="chords">
          {#each group as chord}
            {#if !chord.type || chord.type !== "chord"}
              {#key JSON.stringify(chord)}<Chord
                  scale={0.5}
                  name={chord.name}
                  frets={chord.frets}
                  shift={chord.shift}
                  fingers={chord.fingers}
                />{/key}
            {:else if chord.type === "empty"}
              <div class="empty" />
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap");

  .container {
    font-family: "Inter", sans-serif;
  }
  .realbook .right {
    font-family: realbook;
  }
  .mask {
    display: none;
  }
  .print .mask {
    position: fixed;
    inset: 0;
    background: white;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 2rem;
    font-style: italic;
    font-weight: 200;
  }
  .mask .cancel {
    display: block;
    cursor: pointer;
    text-decoration: underline;
    margin-top: 0.5rem;
    font-style: normal;
    font-weight: 100;
    font-size: 1.2rem;
  }
  label {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    width: calc(100% - 20px);
    max-width: 600px;
  }
  label input {
    height: 15px;
    width: 15px;
    display: inline;
    padding: 0;
    margin: 0;
    margin-right: 8px;
  }
  .desc {
    font-style: italic;
    text-align: left;
    margin-bottom: 1rem;
    color: #666;
  }
  .left h2 {
    collor: #333;
  }
  textarea {
    border-radius: 3px;
    color: #333;
    font-family: "Courier New", monospace !important;
    caret-color: lightseagreen;
  }
  textarea:focus {
    outline: none;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }
  @media print {
    .mask {
      display: none !important;
    }
  }
  .description {
    text-align: center;
    display: block;
    font-size: 1rem;
    font-style: italic;
    font-weight: 200;
    margin-top: -0.5rem;
    margin-bottom: 2rem;
  }
  .container {
    position: absolute;
    inset: 0;
    display: flex;
  }
  .divider {
    grid-column: 1/7;
    background: red;
    display: none;
    height: 100px;
  }
  .print .description {
    display: none !important;
  }
  .print .group {
    display: block;
    width: 100vw;
    height: 100vh;
    page-break-before: always;
  }
  input[readonly]:not(.print *) {
    display: none !important;
  }
  .chords {
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(6, 1fr);
    width: calc(100% - 40px);
    margin: 0 20px;
  }
  .right:not(.print .right) {
    font-size: 0.5rem;
    margin: 20px;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
      rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    border-radius: 3px;
  }
  .left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  textarea {
    flex: 1;
    width: calc(100% - 20px);
    max-width: 600px;
    font-family: "Courier New", monospace;
  }
  button,
  .desc {
    width: calc(100% - 20px);
    max-width: 600px;
  }
  button {
    margin-bottom: 3rem;
  }
  .print .left {
    display: none;
  }
  .print .right {
    width: 100%;
  }
  .right {
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow-y: scroll;
  }
  @media (min-width: 999px) {
    .right {
      aspect-ratio: 8.5/11;
    }
  }
  @media (max-width: 1000px) {
    .container:not(.print *) {
      flex-direction: column;
    }
    .desc:not(.print *) {
      display: none;
    }
    label:not(.print *) {
      display: none;
    }
    .right:not(.print *) {
      display: none;
    }
  }
  .print .right {
    overflow: visible;
    height: fit-content;
  }
  textarea,
  input {
    display: block;
  }
  input {
    margin-top: 1em;
    border: none;
    font-weight: 900;
    width: 100%;
    font-size: 2em;
    text-align: center;
  }
  .realbook input {
    text-transform: uppercase;
  }
</style>

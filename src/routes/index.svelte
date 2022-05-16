<script>
  import XLSX from "xlsx";

  import { Open, Sheet, download } from "../lib";
  import example from "./_example.json";
  let open;
  let currentValue;
  let selected;
  let active = 0;
  let sheets = [example];
  let sheetNames = [];

  function onload(loadedSheets, loadedSheetNames) {
    sheets = loadedSheets;
    sheetNames = loadedSheetNames;
  }

  const decode = XLSX.utils.decode_cell;

  $: sheet = sheets[active];

  $: decoded = selected?.[0] ? decode(selected[0]) : { c: 0, r: 0 };
</script>

<Open bind:open {onload} />

<button class="btn secondary" on:click={(_) => open.click()}>
  <i class="fas fa-folder-open mr-1" />Open .xlsx File
</button>

{#if sheet}
  <button
    class="btn secondary"
    on:click={(_) => download(sheets, "example" + ".xlsx")}
  >
    <i class="fas fa-download mr-1" />Download file
  </button>
{/if}

{#if sheet}
  <input
    bind:value={sheet.data[decoded.r][decoded.c]}
    style={{ width: "50vw" }}
    on:change={(v) => console.log("change", v)}
  />
  <Sheet
    bind:data={sheet.data}
    columns={sheet.columns}
    rows={sheet.rows}
    mergeCells={sheet.mergeCells || {}}
    options={{ tableHeight: "90vh" }}
    style={sheet.style || {}}
    bind:currentValue
    bind:selected
  />
{/if}

<a href="https://github.com/ticruz38/svelte-sheets" class="github-link">
  <span />
</a>

<div class="sheet-names">
  {#each sheetNames as sn, i (sn)}
    <span class:selected={sheet.sheetName == sn} on:click={(_) => (active = i)}
      >{sn}</span
    >
  {/each}
</div>

<style>
  .sheet-names {
    text-align: center;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 1rem;
  }
  .github-link {
    position: fixed;
    top: 0.5rem;
    right: 0.5rem;
    background-image: url("/github.png");
    height: 2rem;
    width: 2rem;
    background-position: center;
    background-repeat: none;
    background-size: cover;
  }
  .selected {
    text-decoration: underline;
  }
</style>

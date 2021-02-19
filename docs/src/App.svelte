<script>
  import { Open, Sheet, download } from "svelte-sheets";
  let open;
  let currentValue;
  let selected;
  let active = 0;
  let sheets = [];
  let sheetNames = [];

  function onload(loadedSheets, loadedSheetNames) {
    sheets = loadedSheets;
    sheetNames = loadedSheetNames;
  }

  $: sheet = sheets[active];

  $: console.log(sheet);
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
  <input bind:value={currentValue} style={{ width: "50vw" }} />
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
  .selected {
    text-decoration: underline;
  }
</style>

<script>
  import { Open, Sheet } from "svelte-sheets";
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
</script>

<Open bind:open {onload} />

<button class="btn secondary" on:click={(_) => open.click()}>
  <i class="fas fa-folder-open mr-1" />Open .xlsx File
</button>

<div>
  {#each sheetNames as sn (sn)}
    <span>{sn}</span>
  {/each}
</div>

<div style="height: 50vh;">
  {#if sheet}
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
</div>

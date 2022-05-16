<script>import XLSX from "xlsx";
import { convert } from "./convert";
export let sheetNames;
export let sheets = [];
export let active = 0;
// declare all possible table object
let fileinput;
let files;
$: files && files[0] && reader && reader.readAsArrayBuffer(files[0]);
let reader;
if (FileReader != undefined) {
    reader = new FileReader();
    reader.onload = () => {
        sheets = [];
        active = 0;
        const wb = XLSX.read(new Uint8Array(reader.result), {
            type: "array",
            cellFormula: true,
            cellStyles: true,
        });
        sheets = convert(wb);
        sheetNames = sheets.map((s) => s.sheetName);
    };
}
</script>

<input
  type="file"
  class="hidden"
  name="file"
  bind:this={fileinput}
  bind:files
/>

<div class="flex">
  <button on:click={(_) => fileinput.click()}>Open XLSX file</button>
  {#each sheetNames as sn, i}
    <div
      on:click={(_) => {
        active = i;
      }}
      class={"ml-4 cursor-pointer " + (i == active ? "active" : "")}
    >
      {sn}
    </div>
  {/each}
</div>

<style>
  .hidden {
    height: 0;
    width: 0;
    opacity: 0;
  }
  .active {
    border-bottom: 1px solid teal;
  }
  .flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .ml-4 {
    margin-left: 1rem;
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>

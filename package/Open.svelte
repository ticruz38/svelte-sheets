<script>import XLSX from "xlsx";
import { convert } from "./convert";
export let onload;
export let sheetNames;
export let sheets = [];
export let open;
// declare all possible table object
let files;
$: files && files[0] && reader && reader.readAsArrayBuffer(files[0]);
let reader;
if (typeof FileReader != "undefined") {
    reader = new FileReader();
    reader.onload = () => {
        sheets = [];
        const wb = XLSX.read(new Uint8Array(reader.result), {
            type: "array",
            cellFormula: true,
            cellStyles: true,
        });
        sheets = convert(wb);
        sheetNames = sheets.map((s) => s.sheetName);
        onload && onload(sheets, sheetNames);
    };
}
</script>

<input type="file" class="hidden" name="file" bind:this={open} bind:files />

<style>
  .hidden {
    height: 0;
    width: 0;
    opacity: 0;
  }
</style>

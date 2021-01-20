<script lang="ts">
  import Open from "../src/Open.svelte";
  import Sheet from "../src/Sheet.svelte";

  let open, sheets;
  $: console.log(sheets);
</script>

<Open bind:open bind:sheets />

<Sheet />

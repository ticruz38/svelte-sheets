<script lang="ts">
  import XLSX from "xlsx";

  export let show = false;
  export let data: (string | number | boolean)[][] = [];
  export let selected: string;

  function onCut() {}
  function onCopy() {}
  function onPaste() {}
</script>

<style>
  .menu {
    padding: 0.5rem 1rem;
    position: absolute;
    z-index: 20;
    background: #ddd;
    border-radius: 10px;
  }
  .disabled {
    color: #ddd;
  }
  .divider {
    padding-top: 0.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #aaa;
  }
  .hidden {
    display: none;
  }
</style>

<div class="menu" class:hidden={!show}>
  <div class="flex justify-between">
    <div>Cut</div>
    <div class="disabled">⌘X</div>
  </div>
  <div class="flex justify-between">
    <div>Copy</div>
    <div class="disabled">⌘C</div>
  </div>
  <div class="flex justify-between">
    <div>Paste</div>
    <div class="disabled">⌘P</div>
  </div>
  <div class="divider" />
  <div>Insert</div>
  <div>Delete</div>
  <div>Clear contents</div>
</div>

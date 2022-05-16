<script>export let show = false;
export let x;
export let y;
export let data = [];
export let selected;
export let copy;
export let cut;
export let paste;
export let clear;
// delete is a reserved word...
export let delet;
</script>

<div class="menu" class:hidden={!show} style={`top: ${y}px; left: ${x}px`}>
  <div class="item flex justify-between" on:click={(e) => cut(e)}>
    <div>Cut</div>
    <div class="disabled">⌘X</div>
  </div>
  <div class="item flex justify-between" on:click={(e) => copy(e)}>
    <div>Copy</div>
    <div class="disabled">⌘C</div>
  </div>
  <div class="item flex justify-between" on:click={(e) => paste(e)}>
    <div>Paste</div>
    <div class="disabled">⌘P</div>
  </div>
  <div class="divider" />
  <div class="item">Insert</div>
  <div class="item" on:click={(e) => delet(e)}>Delete</div>
  <div class="item" on:click={(e) => clear(e)}>Clear contents</div>
</div>

<style>
  .menu {
    padding: 0.5rem 0.25rem;
    position: fixed;
    z-index: 20;
    min-width: 10rem;
    background: #ddd;
    border-radius: 10px;
  }
  .disabled {
    color: #aaa;
  }
  .divider {
    padding-top: 0.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #aaa;
  }
  .hidden {
    display: none;
  }
  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .item {
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  .item:hover {
    background-color: rgb(79, 194, 194);
  }
</style>

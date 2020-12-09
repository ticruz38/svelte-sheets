<script lang="ts">
  import { onMount, tick } from "svelte";
  import XLSX from "xlsx";
  import { defaultconfig } from "./defaultconfig";
  import type { Config } from "./defaultconfig";
  import { computeStyles, GetColSpan, GetRowSpan } from "./utilities";

  export let data: (string | number | boolean)[][] = [];
  export let columns: any[] = [];
  export let mergeCells: Record<string, number[]> = {};
  // export let rows: Record<string, any> = [];
  export let style: { [cellIndex: string]: string } = {};
  export let selection: [number[], number[]] = null; // either null, or coordinates [[x, y], [x, y]]

  export let options: Config;

  $: config = {
    ...defaultconfig,
    ...(options || {}),
  };
  // Containers
  let history = [];
  let highlighted = [];

  // Internal controllers
  let keydown = false;
  let cursor = null;
  let historyIndex = 0;
  let ignoreEvents = false;
  let ignoreHistory = false;
  let edition = null;
  let hashString = null;
  let resizing = null;
  let dragging = null;
  const keypressed = {};

  // $: ((_) => {
  //   history = history.slice(0, historyIndex);
  //   history.push(data);
  //   historyIndex = history.length;
  // })();

  // implement virtual list
  export let start = 0;
  export let end = 0;
  // virtual list state
  let height_map = [];
  let els;
  let viewport;
  let contents;
  let viewport_height = 0;
  let visible: { i: number; data: (string | number | boolean)[] }[];
  let mounted;
  let top = 0;
  let top_buffer = 3000;
  let bottom_buffer = 1000;
  let bottom = 0;
  let average_height;

  $: visible = data.slice(start, end).map((data, i) => {
    return { i: i + start, data };
  });

  // whenever `items` changes, invalidate the current heightmap
  $: if (mounted) refresh(data, viewport_height);

  async function refresh(data, viewport_height) {
    const { scrollTop } = viewport;
    await tick(); // wait until the DOM is up to date
    let content_height = top - scrollTop - bottom_buffer;
    let i = start;
    while (
      content_height < viewport_height &&
      i <
        (25000 / columns.length > data.length
          ? data.length
          : 25000 / columns.length)
    ) {
      let row = els[i - start];
      if (!row) {
        end = i + 1;
        await tick(); // render the newly visible row
        row = els[i - start];
      }
      const row_height = (height_map[i] = row.offsetHeight);
      content_height += row_height;
      i += 1;
    }
    end = i;
    const remaining = data.length - end;
    average_height = (top + content_height) / end;
    bottom = remaining * average_height;
    height_map.length = data.length;
  }

  async function handle_scroll() {
    const { scrollTop } = viewport;
    const old_start = start;
    for (let v = 0; v < els.length; v += 1) {
      height_map[start + v] = els[v].offsetHeight;
    }
    let i = 0;
    let x = 0;
    while (i < data.length) {
      const row_height = height_map[i] || average_height;
      if (x + row_height > scrollTop - top_buffer) {
        start = i;
        top = x;
        break;
      }
      x += row_height;
      i += 1;
    }
    while (i < data.length) {
      x += height_map[i] || average_height;
      i += 1;
      if (x > scrollTop + viewport_height + bottom_buffer) break;
    }
    end = i;
    const remaining = data.length - end;
    average_height = x / end;
    while (i < data.length) height_map[i++] = average_height;
    bottom = remaining * average_height;
    // prevent jumping if we scrolled up into unknown territory
    if (start < old_start) {
      await tick();
      let expected_height = 0;
      let actual_height = 0;
      for (let i = start; i < old_start; i += 1) {
        if (els[i - start]) {
          expected_height += height_map[i];
          actual_height += els[i - start].offsetHeight;
        }
      }
      const d = actual_height - expected_height;
      viewport.scrollTo(0, scrollTop + d);
    }
    // TODO if we overestimated the space these
    // rows would occupy we may need to add some
    // more. maybe we can just call handle_scroll again?
  }

  onMount(() => {
    els = document.getElementsByClassName("virtual-row");
    mounted = true;
    // document.addEventListener("mouseup", jexcel.mouseUpControls);
    // document.addEventListener("mousedown", jexcel.mouseDownControls);
    // document.addEventListener("mousemove", jexcel.mouseMoveControls);
    // document.addEventListener("mouseover", jexcel.mouseOverControls);
    // document.addEventListener("dblclick", jexcel.doubleClickControls);
    // document.addEventListener("paste", jexcel.pasteControls);
    // document.addEventListener("contextmenu", jexcel.contextMenuControls);
    // document.addEventListener("touchstart", jexcel.touchStartControls);
    // document.addEventListener("touchend", jexcel.touchEndControls);
    // document.addEventListener("touchcancel", jexcel.touchEndControls);
    // document.addEventListener("touchmove", jexcel.touchEndControls);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
  });

  function onMouseDown(e) {
    if (!e.target.dataset.x) return;
    edition = null;
    keydown = true;
    selection = [
      [e.target.dataset.x, e.target.dataset.y],
      [e.target.dataset.x, e.target.dataset.y],
    ];
  }

  function onMouseUp(e) {
    if (!!edition || !selection) return;
    keydown = false;
    selection = [
      selection[0] || [e.target.dataset.x, e.target.dataset.y],
      [e.target.dataset.x, e.target.dataset.y],
    ];
  }

  function onMouseOver(e) {
    if (!!edition) return;
    if (keydown && !!selection) {
      selection = [
        selection[0] || [e.target.dataset.x, e.target.dataset.y],
        [e.target.dataset.x, e.target.dataset.y],
      ];
    }
  }

  function onKeyUp(e) {
    keypressed[e.keyCode] = false;
  }

  function onKeyDown(e) {
    keypressed[e.keyCode] = true;
    // manage history (91 is command, 90 is z, shift is 27)
    if (keypressed[91] && keypressed[90] && keypressed[27]) {
      if (history.length == historyIndex) return;
      historyIndex = historyIndex++;
      data = history[historyIndex - 1];
      return;
    }
    if (keypressed[91] && keypressed[90]) {
      if (historyIndex == 1) return;
      historyIndex = historyIndex--;
      data = history[historyIndex - 1];
      return;
    }
    if (!!edition) {
      if (e.key == "Escape") {
        edition = null;
      }
      return;
    }
    if (!selection) return;
    switch (e.key) {
      case "ArrowDown":
        var s = [Number(selection[0][0]), Number(selection[0][1]) + 1];
        selection = [s, s];
        break;
      case "ArrowUp":
        var s = [Number(selection[0][0]), Number(selection[0][1]) - 1];
        selection = [s, s];
        break;
      case "ArrowLeft":
        var s = [Number(selection[0][0]) - 1, Number(selection[0][1])];
        selection = [s, s];
        break;
      case "ArrowRight":
        var s = [Number(selection[0][0]) + 1, Number(selection[0][1])];
        selection = [s, s];
        break;
      default:
        break;
    }
  }
  // initialize and refactor data
  $: (() => {
    if (data[0]) {
      if (!Array.isArray(data[0])) {
        columns = Object.keys(data[0]).map((k) => ({ name: k }));
        var d = [];
        for (var j = 0; j < data.length; j++) {
          var row = [];
          for (var i = 0; i < columns.length; i++) {
            row[i] = data[j][columns[i].name];
          }
          d.push(row);
        }
        data = d;
      }
    }

    // Adjust minimal dimensions
    var j = 0;
    var i = 0;
    var size_i = columns.length;
    var size_j = data.length;
    var min_i = config.minDimensions[0];
    var min_j = config.minDimensions[1];
    var max_i = min_i > size_i ? min_i : size_i;
    var max_j = min_j > size_j ? min_j : size_j;

    for (j = 0; j < max_j; j++) {
      for (i = 0; i < max_i; i++) {
        if (data[j] == undefined) {
          data[j] = [];
        }

        if (data[j][i] == undefined) {
          data[j][i] = "";
        }
      }
    }
  })();
</script>

<style>
  .sheet_container {
    display: inline-block;
    padding-right: 2px;
    box-sizing: border-box;
    overscroll-behavior: contain;
    outline: none;
  }
  table {
    border-collapse: separate;
    table-layout: fixed;
    white-space: nowrap;
    empty-cells: show;
    border: 0px;
    background-color: #fff;
    width: 0;
    border-top: 1px solid transparent;
    border-left: 1px solid transparent;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
  }
  tr.selected {
    background-color: #b8e7e3;
  }
  td.highlight-top {
    border-top: 1px solid black;
    box-shadow: -1px -1px #ccc;
  }
  td.highlight-bottom {
    border-bottom: 1px solid black;
  }
  td.highlight-left {
    border-left: 1px solid black;
    box-shadow: -1px -1px #ccc;
  }
  td.highlight-right {
    border-right: 1px solid black;
  }
  thead > tr > td.selected {
    background-color: #dcdcdc;
  }
  thead > tr > td {
    background-color: #f3f3f3;
    padding: 2px;
    cursor: pointer;
    box-sizing: border-box;
    overflow: hidden;
    position: sticky;
    top: 0;
    z-index: 2;
  }
  td {
    outline: none;
    cursor: default;
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }
  tbody > tr > td {
    padding: 4px;
    white-space: nowrap;
    box-sizing: border-box;
    line-height: 1em;
  }
  tbody > tr > td:first-child {
    position: relative;
    background-color: #f3f3f3;
    text-align: center;
  }
  tr.selected > td:first-child {
    background-color: #dcdcdc;
  }
  input {
    background: none;
    margin: -2px 0;
  }
</style>

<div
  class="w-full sheet_container"
  class:fullscreen={!!config.fullscreen}
  class:with-toolbar={config.tableOverflow != true && config.toolbar}
  on:mousedown={onMouseDown}
  on:mouseup={onMouseUp}
  on:mouseover={onMouseOver}
  tabindex="1">
  <div
    class="jexcel_content"
    style={config.tableWidth ? 'overflow-x: auto; width: ' + config.tableWidth + ';' : '' + config.tableHeight ? 'overflow-y: auto; max-height: ' + config.tableHeight + ';' : ''}
    bind:this={viewport}
    bind:offsetWidth={viewport_height}
    on:scroll={handle_scroll}>
    <table
      cellpadding="0"
      cellspacing="0"
      unselectable={true}
      style="padding-top: {top}px; padding-bottom: {bottom}px"
      bind:this={contents}>
      <colgroup>
        <col width={50} />
        {#each columns as col, i}
          <col width={columns[i].width || config.defaultColWidth} />
        {/each}
      </colgroup>
      <thead
        class:draggable={config.columnDrag || config.rowDrag}
        class:resizable={config.columnResize || config.rowResize}
        class="resizable">
        <tr>
          <td class="jexcel_selectall virtual-col" />
          {#each columns as col, i}
            <td
              on:click={(_) => (selection = [[i, 0], [i, data.length]])}
              data-x={i}
              title={columns[i].title || ''}
              class:selected={selection && i >= selection[0][0] && selection[1][0] >= i}
              class:hidden={columns[i].type == 'hidden'}
              style={`text-align: ${columns[i].align || config.defaultColAlign};`}>
              {columns[i].title || XLSX.utils.encode_col(i)}
            </td>
          {/each}
        </tr>
      </thead>
      <tbody
        class="draggable"
        bind:this={viewport}
        bind:offsetWidth={viewport_height}
        on:scroll={handle_scroll}>
        {#each visible as r}
          <tr
            class="virtual-row"
            data-y={r.i}
            class:selected={selection && r.i >= selection[0][1] && selection[1][1] >= r.i}>
            <td data-y={r.i} class="jexcel_row">{r.i + 1}</td>
            {#each r.data as cell, c}
              <td
                tabindex="-1"
                data-x={c}
                data-y={r.i}
                data-merged={GetColSpan(mergeCells, c, r.i) || GetRowSpan(mergeCells, c, r.i)}
                colspan={GetColSpan(mergeCells, c, r.i)}
                on:dblclick={(_) => (edition = [c, r.i])}
                class:highlight={selection && r.i >= selection[0][1] && selection[1][1] >= r.i && c >= selection[0][0] && selection[1][0] >= c}
                class:highlight-top={selection && r.i == selection[0][1] && c >= selection[0][0] && selection[1][0] >= c}
                class:highlight-bottom={selection && r.i == selection[1][1] && c >= selection[0][0] && selection[1][0] >= c}
                class:highlight-left={selection && c == selection[0][0] && r.i >= selection[0][1] && selection[1][1] >= r.i}
                class:highlight-right={selection && c == selection[1][0] && r.i >= selection[0][1] && selection[1][1] >= r.i}
                class:readonly={columns[c] && columns[c].readOnly}
                style={computeStyles(c, r.i, style, config, cell, data[r.i][c + 1])}>
                {#if String(edition) == String([c, r.i])}
                  <input
                    autofocus
                    bind:value={cell}
                    style={`width: ${columns[c].width || config.defaultColWidth}px; height: 22px; min-height: 22px;`} />
                {:else}{cell || ''}{/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

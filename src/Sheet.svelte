<script lang="ts">
  import { onMount, tick } from "svelte";
  import XLSX from "xlsx";
  import { defaultconfig } from "./defaultconfig";
  import type { Config } from "./defaultconfig";
  import { computeStyles, GetColSpan, GetRowSpan } from "./utilities";

  export let data: (string | number | boolean)[][] = [];
  export let columns: any[] = [];
  export let rows: any[] = [];
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
  export let startY = 0;
  export let startX = 0;
  export let endY = 0;
  export let endX = 0;
  // virtual list state
  let height_map = [];
  let width_map = [];
  let rowElements;
  let colElements;
  let viewport;
  let contents;
  let viewport_height = 0;
  let viewport_width = 0;
  let visibleY: { i: number; data: (string | number | boolean)[] }[];
  let visibleX: { i: number; data: (string | number | boolean)[] }[];
  let mounted;
  let top = 0;
  let left = 0;
  let top_buffer = 500;
  let bottom_buffer = 1000;
  let left_buffer = 500;
  let right_buffer = 1000;
  let bottom = 0;
  let right = 0;
  let average_height;
  let average_width;

  $: visibleY = data.slice(startY, endY).map((data, i) => {
    return { i: i + startY, data };
  });

  $: visibleX = columns.slice(startX, endX).map((data, i) => {
    return { i: i + startX, data };
  });

  // whenever `items` changes, invalidate the current heightmap
  $: if (mounted) refresh(data, viewport_height, viewport_width);

  function getColumnsWidth(i: number) {
    return Number(
      typeof columns[i]?.width == "string"
        ? columns[i]?.width.replace("px", "")
        : columns[i]?.width || config.defaultColWidth
    );
  }

  function getRowHeight(i: number) {
    return Number(
      rows[i]?.height?.replace("px", "") || 24 // consider adding a config.defaultRowHeight
    );
  }

  async function refresh(data, viewport_height, viewport_width) {
    const { scrollTop, scrollLeft } = viewport;
    await tick(); // wait until the DOM is up to date
    let content_height = top - scrollTop - bottom_buffer;
    let content_width = left - scrollLeft - left_buffer;
    // vertical
    let y = startY;
    while (content_height < viewport_height && y < data.length) {
      let row = rowElements[y - startY];
      if (!row) {
        endY = y + 1;
        await tick(); // render the newly visible row
        row = rowElements[y - startY];
      }
      const row_height = (height_map[y] = getRowHeight(y));
      content_height += row_height;
      y += 1;
    }
    endY = y;
    let remaining = data.length - endY;
    average_height = (top + content_height) / endY;
    bottom = remaining * average_height;
    height_map.length = data.length;
    // horizontal
    let x = startX;
    while (content_width < viewport_width && x < columns.length) {
      let col = colElements[x - startX];
      if (!col) {
        endX = x + 1;
        await tick(); // render the newly visible col
        col = colElements[x - startX];
      }
      const col_width = (width_map[x] = getColumnsWidth(x));
      content_width += col_width;
      x += 1;
    }
    endX = x;
    let remains = columns.length - endX;
    average_width = (left + content_width) / endX;
    right = remains * average_width;
    width_map.length = columns.length;
  }

  // $: scrollLeft = viewport?.scrollLeft;
  // $: scrollTop = viewport?.scrollTop;
  let scrollLeft;
  let scrollTop;

  $: (function scrollX() {
    if (!scrollLeft || !colElements) return;
    // if (!scrollLeft) ;
    // horizontal scrolling
    for (let v = 0; v < colElements.length; v += 1) {
      width_map[startX + v] = getColumnsWidth(startX + v);
    }
    let c = 0;
    let x = 0;
    while (c < columns.length) {
      const col_width = width_map[c] || average_width;
      if (x + col_width > scrollLeft - left_buffer) {
        startX = c;
        left = x;
        break;
      }
      x += col_width;
      c += 1;
    }
    while (c < columns.length) {
      x += width_map[c] || average_width;
      c += 1;
      if (x > scrollLeft + viewport_width + right_buffer) break;
    }
    endX = c;
    const remainingX = columns.length - endX;
    average_width = x / endX;
    while (c < columns.length) width_map[c++] = average_width;
    right = remainingX * average_width;
  })();

  $: (function scrollY() {
    if (!scrollTop || !rowElements) return;

    // vertical scrolling
    for (let v = 0; v < rowElements.length; v += 1) {
      height_map[startY + v] = getRowHeight(startY + v);
    }
    let r = 0;
    let y = 0;
    while (r < data.length) {
      const row_height = height_map[r] || average_height;
      if (y + row_height > scrollTop - top_buffer) {
        startY = r;
        top = y;
        break;
      }
      y += row_height;
      r += 1;
    }
    while (r < data.length) {
      y += height_map[r] || average_height;
      r += 1;
      if (y > scrollTop + viewport_height + bottom_buffer) break;
    }
    endY = r;
    const remaining = data.length - endY;
    average_height = y / endY;
    while (r < data.length) height_map[r++] = average_height;
    bottom = remaining * average_height;
  })();

  function handle_scroll(e) {
    scrollTop = viewport.scrollTop;
    scrollLeft = viewport.scrollLeft;
  }

  onMount(() => {
    rowElements = document.getElementsByClassName("virtual-row");
    colElements = document.getElementsByClassName("virtual-col");
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
  /* tbody > tr > td:first-child {
    position: relative;
    background-color: #f3f3f3;
    text-align: center;
  } */
  tr.selected > td:first-child {
    background-color: #dcdcdc;
  }

  div.col-resize {
    position: absolute;
    top: 0;
    cursor: col-resize;
    width: 1rem;
    height: 100%;
  }
  div.col-resize.right {
    right: 0;
  }
  div.col-resize.left {
    left: 0;
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
    bind:offsetHeight={viewport_height}
    bind:offsetWidth={viewport_width}
    on:scroll={handle_scroll}>
    <table
      cellpadding="0"
      cellspacing="0"
      unselectable={true}
      style="padding-top: {top}px; padding-bottom: {bottom}px; padding-left: {left}px; padding-right: {right}px;"
      bind:this={contents}>
      <colgroup>
        {#each visibleX as v}
          {#if v.i == 0}
            <col width={50} />
          {/if}
          <col width={getColumnsWidth(v.i)} />
        {/each}
      </colgroup>
      <thead
        class:draggable={config.columnDrag || config.rowDrag}
        class:resizable={config.columnResize || config.rowResize}
        class="resizable">
        <tr>
          {#each visibleX as c, i}
            {#if c.i == 0}
              <td class="jexcel_selectall virtual-col" />
            {/if}
            <td
              on:click={(_) => (selection = [[c.i, 0], [c.i, data.length]])}
              data-x={c.i}
              title={columns[c.i].title || ''}
              class="virtual-col"
              class:selected={selection && c.i >= selection[0][0] && selection[1][0] >= c.i}
              class:hidden={columns[c.i].type == 'hidden'}
              style={`text-align: ${columns[c.i].align || config.defaultColAlign};`}>
              {columns[c.i].title || XLSX.utils.encode_col(c.i)}
              <div class="col-resize left" />
              <div class="col-resize right" />
            </td>
          {/each}
        </tr>
      </thead>
      <tbody class="draggable" bind:this={viewport} on:scroll={handle_scroll}>
        {#each visibleY as r}
          <tr
            class="virtual-row"
            data-y={r.i}
            style={`height: ${rows[r.i] || '22px'}`}
            class:selected={selection && r.i >= selection[0][1] && selection[1][1] >= r.i}>
            {#each visibleX as x, i}
              {#if x.i == 0}
                <td
                  data-y={r.i}
                  style="background-color: #f3f3f3; text-align: center;"
                  class="jexcel_row">
                  {r.i + 1}
                </td>
              {/if}
              <td
                tabindex="-1"
                data-x={x.i}
                data-y={r.i}
                data-merged={GetColSpan(mergeCells, x.i, r.i) || GetRowSpan(mergeCells, x.i, r.i)}
                colspan={GetColSpan(mergeCells, x.i, r.i)}
                on:dblclick={(_) => (edition = [x.i, r.i])}
                class:highlight={selection && r.i >= selection[0][1] && selection[1][1] >= r.i && x.i >= selection[0][0] && selection[1][0] >= x.i}
                class:highlight-top={selection && r.i == selection[0][1] && x.i >= selection[0][0] && selection[1][0] >= x.i}
                class:highlight-bottom={selection && r.i == selection[1][1] && x.i >= selection[0][0] && selection[1][0] >= x.i}
                class:highlight-left={selection && x.i == selection[0][0] && r.i >= selection[0][1] && selection[1][1] >= r.i}
                class:highlight-right={selection && x.i == selection[1][0] && r.i >= selection[0][1] && selection[1][1] >= r.i}
                class:readonly={columns[x.i] && columns[x.i].readOnly}
                style={computeStyles(x.i, r.i, rows[r.i], style, config, data[r.i][x.i], data[r.i][x.i + 1])}>
                {#if String(edition) == String([x.i, r.i])}
                  <input
                    autofocus
                    bind:value={data[r.i][x.i]}
                    style={`width: ${columns[x.i].width || config.defaultColWidth}px; height: 22px; min-height: 22px;`} />
                {:else}{data[r.i][x.i] || ''}{/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

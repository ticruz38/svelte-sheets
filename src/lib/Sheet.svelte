<script lang="ts">
  import { onMount, tick } from "svelte";
  import XLSX from "xlsx";
  import { resizable } from "./actions";
  import { draggable } from "./actions/draggable";
  import type { Config } from "./defaultconfig";
  import { defaultconfig } from "./defaultconfig";
  import hotkeys from "hotkeys-js";
  import Menu from "./Menu.svelte";
  import {
    clearSelection,
    computeStyles,
    deleteSelection,
    GetColSpan,
    GetRowSpan,
    mergeSelectExtends,
    pasteSelection,
  } from "./utilities";

  export let data: (string | number | boolean)[][] = [];
  export let columns: any[] = [];
  let xcolumns: any[] = [];
  export let rows: any[] = [];
  let xrows: any[] = [];
  export let mergeCells: Record<string, number[]> = {};
  // export let rows: Record<string, any> = [];
  export let style: { [cellIndex: string]: string } = {};
  export let selected: [string, string] = null; // either null, or coordinates [[x, y], [x, y]]
  export let extended: [string, string] = null;
  export let currentValue: string | number | boolean = "";
  export let clipboard: [string, string];

  export let options: Config;

  const encode = ({ c, r }) =>
    XLSX.utils.encode_cell({ c: Number(c), r: Number(r) });
  const decode = XLSX.utils.decode_cell;
  $: decoded = selected
    ? [decode(selected[0]), decode(selected[1])]
    : [
        { c: 0, r: 0 },
        { c: 0, r: 0 },
      ];
  $: config = {
    ...defaultconfig,
    ...(options || {}),
  };
  // Containers
  let history: string[] = [];
  let highlighted = [];

  // Internal controllers
  let cmdz = false;
  let selection = false;
  let extension = false;
  let cursor = null;
  let historyIndex = 0;
  let ignoreEvents = false;
  let ignoreHistory = false;
  let edition = null;
  let hashString = null;
  let resizing = null;
  let dragging = null;
  let keypressed = {};

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
  let top_buffer = 2500;
  let bottom_buffer = 2500;
  let left_buffer = 2500;
  let right_buffer = 2500;
  let bottom = 0;
  let right = 0;
  let average_height;
  let average_width;

  $: xrows =
    endY > data.length ? Array.from({ length: endY - data.length }) : [];

  $: xcolumns =
    endX > columns.length
      ? Array.from({ length: endX - columns.length }, (v, i) => ({}))
      : [];

  $: visibleY = [...data, ...xrows].slice(startY, endY).map((d, i) => {
    return { i: i + startY, data: d };
  });

  $: visibleX = [...columns, ...xcolumns].slice(startX, endX).map((d, i) => {
    return { i: i + startX, data: d };
  });

  // whenever `items` changes, invalidate the current heightmap
  $: if (mounted) refresh(data, viewport_height, viewport_width);

  $: {
    try {
      currentValue = data[decoded[0].r][decoded[0].c];
    } catch (e) {
      currentValue = "";
    }
  }

  function getColumnsWidth(i: number) {
    return Number(
      typeof columns[i]?.width == "string"
        ? columns[i]?.width.replace("px", "")
        : columns[i]?.width || config.defaultColWidth
    );
  }

  function getRowHeight(i: number) {
    try {
      const height = Number(
        typeof rows[i]?.height == "string"
          ? rows[i]?.height?.replace("px", "")
          : rows[i]?.height || 24 // consider adding a config.defaultRowHeight
      );
      return height > 24 ? height : 24;
    } catch (e) {
      return 24;
    }
  }

  export function onInputChange(value, row, column) {
    cmdz = true;
    if (row.i > data.length - 1) {
      data = [
        ...data,
        ...Array.from({ length: row.i - data.length + 1 }, (v, i) => {
          if (i == row.i) {
            return Array.from({ length: columns.length }, (_, i) => {
              if (i == column.i) {
                return value;
              } else {
                return "";
              }
            });
          } else {
            return Array.from({ length: columns.length }, (_) => "");
          }
        }),
      ];
    } else {
      data[row.i][column.i] = value;
    }
  }

  async function refresh(data, viewport_height, viewport_width) {
    const { scrollTop, scrollLeft } = viewport;
    await tick(); // wait until the DOM is up to date
    let content_height = top - scrollTop - bottom_buffer;
    let content_width = left - scrollLeft - left_buffer;
    // vertical
    let y = startY;
    while (content_height < viewport_height) {
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
    while (content_width < viewport_width) {
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
    while (true) {
      const col_width = width_map[c] || average_width;
      if (x + col_width > scrollLeft - left_buffer) {
        startX = c;
        left = x;
        break;
      }
      x += col_width;
      c += 1;
    }
    while (true) {
      x += width_map[c] || average_width;
      c += 1;
      if (x > scrollLeft + viewport_width + right_buffer) break;
    }
    endX = c;
    const remaining =
      endX > columns.length
        ? (viewport_width + right_buffer) / 24
        : columns.length - endX;
    average_width = x / endX;
    // while (c < columns.length) width_map[c++] = average_width;
    right = remaining * average_width;
  })();

  $: (function scrollY() {
    if (!scrollTop || !rowElements) return;

    // vertical scrolling
    for (let v = 0; v < rowElements.length; v += 1) {
      height_map[startY + v] = getRowHeight(startY + v);
    }
    let r = 0;
    let y = 0;
    while (true) {
      const row_height = height_map[r] || average_height;
      if (y + row_height > scrollTop - top_buffer) {
        startY = r;
        top = y;
        break;
      }
      y += row_height;
      r += 1;
    }
    while (true) {
      y += height_map[r] || average_height;
      r += 1;
      if (y > scrollTop + viewport_height + bottom_buffer) break;
    }
    endY = r;
    const remaining =
      endY > data.length
        ? (viewport_height + bottom_buffer) / 24
        : data.length - endY;
    average_height = y / endY;
    // while (r < data.length) height_map[r++] = average_height;
    bottom = remaining * average_height;
  })();

  function handle_scroll(e) {
    scrollTop = viewport.scrollTop;
    scrollLeft = viewport.scrollLeft;
  }

  onMount(() => {
    if (window && window.document) {
      rowElements = document?.getElementsByClassName("virtual-row");
      colElements = document?.getElementsByClassName("virtual-col");
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
      document?.addEventListener("keydown", onKeyDown);
      document?.addEventListener("keyup", onKeyUp);
    }
  });

  function onMouseDown(e) {
    // if right click
    if (e.which == 3) return;
    console.log("mousedown", e.which);
    if (e.target.id == "square") {
      extension = true;
      selection = false;
      return;
    }
    if (!e.target.dataset.x || !e.target.dataset.y) return;
    if (keypressed[16] && selected && selected[0]) {
      edition = null;
      selected = [
        selected[0],
        encode({ c: e.target.dataset.x, r: e.target.dataset.y }),
      ];
      return;
    }
    edition = null;
    // extension = false;
    selection = true;
    selected = [
      encode({ c: e.target.dataset.x, r: e.target.dataset.y }),
      encode({ c: e.target.dataset.x, r: e.target.dataset.y }),
    ];
  }

  function onMouseUp(e) {
    if (!!selected && !selection && extension) {
      extension = false;
      data = mergeSelectExtends(data, selected, extended);
      selected = extended;
      return;
    }
    if (!!edition || !selected || !selection) return;
    selection = false;
    extended = selected;
  }

  function onMouseOver(e) {
    if (!!edition) return;
    if (!!selected && !selection && extension && e.target?.dataset?.x) {
      if (
        // extended is inside selected
        e.target?.dataset?.x >= topLeft.c &&
        e.target?.dataset?.x < bottomRight.c &&
        e.target?.dataset?.y >= topLeft.r &&
        e.target?.dataset?.y < bottomRight.r
      ) {
        extended = [
          encode(topLeft),
          encode({
            c: e.target.dataset.x,
            r: e.target.dataset.y,
          }),
        ];
        return;
      }
      if (
        e.target?.dataset?.y >= topLeft.r &&
        e.target?.dataset?.y < bottomRight.r
      ) {
        extended = [
          squareX < 0
            ? encode({ c: bottomRight.c - 1, r: topLeft.r })
            : selected[0],
          encode({ r: decoded[1].r, c: e.target.dataset.x }),
        ];
      }
      if (
        e.target?.dataset?.x >= topLeft.c &&
        e.target?.dataset?.x < bottomRight.c
      ) {
        extended = [
          squareY < 0
            ? encode({ r: bottomRight.r - 1, c: topLeft.c })
            : selected[0],
          encode({ r: e.target.dataset.y, c: decoded[1].c }),
        ];
      }
      return;
    }
    if (selection && !!selected && e.target?.dataset?.x) {
      selected = [
        selected[0] ||
          encode({
            c: e.target.dataset.x,
            r: e.target.dataset.y,
          }),
        encode({
          c: e.target.dataset.x,
          r: e.target.dataset.y,
        }),
      ];
    }
  }

  function onKeyUp(e) {
    // on keyup just reinitialize everything
    keypressed[e.keyCode] = false;
  }

  hotkeys("ctrl+z, command+z", function (e) {
    e.preventDefault();
    cmdz = true;
    if (historyIndex == 0) return;
    historyIndex -= 1;
    const res = JSON.parse(history[historyIndex]);
    data = res.data;
    columns = res.columns;
    rows = res.rows;
    style = res.style;
    setTimeout((_) => (cmdz = false), 10);
  });

  hotkeys("ctrl+shift+z, command+shift+z", function (e) {
    console.log("redo");
    e.preventDefault();
    cmdz = true;
    if (history.length - 1 == historyIndex) return;
    historyIndex = historyIndex + 1;
    const res = JSON.parse(history[historyIndex]);
    data = res.data;
    columns = res.columns;
    rows = res.rows;
    style = res.style;
    setTimeout((_) => (cmdz = false), 10);
  });

  hotkeys("ctrl+c, command+c, ctrl+x, command+x", function (e) {
    e.preventDefault();
    clipboard = JSON.stringify(selected);
  });

  hotkeys("ctrl+v, command+v", function (e) {
    e.preventDefault();
    if (!clipboard) return;
    data = pasteSelection(data, JSON.parse(clipboard), selected);
  });

  function onKeyDown(e) {
    keypressed[e.keyCode] = true;
    if (!!edition) {
      if (e.key == "Escape") {
        edition = null;
      }
      return;
    }
    if (!selected) return;
    switch (e.key) {
      case "ArrowDown":
        var s = encode({
          c: decoded[0].c,
          r: decoded[0].r + 1,
        });
        selected = [s, s];
        break;
      case "ArrowUp":
        var s = encode({
          c: decoded[0].c,
          r: decoded[0].r - 1,
        });
        selected = [s, s];
        break;
      case "ArrowLeft":
        var s = encode({
          c: decoded[0].c - 1,
          r: decoded[0].r,
        });
        selected = [s, s];
        break;
      case "ArrowRight":
        var s = encode({
          c: decoded[0].c + 1,
          r: decoded[0].r,
        });
        selected = [s, s];
        break;
      default:
        break;
    }
  }

  let menuX;
  let menuY;
  function showMenu(e) {
    e.preventDefault();
    // e.stopImmediatePropagation();
    e.stopPropagation();
    menuX = e.screenX;
    menuY = e.screenY - 70;
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
  // square selection
  let tops;
  let rights;
  let lefts;
  let bottoms;
  let topextend;
  let rightextend;
  let leftextend;
  let bottomextend;
  let colLine;
  let rowLine;
  let square;
  let squareX;
  let squareY;
  let topLeft;
  let bottomRight;
  $: {
    if (extension && extended) {
      let tl = (selected && decode(extended[0])) || { c: 0, r: 0 };
      let br = (selected && decode(extended[1])) || { c: 0, r: 0 };
      topLeft = {
        c: br.c < tl.c ? br.c : tl.c,
        r: br.r < tl.r ? br.r : tl.r,
      };
      bottomRight = {
        c: br.c > tl.c ? br.c + 1 : tl.c + 1,
        r: br.r > tl.r ? br.r + 1 : tl.r + 1,
      };
      let top = 28;
      let right = 51;
      let bottom = 28;
      let left = 51;
      for (let i = 0; i < topLeft.r; i++) {
        top = top + getRowHeight(i);
      }
      for (let i = 0; i < topLeft.c; i++) {
        left = left + getColumnsWidth(i);
      }
      for (let i = 0; i < bottomRight.r; i++) {
        bottom = bottom + getRowHeight(i);
      }
      for (let i = 0; i < bottomRight.c; i++) {
        right = right + getColumnsWidth(i);
      }
      topextend.style = `width: ${
        right - left
      }px; left: ${left}px; top: ${top}px`;
      rightextend.style = `height: ${
        bottom - top
      }px; left: ${right}px; top: ${top}px`;
      bottomextend.style = `width: ${
        right - left
      }px; left: ${left}px; top: ${bottom}px`;
      leftextend.style = `height: ${
        bottom - top
      }px; left: ${left}px; top: ${top}px`;
    }
  }

  let selectWidth: number;
  let selectHeight: number;

  $: {
    if (mounted) {
      let tl = (selected && decode(selected[0])) || { c: 0, r: 0 };
      let br = (selected && decode(selected[1])) || { c: 0, r: 0 };
      topLeft = {
        c: br.c < tl.c ? br.c : tl.c,
        r: br.r < tl.r ? br.r : tl.r,
      };
      bottomRight = {
        c: br.c > tl.c ? br.c + 1 : tl.c + 1,
        r: br.r > tl.r ? br.r + 1 : tl.r + 1,
      };
      let top = 28;
      let right = 51;
      let bottom = 28;
      let left = 51;
      for (let i = 0; i < topLeft.r; i++) {
        top = top + getRowHeight(i);
      }
      for (let i = 0; i < topLeft.c; i++) {
        left = left + getColumnsWidth(i);
      }
      for (let i = 0; i < bottomRight.r; i++) {
        bottom = bottom + getRowHeight(i);
      }
      for (let i = 0; i < bottomRight.c; i++) {
        right = right + getColumnsWidth(i);
      }
      tops.style = `width: ${right - left}px; left: ${left}px; top: ${top}px`;
      rights.style = `height: ${
        bottom - top
      }px; left: ${right}px; top: ${top}px`;
      bottoms.style = `width: ${
        right - left
      }px; left: ${left}px; top: ${bottom}px`;
      lefts.style = `height: ${bottom - top}px; left: ${left}px; top: ${top}px`;
      colLine.style = `width: ${right - left}px; left: ${left}px; top: 28px;`;
      rowLine.style = `height: ${bottom - top}px; left: 51px; top: ${top}px`;
      square.style = `left:${right}px; top:${bottom}px`;
      selectWidth = right - left;
      selectHeight = bottom - top;
    }
  }
  // history logic

  function historyPush(data, rows, columns, style) {
    if (!cmdz) {
      const step = { data, rows, columns, style };
      if (history[historyIndex] != JSON.stringify(step)) {
        history = [...history.slice(0, historyIndex + 1), JSON.stringify(step)];
        historyIndex = history.length - 1;
      }
    }
  }
</script>

<div
  class="w-full sheet_container"
  class:fullscreen={!!config.fullscreen}
  class:with-toolbar={config.tableOverflow != true && config.toolbar}
  on:contextmenu={(e) => showMenu(e)}
  on:mousedown={onMouseDown}
  on:mouseup={onMouseUp}
  on:mouseover={onMouseOver}
  tabindex="1"
>
  <div
    class="jexcel_content"
    style={config.tableWidth
      ? "overflow-x: auto; width: " + config.tableWidth + ";"
      : "" + config.tableHeight
      ? "overflow-y: auto; max-height: " + config.tableHeight + ";"
      : ""}
    bind:this={viewport}
    bind:offsetHeight={viewport_height}
    bind:offsetWidth={viewport_width}
    on:scroll={handle_scroll}
  >
    <table
      cellpadding="0"
      cellspacing="0"
      unselectable={true}
      on:click={(e) => (menuX = 0)}
      style="padding-top: {top}px; padding-bottom: {bottom}px; padding-left: {left}px; padding-right: {right}px;"
      bind:this={contents}
    >
      <div
        class="top-extend absolute"
        class:hidden={!extension}
        bind:this={topextend}
      />
      <div
        class="bottom-extend absolute"
        class:hidden={!extension}
        bind:this={bottomextend}
      />
      <div
        class="left-extend absolute"
        class:hidden={!extension}
        bind:this={leftextend}
      />
      <div
        class="right-extend absolute"
        class:hidden={!extension}
        bind:this={rightextend}
      />
      <div class="top-select absolute" bind:this={tops} />
      <div class="bottom-select absolute" bind:this={bottoms} />
      <div class="left-select absolute" bind:this={lefts} />
      <div class="right-select absolute" bind:this={rights} />
      <div class="col-line absolute" bind:this={colLine} />
      <div class="row-line absolute" bind:this={rowLine} />
      <div
        tabindex={-1}
        use:draggable
        on:dragging={(e) => {
          squareX = e.detail.x;
          squareY = e.detail.y;
        }}
        class="square absolute"
        id="square"
        bind:this={square}
      />
      <Menu
        show={!!menuX}
        x={menuX}
        y={menuY}
        copy={(e) => (clipboard = selected)}
        cut={(e) => (clipboard = selected)}
        paste={(e) => (data = pasteSelection(data, clipboard, selected))}
        clear={(e) => (data = clearSelection(data, selected))}
        delet={(e) => (data = deleteSelection(data, selected))}
      />
      <colgroup>
        <col width={50} />
        {#each visibleX as v}
          <col width={getColumnsWidth(v.i)} />
        {/each}
      </colgroup>
      <thead
        class:draggable={config.columnDrag || config.rowDrag}
        class:resizable={config.columnResize || config.rowResize}
        class="resizable"
      >
        <tr>
          <th class="jexcel_selectall virtual-col" />
          {#each visibleX as c, i}
            <td
              on:click={(_) =>
                (selected =
                  keypressed[16] && selected && selected[0]
                    ? [
                        encode({
                          c: decoded[0].c,
                          r: 0,
                        }),
                        encode({
                          c: c.i,
                          r: data.length - 1,
                        }),
                      ]
                    : [
                        encode({
                          c: c.i,
                          r: 0,
                        }),
                        encode({ c: c.i, r: data.length - 1 }),
                      ])}
              data-x={c.i}
              title={c.data.title || ""}
              class="virtual-col"
              class:selected={selected &&
                c.i >= topLeft.c &&
                bottomRight.c - 1 >= c.i}
              class:hidden={c.data.type == "hidden"}
              style={`text-align: ${c.data.align || config.defaultColAlign};`}
            >
              {c.data.title || XLSX.utils.encode_col(c.i)}
              <div
                use:resizable
                on:resizing={(e) =>
                  c.i != 0 &&
                  (columns[c.i - 1] = {
                    ...(columns[c.i - 1] || {}),
                    width: getColumnsWidth(c.i - 1) + e.detail.x,
                  })}
                class="col-resize left"
              />
              <div
                class="col-resize right"
                use:resizable
                on:resizing={(e) =>
                  (columns[c.i] = {
                    ...(columns[c.i] || {}),
                    width: getColumnsWidth(c.i) + e.detail.x,
                  })}
              />
            </td>
          {/each}
        </tr>
      </thead>
      <tbody class="draggable" bind:this={viewport} on:scroll={handle_scroll}>
        {#each visibleY as r}
          <tr
            class="virtual-row"
            data-y={r.i}
            style={`height: ${getRowHeight(r.i)}px`}
          >
            <th
              data-y={r.i}
              class:selected={selected &&
                r.i >= topLeft.r &&
                bottomRight.r - 1 >= r.i}
              style={`background-color:
              #f3f3f3;
              text-align:
              center;
              height:
              ${getRowHeight(r.i)}px;`}
              on:click={(e) =>
                (selected =
                  keypressed[16] && selected && selected[0]
                    ? [
                        encode({
                          c: 0,
                          r: decoded[0].r,
                        }),
                        encode({
                          c: data[0].length - 1,
                          r: r.i,
                        }),
                      ]
                    : [
                        encode({
                          c: 0,
                          r: r.i,
                        }),
                        encode({ c: data[0].length - 1, r: r.i }),
                      ])}
            >
              <div
                class="row-resize top"
                use:resizable
                on:resizing={(e) =>
                  r.i != 0 &&
                  (rows[r.i - 1] = {
                    ...(rows[r.i - 1] || {}),
                    height: getRowHeight(r.i - 1) + e.detail.y,
                  })}
              />
              <div
                class="row-resize bottom"
                use:resizable
                on:resizing={(e) =>
                  (rows[r.i] = {
                    ...(rows[r.i] || {}),
                    height: getRowHeight(r.i) + e.detail.y,
                  })}
              />
              {r.i + 1}
            </th>
            {#each visibleX as x, i}
              <td
                tabindex="-1"
                data-x={x.i}
                data-y={r.i}
                data-merged={GetColSpan(mergeCells, x.i, r.i) ||
                  GetRowSpan(mergeCells, x.i, r.i)}
                colspan={GetColSpan(mergeCells, x.i, r.i)}
                class:selected={x.i >= topLeft.c &&
                  x.i < bottomRight.c &&
                  r.i >= topLeft.r &&
                  r.i < bottomRight.r}
                on:dblclick={(_) => (edition = [x.i, r.i])}
                class:readonly={columns[x.i] && columns[x.i].readOnly}
                style={computeStyles(
                  x.i,
                  r.i,
                  rows[r.i],
                  style,
                  config,
                  r.data && r.data[x.i],
                  r.data && r.data[x.i + 1]
                )}
              >
                {#if String(edition) == String([x.i, r.i])}
                  <input
                    autofocus
                    on:blur={(e) => {
                      cmdz = false;
                      historyPush(data, rows, columns, style);
                    }}
                    on:input={(e) => onInputChange(e.target.value, r, x)}
                    value={(data[r.i] && data[r.i][x.i]) || ""}
                    style={`width: ${getColumnsWidth(
                      x.i
                    )}px; height: ${getRowHeight(r.i)}px; min-height: 22px;`}
                  />
                {:else}{(r.data && r.data[x.i]) || ""}{/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  *,
  ::before,
  ::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: #e0e0e0;
  }

  :root {
    tab-size: 4;
  }
  .jexcel_content {
    overflow-x: auto;
    overflow-y: auto;
    max-width: 100vw;
    max-height: 100vh;
  }
  .sheet_container {
    display: block;
    padding-right: 2px;
    box-sizing: border-box;
    overscroll-behavior: contain;
    outline: none;
    position: relative;
    user-select: none;
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
    text-indent: 0;
  }
  /* tr.selected {
    background-color: #b8e7e3;
  } */
  thead > tr > td.selected {
    background-color: #dcdcdc;
    color: teal;
  }
  thead > tr > td {
    background-color: #f3f3f3;
    padding: 2px;
    cursor: s-resize;
    box-sizing: border-box;
    overflow: hidden;
    position: sticky;
    top: 0;
    z-index: 2;
  }
  td {
    outline: none;
    cursor: default;
    line-height: 14px;
    font-size: 14px;
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
    text-align: end;
    cursor: cell;
  }
  tbody > tr > td.selected {
    background-color: #ddd;
    transition: all 0.1s linear;
  }
  tbody > tr > th,
  thead > tr > th {
    position: sticky;
    left: 0;
    cursor: e-resize;
    top: auto;
    background: #f3f3f3;
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    z-index: 10;
    font-weight: normal;
    height: 27px;
  }

  /* tbody > tr > td:first-child {
    position: relative;
    background-color: #f3f3f3;
    text-align: center;
  } */
  tbody > tr > th.selected {
    background-color: #dcdcdc !important;
    color: teal;
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

  div.row-resize {
    position: absolute;
    left: 0;
    cursor: row-resize;
    width: 100%;
    height: 0.5rem;
  }

  div.row-resize.top {
    top: 0;
  }
  div.row-resize.bottom {
    bottom: 0;
  }
  input {
    background: none;
    margin: -4px 0;
    outline: none;
  }
  .absolute {
    position: absolute;
    z-index: 10;
    transition: all 0.1s linear;
  }
  .top-select,
  .bottom-select,
  .col-line {
    border-bottom: 2px solid teal;
  }
  .left-select,
  .right-select {
    border-left: 2px solid teal;
  }

  .top-extend,
  .bottom-extend {
    border-bottom: 2px solid #aaa;
  }
  .left-extend,
  .right-extend {
    border-left: 2px solid #aaa;
  }
  .row-line {
    border-right: 1px solid teal;
  }
  .square {
    height: 8px;
    width: 8px;
    cursor: crosshair;
    border: 1px solid white;
    background: teal;
    transform: translate3D(-40%, -40%, 0);
  }
  .hidden {
    display: none;
  }
</style>

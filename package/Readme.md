# Svelte Spreadsheets

Ultra fast excel sheets in the browser. Hugely inspired by JExcel, built on XLSX shoulders.

=> Find a live example [Here](https://ticruz38.github.io/svelte-sheets/)

### Motivation

Making excel sheets a reality in the browser can be incredibly difficult, keeping good performance while drawing and editing large amount of data in the DOM is the ultimate challenge for a web developper.
The best implementation I could find was the awesome vanillajs [jexcel](https://github.com/jspreadsheet/jexcel) by Paul Hodel. <br/>
However, opening really big spreadsheet would still block the JS thread for a minute or two.
Following Rich Harris talk about reactivity, I decided to take the idea behind Jexcel and adapt it to Svelte, making use of a Virtual List to keep the DOM small and light at all times.

### Known limitation

You will need to have typescript svelte-preprocess enabled in your webpack/rollup configuration

### Installation

`npm i -S svelte-sheets`

### Example

```html
<script>
  import { Sheet } from "svelte-sheets";

  let style = {
    A1: "background-color: red",
  };
  let mergeCells = {
    A1: [5, 0], // 5 horizontally merged cell (colspan), 0 vertically merged cells (rowspan)
  };
  let columns = [{ width: "50px" }];
  let data = [
    ["mazda", "renault", "volkswagen"][("10000km", "20000km", "300000km")],
  ];
</script>

<Sheet {style} {mergeCells} {columns} {data} />
```

Alternatively you can use the toolbar to open any kind of excel files

```html
<script>
  import { Sheet, Toolbar } from "svelte-sheets";

  let sheetNames;
  let sheets;
  let active;
  let data;
  let columns;
  let mergeCells;
  let style;

  $: {
    data = sheets[active].data;
    columns = sheets[active].columns;
    mergeCells = sheets[active].mergeCells;
    style = sheets[active].style;
  }
</script>

<Toolbar bind:sheetNames bind:sheets bind:active />
<Sheet {style} {mergeCells} {columns} {data} />
```

You can configure the table such as height and many other things with the options props:

```js
let options = {
  tableHeight: "90vh",
  defaultColWidth: "50px",
};
```

Many of this options will be implemented later, so expect most of them to be unresponsible.

### Things yet to be done

- Make a svelte REPL demonstrating the library (awaiting repl typescript support)
- ✅ Undo/Redo (mapping keyboard shortcuts)
- ✅ shift+click should extend the selection
- ✅ Resizing rows/columns
- Filtering
- ✅ Copy/Paste
- Comments on cells
- Support more that number, string or boolean in cells. let's say charts, datepickers etc...
- ✅ Implement a tooltip when right clicking a cell with a list of actions
- All other excel features you can think of

export function getColumnName(i) {
  var letter = "";
  if (i > 701) {
    letter += String.fromCharCode(64 + parseInt(i / 676));
    letter += String.fromCharCode(64 + parseInt((i % 676) / 26));
  } else if (i > 25) {
    letter += String.fromCharCode(64 + parseInt(i / 26));
  }
  letter += String.fromCharCode(65 + (i % 26));

  return letter;
}

/**
 * Convert jexcel id to excel like column name
 *
 * @param string id
 * @return string id
 */
export function getColumnNameFromId(cellId) {
  if (!Array.isArray(cellId)) {
    cellId = cellId.split("-");
  }

  return getColumnName(parseInt(cellId[0])) + (parseInt(cellId[1]) + 1);
}

/**
 * Convert excel like column to jexcel id
 *
 * @param string id
 * @return string id
 */
export function getIdFromColumnName(id, arr) {
  // Get the letters
  var t = /^[a-zA-Z]+/.exec(id);

  if (t) {
    // Base 26 calculation
    var code = 0;
    for (var i = 0; i < t[0].length; i++) {
      code +=
        parseInt(t[0].charCodeAt(i) - 64) * Math.pow(26, t[0].length - 1 - i);
    }
    code--;
    // Make sure jexcel starts on zero
    if (code < 0) {
      code = 0;
    }

    // Number
    var number = parseInt(/[0-9]+$/.exec(id));
    if (number > 0) {
      number--;
    }

    if (arr == true) {
      id = [code, number];
    } else {
      id = code + "-" + number;
    }
  }

  return id;
}

export function convert(workbook) {
  var spreadsheets = [];
  workbook.SheetNames.forEach(function (sheetName) {
    var spreadsheet = {
      rows: [],
      columns: [],
      data: [],
      style: {},
      sheetName: sheetName,
      mergeCells: [],
    };

    // Column widths
    var temp = workbook.Sheets[sheetName]["!cols"];
    if (temp && temp.length) {
      for (var i = 0; i < temp.length; i++) {
        spreadsheet.columns[i] = {};
        if (temp[i] && temp[i].wpx) {
          spreadsheet.columns[i].width = temp[i].wpx + "px";
        }
      }
    }
    // Rows heights
    var temp = workbook.Sheets[sheetName]["!rows"];
    if (temp && temp.length) {
      for (var i = 0; i < temp.length; i++) {
        if (temp[i] && temp[i].hpx) {
          spreadsheet.rows[i] = {};
          spreadsheet.rows[i].height = temp[i].hpx + "px";
        }
      }
    }
    // Merge cells
    var temp = workbook.Sheets[sheetName]["!merges"];
    if (temp && temp.length > 0) {
      for (var i = 0; i < temp.length; i++) {
        var x1 = temp[i].s.c;
        var y1 = temp[i].s.r;
        var x2 = temp[i].e.c;
        var y2 = temp[i].e.r;
        var key = getColumnNameFromId([x1, y1]);
        spreadsheet.mergeCells[key] = [x2 - x1 + 1, y2 - y1 + 1];
      }
    }
    // Data container
    var max_x = 0;
    var max_y = 0;
    var temp = Object.keys(workbook.Sheets[sheetName]);
    for (var i = 0; i < temp.length; i++) {
      if (temp[i].substr(0, 1) != "!") {
        var cell = workbook.Sheets[sheetName][temp[i]];
        var info = getIdFromColumnName(temp[i], true);
        if (!spreadsheet.data[info[1]]) {
          spreadsheet.data[info[1]] = [];
        }
        spreadsheet.data[info[1]][info[0]] = cell.f ? "=" + cell.f : cell.w;
        if (max_x < info[0]) {
          max_x = info[0];
        }
        if (max_y < info[1]) {
          max_y = info[1];
        }
        // Style
        if (cell.style && Object.keys(cell.style).length > 0) {
          spreadsheet.style[temp[i]] = cell.style;
        }
        if (cell.s && cell.s.fgColor) {
          if (spreadsheet.style[temp[i]]) {
            spreadsheet.style[temp[i]] += ";";
          }
          // console.log(
          //   "style bg-color ",
          //   spreadsheet.style[temp[i]],
          //   cell.s.fgColor.rgb
          // );
          spreadsheet.style[temp[i]] =
            (spreadsheet.style[temp[i]] || "") +
            "background-color:#" +
            cell.s.fgColor.rgb;
        }
      }
    }
    // ensure we have enough columns to display all the data
    const maxColumns = spreadsheet.data.reduce(
      (acc, cur) => (cur.length > acc ? (acc = cur.length) : acc),
      0
    );
    spreadsheet.columns = spreadsheet.columns.slice(0, maxColumns);
    for (var i = 0; i <= maxColumns; i++) {
      if (!spreadsheet.columns[i]) {
        spreadsheet.columns[i] = { width: "100px" };
      }
    }

    for (var j = 0; j <= max_y; j++) {
      for (var i = 0; i <= max_x; i++) {
        if (!spreadsheet.data[j]) {
          spreadsheet.data[j] = [];
        }
        if (!spreadsheet.data[j][i]) {
          if (maxColumns < i) {
            spreadsheet.data[j][i] = "";
          }
        }
      }
    }
    spreadsheets.push(spreadsheet);
  });

  return spreadsheets;
}

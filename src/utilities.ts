import XLSX from "xlsx";

export const computeStyles = (c, r, style, options, value, nextValue) => {
  return `text-align: ${c.align || "center"}; 
  ${r && r.height ? "height: " + r.height : "22px; "}
  ${
    c.wordWrap != false &&
    (options.wordWrap || c.wordwrap || value?.length > 200)
      ? "white-space: pre-wrap;"
      : ""
  }
  overflow: ${nextValue && nextValue.length ? "hidden" : "visible"};
  ${style[XLSX.utils.encode_cell({ c, r })]}
  `;
};

export function GetCellByAddress(map, c, r) {
  return map[
    XLSX.utils.encode_cell({
      c,
      r,
    })
  ];
}

export function GetColSpan(map, c, r) {
  return (
    (GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[0]) || undefined
  );
}

export function GetRowSpan(map, c, r) {
  return (
    (GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[1]) || undefined
  );
}

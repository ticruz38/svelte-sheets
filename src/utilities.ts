import XLSX from "xlsx";
import btob from "b64-to-blob"

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

export async function download(sheets: any[], fileName: string) {
  const wb = XLSX.utils.book_new();
  const wss: XLSX.WorkSheet[] = [];
  sheets.map((s, i) => {
    const ws = XLSX.utils.aoa_to_sheet(s.data);
    XLSX.utils.book_append_sheet(wb, ws, s.sheetName);
  });
  XLSX.writeFile(wb, fileName);
}

export async function upload(
  sheets: any[],
  uploadURL: string
): Promise<Error[]> {
  if (!sheets) return;
  const wb = XLSX.utils.book_new();
  sheets.map((s, i) => {
    const ws = XLSX.utils.aoa_to_sheet(s.data);
    XLSX.utils.book_append_sheet(wb, ws, s.sheetName);
  });
  const wbout = XLSX.write(wb, {
    bookType: "xlsx",
    bookSST: false,
    type: "base64",
  });
  const formData = new FormData();
  formData.append(
    "file",
    btob(
      wbout,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ),
    "test.xlsx"
  );
  const req = await fetch(uploadURL, {
    method: "POST",
    body: formData,
  });
  if (req.status == 400) {
    const res = await req.json(); // res contains the list of errors
    return res;
  }
  return [];
}

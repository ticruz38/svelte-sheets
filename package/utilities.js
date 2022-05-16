var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as XLSX from "xlsx";
import btob from "b64-to-blob";
function getRowHeight(row) {
    var _a;
    try {
        const height = Number(typeof (row === null || row === void 0 ? void 0 : row.height) == "string"
            ? (_a = row === null || row === void 0 ? void 0 : row.height) === null || _a === void 0 ? void 0 : _a.replace("px", "")
            : (row === null || row === void 0 ? void 0 : row.height) || 24 // consider adding a config.defaultRowHeight
        );
        return height > 24 ? height : 24;
    }
    catch (e) {
        return 24;
    }
}
export const computeStyles = (c, r, row, style, options, value, nextValue) => {
    // ${
    //   c.wordWrap != false &&
    //   (options.wordWrap || c.wordwrap || value?.length > 200)
    //     ? "white-space: pre-wrap;"
    //     : ""
    // }
    return `text-align: ${c.align || "center"}; 
  height: ${getRowHeight(row)}px;
  overflow: ${nextValue && nextValue.length ? "hidden" : "visible"};
  ${style[XLSX.utils.encode_cell({ c, r })]};
  `;
};
export function GetCellByAddress(map, c, r) {
    return map[XLSX.utils.encode_cell({
        c,
        r,
    })];
}
export function GetColSpan(map, c, r) {
    return ((GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[0]) || undefined);
}
export function GetRowSpan(map, c, r) {
    return ((GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[1]) || undefined);
}
export function download(sheets, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const wb = XLSX.utils.book_new();
        const wss = [];
        sheets.map((s, i) => {
            const ws = XLSX.utils.aoa_to_sheet(s.data);
            XLSX.utils.book_append_sheet(wb, ws, s.sheetName);
        });
        XLSX.writeFile(wb, fileName);
    });
}
export function upload(sheets, uploadURL) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sheets)
            return;
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
        formData.append("file", btob(wbout, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), "test.xlsx");
        const req = yield fetch(uploadURL, {
            method: "POST",
            body: formData,
        });
        if (req.status == 400) {
            const res = yield req.json(); // res contains the list of errors
            return res;
        }
        return [];
    });
}
// Return bottomRight, and topLeft border for one selection
function getBorder(selection) {
    const br = {
        c: selection[0].c > selection[1].c ? selection[0].c : selection[1].c,
        r: selection[0].r > selection[1].r ? selection[0].r : selection[1].r,
    };
    const tl = {
        c: selection[0].c < selection[1].c ? selection[0].c : selection[1].c,
        r: selection[0].r < selection[1].r ? selection[0].r : selection[1].r,
    };
    return { tl, br };
}
export function removeColumns(selection, data) {
    const { tl, br } = getBorder(selection);
    return data.map((d) => d.filter((_, i) => !(i >= tl.c && i <= br.c)));
}
export function removeRows(selection, data) {
    const { tl, br } = getBorder(selection);
    return data.filter((d, i) => !(i >= tl.c && i <= br.c));
}
function decode(address) {
    return [
        XLSX.utils.decode_cell(address[0]),
        XLSX.utils.decode_cell(address[1]),
    ];
}
export function pasteSelection(data, pasted, selected) {
    const dpaste = getBorder(decode(pasted));
    const dselect = getBorder(decode(selected));
    const dx = dselect.tl.c - dpaste.tl.c;
    const dy = dselect.tl.r - dpaste.tl.r;
    console.log(dx, dy);
    for (var r = dpaste.tl.r; r <= dpaste.br.r; r++) {
        for (var c = dpaste.tl.c; c <= dpaste.br.c; c++) {
            if (data.length - 1 < r + dy) {
                data = [...data, Array.from({ length: r + dy - data.length + 1 })];
            }
            data[r + dy][c + dx] = data[r][c];
        }
    }
    return data;
}
export function clearSelection(data, selected) {
    console.log("clear");
    const dselect = getBorder(decode(selected));
    for (var r = dselect.tl.r; r <= dselect.br.r; r++) {
        for (var c = dselect.tl.c; r <= dselect.br.c; c++) {
            if (data.length - 1 < r)
                return;
            data[r][c] = "";
        }
    }
    return data;
}
export function deleteSelection(data, selected) {
    const dselect = getBorder(decode(selected));
    if (dselect.br.c == data[0].length - 1) {
        // delete rows
        data = data.filter((v, i) => {
            return i < dselect.tl.r || i > dselect.br.r;
        });
    }
    if (dselect.br.r == data.length - 1) {
        // delete columns
        console.log("delete columns");
        data = data.map((c) => c.filter((v, i) => {
            return i < dselect.tl.c || i > dselect.br.c;
        }));
    }
    return data;
}
export function mergeSelectExtends(data, selected, extended) {
    // merge logic here...
    const sel = getBorder(decode(selected));
    const ext = getBorder(decode(extended));
    // if extended is inside selected
    if (ext.tl.c >= sel.tl.c &&
        ext.br.c <= sel.br.c &&
        ext.tl.r >= sel.tl.r &&
        ext.br.r <= sel.br.r) {
        // every cells outside ext and inside sel are emptied
        for (var c = sel.tl.c; c <= sel.br.c; c++) {
            for (var r = sel.tl.r; r <= sel.br.r; r++) {
                // if the cell is outside extended and inside selected erase it
                if (c > ext.br.c || r > ext.br.r) {
                    data[r][c] = "";
                }
            }
        }
    }
    else {
        // extended extend the selection
        // for all cells outside selection
        for (var c = ext.tl.c; c <= ext.br.c; c++) {
            for (var r = ext.tl.r; r <= ext.br.r; r++) {
                const brsel = { c: sel.br.c + 1, r: sel.br.r + 1 };
                const selwidth = brsel.c - sel.tl.c;
                const selheight = brsel.r - sel.tl.r;
                if (c < sel.tl.c) {
                    // cell is on the left
                    data[r][c] =
                        data[r][sel.br.c - (Math.abs(c - sel.tl.c + 1) % selwidth)];
                }
                if (c > sel.br.c) {
                    // cell is on the right
                    data[r][c] = data[r][sel.tl.c + ((c - sel.br.c - 1) % selwidth)];
                }
                // if extended to unknown rows territory
                if (data.length - 1 < r) {
                    data = [...data, Array.from({ length: r - data.length + 1 })];
                }
                if (r < sel.tl.r) {
                    // cell is on top
                    data[r][c] =
                        data[sel.br.r - (Math.abs(r - sel.tl.r + 1) % selheight)][c];
                }
                if (r > sel.br.r) {
                    // cell is below
                    data[r][c] = data[sel.tl.r + ((r - sel.br.r - 1) % selheight)][c];
                }
            }
        }
    }
    return data;
}

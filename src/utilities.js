"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.mergeSelectExtends = exports.deleteSelection = exports.clearSelection = exports.pasteSelection = exports.removeRows = exports.removeColumns = exports.upload = exports.download = exports.GetRowSpan = exports.GetColSpan = exports.GetCellByAddress = exports.computeStyles = void 0;
var XLSX = require("xlsx");
var b64_to_blob_1 = require("b64-to-blob");
function getRowHeight(row) {
    var _a;
    try {
        var height = Number(typeof (row === null || row === void 0 ? void 0 : row.height) == "string"
            ? (_a = row === null || row === void 0 ? void 0 : row.height) === null || _a === void 0 ? void 0 : _a.replace("px", "") : (row === null || row === void 0 ? void 0 : row.height) || 24 // consider adding a config.defaultRowHeight
        );
        return height > 24 ? height : 24;
    }
    catch (e) {
        return 24;
    }
}
exports.computeStyles = function (c, r, row, style, options, value, nextValue) {
    // ${
    //   c.wordWrap != false &&
    //   (options.wordWrap || c.wordwrap || value?.length > 200)
    //     ? "white-space: pre-wrap;"
    //     : ""
    // }
    return "text-align: " + (c.align || "center") + "; \n  height: " + getRowHeight(row) + "px;\n  overflow: " + (nextValue && nextValue.length ? "hidden" : "visible") + ";\n  " + style[XLSX.utils.encode_cell({ c: c, r: r })] + ";\n  ";
};
function GetCellByAddress(map, c, r) {
    return map[XLSX.utils.encode_cell({
        c: c,
        r: r
    })];
}
exports.GetCellByAddress = GetCellByAddress;
function GetColSpan(map, c, r) {
    return ((GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[0]) || undefined);
}
exports.GetColSpan = GetColSpan;
function GetRowSpan(map, c, r) {
    return ((GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[1]) || undefined);
}
exports.GetRowSpan = GetRowSpan;
function download(sheets, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var wb, wss;
        return __generator(this, function (_a) {
            wb = XLSX.utils.book_new();
            wss = [];
            sheets.map(function (s, i) {
                var ws = XLSX.utils.aoa_to_sheet(s.data);
                XLSX.utils.book_append_sheet(wb, ws, s.sheetName);
            });
            XLSX.writeFile(wb, fileName);
            return [2 /*return*/];
        });
    });
}
exports.download = download;
function upload(sheets, uploadURL) {
    return __awaiter(this, void 0, void 0, function () {
        var wb, wbout, formData, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sheets)
                        return [2 /*return*/];
                    wb = XLSX.utils.book_new();
                    sheets.map(function (s, i) {
                        var ws = XLSX.utils.aoa_to_sheet(s.data);
                        XLSX.utils.book_append_sheet(wb, ws, s.sheetName);
                    });
                    wbout = XLSX.write(wb, {
                        bookType: "xlsx",
                        bookSST: false,
                        type: "base64"
                    });
                    formData = new FormData();
                    formData.append("file", b64_to_blob_1["default"](wbout, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), "test.xlsx");
                    return [4 /*yield*/, fetch(uploadURL, {
                            method: "POST",
                            body: formData
                        })];
                case 1:
                    req = _a.sent();
                    if (!(req.status == 400)) return [3 /*break*/, 3];
                    return [4 /*yield*/, req.json()];
                case 2:
                    res = _a.sent();
                    return [2 /*return*/, res];
                case 3: return [2 /*return*/, []];
            }
        });
    });
}
exports.upload = upload;
// Return bottomRight, and topLeft border for one selection
function getBorder(selection) {
    var br = {
        c: selection[0].c > selection[1].c ? selection[0].c : selection[1].c,
        r: selection[0].r > selection[1].r ? selection[0].r : selection[1].r
    };
    var tl = {
        c: selection[0].c < selection[1].c ? selection[0].c : selection[1].c,
        r: selection[0].r < selection[1].r ? selection[0].r : selection[1].r
    };
    return { tl: tl, br: br };
}
function removeColumns(selection, data) {
    var _a = getBorder(selection), tl = _a.tl, br = _a.br;
    return data.map(function (d) { return d.filter(function (_, i) { return !(i >= tl.c && i <= br.c); }); });
}
exports.removeColumns = removeColumns;
function removeRows(selection, data) {
    var _a = getBorder(selection), tl = _a.tl, br = _a.br;
    return data.filter(function (d, i) { return !(i >= tl.c && i <= br.c); });
}
exports.removeRows = removeRows;
function decode(address) {
    return [
        XLSX.utils.decode_cell(address[0]),
        XLSX.utils.decode_cell(address[1]),
    ];
}
function pasteSelection(data, pasted, selected) {
    var dpaste = getBorder(decode(pasted));
    var dselect = getBorder(decode(selected));
    var dx = dselect.tl.c - dpaste.tl.c;
    var dy = dselect.tl.r - dpaste.tl.r;
    console.log(dx, dy);
    for (var r = dpaste.tl.r; r <= dpaste.br.r; r++) {
        for (var c = dpaste.tl.c; c <= dpaste.br.c; c++) {
            if (data.length - 1 < r + dy) {
                data = __spreadArrays(data, [Array.from({ length: r + dy - data.length + 1 })]);
            }
            data[r + dy][c + dx] = data[r][c];
        }
    }
    return data;
}
exports.pasteSelection = pasteSelection;
function clearSelection(data, selected) {
    console.log("clear");
    var dselect = getBorder(decode(selected));
    for (var r = dselect.tl.r; r <= dselect.br.r; r++) {
        for (var c = dselect.tl.c; r <= dselect.br.c; c++) {
            if (data.length - 1 < r)
                return;
            data[r][c] = "";
        }
    }
    return data;
}
exports.clearSelection = clearSelection;
function deleteSelection(data, selected) {
    var dselect = getBorder(decode(selected));
    if (dselect.br.c == data[0].length - 1) {
        // delete rows
        data = data.filter(function (v, i) {
            return i < dselect.tl.r || i > dselect.br.r;
        });
    }
    if (dselect.br.r == data.length - 1) {
        // delete columns
        console.log("delete columns");
        data = data.map(function (c) {
            return c.filter(function (v, i) {
                return i < dselect.tl.c || i > dselect.br.c;
            });
        });
    }
    return data;
}
exports.deleteSelection = deleteSelection;
function mergeSelectExtends(data, selected, extended) {
    // merge logic here...
    var sel = getBorder(decode(selected));
    var ext = getBorder(decode(extended));
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
                var brsel = { c: sel.br.c + 1, r: sel.br.r + 1 };
                var selwidth = brsel.c - sel.tl.c;
                var selheight = brsel.r - sel.tl.r;
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
                    data = __spreadArrays(data, [Array.from({ length: r - data.length + 1 })]);
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
exports.mergeSelectExtends = mergeSelectExtends;

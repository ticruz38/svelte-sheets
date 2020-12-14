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
exports.__esModule = true;
exports.upload = exports.download = exports.GetRowSpan = exports.GetColSpan = exports.GetCellByAddress = exports.computeStyles = void 0;
var xlsx_1 = require("xlsx");
var b64_to_blob_1 = require("b64-to-blob");
exports.computeStyles = function (c, r, style, options, value, nextValue) {
    return "text-align: " + (c.align || "center") + "; \n  " + (r && r.height ? "height: " + r.height : "22px; ") + "\n  " + (c.wordWrap != false &&
        (options.wordWrap || c.wordwrap || (value === null || value === void 0 ? void 0 : value.length) > 200)
        ? "white-space: pre-wrap;"
        : "") + "\n  overflow: " + (nextValue && nextValue.length ? "hidden" : "visible") + ";\n  " + style[xlsx_1["default"].utils.encode_cell({ c: c, r: r })] + "\n  ";
};
function GetCellByAddress(map, c, r) {
    return map[xlsx_1["default"].utils.encode_cell({
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
            wb = xlsx_1["default"].utils.book_new();
            wss = [];
            sheets.map(function (s, i) {
                var ws = xlsx_1["default"].utils.aoa_to_sheet(s.data);
                xlsx_1["default"].utils.book_append_sheet(wb, ws, s.sheetName);
            });
            xlsx_1["default"].writeFile(wb, fileName);
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
                    wb = xlsx_1["default"].utils.book_new();
                    sheets.map(function (s, i) {
                        var ws = xlsx_1["default"].utils.aoa_to_sheet(s.data);
                        xlsx_1["default"].utils.book_append_sheet(wb, ws, s.sheetName);
                    });
                    wbout = xlsx_1["default"].write(wb, {
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

"use strict";
exports.__esModule = true;
exports.selection = void 0;
var xlsx_1 = require("xlsx");
function selection(node, _a) {
    var selection = _a.selection, rows = _a.rows, columns = _a.columns;
    var viewport = node.getBoundingClientRect();
    var topleft = xlsx_1["default"].utils.decode_cell(selection[0]);
    var bottomRight = xlsx_1["default"].utils.decode_cell(selection[1]);
    var top = node.getElementByClassName(".top");
    var bottom = node.getElementByClassName(".bottom");
    var left = node.getElementByClassName(".left");
    var right = node.getElementByClassName(".right");
}
exports.selection = selection;

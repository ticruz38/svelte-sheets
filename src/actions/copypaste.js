"use strict";
exports.__esModule = true;
exports.copypaste = void 0;
// copy-paste action (also support cut)
function copypaste(node) {
    var keyPressed = {};
    function onKeyDown(e) {
        keyPressed[e.keyCode] = true;
        if (keyPressed[91] && keyPressed[88]) {
            e.preventDefault();
            node.dispatchEvent(new CustomEvent("cut"));
        }
        if (keyPressed[91] && keyPressed[88]) {
            e.preventDefault();
            node.dispatchEvent(new CustomEvent("paste"));
        }
        if (keyPressed[91] && keyPressed[88]) {
            e.preventDefault();
            node.dispatchEvent(new CustomEvent("copy"));
        }
    }
    function onKeyUp(e) {
        keyPressed[e.keyCode] = false;
    }
    node.addEventListener("keydown", onKeyDown);
    node.addEventListener("keyup", onKeyUp);
}
exports.copypaste = copypaste;

import XLSX from "xlsx";
export function selection(node, { selection, rows, columns }) {
    const viewport = node.getBoundingClientRect();
    const topleft = XLSX.utils.decode_cell(selection[0]);
    const bottomRight = XLSX.utils.decode_cell(selection[1]);
    const top = node.getElementByClassName(".top");
    const bottom = node.getElementByClassName(".bottom");
    const left = node.getElementByClassName(".left");
    const right = node.getElementByClassName(".right");
}

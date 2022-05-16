export function resizable(node) {
  let x;
  let y;

  function handleMousedown(event) {
    x = event.clientX;
    y = event.clientY;

    node.dispatchEvent(
      new CustomEvent("resizing", {
        detail: { x: 0, y: 0 },
      })
    );

    window.addEventListener("mousemove", handleMousemove);
    window.addEventListener("mouseup", handleMouseup);
  }

  function handleMousemove(event) {
    const dx = event.clientX - x;
    const dy = event.clientY - y;
    x = event.clientX;
    y = event.clientY;

    node.dispatchEvent(
      new CustomEvent("resizing", {
        detail: { x: dx, y: dy },
      })
    );
  }

  function handleMouseup(event) {
    const dx = event.clientX - x;
    const dy = event.clientY - y;

    node.dispatchEvent(
      new CustomEvent("resizing", {
        detail: { x: dx, y: dy },
      })
    );

    window.removeEventListener("mousemove", handleMousemove);
    window.removeEventListener("mouseup", handleMouseup);
  }

  node.addEventListener("mousedown", handleMousedown);

  return {
    destroy() {
      node.removeEventListener("mousedown", handleMousedown);
    },
  };
}

const svelte = require("svelte/compiler");
const fs = require("fs");

const result = svelte.compile("./index.svelte", {});
fs.writeFileSync("./docs/index.js", result.js.code);
console.log(result);

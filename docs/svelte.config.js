// See https://github.com/kaisermann/svelte-preprocess#with-svelte-vs-code
const sveltePreprocess = require("svelte-preprocess");

module.exports = {
  preprocess: sveltePreprocess({
    postcss: true,
    typescript: {
      transpileOnly: true,
    },
  }),
  // ...other svelte options (optional)
};

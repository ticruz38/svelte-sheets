const path = require("path");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

const preprocess = require("svelte-preprocess")({
  // postcss: true,
  typescript: {
    transpileOnly: true,
  },
});

module.exports = {
  entry: {
    "build/bundle": ["./src/main.js"],
  },
  resolve: {
    alias: {
      svelte: path.dirname(require.resolve("svelte/package.json")),
    },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
  output: {
    path: path.join(__dirname, "/public"),
    filename: "[name].js",
    chunkFilename: "[name].[id].js",
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            preprocess,
            compilerOptions: {
              dev: !prod,
            },
            emitCss: prod,
            hotReload: !prod,
          },
        },
      },
      {
        test: /\.(ts)?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
          compilerOptions: { module: "es2015" },
        },
      },
      {
        // required to prevent errors from Svelte on Webpack 5+
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  mode,
  devtool: prod ? false : "source-map",
  devServer: {
    hot: true,
  },
};

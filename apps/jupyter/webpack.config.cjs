/* eslint-disable @typescript-eslint/no-var-requires */
const preprocess = require("svelte-preprocess");

const prod = process.env.NODE_ENV === "production";

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "swc-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            compilerOptions: {
              dev: !prod,
            },
            emitCss: false,
            hotReload: !prod,
            preprocess: preprocess(),
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
    },
  },
  experiments: {
    topLevelAwait: true,
  },
};

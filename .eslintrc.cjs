module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["svelte3", "@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
    },
  ],
  env: {
    browser: true,
    node: true,
  },
  settings: {
    "svelte3/typescript": true, // load TypeScript as peer dependency
  },
  rules: {},
};

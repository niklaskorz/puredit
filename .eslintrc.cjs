module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "testing-library",
    "jest-dom",
    "svelte3",
    "@typescript-eslint",
    "prettier",
  ],
  extends: [
    "eslint:recommended",
    "plugin:jest-dom/recommended",
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
  ignorePatterns: ["**/public/examples/"],
  settings: {
    "svelte3/typescript": true, // load TypeScript as peer dependency
  },
  rules: {
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-explicit-any": 0,
  },
};

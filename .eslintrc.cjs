module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["testing-library", "jest-dom", "@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:jest-dom/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parserOptions: { extraFileExtensions: [".svelte"] },
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
  env: {
    browser: true,
    node: true,
  },
  globals: {
    vscode: true,
  },
  ignorePatterns: ["**/public/examples/"],
  rules: {
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "no-inner-declarations": 1,
  },
};

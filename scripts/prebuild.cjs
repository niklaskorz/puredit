#!/usr/bin/env node

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProd = process.env.NODE_ENV === 'production';

const staticDir = path.resolve(__dirname, '../_prebuild_static');

const clean = async () => {
  await fs.promises.rm(staticDir, { recursive: true });
};

const main = async () => {
  await clean().catch(_ => {});
  await fs.promises.mkdir(staticDir, { recursive: true });

  await esbuild.build({
    entryPoints: [
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/json/json.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/css/css.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/html/html.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js'),
    ],
    outdir: path.resolve(staticDir, 'monaco-editor/esm/vs'),
    bundle: true,
    minify: isProd,
    sourcemap: isProd ? false : 'inline',
  });

  await fs.promises.copyFile(
    path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf'),
    path.resolve(staticDir, 'codicon.ttf'),
  );
};

void main();


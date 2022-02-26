# CodeMirror TypeScript Extension

Based on <https://github.com/prisma/text-editors>.
See `LICENSE` for original license (Apache-2.0).

## Changes

- Incremental updates: Prisma's version replaces the whole document on change. While they do use throttling to keep the CPU load low, it is more efficient to apply CodeMirror's changes as incremental updates to the TypeScript language service.
- Removed the call to `setDiagnostics` in `onChangeCallback`. The diagnostics are already provided to the CodeMirror linting extension, so this does not bring any obvious benefit. Also, it broke overlapping projections.

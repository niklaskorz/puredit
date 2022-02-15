# Puredit

> Purism, referring to the arts, was a movement (...) where objects are represented as elementary forms devoid of detail. ([Wikipedia](https://en.wikipedia.org/wiki/Purism))

The **Pur**ist **edit**or is a projectional editor that uses textual code as its source of truth. Unlike other projectional editors, Puredit is based on the assumption that parsers are fast enough to continuously react to changes to a document and update the projections accordingly. Projections are derived from patterns on the abstract syntax tree. To make the definition of patterns easy, they are parsed from actual code snippets in the target language.

## Available Scripts

### npm start

Runs the app in the development mode.
Open http://localhost:8080 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### npm test

Launches the test runner in the interactive watch mode.

### npm run build

Builds a static copy of Puredit to the `build/` folder.

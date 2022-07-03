# Puredit

> Purism, referring to the arts, was a movement (...) where objects are represented as elementary forms devoid of detail. ([Wikipedia](https://en.wikipedia.org/wiki/Purism))

The **Pur**ist **edit**or is a projectional editor that uses textual code as its source of truth. Unlike other projectional editors, Puredit is based on the assumption that parsers are fast enough to continuously react to changes to a document and update the projections accordingly. Projections are derived from patterns on the abstract syntax tree. To make the definition of patterns easy, they are parsed from actual code snippets in the target language.

## Project structure

- `apps/`: executable applications and demos
  - `example/`: an example of a projectional data manipulation DSL based on the TypeScript programming language, which is also available at <https://thesis.korz.tech/>
  - `generate/`: an application for generating code pattern templates and projection components from samples
  - `jupyter/`: an example of a projectional DSL for data analysis of Excel sheets, based on Python and integrated into [JupyterLab](https://jupyter.org/)
  - `parser-playground/`: an experimentation playground used for debugging our pattern matching algorithm
  - `python-dsl/`: an example of a projectional data manipulation DSL based on the Python programming language
- `packages/`: reusable packages that together are used to create a projectional editor
  - `codemirror-typescript/`: a client-side language server for the TypeScript programming language integrated into [CodeMirror 6](https://codemirror.net/), based on [prisma/text-editors](https://github.com/prisma/text-editors)
  - `parser/`: a library for defining syntax tree patterns through code templates and finding nodes matching these patterns in a program's syntax tree
  - `projections/`: an extension for the [CodeMirror 6](https://codemirror.net/) editor for detecting syntax tree patterns in a document and replacing them with interactive projection widgets implemented as Svelte components
  - `simple-projection/`: an alternative for the Svelte-based implementation components, limited to simple linear texts widgets with string fields

## Installation and development

This projects requires [Node](https://nodejs.org/en/) 16 LTS and [npm](https://www.npmjs.com/) 8.
Node 18 may work but has not been tested.
Then, install the dependencies using `npm install`.

### Develop

To develop all apps and packages, run the following command:

```
npm run dev
```

This will start development servers for `apps/example`, `apps/parser-playground` and `apps/python-dsl`.
For the JupyterLab example, see the next section.

### Build

To build all apps and packages, run the following command:

```
npm run build
```

### Linting and type checking

To lint and typecheck all apps and packages, run the following command:

```
npm run lint
```

## JupyterLab example

To build and run the JupyterLab DSL example, run the following commands:

### Virtual environment

```sh
# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies and our Jupyter extension
npm install
pip install -r apps/jupyter/requirements.txt
npm -w apps/jupyter run build:prod
pip install apps/jupyter

# Start JupyterLab
cd apps/jupyter/example
jupyter lab
```

### Docker

Alternatively, the JupyterLab example can be built and run using [Docker](https://docs.docker.com/):

```sh
docker build -t puredit-jupyter -f apps/jupyter/Dockerfile .
docker run -p 8888:8888 puredit-jupyter
```

Afterwards, JupyterLab can be accessed in a browser on <http://localhost:8888>.

## Creating new projections

To create new projection components and their code pattern templates, you can either start from scratch or use the output of our sample-based generator as foundation.

### From scratch

### Using the generator

## Integrating the projectional editor

To integrate the projectional editor into your own project, see `apps/example`, in particular `apps/example/src/Editor.svelte`.
There, a new CodeMirror editor is created and mounted that is making use of our projectional editing extension.
For a more specialized example, see `apps/jupyter`.
In `apps/jupyter/src/editor.ts`, a wrapper for CodeMirror 6 is provided that makes it compatible to JupyterLab's own editor.
On top of this, `apps/jupyter/src/index.ts` provides a Jupyter [frontend extension](https://jupyter-notebook.readthedocs.io/en/stable/extending/frontend_extensions.html) that replaces Jupyter's own editor with our projectional editor.

## Project Overview
This repository contains the accompanying source code and examples of the following paper:

[Niklas Korz](https://2023.splashcon.org/profile/niklaskorz), [Artur Andrzejak](https://aip.ifi.uni-heidelberg.de/team/aa)

**Virtual Domain Specific Languages via Embedded Projectional Editing**

Published at 22nd International Conference on Generative Programming: Concepts & Experiences ([GPCE 2023](https://2023.splashcon.org/program/program-splash-2023/)), in conjunction with ACM SPLASH 2023, 22-27 October 2023, Cascais, Portugal.


### Summary
We propose here an approach which represents a subset of a General-Purpose Programming Language (GPL) as GUI widgets in a hybrid editor. It relies on matching parametrized patterns against the GPL program, and displaying the matched parts as dynamically rendered widgets. Such widgets can be interpreted as components of an external DSL. Since the source code is serialized as GPL text without annotations, there is no DSL outside the editor - hence the term ‘virtual’ DSL.

The underlying GPL and the virtual DSL can be mixed in a compositional way, with zero cost of their integration. The project infrastructure does not need to be adapted. Furthermore, our approach works with mainstream GPLs like Python or JavaScript.

To lower the development effort of such virtual DSLs, we also propose an approach to generate patterns and the corresponding text-only GUI widgets from pairs of examples.

A live demo of the system can be accessed [here](https://puredit.korz.dev/).

### Why the name Puredit?

> Purism, referring to the arts, was a movement (...) where objects are represented as elementary forms devoid of detail. ([Wikipedia](https://en.wikipedia.org/wiki/Purism))

The **Pur**ist **edit**or is a projectional editor that uses textual code as its source of truth. Unlike other projectional editors, Puredit is based on the assumption that parsers are fast enough to continuously react to changes to a document and update the projections accordingly. Projections are derived from patterns on the abstract syntax tree. To make the definition of patterns easy, they are parsed from actual code snippets in the target language.

## Project structure

- `apps/`: executable applications and demos
  - `example/`: an example of a projectional data manipulation DSL based on the TypeScript programming language, which is also available at <https://puredit.korz.dev/>
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

## TypeScript DSL example

To build and run the TypeScript DSL example, run the following commands:

```sh
npm install
npm -w apps/example run dev
```

Alternatively, the TypeScript DSL example can be built and run using [Docker](https://docs.docker.com/):

```sh
docker build -t puredit-example -f apps/example/Dockerfile .
docker run -p 3000:80 puredit-example
```

Afterwards, the example can be accessed in a browser on <http://localhost:3000>.

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

To create a new projection from scratch, you need to implement two things: an entrypoint for your projection that defines the pattern and the projection, as well as a Svelte component providing the implementation for your projection widget.
A good starting point is to copy and adapt one of the projections from `apps/example/src/projections`.
Use the `arg`, `block`, and `contextVariable` template helpers from the `@puredit/parser` inside your code templates to create dynamic patterns.

### Using the generator

The sample-based generator takes a text files containing both code and projection samples as input.
All samples are divided by an empty line.
The code samples are divided from the projection samples by a line containg only `---` as content.
You can look at the datasets in `apps/generate/examples` as reference.
Execute the generator as follows, replacing the argument placeholders with your according values:

```sh
npm start -w apps/generate -- \
    --language <language> \
    --parser-name <parser-name> \
    --parser-module <parser-module> \
    --projection-name <projection-name> \
    --samples <samples> \
    --target-dir <target-dir>
```

Note that the path of `parser-module` must be relative to the path of `target-dir`.
For example, to generate the pattern and projections files `removeProjection.ts` and `RemoveProjection.svelte` for `apps/generate/examples/ts-remove.txt` with target app `apps/examples`:

```sh
npm start -w apps/generate -- \
    --language ts \
    --parser-name tsParser \
    --parser-module './parser' \
    --projection-name remove \
    --samples apps/generate/examples/ts-remove.txt \
    --target-dir apps/example/src/projections
```

On Windows Powershell, `\` does not work for multiline commands, so write everything in one line instead:

```sh
npm start -w apps/generate -- --language ts --parser-name tsParser --parser-module "./parser" --projection-name remove --samples apps/generate/examples/ts-remove.txt --target-dir apps/example/src/projections
```

Similarly, to generate the pattern and projections files `takeProjection.ts` and `TakeProjection.svelte` for `apps/generate/examples/py-take.txt` with target app `apps/jupyter`:

```sh
npm start -w apps/generate -- \
    --language py \
    --parser-name pythonParser \
    --parser-module './parser' \
    --projection-name take \
    --samples apps/generate/examples/py-take.txt \
    --target-dir apps/jupyter/src/projections
```

Afterwards, register the new projection by adding them to the lists in `apps/example/src/projections/index.ts` or respectively `apps/jupyter/src/projections/index.ts`.

## Integrating the projectional editor

To integrate the projectional editor into your own project, see `apps/example`, in particular `apps/example/src/Editor.svelte`.
There, a new CodeMirror editor is created and mounted that is making use of our projectional editing extension.
For a more specialized example, see `apps/jupyter`.
In `apps/jupyter/src/editor.ts`, a wrapper for CodeMirror 6 is provided that makes it compatible to JupyterLab's own editor.
On top of this, `apps/jupyter/src/index.ts` provides a Jupyter [frontend extension](https://jupyter-notebook.readthedocs.io/en/stable/extending/frontend_extensions.html) that replaces Jupyter's own editor with our projectional editor.

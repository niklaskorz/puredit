import type { FileMap } from "@puredit/codemirror-typescript";

async function fetchText(url: string): Promise<string> {
  const resp = await fetch(url);
  return resp.text();
}

function wrapModule(name: string, text: string): string {
  const moduleBody = text.replaceAll("declare ", "");
  return `declare module "${name}" {
${moduleBody}
}`;
}

const modules = [{ name: "dsl", wrap: true }, { name: "examples/db" }];

export const typeDeclarations = await Promise.all(
  modules.map(({ name, wrap }) =>
    fetchText(`/${name}.d.ts`).then((text) => [
      wrap ? wrapModule(name, text) : text,
      name,
    ])
  )
);

export const typeDeclarationsMap = typeDeclarations.reduce(
  (map: FileMap, [content, name]) => {
    map[`/${name}.d.ts`] = content;
    return map;
  },
  {}
);

export const example = await fetchText("/examples/example.mts");

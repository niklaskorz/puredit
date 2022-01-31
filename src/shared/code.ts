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

const modules = ["dsl"];
export const typeDeclarations = await Promise.all(
  modules.map((name) =>
    fetchText(`/${name}.d.ts`).then((text) => [wrapModule(name, text), name])
  )
);
export const example = await fetchText("/example.ts");

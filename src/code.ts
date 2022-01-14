async function fetchText(url: string): Promise<string> {
  const resp = await fetch(url);
  return resp.text();
}

const modules = ["dsl"];
export const typeDeclarations = await Promise.all(
  modules.map((name) =>
    fetchText(`/${name}.d.ts`).then(
      (text) => `declare module "${name}" {
${text.replaceAll("declare ", "")}
}`
    )
  )
);
export const example = await fetchText("/example.ts");

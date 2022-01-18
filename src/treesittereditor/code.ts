async function fetchText(url: string): Promise<string> {
  const resp = await fetch(url);
  return resp.text();
}

export const example = await fetchText("/example.py");

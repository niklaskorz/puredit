function process(input) {
  let parts = [];
  for (let from = 0, to = 0; to < input.length; to++) {
    if (input[to] === "{") {
      parts.push(input.slice(from, to));
      from = to + 1;
      while (from < input.length && input[from] !== "}") {
        from += 1;
      }
      let variables = input
        .slice(to + 1, from)
        .split(",")
        .map((name) => name.trim());
      parts.push(variables);
      to = from;
      from += 1;
    }
  }
  return parts;
}

console.log(
  process(
    "replace {target} in column {columnTarget, columnSource} with {replacement}"
  )
);

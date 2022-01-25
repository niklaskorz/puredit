import type { Database } from "../dsl";

// Meta functions

function pattern(fn: () => void) {
  return fn.toString();
}

type $symbol<T> = T;

function $symbol<T>(name: string): T {
  return {} as T;
}

function $keyof<T>(name: string): keyof T {
  return {} as keyof T;
}

function $arg<T>(name: string): T {
  return {} as T;
}

// Code sample

export let fancyExample = pattern(() => {
  $symbol<Database>("db").students.name = $arg<string>("Test");
});

export function logger(namespace: string, color = "orange") {
  return function (...args: unknown[]) {
    console.groupCollapsed(`%c[${namespace}]`, `color:${color};`, ...args);
    console.trace();
    console.groupEnd();
  };
}

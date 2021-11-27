import ts from "typescript";

export interface Value {
  value: string;
  start: number;
  end: number;
}

export type Context = Record<string, Value>;

export type Visitor<T> = (node: T) => Context | null;

export type NodeVisitor = Visitor<ts.Node>;

export const expressionStatement =
  (expression: NodeVisitor) => (node: ts.Node) => {
    if (!ts.isExpressionStatement(node)) {
      return null;
    }
    return expression(node.expression);
  };

export const callExpression =
  (expression: NodeVisitor, ...args: NodeVisitor[]) =>
  (node: ts.Node) => {
    if (!ts.isCallExpression(node) || node.arguments.length !== args.length) {
      return null;
    }
    return args.reduce((result, visitor, i) => {
      let argResult = result && visitor(node.arguments[i]);
      return argResult && Object.assign(result, argResult);
    }, expression(node.expression));
  };

export const propertyAccessExpression =
  (expression: NodeVisitor, name: NodeVisitor) => (node: ts.Node) => {
    if (!ts.isPropertyAccessExpression(node)) {
      return null;
    }
    let result = expression(node.expression);
    let nameResult = result && name(node.name);
    return nameResult && Object.assign(result, nameResult);
  };

export const identifier =
  (text: Visitor<[string, number, number]>) => (node: ts.Node) => {
    if (!ts.isIdentifier(node)) {
      return null;
    }
    return text([node.text, node.pos, node.end]);
  };

export const stringLiteral =
  (text: Visitor<[string, number, number]>) => (node: ts.Node) => {
    if (!ts.isStringLiteral(node)) {
      return null;
    }
    return text([node.text, node.pos, node.end]);
  };

export const saveString =
  (key: string) =>
  ([value, start, end]: [string, number, number]): Context => ({
    [key]: { value, start, end },
  });

export const matchString =
  (expectedText: string) =>
  ([text]: [string, number, number]) =>
    expectedText === text ? {} : null;

export const operationReplace = expressionStatement(
  callExpression(
    propertyAccessExpression(
      callExpression(
        propertyAccessExpression(
          identifier(matchString("table")),
          identifier(matchString("column"))
        ),
        stringLiteral(saveString("columnName"))
      ),
      identifier(matchString("replace"))
    ),
    stringLiteral(saveString("target")),
    stringLiteral(saveString("value"))
  )
);

export const operationTrim = expressionStatement(
  callExpression(
    propertyAccessExpression(
      callExpression(
        propertyAccessExpression(
          identifier(matchString("table")),
          identifier(matchString("column"))
        ),
        stringLiteral(saveString("columnName"))
      ),
      identifier(matchString("trim"))
    ),
    stringLiteral(saveString("direction"))
  )
);

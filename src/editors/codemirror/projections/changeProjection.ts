import {
  arg,
  block,
  statementPattern,
  contextVariable,
} from "../../../parsers/lezer";
import ChangeProjection from "./ChangeProjection.svelte";
import { span, staticWidget } from "./shared";
import { svelteProjection } from "./svelte";

const db = contextVariable("db");
const table = arg("table", "string");

export const [pattern, draft] = statementPattern`
${db}.change(${table}, (table) => ${block({ table: "table" })});
`;

export const widget = svelteProjection(ChangeProjection);

export const end = staticWidget(() => span("end change"));

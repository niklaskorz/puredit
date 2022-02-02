import { arg, block, statementPattern } from "../../../parsers/lezer";
import ChangeProjection from "./ChangeProjection.svelte";
import { keyword, staticWidget } from "./shared";
import { svelteProjection } from "./svelte";

export const [pattern, draft] = statementPattern`
db.change(${arg("table", "string")}, (table) => ${block()});
`;

export const widget = svelteProjection(ChangeProjection);

export const end = staticWidget(() => keyword("end change"));

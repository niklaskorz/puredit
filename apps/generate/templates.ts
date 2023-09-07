import { capitalize, isString } from "@puredit/utils";
import { ProjectionSegment } from "./projections";

export const definitionTemplate = (options: {
  parserName: string;
  parserModule: string;
  prefix: string;
  codeTemplate: string;
}) => {
  const prefixCapitalized = capitalize(options.prefix);
  const componentName = prefixCapitalized + "Projection";
  const projectionName = options.prefix + "Projection";
  return `import { arg } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import { ${options.parserName} } from "${options.parserModule}";
import ${componentName} from "./${componentName}.svelte";

export const [pattern, draft] = ${options.parserName}.statementPattern\`
${options.codeTemplate}
\`;

export const widget = svelteProjection(${componentName});

export const ${projectionName}: Projection = {
    name: "${options.prefix}",
    description: "${options.prefix}",
    pattern,
    draft,
    requiredContextVariables: [],
    widgets: [widget],
};
`;
};

export const componentTemplate = (
  projectionSegments: ProjectionSegment[]
) => `<script lang="ts">
  import { onMount } from "svelte";
  import { tags } from "@lezer/highlight";
  import type { EditorState } from "@codemirror/state";
  import type { EditorView } from "@codemirror/view";
  import { highlightingFor } from "@codemirror/language";
  import type { Match } from "@puredit/parser";
  import type { FocusGroup } from "@puredit/projections/focus";
  import TextInput from "@puredit/projections/TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let context: any;
  export let state: EditorState;
  export let focusGroup: FocusGroup;

  onMount(() => {
    if (isNew) {
      requestAnimationFrame(() => {
        focusGroup.first();
      });
    }
  });
</script>

<span class="inline-flex">
${projectionSegments
  .reduce(reduceSegments, [])
  .map(projectionSegmentTemplate)
  .join("\n")}
</span>
`;

const reduceSegments = (
  segments: ProjectionSegment[],
  segment: ProjectionSegment
): ProjectionSegment[] => {
  const previous = segments.length - 1;
  if (previous >= 0 && isString(segment) && isString(segments[previous])) {
    segments[previous] += " " + segment;
  } else {
    segments.push(segment);
  }
  return segments;
};

const projectionSegmentTemplate = (segment: ProjectionSegment) => {
  if (isString(segment)) {
    return `  <span>${segment}</span>`;
  }
  const targetNodes = segment.names.map((name) => `match.args.${name}`);
  let targetNodesAttr = "";
  if (segment.names.length > 1) {
    targetNodesAttr = `\n    targetNodes={[${targetNodes.join(", ")}]}`;
  }
  return `  <TextInput
    className={highlightingFor(state, [tags.string])}
    node={${targetNodes[0]}}${targetNodesAttr}
    placeholder="${segment.names.join(", ")}"
    {state}
    {view}
    {focusGroup}
  />`;
};

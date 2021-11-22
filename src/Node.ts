import type { Node as TSNode } from "typescript";

export interface Node extends TSNode {
  projectional?: boolean;
}

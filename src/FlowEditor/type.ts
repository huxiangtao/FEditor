import { Map } from "immutable";
export interface TreeNode {
  id: string;
  nextNodes: Map<string, TreeNode>;
  preNodes: Map<string, TreeNode>;
}
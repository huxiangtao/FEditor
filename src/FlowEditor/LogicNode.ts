import { TreeNode } from './TreeNode';
import Line from './Line';
import { Map } from "immutable";
export default class LogicNode extends TreeNode {
  getRightLineId( nextLines: Map<string, Line> ): Line {
    // TODO:huxt immplitat the logic
    return nextLines.first();
  }
}
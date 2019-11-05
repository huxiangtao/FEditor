import React from "react";
import { generateCustomProps, generateCommonStyle } from "../../utils";
import TreeNode from "../../TreeNode";
import PauseNode from "../../PauseNode";
import { Map } from "immutable";

interface BaseNodeProps {
  id: string;
  alias?: string;
  curElement: any;
  staticData?: any;
  taskStateMap?: Map<string, string>;
  nodeMap?: Map<string, TreeNode | PauseNode>;
  recurRunTask?(id: string, nodeMap: Map<string, TreeNode | PauseNode>): void;
  checkPreDone?(
    curNodeId: string,
    nodeMap: Map<string, TreeNode | PauseNode>
  ): boolean;
  onHover?: (e: any) => void;
  onHoverOut?: (e: any) => void;
  onClick?: (e: any) => void;
  onContextMenu?: (e: any) => void;
  broadCastLineState?(nodeId: string, state: boolean): void;
  broadCastTaskState?(nodeId: string, state: string): void;
}

export default class BaseNode extends React.Component<BaseNodeProps, any> {
  commonStyleFactory = (o: any) => {
    return generateCommonStyle(o);
  };
  customPropsFactory = (o: any) => {
    return generateCustomProps(o);
  };
}

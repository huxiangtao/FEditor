import React from "react";
import { generateCustomProps, generateCommonStyle } from "../../utils";
import { TreeNode } from "../../TreeNode";
import PauseNode from "../../PauseNode";
import { Map } from "immutable";
import LogicNode from "../../LogicNode";

interface BaseNodeProps {
  id: string;
  alias?: string;
  curElement: any;
  staticData?: any;
  taskStateMap?: Map<string, string>;
  nodeMap?: Map<string, TreeNode | PauseNode | LogicNode>;
  recurRunTask?(
    id: string,
    nodeMap: Map<string, TreeNode | PauseNode | LogicNode>
  ): void;
  checkPreDone?(
    curNodeId: string,
    nodeMap: Map<string, TreeNode | PauseNode | LogicNode>
  ): boolean;
  onHover?: (e: any) => void;
  onHoverOut?: (e: any) => void;
  onClick?: (e: any) => void;
  onContextMenu?: (e: any) => void;
  broadCastLineState?(nodeId: string, state: boolean): void;
  broadCastTaskState?(nodeId: string, state: string): void;
  onEditApp?(formValue: any): void;
}

export default class BaseNode extends React.Component<BaseNodeProps, any> {
  commonStyleFactory = (o: any) => {
    return generateCommonStyle(o);
  };
  customPropsFactory = (o: any) => {
    return generateCustomProps(o);
  };
}

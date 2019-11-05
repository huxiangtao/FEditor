import TreeNode from "../TreeNode";
import PauseNode from "../PauseNode";
import Line from "../Line";
import { Map } from "immutable";
import React from "react";
// interface RunTaskProps {
//   staticData: any;
//   taskStateMap: Map<string, string>;
//   broadCastLineState(nodeId: string, state: boolean): void;
//   broadCastTaskState(nodeId: string, state: string): void;
// }
export default function RunTaskHoc(
  WrappedComponent: React.ComponentClass<any> | React.FC<any>
) {
  return class extends React.Component<any, any> {
    checkPreDone = (
      curNodeId: string,
      nodeMap: Map<string, TreeNode | PauseNode>
    ): boolean => {
      const { taskStateMap } = this.props;
      const curNode = nodeMap.get(curNodeId);
      const preNodes = (curNode as TreeNode).preNodes;
      let result = true;
      if (preNodes) {
        preNodes.forEach((v: TreeNode) => {
          if (taskStateMap.get(v.id) !== "done") {
            result = false;
          }
        });
      }
      return result;
    };
    recurRunTask = (
      nodeId: string,
      nodeMap: Map<string, TreeNode | PauseNode>,
      trigger?: boolean
    ) => {
      const { broadCastTaskState, broadCastLineState } = this.props;
      const node = nodeMap.get(nodeId);
      if (!node) {
        return;
      }
      const execTask = () => {
        node.runTask(nodeId, broadCastTaskState).then(res => {
          if (res) {
            broadCastTaskState(nodeId, "done");
            if (node.nextLines.size > 0) {
              node.nextLines.forEach((line: Line) => {
                line.playTransData(line.id, broadCastLineState).then(res => {
                  if (res) {
                    if (line.to && this.checkPreDone(line.to.id, nodeMap)) {
                      this.recurRunTask(line.to.id, nodeMap, trigger);
                    }
                  }
                });
              });
            }
          } else {
            broadCastTaskState(nodeId, "error");
          }
        });
      };
      if (node.type === "task" || trigger) {
        execTask();
      }
    };
    render() {
      const { staticData } = this.props;
      return (
        <WrappedComponent
          recurRunTask={this.recurRunTask}
          checkPreDone={this.checkPreDone}
          nodeMap={staticData.NodeMap}
          {...this.props}
        />
      );
    }
  };
}

import React from "react";
import { Button, Icon } from "antd";
import TreeNode from "../TreeNode";
import { Map } from "immutable";
import Line from "../Line";

interface RunButtonProps {
  nodeMap: Map<string, TreeNode>;
  taskStateMap: Map<string, string>;
  broadCastLineState(nodeId: string, state: boolean): void;
  broadCastTaskState(nodeId: string, state: string): void;
}
export default class RunButton extends React.Component<RunButtonProps, any> {
  checkPreNodeStatus = (
    curNodeId: string,
    nodeMap: Map<string, TreeNode>
  ): boolean => {
    const { taskStateMap } = this.props;
    const curNode = nodeMap.get(curNodeId);
    const preNodes = (curNode as TreeNode).preNodes;
    let result = true;
    if (preNodes) {
      preNodes.forEach((v: TreeNode) => {
        console.log(taskStateMap, taskStateMap.get(v.id), v.id);
        //debugger;
        if (taskStateMap.get(v.id) !== "done") {
          result = false;
        }
      });
    }
    return result;
  };
  recurRunTask = (
    nodeId: string,
    nodeMap: Map<string, TreeNode>,
    broadCastNode: (nodeId: string, state: string) => void,
    broadCastLine: (lineId: string, state: boolean) => void
  ) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
      return;
    }
    node.runTask(nodeId, broadCastNode).then(res => {
      if (res) {
        broadCastNode(nodeId, "done");
        if (node.nextLines.size > 0) {
          node.nextLines.forEach((line: Line) => {
            line.playTransData(line.id, broadCastLine).then(res => {
              if (res) {
                if (line.to && this.checkPreNodeStatus(line.to.id, nodeMap)) {
                  this.recurRunTask(
                    line.to.id,
                    nodeMap,
                    broadCastNode,
                    broadCastLine
                  );
                }
              }
            });
          });
        }
      } else {
        broadCastNode(nodeId, "error");
      }
    });
  };
  runFlow = () => {
    const { nodeMap, broadCastLineState, broadCastTaskState } = this.props;
    console.log("start run flow");
    if (nodeMap.size <= 0) {
      return;
    }
    nodeMap.forEach(v => {
      if (v.preNodes.size <= 0) {
        setTimeout(() => {
          this.recurRunTask(
            v.id,
            nodeMap,
            broadCastTaskState,
            broadCastLineState
          );
        }, 0);
      }
    });
  };
  render() {
    return (
      <div
        style={{ position: "fixed", right: "10px", top: "5px", zIndex: 1000 }}
      >
        <Button type="primary" onClick={this.runFlow}>
          <Icon type="play-circle" />
          Run
        </Button>
      </div>
    );
  }
}

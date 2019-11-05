import React from "react";
import { Button, Icon } from "antd";
import { TreeNode } from "../TreeNode";
import { Map } from "immutable";
import Line from "../Line";
import PauseNode from "../PauseNode";
import RunTaskHoc from "./RunTaskHoc";

interface RunButtonProps {
  nodeMap: Map<string, TreeNode | PauseNode>;
  recurRunTask(id: string, nodeMap: Map<string, TreeNode | PauseNode>): void;
}
class RunButton extends React.Component<RunButtonProps, any> {
  runFlow = () => {
    const { nodeMap, recurRunTask } = this.props;
    console.log("start run flow", nodeMap);
    if ((nodeMap as Map<string, TreeNode | PauseNode>).size <= 0) {
      return;
    }
    (nodeMap as Map<string, TreeNode | PauseNode>).forEach((v: any) => {
      if (v.preNodes.size <= 0) {
        setTimeout(() => {
          recurRunTask(v.id, nodeMap as Map<string, TreeNode | PauseNode>);
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

export default RunTaskHoc(RunButton);

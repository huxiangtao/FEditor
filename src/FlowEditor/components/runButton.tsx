import React from "react";
import { Button, Icon, Divider } from "antd";
import { TreeNode } from "../TreeNode";
import { Map } from "immutable";
import PauseNode from "../PauseNode";
import RunTaskHoc from "./RunTaskHoc";
import LogicNode from "../LogicNode";

interface RunButtonProps {
  nodeMap: Map<string, TreeNode | PauseNode | LogicNode>;
  recurRunTask(id: string, nodeMap: Map<string, TreeNode | PauseNode>): void;
}
class RunButton extends React.Component<RunButtonProps, any> {
  runFlow = () => {
    const { nodeMap, recurRunTask } = this.props;
    console.log("start run flow", nodeMap);
    if ((nodeMap as Map<string, TreeNode | PauseNode | LogicNode>).size <= 0) {
      return;
    }
    (nodeMap as Map<string, TreeNode | PauseNode | LogicNode>).forEach(
      (v: any) => {
        if (v.preNodes.size <= 0) {
          setTimeout(() => {
            recurRunTask(v.id, nodeMap as Map<
              string,
              TreeNode | PauseNode | LogicNode
            >);
          }, 0);
        }
      }
    );
  };
  render() {
    return (
      <div
        style={{ position: "fixed", right: "10px", top: "55px", zIndex: 1000 }}
      >
        <Button type="primary" onClick={this.runFlow}>
          <Icon type="play-circle" />
          测试运行
        </Button>
        <Divider type="vertical" />
        <Button type="primary">
          流程发布
        </Button>
      </div>
    );
  }
}

export default RunTaskHoc(RunButton);

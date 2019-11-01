import React from "react";
import { Button, Icon } from "antd";
import { Map } from "immutable";
import { TreeNode } from "../type";

interface ActionMenuProps {
  nodeMap: Map<string, TreeNode>;
}

export default function ActionMenu(props: ActionMenuProps) {
  const { nodeMap } = props;
  const runFlow = () => {
    console.log("start run flow");
    if (nodeMap.size <= 0) {
      return;
    }
    nodeMap.forEach(v => {
      const preSize = v.preNodes.size;
      console.log(preSize, v.preNodes);
      if (preSize <= 0) {
        // root node, just start exec the root node task
        // TODO:huxt exec dispatch promise then change the attribute
        (document.getElementById(v.id) as any)
          .getElementsByClassName("shape")[0]
          .setAttribute("fill", "yellow");
        // 递归调用后续的task
      }
    });
  };
  return (
    <div style={{ position: "fixed", right: "10px", top: "5px", zIndex: 1000 }}>
      <Button type="primary" onClick={runFlow}>
        <Icon type="play-circle" />
        Run
      </Button>
    </div>
  );
}

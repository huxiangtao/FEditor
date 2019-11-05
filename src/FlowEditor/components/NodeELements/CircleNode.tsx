import BaseNode from "./BaseNode";
import React from "react";
import _ from "lodash";
import { Map } from "immutable";
import ActionMenu from "../actionMenu";
import { Dropdown } from "antd";
import RunTaskHoc from "../RunTaskHoc";
import { TreeNode } from "../../TreeNode";
import PauseNode from "../../PauseNode";
import LogicNode from "../../LogicNode";

interface CircleNodeState {
  style: any;
  title: string;
}
class CircleNode extends BaseNode {
  state: CircleNodeState = {
    style: {},
    title: "CircleNode"
  };

  render() {
    const { style, title } = this.state;
    const {
      id,
      onHover,
      onContextMenu,
      curElement,
      nodeMap,
      recurRunTask
    } = this.props;
    const commonStyle = this.commonStyleFactory(curElement);
    const customProps = this.customPropsFactory(curElement);
    return (
      <Dropdown
        overlay={ActionMenu({
          menuList: ["delete", "start"],
          type: "pause",
          onClick: type => {
            if (type === "pause") {
              (recurRunTask as (
                id: string,
                nodeMap: Map<string, TreeNode | PauseNode | LogicNode>,
                trigger?: boolean
              ) => void)(
                id,
                nodeMap as Map<string, TreeNode | PauseNode | LogicNode>,
                true
              );
            }
          }
        })}
        trigger={["contextMenu"]}
      >
        <g
          key={id}
          id={id}
          className={"svg-shape shape-container"}
          transform={curElement.get("transform")}
          onMouseEnter={onHover}
          onContextMenuCapture={onContextMenu}
          {...customProps}
        >
          <circle
            {...commonStyle}
            cx={curElement.get("cx")}
            cy={curElement.get("cy")}
            fill="#72C14B"
            r={curElement.get("r")}
            className="svg-shape shape"
          />
          <text
            x={-curElement.get("dataBboxW") / 2.8}
            y={curElement.get("dataBboxH") / 8}
            fill="#000"
            font-size="14"
            font-family="'Raleway', sans-serif"
            font-fontWeight="bold"
          >
            {curElement.get("title")}
          </text>
        </g>
      </Dropdown>
    );
  }
}

export default RunTaskHoc(CircleNode);

import BaseNode from "./BaseNode";
import React from "react";
import ActionMenu from "../actionMenu";
import { Map } from "immutable";
import { Dropdown } from "antd";

interface LogicNodeState {
  style: any;
  title: string;
}
const fillType = {
  running: "yellow",
  done: "red"
};
export default class LogicNode extends BaseNode {
  state: LogicNodeState = {
    style: {},
    title: "CircleNode"
  };

  render() {
    const { style, title } = this.state;
    const { id, onHover, curElement, onContextMenu, taskStateMap } = this.props;
    const commonStyle = this.commonStyleFactory(curElement);
    const customProps = this.customPropsFactory(curElement);
    const nodeState = (taskStateMap as Map<string, string>).get(id);
    const fill = (fillType as any)[nodeState as string]
      ? (fillType as any)[nodeState as string]
      : "#fff";
    return (
      <Dropdown
        overlay={ActionMenu({ menuList: ["delete", "edit"], type: "logic" })}
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
          <path
            {...commonStyle}
            fill={fill}
            className="svg-shape shape"
            d={curElement.get("d")}
          />
          <foreignObject width="80" height="45">
            <p className="node-text">{curElement.get("title")}</p>
          </foreignObject>
        </g>
      </Dropdown>
    );
  }
}

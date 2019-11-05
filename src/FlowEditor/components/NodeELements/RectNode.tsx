import BaseNode from "./BaseNode";
import React from "react";
import { Map } from "immutable";
import ActionMenu from "../actionMenu";
import { Dropdown } from "antd";

interface RectNodeState {
  style: any;
  title: string;
}
const fillType = {
  running: "yellow",
  done: "red"
};
export default class RectNode extends BaseNode {
  state: RectNodeState = {
    style: {},
    title: "RectNode"
  };

  render() {
    const {
      id,
      onHover,
      onHoverOut,
      curElement,
      onContextMenu,
      taskStateMap
    } = this.props;
    const customProps = this.customPropsFactory(curElement);
    const commonStyle = this.commonStyleFactory(curElement);
    const nodeState = (taskStateMap as Map<string, string>).get(id);
    const fill = (fillType as any)[nodeState as string]
      ? (fillType as any)[nodeState as string]
      : "#fff";
    return (
      <Dropdown
        overlay={ActionMenu({ menuList: ["delete", "edit"], type: "task" })}
        trigger={["contextMenu"]}
      >
        <g
          key={id}
          id={id}
          className={"svg-shape shape-container"}
          transform={curElement.get("transform")}
          onMouseEnter={onHover}
          onMouseLeave={onHoverOut}
          onContextMenuCapture={onContextMenu}
          {...customProps}
        >
          <rect
            {...commonStyle}
            x={curElement.get("x")}
            y={curElement.get("y")}
            className="svg-shape shape"
            fill={fill}
            width={curElement.get("width")}
            height={curElement.get("height")}
          />
        </g>
      </Dropdown>
    );
  }
}

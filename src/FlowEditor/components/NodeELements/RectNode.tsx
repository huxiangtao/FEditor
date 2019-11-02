import BaseNode from "./BaseNode";
import React from "react";
import ActionMenu from "../actionMenu";
import { Dropdown } from "antd";

interface RectNodeState {
  style: any;
  title: string;
}
export default class RectNode extends BaseNode {
  state: RectNodeState = {
    style: {},
    title: "RectNode"
  };

  render() {
    const { style, title } = this.state;
    const { id, onHover, onHoverOut, curElement, onContextMenu } = this.props;
    const customProps = this.customPropsFactory(curElement);
    const commonStyle = this.commonStyleFactory(curElement);
    return (
      <Dropdown
        overlay={ActionMenu({ menuList: ["clone", "delete", "edit"] })}
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
            width={curElement.get("width")}
            height={curElement.get("height")}
          />
        </g>
      </Dropdown>
    );
  }
}

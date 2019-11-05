import BaseNode from "./BaseNode";
import React from "react";
import ActionMenu from "../actionMenu";
import { Dropdown } from "antd";

interface LogicNodeState {
  style: any;
  title: string;
}
export default class LogicNode extends BaseNode {
  state: LogicNodeState = {
    style: {},
    title: "CircleNode"
  };

  render() {
    const { style, title } = this.state;
    const { id, onHover, curElement, onContextMenu } = this.props;
    const commonStyle = this.commonStyleFactory(curElement);
    const customProps = this.customPropsFactory(curElement);
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
            className="svg-shape shape"
            d={curElement.get("d")}
          />
        </g>
      </Dropdown>
    );
  }
}

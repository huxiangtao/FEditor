import BaseNode from "./BaseNode";
import React from "react";

interface CircleNodeState {
  style: any;
  title: string;
}
export default class CircleNode extends BaseNode {
  state: CircleNodeState = {
    style: {},
    title: "CircleNode"
  };

  render() {
    const { style, title } = this.state;
    const { id, onHover, onContextMenu, curElement, onClick } = this.props;
    const commonStyle = this.commonStyleFactory(curElement);
    const customProps = this.customPropsFactory(curElement);
    return (
      <g
        key={id}
        id={id}
        className={"svg-shape shape-container"}
        transform={curElement.get("transform")}
        onMouseEnter={onHover}
        onContextMenuCapture={onContextMenu}
        onClick={(onClick as any).bind(id)}
        {...customProps}
      >
        <circle
          {...commonStyle}
          cx={curElement.get("cx")}
          cy={curElement.get("cy")}
          r={curElement.get("r")}
          className="svg-shape shape"
        />
      </g>
    );
  }
}

import BaseNode from "./BaseNode";
import React from "react";

interface DiamondNodeState {
  style: any;
  title: string;
}
export default class DiamondNode extends BaseNode {
  state: DiamondNodeState = {
    style: {},
    title: "CircleNode"
  };

  render() {
    const { style, title } = this.state;
    const { id, onHover, curElement, onContextMenu } = this.props;
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
        {...customProps}
      >
        <path
          {...commonStyle}
          className="svg-shape shape"
          d={curElement.get("d")}
        />
      </g>
    );
  }
}
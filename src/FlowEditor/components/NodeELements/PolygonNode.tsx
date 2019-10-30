import BaseNode from "./BaseNode";
import React from "react";

interface PolygonNodeState {
  style: any;
  title: string;
}
export default class PolygonNode extends BaseNode {
  state: PolygonNodeState = {
    style: {},
    title: "PolygonNode"
  };

  render() {
    const { style, title } = this.state;
    const { id, onHover, onHoverOut, curElement } = this.props;
    const commonStyle = this.commonStyleFactory(curElement);
    const customProps = this.customPropsFactory(curElement);
    return (
      <g
        key={id}
        id={id}
        className={"svg-shape shape-container"}
        transform={curElement.get("transform")}
        onMouseEnter={onHover}
        onMouseLeave={onHoverOut}
        {...customProps}
      >
        <polygon
          {...commonStyle}
          className="svg-shape shape"
          points={curElement.get("points")}
        />
      </g>
    );
  }
}

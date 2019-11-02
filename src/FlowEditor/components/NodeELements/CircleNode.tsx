import BaseNode from "./BaseNode";
import React from "react";
import _ from "lodash";
import ActionMenu from "../actionMenu";
import { Dropdown } from "antd";

interface CircleNodeState {
  style: any;
  title: string;
}
export default class CircleNode extends BaseNode {
  state: CircleNodeState = {
    style: {},
    title: "CircleNode"
  };

  switchPause = (id: string) => {
    const { staticData } = this.props;
    const attached = _.get(staticData, "attached");
    const lines = _.get(attached, `${id}.lines`);
    for (let lineId of lines) {
      const lineElement = document.getElementById(`${lineId}`);
      const points = (lineElement as any).querySelectorAll(".animatepoints");
      _.forEach(points, v => {
        const pointId = v.getAttribute("data-line-id");
        if (pointId.indexOf(lineId) > -1) {
          const visibility = v.getAttribute("visibility");
          if (visibility === "visible") {
            v.setAttribute("visibility", "hidden");
          } else {
            v.setAttribute("visibility", "visible");
          }
        }
      });
    }
  };

  render() {
    const { style, title } = this.state;
    const { id, onHover, onContextMenu, curElement, onClick } = this.props;
    const commonStyle = this.commonStyleFactory(curElement);
    const customProps = this.customPropsFactory(curElement);
    return (
      <Dropdown
        overlay={ActionMenu({ menuList: ["clone", "delete", "pause"] })}
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
            onClick={() => {
              this.switchPause(id);
              (onClick as any)(id);
            }}
            cx={curElement.get("cx")}
            cy={curElement.get("cy")}
            r={curElement.get("r")}
            className="svg-shape shape"
          />
        </g>
      </Dropdown>
    );
  }
}

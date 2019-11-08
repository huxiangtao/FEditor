import BaseNode from "./BaseNode";
import React, { Fragment } from "react";
import { Map } from "immutable";
import ActionMenu from "../actionMenu";
import { Dropdown } from "antd";

interface RectNodeState {
  style: any;
  title: string;
  showTips: boolean;
}
const fillType = {
  running: "yellow",
  done: "#F69331",
  error: "red"
};
export default class RectNode extends BaseNode {
  state: RectNodeState = {
    style: {},
    title: "RectNode",
    showTips: false
  };

  hoverText = () => {
    const { curElement } = this.props;
    this.setState({
      showTips: true
    });
  };

  hoverOutText = () => {
    this.setState({
      showTips: false
    });
  };

  render() {
    const {
      id,
      onHover,
      onHoverOut,
      curElement,
      onContextMenu,
      taskStateMap,
      onEditApp
    } = this.props;
    const customProps = this.customPropsFactory(curElement);
    const commonStyle = this.commonStyleFactory(curElement);
    const nodeState = (taskStateMap as Map<string, string>).get(id);
    const fill = (fillType as any)[nodeState as string]
      ? (fillType as any)[nodeState as string]
      : "#fff";
    return (
      <Dropdown
        overlay={ActionMenu({
          menuList: ["删除", "编辑"],
          type: "task",
          onClick: type => {
            (onEditApp as (formValue: any) => void)({
              name: curElement.get("title"),
              apptype: "task",
              id
            });
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
          onMouseLeave={onHoverOut}
          onContextMenuCapture={onContextMenu}
          {...customProps}
        >
          <rect
            {...commonStyle}
            className="svg-shape shape"
            fill={fill}
            rx="3"
            width={curElement.get("width")}
            height={curElement.get("height")}
          />
          {/* {nodeState === "running" && (
            <rect
              {...commonStyle}
              stroke="none"
              className="svg-shape shape"
              fill="yellow"
              rx="3"
              width={curElement.get("width") - 2}
              height={curElement.get("height") - 2}
            >
              <animate
                attributeName="fill"
                attributeType="XML"
                from="yellow"
                to="blue"
                begin="0s"
                dur="4s"
                repeatDur="indefinite"
              />
            </rect>
          )} */}
          <foreignObject
            onMouseEnter={this.hoverText}
            onMouseLeave={this.hoverOutText}
            width="80"
            height="45"
          >
            <p className="node-text">{curElement.get("title")}</p>
          </foreignObject>
          {/* {this.state.showTips && (
            <g>
              <text>{curElement.get("title")}</text>
            </g>
          )} */}
        </g>
      </Dropdown>
    );
  }
}

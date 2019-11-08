import BaseNode from "./BaseNode";
import React, { Fragment } from "react";
import ActionMenu from "../actionMenu";
import { Map } from "immutable";
import { Dropdown } from "antd";
import LogicCondition from "../logicCondition";

interface LogicNodeState {
  style: any;
  title: string;
  modalVisible: boolean;
}
const fillType = {
  running: "#64A5EF",
  done: "#F69331",
  error: "red"
};
export default class LogicNode extends BaseNode {
  state: LogicNodeState = {
    style: {},
    title: "CircleNode",
    modalVisible: false
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

  handleOk = () => {
    this.setState({
      modalVisible: false
    });
  };

  render() {
    const { style, title, modalVisible } = this.state;
    const { id, onHover, curElement, onContextMenu, taskStateMap } = this.props;
    const commonStyle = this.commonStyleFactory(curElement);
    const customProps = this.customPropsFactory(curElement);
    const nodeState = (taskStateMap as Map<string, string>).get(id);
    const fill = (fillType as any)[nodeState as string]
      ? (fillType as any)[nodeState as string]
      : "#fff";
    return (
      <Fragment>
        <Dropdown
          overlay={ActionMenu({
            menuList: ["删除", "编辑条件"],
            type: "logic",
            onClick: type => {
              this.setState({
                modalVisible: true
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
        <LogicCondition
          modalVisible={modalVisible}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
        />
      </Fragment>
    );
  }
}

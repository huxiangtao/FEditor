import BaseNode from "./BaseNode";
import React, { Fragment } from "react";
import { Dropdown, Modal, Radio } from "antd";
import { Map } from "immutable";
import ActionMenu from "../actionMenu";
import { TreeNode } from "../../TreeNode";
import PauseNode from "../../PauseNode";
import RunTaskHoc from "../RunTaskHoc";
import LogicNode from "../../LogicNode";

interface PolygonNodeState {
  style: any;
  title: string;
  modalVisible: boolean;
  radioValue: number;
}
const fillType = {
  running: "yellow",
  done: "red"
};
class PolygonNode extends BaseNode {
  state: PolygonNodeState = {
    style: {},
    title: "PolygonNode",
    modalVisible: false,
    radioValue: 1
  };

  handleOk = () => {
    const { id, nodeMap, recurRunTask } = this.props;
    (recurRunTask as (
      id: string,
      nodeMap: Map<string, TreeNode | PauseNode | LogicNode>,
      trigger?: boolean
    ) => void)(
      id,
      nodeMap as Map<string, TreeNode | PauseNode | LogicNode>,
      true
    );
    this.setState({
      modalVisible: false
    });
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

  openModal = () => {
    this.setState({
      modalVisible: true
    });
  };

  onChange = (e: any) => {
    this.setState({
      radioValue: e.target.value
    });
  };

  render() {
    const {
      id,
      onHover,
      onContextMenu,
      curElement,
      checkPreDone,
      taskStateMap,
      nodeMap
    } = this.props;
    const menuList = ["delete"];
    const nodeState = (taskStateMap as Map<string, string>).get(id);
    const fill = (fillType as any)[nodeState as string]
      ? (fillType as any)[nodeState as string]
      : "#fff";
    if (
      (checkPreDone as (
        curNodeId: string,
        nodeMap: Map<string, TreeNode | PauseNode | LogicNode>
      ) => boolean)(id, nodeMap as Map<
        string,
        TreeNode | PauseNode | LogicNode
      >)
    ) {
      menuList.push("human");
    }
    const commonStyle = this.commonStyleFactory(curElement);
    const customProps = this.customPropsFactory(curElement);
    return (
      <Fragment>
        <Dropdown
          overlay={ActionMenu({
            menuList,
            type: "human",
            onClick: type => {
              if (type === "human") {
                this.openModal();
              }
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
            <polygon
              {...commonStyle}
              fill={fill}
              className="svg-shape shape"
              points={curElement.get("points")}
            />
            <foreignObject width="80" height="45">
              <p
                style={{
                  fontSize: "12px",
                  lineHeight: "43px",
                  color: "#000"
                }}
              >
                {curElement.get("title")}
              </p>
            </foreignObject>
          </g>
        </Dropdown>
        <Modal
          title="Human"
          visible={this.state.modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Radio.Group onChange={this.onChange} value={this.state.radioValue}>
            <Radio value={1}>A</Radio>
            <Radio value={2}>B</Radio>
            <Radio value={3}>C</Radio>
            <Radio value={4}>D</Radio>
          </Radio.Group>
        </Modal>
      </Fragment>
    );
  }
}

export default RunTaskHoc(PolygonNode);

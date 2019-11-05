import BaseNode from "./BaseNode";
import React, { Fragment } from "react";
import { Dropdown, Modal, Radio } from "antd";
import { Map } from "immutable";
import ActionMenu from "../actionMenu";
import TreeNode from "../../TreeNode";
import PauseNode from "../../PauseNode";
import RunTaskHoc from "../RunTaskHoc";

interface PolygonNodeState {
  style: any;
  title: string;
  modalVisible: boolean;
  radioValue: number;
}
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
      nodeMap: Map<string, TreeNode | PauseNode>,
      trigger?: boolean
    ) => void)(id, nodeMap as Map<string, TreeNode | PauseNode>, true);
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
      nodeMap
    } = this.props;
    const menuList = ["delete"];
    if (
      (checkPreDone as (
        curNodeId: string,
        nodeMap: Map<string, TreeNode | PauseNode>
      ) => boolean)(id, nodeMap as Map<string, TreeNode | PauseNode>)
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
              className="svg-shape shape"
              points={curElement.get("points")}
            />
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

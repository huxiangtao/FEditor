import React, { Fragment } from "react";
import { Button } from "antd";
import { constants } from "../constants/index";
import "../style.css";
import _ from 'lodash';

const commonProps = {
  className: "shape-button",
  fill: "#fff",
  stroke: "#000",
  pointerEvents: "none"
};

interface PanelProps {
  createShape(
    type: string,
    id: string,
    title: string,
    position: number[]
  ): void; //NOTE: 创建shape
  showAppForm?(): void;
  appList: any[];
  marginConfig: any;
}

const shapeComponentMap = {
  task: <rect x="1" y="1" width="78" height="43" rx="3" {...commonProps} />,
  human: (
    <polygon
      points="20,2 60,2 78,14 78,31 60,44 20,44 1,31 1,14"
      {...commonProps}
    />
  ),
  pause: (
    <ellipse cx={39} cy={21} rx={20} ry={20} {...commonProps} fill="#72C14B" />
  ),
  logic: (
    <path
      d="M 38 1 L 76 20 L 38 41 L 2 20 Z"
      stroke-linejoin="round"
      stroke-linecap="square"
      {...commonProps}
    />
  )
};

export default class Panel extends React.Component<PanelProps, any> {
  curCloneNode = null;

  dragStart = (e: any) => {
    const crt = e.target.cloneNode(true);
    crt.style.backgroundColor = "none";
    crt.style.position = "absolute";
    crt.style.top = "0px";
    crt.style.left = "-100px";
    document.body.appendChild(crt);
    e.dataTransfer.setDragImage(crt, 0, 0);
    this.curCloneNode = crt;
  };

  dragEnd = (e: any, id: string, type: string, title: string) => {
    const CANVAS_LEFT_MARGIN = _.get(this.props.marginConfig, 'CANVAS_LEFT_MARGIN', constants.CANVAS_LEFT_MARGIN); 
    const CANVAS_TOP_MARGIN = _.get(this.props.marginConfig, 'CANVAS_TOP_MARGIN', constants.CANVAS_TOP_MARGIN); 
    const { createShape } = this.props;
    if (e.clientX > CANVAS_LEFT_MARGIN) {
      createShape(type, id, title, [e.clientX - CANVAS_LEFT_MARGIN, e.clientY - CANVAS_TOP_MARGIN]);
    }
    if (this.curCloneNode) {
      document.body.removeChild(this.curCloneNode as any);
    }
  };

  getTextStyle = (type: string): any => {
    let style = {
      position: "absolute",
      top: "14px",
      textAlign: "center",
      height: "16px",
      overflow: "hidden",
      width: "100%",
      fontSize: "12px",
      color: "#000"
    };
    if (type === "pause") {
      style.top = "12px";
    } else if (type === "logic") {
      style.top = "11px";
    }
    return style;
  };

  render() {
    const CANVAS_LEFT_MARGIN = _.get(this.props.marginConfig, 'CANVAS_LEFT_MARGIN', constants.CANVAS_LEFT_MARGIN); 
    const { appList } = this.props;
    const buttonContainerStyle = {
      width: CANVAS_LEFT_MARGIN + "px",
      padding: "20px"
    } as React.CSSProperties;
    return (
      <div
        style={{
          width: CANVAS_LEFT_MARGIN + "px"
        }}
      >
        <p style={{ marginBottom: '30px' }}></p>
        {/* <Button
          type="primary"
          icon="plus"
          size="small"
          onClick={this.props.showAppForm}
        >
          Add App
        </Button> */}
        <div style={buttonContainerStyle}>
          {appList.map(app => {
            return (
              <div
                onDragStart={this.dragStart}
                onDragEnd={(e: any) => {
                  this.dragEnd(e, app.id, app.type, app.name);
                }}
                draggable={true}
                key={app.id}
                className="panel-button"
              >
                <svg
                  pointerEvents="none"
                  style={{ width: "80px", height: "45px" }}
                >
                  {(shapeComponentMap as any)[app.type]}
                </svg>
                <p style={this.getTextStyle(app.type)}>{app.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

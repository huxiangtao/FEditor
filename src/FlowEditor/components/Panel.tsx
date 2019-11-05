import React, { Fragment } from "react";
import { Button } from "antd";
import { constants } from "../constants/index";
import "../style.css";

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
}

const shapeComponentMap = {
  task: <rect x="7" y="3" width="66" height="34" {...commonProps} />,
  human: (
    <path d="M 6 2 L 30 18 L 6 34 Z" strokeMiterlimit={10} {...commonProps} />
  ),
  pause: <ellipse cx={38} cy={20} rx={15.6} ry={15.6} {...commonProps} />,
  logic: (
    <path
      d="M 38 2 L 76 20 L 38 38 L 2 20 Z"
      strokeMiterlimit={10}
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
    const { CANVAS_LEFT_MARGIN } = constants;
    const { createShape } = this.props;
    if (e.clientX > CANVAS_LEFT_MARGIN) {
      createShape(type, id, title, [e.clientX - CANVAS_LEFT_MARGIN, e.clientY]);
    }
    if (this.curCloneNode) {
      document.body.removeChild(this.curCloneNode as any);
    }
  };

  render() {
    const { CANVAS_LEFT_MARGIN } = constants;
    const { appList } = this.props;
    const buttonContainerStyle = {
      display: "flex",
      justifyContent: "space-evenly",
      flexWrap: "wrap",
      marginTop: "18px",
      left: "0px",
      width: CANVAS_LEFT_MARGIN + "px",
      height: "260px",
      backgroundColor: "#F6F6F6"
    } as React.CSSProperties;
    return (
      <div
        style={{
          position: "fixed",
          left: "0px",
          width: CANVAS_LEFT_MARGIN + "px",
          height: "100%",
          backgroundColor: "#F6F6F6"
        }}
      >
        <p></p>
        <Button
          type="primary"
          icon="plus"
          size="small"
          onClick={this.props.showAppForm}
        >
          Add App
        </Button>
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
                <svg pointerEvents="none">
                  {(shapeComponentMap as any)[app.type]}
                </svg>
                <p style={{ position: "absolute", top: "4px" }}>{app.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

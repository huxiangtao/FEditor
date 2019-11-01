import React from "react";
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
  createShape(e: any): void; //NOTE: 创建shape
  createApp?(): void;
}

const shapeComponentMap = {
  common: <rect x={1} y={1} width={66} height={34} {...commonProps} />,
  human: (
    <path d="M 6 2 L 30 18 L 6 34 Z" strokeMiterlimit={10} {...commonProps} />
  ),
  pause: <ellipse cx={28} cy={18} rx={15.6} ry={15.6} {...commonProps} />,
  logic: (
    <path
      d="M 18 2 L 34 18 L 18 34 L 2 18 Z"
      strokeMiterlimit={10}
      {...commonProps}
    />
  )
};

export default class Panel extends React.Component<PanelProps, any> {
  state = {
    appList: [
      { id: "app1", type: "common" },
      { id: "app2", type: "human" },
      { id: "app2", type: "pause" },
      { id: "app3", type: "logic" }
    ]
  };
  addApp = () => {
    // TODO:huxt 暴露给外部的创建服务接口
    //(this.props.createApp as any)();
    this.setState({});
  };

  render() {
    const { CANVAS_LEFT_MARGIN } = constants;
    const { appList } = this.state;
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
        <Button type="primary" icon="plus" size="small" onClick={this.addApp}>
          Add App
        </Button>
        <div style={buttonContainerStyle}>
          {appList.map(app => {
            return (
              <button
                draggable={true}
                key={app.id}
                className="panel-button"
                onClick={this.props.createShape}
                id={app.id}
              >
                <svg pointerEvents="none">
                  {(shapeComponentMap as any)[app.type]}
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

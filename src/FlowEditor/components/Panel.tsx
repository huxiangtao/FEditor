import React from "react";
import { constants } from "../constants/index";
import { Button } from "antd";
import "../style.css";

const rect = (props: any) => <rect {...props} />;
const path = (props: any) => <path {...props} />;
const ellipse = (props: any) => <ellipse {...props} />;
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

export default class Panel extends React.Component<PanelProps, any> {
  state = {
    regularShapes: [
      {
        tag: "rect",
        id: "create-rect",
        attributes: { x: 1, y: 1, width: 66, height: 34, ...commonProps }
      },
      {
        tag: "path",
        id: "create-triangle",
        attributes: {
          d: "M 6 2 L 30 18 L 6 34 Z",
          strokeMiterlimit: 10,
          ...commonProps
        }
      },
      {
        tag: "ellipse",
        id: "create-circle",
        attributes: {
          cx: "18",
          cy: "18",
          rx: "15.6",
          ry: "15.6",
          ...commonProps
        }
      },
      {
        tag: "path",
        id: "create-diamond",
        attributes: { d: "M 18 2 L 34 18 L 18 34 L 2 18 Z", ...commonProps }
      }
    ]
  };
  addApp = () => {
    // TODO:huxt 暴露给外部的创建服务接口
    //(this.props.createApp as any)();
    this.setState({});
  };

  render() {
    const { CANVAS_LEFT_MARGIN } = constants;
    const { regularShapes } = this.state;
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
          {regularShapes.map(shape => {
            let tag;
            switch (shape.tag) {
              case "rect":
                tag = rect(shape.attributes);
                break;
              case "path":
                tag = path(shape.attributes);
                break;
              case "ellipse":
                tag = ellipse(shape.attributes);
                break;
            }
            return (
              <button
                draggable={true}
                key={shape.id}
                className="panel-button"
                onClick={this.props.createShape}
                id={shape.id}
              >
                <svg pointerEvents="none">{tag}</svg>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

import BaseLine from "./BaseLine";
import React from "react";

interface PolyLineState {
  style: any;
  title: string;
}
export default class PolyLine extends BaseLine {
  state: PolyLineState = {
    style: {},
    title: "PolyLine"
  };

  render() {
    const { style, title } = this.state;
    const { id, curElement, onContextMenu } = this.props;
    const customProps = this.customPropsFactory(curElement);
    const commonStyle = this.commonStyleFactory(curElement);
    const pointsList = curElement.get("points").split(" ");
    return (
      <g
        key={id}
        id={id}
        className={"svg-shape shape-container"}
        transform={curElement.get("transform")}
        onContextMenuCapture={onContextMenu}
        {...customProps}
      >
        <polyline
          {...commonStyle}
          className="svg-shape shape polyline-shape"
          fill="none"
          strokeWidth={1}
          stroke="#424242"
          points={curElement.get("points")}
          data-shape1={curElement.get("shape1")}
          data-shape2={curElement.get("shape2")}
          pointerEvents="none"
          markerEnd="url(#marker-arrow)"
        />
        {pointsList.map((v: any, i: number) => {
          const curPos = v.split(",");
          const nextPointsPos =
            i < pointsList.length - 1 ? pointsList[i + 1] : "";
          const nextPos = nextPointsPos.split(",");
          let dis;
          if (curPos[0] === nextPos[0]) {
            dis = {
              y: nextPos[1]
            };
          } else if (curPos[1] === nextPos[1]) {
            dis = {
              x: nextPos[0]
            };
          }
          const attrName = dis && dis["x"] ? "cx" : "cy";
          const from = dis && dis["x"] ? curPos[0] : curPos[1];
          const to = dis && dis["x"] ? nextPos[0] : nextPos[1];
          return (
            <circle
              {...commonStyle}
              fill="red"
              cx={curPos[0]}
              cy={curPos[1]}
              r="5"
              data-line-id={`${id}_animatepoints_${i}`}
              className={`svg-shape shape animatepoints`}
            >
              <animate
                attributeName={attrName}
                attributeType="XML"
                from={from}
                to={to}
                begin="0s"
                dur="4s"
                repeatDur="indefinite"
              />
            </circle>
          );
        })}
      </g>
    );
  }
}

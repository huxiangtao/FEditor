import React from "react";
import { lineConnHandlers } from "../utils";

interface ShapeHandlerProps {
  staticData: any;
}

export default function ShapeHandler(props: ShapeHandlerProps) {
  const { staticData } = props;
  const ele = staticData.selected.element;
  if (!ele) return null;

  const matrix = staticData.transform.matrix;
  let placeHolderPoints = staticData.handlersPos.slice(0, 4);
  let lineConn = lineConnHandlers(ele.getBoundingClientRect());
  return (
    <g id="handlers">
      {lineConn.map((l, idx) => (
        <path
          id={"line-connect-handler-" + idx}
          key={idx}
          className="svg-shape line-connect-handler handler"
          fill="#017cfc"
          fillOpacity="0.2"
          d={l}
        />
      ))}
      <g id="place-holder" className="place-holder elliot">
        <polygon
          fill="none"
          stroke="#00a8ff"
          strokeDasharray="3 3"
          strokeWidth={1}
          points={placeHolderPoints.map((p: any) => p.join(",")).join(" ")}
          pointerEvents="none"
        />
      </g>
    </g>
  );
}

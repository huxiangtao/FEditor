import React from "react";
import { constants } from "../constants";
const { CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN } = constants;

interface ShapeWraperProps {
  objList: any[];
  staticData: any;
  handlers: any;
  selectedElementID: string;
}

const wrap = (shape: any, o: any, handlers: any) => {
  if (!shape) return;
  let objID = o.get("id");
  let customProps = {
    "data-bboxx": o.get("dataBboxX"),
    "data-bboxy": o.get("dataBboxY"),
    "data-bboxw": o.get("dataBboxW"),
    "data-bboxh": o.get("dataBboxH"),
    "data-cx": o.get("dataCX"),
    "data-cy": o.get("dataCY")
  };
  let isCustomShape = o.get("type") === "custom";
  return (
    <g
      key={objID}
      id={objID}
      className={"svg-shape shape-container"}
      transform={o.get("transform")}
      onMouseEnter={handlers.onHover}
      onMouseLeave={handlers.onHoverOut}
      {...customProps}
    >
      {shape}
    </g>
  );
};
export default function ShapeWrap(props: ShapeWraperProps) {
  const { objList, staticData, handlers, selectedElementID } = props;
  return (
    <g className="all-shape-wrapper">
      {objList.map(o => {
        const commonProps = {
          stroke: o.get("stroke"),
          "stroke-width": o.get("stroke-width"),
          "stroke-opacity": o.get("stroke-opacity"),
          "stroke-dasharray": o.get("stroke-dasharray"),
          fill: o.get("fill"),
          "fill-opacity": o.get("fill-opacity")
        };
        let shape;
        switch (o.get("type")) {
          case "circle":
            shape = (
              <circle
                {...commonProps}
                cx={o.get("cx")}
                cy={o.get("cy")}
                r={o.get("r")}
                className="svg-shape shape"
              />
            );
            break;

          case "rect":
            shape = (
              <rect
                {...commonProps}
                x={o.get("x")}
                y={o.get("y")}
                className="svg-shape shape"
                width={o.get("width")}
                height={o.get("height")}
              />
            );
            break;
          case "polygon":
            shape = (
              <polygon
                {...commonProps}
                className="svg-shape shape"
                points={o.get("points")}
              />
            );
            break;
          case "polyline":
            let objID = o.get("id");
            let shape1 = o.get("shape1"),
              shape2 = o.get("shape2");
            if (shape1 && staticData.attached[shape1])
              staticData.attached[shape1].lines.add(objID);
            if (shape2 && staticData.attached[shape2])
              staticData.attached[shape2].lines.add(objID);
            // about the pointEvents props, go check: https://stackoverflow.com/questions/18663958/clicking-a-svg-line-its-hard-to-hit-any-ideas-how-to-put-a-click-area-around-a-l
            // https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events           https://css-tricks.com/almanac/properties/p/pointer-events/
            let handlerPoints = [];
            if (selectedElementID === objID) {
              handlerPoints = staticData.selected.element
                .getElementsByClassName("shape")[0]
                .getAttribute("points")
                .split(/\s+/)
                .map((p: any) => p.split(",").map((num: any) => parseInt(num)));
            }
            shape = (
              <g>
                <polyline
                  {...commonProps}
                  className="svg-shape shape polyline-shape"
                  fill="none"
                  strokeWidth={1}
                  stroke="#424242"
                  points={o.get("points")}
                  data-shape1={o.get("shape1")}
                  data-shape2={o.get("shape2")}
                  pointerEvents="none"
                  markerEnd="url(#marker-arrow)"
                />
              </g>
            );
            break;
          case "path":
            shape = (
              <path
                {...commonProps}
                className="svg-shape shape"
                d={o.get("d")}
              />
            );
            break;
          case "animate_rect":
            const dir = o.get("dis");
            const attrName = dir && dir.get("x") ? "cx" : "cy";
            const moveAttr = attrName === "cx" ? "x" : "y";
            shape = (
              <g>
                <circle
                  {...commonProps}
                  cx={o.get("x")}
                  cy={o.get("y")}
                  r="5"
                  data-line-id={o.get("lineId")}
                  className="svg-shape shape"
                >
                  {dir && (
                    <animate
                      attributeName={attrName}
                      attributeType="XML"
                      from={o.get(moveAttr)}
                      to={dir.get(moveAttr)}
                      begin="0s"
                      dur="4s"
                      repeatDur="indefinite"
                    />
                  )}
                </circle>
              </g>
            );
        }
        return wrap(shape, o, handlers);
      })}
    </g>
  );
}

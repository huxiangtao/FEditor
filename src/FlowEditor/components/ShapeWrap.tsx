import React from "react";

interface ShapeWraperProps {
  objList: any[];
  staticData: any;
}

const wrap = (shape: any, o: any) => {
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
      className={
        "svg-shape shape-container" +
        (isCustomShape
          ? " custom-shape custom-" + o.get("customClassName")
          : "")
      }
      transform={o.get("transform")}
      {...customProps}
    >
      {shape}
    </g>
  );
};
export default function ShapeWrap(props: ShapeWraperProps) {
  const { objList, staticData } = props;
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

          case "path":
            shape = (
              <path
                {...commonProps}
                className="svg-shape shape"
                d={o.get("d")}
              />
            );
            break;
        }
        return wrap(shape, o);
      })}
    </g>
  );
}

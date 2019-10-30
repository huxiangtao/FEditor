import React from "react";
import RectNode from "./NodeELements/RectNode";
import PolygonNode from "./NodeELements/PolygonNode";
import CircleNode from "./NodeELements/CircleNode";
import DiamondNode from "./NodeELements/DiamondNode";
import PolyLine from "./LineElements/PolyLine";

interface ShapeWraperProps {
  objList: any[];
  staticData: any;
  handlers: any;
  selectedElementID: string;
}

export default function ShapeWrap(props: ShapeWraperProps) {
  const { objList, staticData, handlers, selectedElementID } = props;
  return (
    <g className="all-shape-wrapper">
      {objList.map(o => {
        let node;
        switch (o.get("type")) {
          case "circle":
            node = (
              <CircleNode
                id={o.get("id")}
                curElement={o}
                onClick={handlers.onPauseClick}
                onContextMenu={handlers.onContextMenu}
                onHover={handlers.onHover}
              />
            );
            break;
          case "rect":
            node = (
              <RectNode
                id={o.get("id")}
                curElement={o}
                onHover={handlers.onHover}
                onContextMenu={handlers.onContextMenu}
              />
            );
            break;
          case "polygon":
            node = (
              <PolygonNode
                id={o.get("id")}
                curElement={o}
                onHover={handlers.onHover}
              />
            );
            break;
          case "diamond":
            node = (
              <DiamondNode
                id={o.get("id")}
                curElement={o}
                onHover={handlers.onHover}
                onContextMenu={handlers.onContextMenu}
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
            node = (
              <PolyLine
                id={o.get("id")}
                curElement={o}
                staticData={staticData}
              />
            );
            break;
        }
        return node;
      })}
    </g>
  );
}

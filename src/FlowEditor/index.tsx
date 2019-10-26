import React from "react";
import { fromJS } from "immutable";
import { constants } from "./constants/index";
import BackGround from "./components/BackGround";
import Panel from "./components/Panel";
import ShapeWrap from "./components/ShapeWrap";
import {
  randomNumber,
  randomString,
  pointTransform,
  updateHandlersPos,
  optimisePath
} from "./utils";
import regularShapes from "./regularShapes";
import ShapeHandler from "./components/ShapeHandler";

interface FlowEditorState {
  selectedElementID: string;
  objList: any[];
}

const staticData = {
  dragging: false, // there are too many computing in onmouseup/down, only mousedown followed by mousemove is considered dragging, thus dragging: false won't fire mouseup handler
  action: "", // allowed values are: translate, scale, rotate, draw-line, move-controlPoint, ...

  selected: {
    element: null,
    textEle: null
  },
  selector: null, // this is the <g> tag enclosing place-holder and handlers, I need to access them frequently during transform, so saved here

  transform: {
    // todo: all coordinates and matrix should be rounded to integer, floats consume too much space.
    matrix: [1, 0, 0, 1, 0, 0],
    startX: 0,
    startY: 0,
    diagonalRad: 0, // the radian or just call it width/height ratio, used in calculating deltaX/Y of mouse movement during scaling
    scaleOrigin: [[], [], [], []],
    cx: 0,
    cy: 0 // center point of current shape after transform
  },

  handlersPos: [
    // points coordinates around the shape when clicked as a indicator that the element is selected. 4 scale handlers, 1 rotate handler ...
    [],
    [],
    [],
    [],
    [] // but for polylines, those points are not allowed to interact in this implt.
  ],
  scaleHandlerIdx: -1,

  bbox: { x: 0, y: 0, w: 0, h: 0 }, // x: 0, y: 0, // X/Y coordinates of top left point of selected element, read from element's attribute: dataBboxX/X
  // w: 0, h: 0, // width/height of selected element, read from element's attribute: dataBboxWidth/Height. these 4 values are written as custom attributes for each element during creation.

  curve: {
    CP: [[], [], [], []], // 4 control points coordinates for cubic bezier curve
    CPselected: 0 // there are 4 control points for a curve, I need to know which one is selected when updating the 'd' attribute of <path />. Allowed values are 0, 1, 2, 3.
  },

  drawLine: {
    // info about the line you are currently drawing
    id: "", // the lineID of the current line that user is drawing
    element: null, // svg polyline element that user is drawing
    points: [], // array of 2 points(value of 'points' attribute after joining). When drawing, there are only 2 points(start/end) for simplicity sake.
    hoveredElement: null // when the line is still drawing, and you hover mouse on another shape(to draw a line between 2 shapes). This variable is that shape element
  },

  animationPath: [],

  attached: {
    // key is the shapeID, value is an obj containing all the attached info (text, connected lines)
    // objA-id: {
    //     text: textID, this is the text shape ID, with which you could get text content/color/fontSize/fontFamily/width/etc
    //     lines: [lineA-ID, lineB-ID, ...], this is a Set, not an array,
    // }, objB-id: {text: {...}, lines: []
  }
};

export default class FlowEditor extends React.Component<any, FlowEditorState> {
  state = {
    selectedElementID: "",
    objList: fromJS([])
  };

  componentDidMount = () => {
    (staticData.selector as any) = document.getElementById("selector-layer");
  };

  componentDidUpdate = () => {
    if (staticData.drawLine.id) {
      // user has drawn a line
      let ele = document.getElementById(staticData.drawLine.id);
      if (ele) {
        (staticData.drawLine.element as any) = ele;
      }
    }
  };

  translate = (e: any) => {
    const { CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN } = constants;
    let x = e.clientX - CANVAS_LEFT_MARGIN,
      y = e.clientY - CANVAS_TOP_MARGIN;
    let deltaX = x - staticData.transform.startX;
    let deltaY = y - staticData.transform.startY;
    staticData.transform.startX = x;
    staticData.transform.startY = y;
    staticData.transform.matrix[4] += deltaX;
    staticData.transform.matrix[5] += deltaY;

    (staticData.handlersPos as number[][]) = staticData.handlersPos.map(p => [
      ((p as number[])[0] += deltaX),
      ((p as number[])[1] += deltaY)
    ]);

    const placeholder = (staticData.selector as any).getElementsByTagName(
      "polygon"
    )[0]; // place-holder is a <polygon >
    placeholder.setAttribute(
      "points",
      staticData.handlersPos.slice(0, 4).join(" ")
    ); // 4 scale handlers, 1 rotate handler, for place-holder polygon, only the first 4 is needed
  };

  drawLine = (e: any) => {
    const { CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN } = constants;
    if (!staticData.drawLine.element) return;

    let x = e.clientX,
      y = e.clientY;
    (staticData.drawLine.points[1] as any) = [
      x - CANVAS_LEFT_MARGIN,
      y - CANVAS_TOP_MARGIN
    ];
    (staticData.drawLine.element as any)
      .getElementsByTagName("polyline")[0]
      .setAttribute("points", staticData.drawLine.points.join(" "));
  };

  keyUpHandler = () => {};

  onMouseMove = (e: any) => {
    if (!staticData.action || staticData.action === "text-editing") return;

    staticData.dragging = true;
    switch (staticData.action) {
      case "translate":
        this.translate(e);
        break;
      case "draw-line":
        this.drawLine(e);
        break;
      default:
        console.log("unknown action: ", staticData.action);
    }
  };

  onMouseDown = (e: any) => {
    const { CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN } = constants;
    staticData.transform.startX = e.clientX - CANVAS_LEFT_MARGIN;
    staticData.transform.startY = e.clientY - CANVAS_TOP_MARGIN;
    const target = e.target;
    const selectedEle = target.closest(".shape-container");
    if (
      target.classList.contains("shape") &&
      selectedEle &&
      selectedEle.id === this.state.selectedElementID
    ) {
      staticData.action = "translate";
      return;
    }
    if (selectedEle) {
      staticData.selected.element = selectedEle;
      const matrix = (staticData.transform.matrix = selectedEle
        .getAttribute("transform")
        .slice(7, -1)
        .split(" ")
        .map(parseFloat));
      let x = (staticData.bbox.x = selectedEle.getAttribute("data-bboxx") * 1);
      let y = (staticData.bbox.y = selectedEle.getAttribute("data-bboxy") * 1);
      let w = (staticData.bbox.w = selectedEle.getAttribute("data-bboxw") * 1);
      let h = (staticData.bbox.h = selectedEle.getAttribute("data-bboxh") * 1);
      let handlersPos = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; // the last one is the rotate handler
      (staticData.handlersPos as any) = handlersPos.map(p =>
        pointTransform(staticData.transform.matrix, p)
      );
      staticData.action = "translate";
      this.setState({ selectedElementID: selectedEle.id });
    }

    if (target.classList.contains("line-connect-handler")) {
      staticData.action = "draw-line";

      const shape = (staticData.selected.element as any).getElementsByClassName(
        "shape"
      )[0]; // shape className is the concrete shape
      if (!shape) return;

      const bbox = shape.getBoundingClientRect();
      const candidatePoints = [
        [bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2, bbox.top], // top
        [bbox.right - CANVAS_LEFT_MARGIN, bbox.top + bbox.height / 2], // right
        [bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2, bbox.bottom], // bottom
        [bbox.left - CANVAS_LEFT_MARGIN, bbox.top + bbox.height / 2] // left
      ];

      let handlerID = parseInt(target.id.split("-")[3]);
      (staticData.drawLine.points as any) = [
        candidatePoints[handlerID], // start point pos
        candidatePoints[handlerID] // end point pos
      ]; // the moment you click the connect-line handler, a line is being drawn ...
      // ... with the same starting and end points

      const id = (staticData.drawLine.id = randomString(12)); // id is used in componentDidUpdate: save the actual line element when its DOM is created
      this.setState({
        objList: this.state.objList.push(
          fromJS({
            id: id,
            type: "polyline",
            stroke: "#424242",
            strokeWidth: 1,
            fill: "none",
            transform: "matrix(1 0 0 1 0 0)",
            points: `${candidatePoints[handlerID].join(",")} ${candidatePoints[
              handlerID
            ].join(",")}`
          })
        )
      });
    }
    // analyze conditions of target element, switch element type, render element shape.
  };

  onMouseUp = (e: any) => {
    if (!staticData.action || !staticData.dragging) {
      // dbl-click to enter text? this satisfies this "if", the result is: action/dragging both are false????
      staticData.action = "";
      staticData.dragging = false;
      return;
    } // empty action means you are clicking on empty space, false dragging means you are clicking then release, no movement
    const {
      CANVAS_LEFT_MARGIN,
      CANVAS_TOP_MARGIN,
      SHAPE_LEADING_MARGIN
    } = constants;
    let bbox;
    const matrix = staticData.transform.matrix;
    const mStr = `matrix(${matrix.join(" ")})`;
    const action = staticData.action;
    switch (action) {
      case "translate":
        (staticData.selected.element as any).setAttribute("transform", mStr);
        break;
      case "draw-line":
        const line = staticData.drawLine.element;
        if (!line) break;

        // this line's presence confirmed this is the moment when the line drawing is just finished
        bbox = (staticData.selected.element as any)
          .getElementsByClassName("shape")[0]
          .getBoundingClientRect();
        const fromRec = [
          // the 4 points go from [top, right, bottom, left]
          [
            bbox.left - CANVAS_LEFT_MARGIN + Math.round(bbox.width / 2),
            bbox.top - CANVAS_TOP_MARGIN
          ],
          [
            bbox.right - CANVAS_LEFT_MARGIN,
            bbox.top - CANVAS_TOP_MARGIN + Math.round(bbox.height / 2)
          ],
          [
            bbox.left - CANVAS_LEFT_MARGIN + Math.round(bbox.width / 2),
            bbox.bottom
          ],
          [
            bbox.left - CANVAS_LEFT_MARGIN,
            bbox.top - CANVAS_TOP_MARGIN + Math.round(bbox.height / 2)
          ]
        ]; // todo: do the rounding inside optimisePath

        let hoveredEle = staticData.drawLine.hoveredElement; // todo: what if the hoveredEle is also the currently selected element
        (hoveredEle as any).setAttribute("filter", "none");
        let path;
        let p = [e.clientX - CANVAS_LEFT_MARGIN, e.clientY - CANVAS_TOP_MARGIN];
        path = optimisePath(fromRec, [p, p, p, p], SHAPE_LEADING_MARGIN);
        (line as any)
          .getElementsByClassName("shape")[0]
          .setAttribute("points", path);
        const points = path.split(" "); // animation rect pos
        const animatePoints = points.map((v, i) => {
          const nextPointsPos = i < points.length - 1 ? points[i + 1] : "";
          const curPos = v.split(",");
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
          return fromJS({
            type: "animate_rect",
            x: curPos[0],
            y: curPos[1],
            stroke: "#424242",
            strokeWidth: 1,
            fill: "red",
            index: i,
            dis
          });
        });
        animatePoints.pop();
        this.setState({
          objList: this.state.objList.concat(animatePoints)
        });
        break;
      default:
        console.log("unknown action in mouseup");
    }
    if (
      staticData.dragging &&
      (action === "translate" || action === "rotate" || action === "scale")
    ) {
      updateHandlersPos(staticData);
    }
    staticData.dragging = false;
    staticData.action = "";
  };

  createShape = (e: any) => {
    const { objList } = this.state;
    const { FILL, STROKE } = constants;
    const matrix = [1, 0, 0, 1, randomNumber(0, 800), randomNumber(0, 480)];
    const type: string = e.target.id.split("-")[1];
    const id = randomString(12);
    const newShape = (regularShapes as any)[type];
    const fill = FILL[Math.floor(Math.random() * FILL.length)];
    const stroke = STROKE[Math.floor(Math.random() * STROKE.length)];
    const customProps = {
      id,
      fill,
      stroke,
      transform: `matrix(${matrix.join(" ")})`
    };
    Object.assign(newShape, customProps);
    this.setState({
      objList: objList.push(fromJS(newShape))
    });
  };

  onHover = (e: any) => {
    if (staticData.action !== "draw-line") return;

    const classList = e.target.classList;
    if (
      classList.contains("polyline-shape") ||
      classList.contains("curved-shape")
    ) {
      staticData.drawLine.hoveredElement = null;
      return;
    }

    if (staticData.drawLine.hoveredElement !== e.target) {
      staticData.drawLine.hoveredElement = e.target;
      (staticData.drawLine.hoveredElement as any).setAttribute(
        "filter",
        "url(#blurFilter2)"
      );
    }
  };

  onHoverOut = (e: any) => {
    //console.log(e, "onHandlerHoverOut");
  };

  render() {
    const { CANVAS_LEFT_MARGIN } = constants;
    const { objList, selectedElementID } = this.state;
    return (
      <div>
        <Panel createShape={this.createShape} />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          id="work-space"
          style={{
            position: "absolute",
            left: `${CANVAS_LEFT_MARGIN + 1}px`,
            top: "0px",
            height: "100%",
            width: "100%",
            backgroundColor: "#F5F5F5"
          }}
          version="1.1"
          baseProfile="full"
          focusable="true"
          onKeyUp={this.keyUpHandler}
          onMouseMove={this.onMouseMove}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
        >
          <BackGround />
          <rect width="100%" height="100%" fill="url(#grid)" />
          <ShapeWrap
            selectedElementID={selectedElementID}
            objList={objList}
            staticData={staticData}
            handlers={{ onHover: this.onHover, onHoverOut: this.onHoverOut }}
          />
          <g id="selector-layer">
            {selectedElementID ? (
              <ShapeHandler staticData={staticData} />
            ) : null}
          </g>
        </svg>
      </div>
    );
  }
}

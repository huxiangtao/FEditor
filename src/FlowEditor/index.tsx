import React from "react";
import { fromJS } from "immutable";
import { constants } from "./constants/index";
import WorkSpace from "./components/WorkSpace";
import Panel from "./components/Panel";
import ShapeWrap from "./components/ShapeWrap";
import {
  randomNumber,
  randomString,
  pointTransform,
  updateHandlersPos
} from "./utils";
import regularShapes from "./regularShapes";
import ShapeHandler from "./components/ShapeHandler";
import { number } from "prop-types";

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

  newItem: {
    elementID: "",
    local: true, // shape could be created locally( or remotely), in this case, make it selected.

    textID: "",
    textEle: null // todo: I forgot why do I need this
  },

  transform: {
    // todo: all coordinates and matrix should be rounded to integer, floats consume too much space.
    matrix: [1, 0, 0, 1, 0, 0],
    startX: 0,
    startY: 0,
    diagonalRad: 0, // the radian or just call it width/height ratio, used in calculating deltaX/Y of mouse movement during scaling
    rotateRad: 0, // the rotation rad after transform
    scalingFactor: 1,
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

  keyUpHandler = () => {};

  onMouseMove = (e: any) => {
    if (!staticData.action || staticData.action === "text-editing") return;

    staticData.dragging = true;
    switch (staticData.action) {
      case "translate":
        this.translate(e);
        break;
      // case "rotate":
      //   this.rotate(e);
      //   break;
      // case "scale":
      //   this.scale(e);
      //   break;
      // case "move-controlPoint":
      //   this.moveControlPoint(e);
      //   break;
      // case "draw-line":
      //   this.drawLine(e);
      //   break;
      default:
        console.log("unknown action: ", staticData.action);
    }
  };

  onMouseDown = (e: any) => {
    const {
      CANVAS_LEFT_MARGIN,
      CANVAS_TOP_MARGIN,
      ROTATE_HANDLER_MARGIN
    } = constants;
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
      staticData.transform.rotateRad = Math.atan(matrix[2] / matrix[0]);
      let x = (staticData.bbox.x = selectedEle.getAttribute("data-bboxx") * 1);
      let y = (staticData.bbox.y = selectedEle.getAttribute("data-bboxy") * 1);
      let w = (staticData.bbox.w = selectedEle.getAttribute("data-bboxw") * 1);
      let h = (staticData.bbox.h = selectedEle.getAttribute("data-bboxh") * 1);
      staticData.transform.scalingFactor = Math.sqrt(
        matrix[0] * matrix[0] + matrix[1] * matrix[1]
      );
      let handlersPos = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
        [
          x + w / 2,
          (y - ROTATE_HANDLER_MARGIN) / staticData.transform.scalingFactor
        ]
      ]; // the last one is the rotate handler
      (staticData.handlersPos as any) = handlersPos.map(p =>
        pointTransform(staticData.transform.matrix, p)
      );
      staticData.action = "translate";
      this.setState({ selectedElementID: selectedEle.id });
    } else {
      (staticData.selected.element as any) = "";
      staticData.transform.matrix = [];
      staticData.action = "";
      this.setState({ selectedElementID: "" });
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
    const matrix = staticData.transform.matrix;
    const mStr = `matrix(${matrix.join(" ")})`;
    const action = staticData.action;
    switch (action) {
      case "translate":
        (staticData.selected.element as any).setAttribute("transform", mStr);
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
          <WorkSpace />
          <rect width="100%" height="100%" fill="url(#grid)" />
          <ShapeWrap objList={objList} staticData={staticData} />
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

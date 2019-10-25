import React from "react";
import { fromJS } from "immutable";
import { constants } from "./constants/index";
import WorkSpace from "./components/workspace";
import Panel from "./components/Panel";
import ShapeWrap from "./components/ShapeWrap";
import { randomNumber, randomString } from "./utils";
import regularShapes from "./regularShapes";

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

  keyUpHandler = () => {};

  onMouseMove = () => {};

  onMouseDown = () => {
    // analyze conditions of target element, switch element type, render element shape.
  };

  onMouseUp = () => {};

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
    const { objList } = this.state;
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
            {/* {this.state.selectedElementID
              ? showHandlers(this.staticData)
              : null} */}
          </g>
        </svg>
      </div>
    );
  }
}

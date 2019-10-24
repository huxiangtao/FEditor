import React, { Component, Fragment } from "react";
import {
  CANVAS_LEFT_MARGIN,
  MARKER_ARROW_HEIGHT,
  MARKER_ARROW_WIDTH,
  SHAPE_LEADING_MARGIN,
  CANVAS_TOP_MARGIN,
  CONTROL_POINT_HANDLER_WIDTH,
  TEXT_ELE_WIDTH,
  TEXT_ELE_HEIGHT,
  FILL,
  STROKE,
  ROTATE_HANDLER_WIDTH,
  ROTATE_HANDLER_HEIGHT,
  ROTATE_HANDLER_MARGIN,
  ARROW_WIDTH,
  ARROW_HEIGHT
} from "./constants";
import { fromJS } from "immutable";
import updateTxtPos from "./utils/updateTxtPos";
import optimisePath from "./utils/optimisePath";
import updatePaths from "./utils/updatePaths";
import { composeD, decomposeD } from "./utils/curve";
import showHandlers from "./utils/showHandlers";
import {
  matrixMultiply,
  pointTransform,
  randomNumber,
  randomString
} from "./utils/common";
import regularShapes from "./RegularShapes";
import createElements from "./utils/createElements";
import updateHandlersPos from "./utils/updateHandlersPos";
import Panel from "./Panel";
const spaceOnly = /^(\s|\n|\r)*$/;
class Index extends Component {
  constructor(props) {
    super(props);
    this.staticData = {
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
    this.state = {
      shapeList: fromJS([])
    };
  }

  componentDidMount() {
    this.staticData.selector = document.getElementById("selector-layer");
  }
  componentDidUpdate = () => {
    if (this.staticData.drawLine.id) {
      // user has drawn a line
      let ele = document.getElementById(this.staticData.drawLine.id);
      if (ele) {
        this.staticData.drawLine.element = ele;
      }
    }
  };
  createShape = (e, shape) => {
    let m = [1, 0, 0, 1, randomNumber(0, 800), randomNumber(0, 480)];
    let type = e.target.id.split("-")[1];
    let newShape = regularShapes[type];
    let id = randomString(12);
    let fill = FILL[Math.floor(Math.random() * FILL.length)];
    let stroke = STROKE[Math.floor(Math.random() * STROKE.length)];
    let customProps = { id, fill, stroke, transform: `matrix(${m.join(" ")})` };
    Object.assign(newShape, customProps);

    this.setState({
      shapeList: this.state.shapeList.push(fromJS(newShape))
    });
  };
  onHover = evt => {
    // todo: what if user want to draw a line from shapeA to shapeA(the same one)
    if (this.staticData.action !== "draw-line") return;

    let classList = evt.target.classList;
    if (
      classList.contains("polyline-shape") ||
      classList.contains("curved-shape")
    ) {
      this.staticData.drawLine.hoveredElement = null;
      return;
    }

    if (this.staticData.drawLine.hoveredElement !== evt.target) {
      // WTF????
      this.staticData.drawLine.hoveredElement = evt.target;
      this.staticData.drawLine.hoveredElement.setAttribute(
        "filter",
        "url(#blurFilter2)"
      );
    }
  };
  onTextBlur = evt => {
    this.staticData.action = "";
    let txtContent = evt.target.innerText.substr(0, 50); // only grab the first 50 characters.
    if (spaceOnly.test(txtContent)) {
      // empty text? then delete the whole text element
      let shapeID = evt.target.closest(".shape-container").id;
      this.removeShape(shapeID);
    }
  };
  onCtxMenu = evt => {
    evt.preventDefault();
    let ctx = this.ctxMenu;
    ctx.style.display = "block";
    ctx.style.left = evt.clientX + "px";
    ctx.style.top = evt.clientY + "px";
    return false; // omitting this would cause standard context menu to pop up
  };
  drawLine = evt => {
    if (!this.staticData.drawLine.element) return;

    let x = evt.clientX,
      y = evt.clientY;
    this.staticData.drawLine.points[1] = [
      x - CANVAS_LEFT_MARGIN,
      y - CANVAS_TOP_MARGIN
    ];
    this.staticData.drawLine.element
      .getElementsByTagName("polyline")[0]
      .setAttribute("points", this.staticData.drawLine.points.join(" "));
  };
  onMouseDown = e => {
    const placeHolder = this.staticData.selector.getElementsByClassName(
      "place-holder"
    )[0];
    if (placeHolder) {
      // 设置虚线边框为可见
      placeHolder.setAttribute("visibility", "visible");
    }
    // 重置当前元素坐标
    this.staticData.transform.startX = e.clientX - CANVAS_LEFT_MARGIN;
    this.staticData.transform.startY = e.clientY - CANVAS_TOP_MARGIN;

    const target = e.target;
    const selectedEle = target.closest(".shape-container");

    if (
      target.classList.contains("shape") &&
      selectedEle &&
      selectedEle.id === this.state.selectedElementID
    ) {
      console.log(
        target.classList.contains("shape"),
        selectedEle,
        selectedEle.id,
        this.state.selectedElementID,
        "elliot131==="
      );
      this.staticData.action = "translate";
      return;
    } else if (target.classList.contains("line-connect-handler")) {
      this.staticData.action = "draw-line";
      let shape = this.staticData.selected.element.getElementsByClassName(
        "shape"
      )[0]; // shape className is the concrete shape
      if (!shape) return;

      let bbox = shape.getBoundingClientRect();
      let candidatePoints = [
        [bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2, bbox.top], // top
        [bbox.right - CANVAS_LEFT_MARGIN, bbox.top + bbox.height / 2], // right
        [bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2, bbox.bottom], // bottom
        [bbox.left - CANVAS_LEFT_MARGIN, bbox.top + bbox.height / 2] // left
      ];

      let handlerID = parseInt(e.target.id.split("-")[3]);
      this.staticData.drawLine.points = [
        candidatePoints[handlerID],
        candidatePoints[handlerID]
      ]; // the moment you click the connect-line handler, a line is being drawn ...
      // ... with the same starting and end points

      let id = (this.staticData.drawLine.id = randomString(12)); // id is used in componentDidUpdate: save the actual line element when its DOM is created
      this.setState({
        shapeList: this.state.shapeList.push(
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

    if (selectedEle) {
      let m = (this.staticData.transform.matrix = selectedEle
        .getAttribute("transform")
        .slice(7, -1)
        .split(" ")
        .map(parseFloat));
      // regular shape
      let x = (this.staticData.bbox.x =
        selectedEle.getAttribute("data-bboxx") * 1);
      let y = (this.staticData.bbox.y =
        selectedEle.getAttribute("data-bboxy") * 1);
      let w = (this.staticData.bbox.w =
        selectedEle.getAttribute("data-bboxw") * 1);
      let h = (this.staticData.bbox.h =
        selectedEle.getAttribute("data-bboxh") * 1);
      this.staticData.transform.scalingFactor = Math.sqrt(
        m[0] * m[0] + m[1] * m[1]
      );
      let handlersPos = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
        [
          x + w / 2,
          (y - ROTATE_HANDLER_MARGIN) / this.staticData.transform.scalingFactor
        ]
      ]; // the last one is the rotate handler
      this.staticData.transform.scaleOrigin = handlersPos.slice(0, 4); // When a shape is selected, I don't know which scale handler user would click, hence I add all 4 of them as scaleOrigin ...
      // ... when scaleHandler with idx 1 is clicked, the shape is scaled around the scaleHandler with idx 3(I call it scaleOrigin)
      this.staticData.handlersPos = handlersPos.map(p =>
        pointTransform(this.staticData.transform.matrix, p)
      );
      this.staticData.transform.rotateRad = Math.atan(m[2] / m[0]);
      this.staticData.selected.element = selectedEle;
      this.setState({
        selectedElementID: selectedEle.id
      });
    }
  };
  onMouseMove = e => {
    if (!this.staticData.action || this.staticData.action === "text-editing")
      return;

    this.staticData.dragging = true;
    switch (this.staticData.action) {
      case "translate":
        this.translate(e);
        break;
      case "rotate":
        this.rotate(e);
        break;
      case "scale":
        this.scale(e);
        break;
      case "move-controlPoint":
        this.moveControlPoint(e);
        break;
      case "draw-line":
        this.drawLine(e);
        break;
      default:
        console.log("unknown action: ", this.staticData.action);
    }
  };
  onMouseUp = e => {
    let bbox;
    let m = this.staticData.transform.matrix;
    let mStr = `matrix(${m.join(" ")})`;
    this.staticData.selected.element.setAttribute("transform", mStr);
    let action = this.staticData.action;
    // not all cases need to call updatePaths.
    if (
      this.staticData.dragging &&
      (action === "translate" || action === "rotate" || action === "scale")
    ) {
      updateHandlersPos(this.staticData);
      if (this.state.selectedElementID) {
        // update current element's all polyline paths.
        let lines = this.staticData.attached[this.state.selectedElementID]
          .lines;
        if (lines.size > 0) {
          // polylines could be updated locally when associated shape get transformed, but server also need to know the polyline changes(to be saved into mongoDB)
          // thus, we have to call socket.emit to notify the change
          updatePaths(this.staticData.selected.element, lines);
        }

        let textID = this.staticData.attached[this.state.selectedElementID]
          .text;
        if (textID) {
          updateTxtPos(textID, this.state.selectedElementID);
        }
      }
    }

    if (this.staticData.dragging && action === "draw-line") {
      let line = this.staticData.drawLine.element;
      if (!line) return;

      // this line's presence confirmed this is the moment when the line drawing is just finished
      bbox = this.staticData.selected.element
        .getElementsByClassName("shape")[0]
        .getBoundingClientRect();
      let fromRec = [
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

      let hoveredEle = this.staticData.drawLine.hoveredElement; // todo: what if the hoveredEle is also the currently selected element
      let path;
      if (hoveredEle) {
        // users draw a line between 2 shapes, the hoveredShape is the target
        let bbox2 = hoveredEle.getBoundingClientRect();
        let toRect = [
          [
            bbox2.left - CANVAS_LEFT_MARGIN + Math.round(bbox2.width / 2),
            bbox2.top - CANVAS_TOP_MARGIN
          ],
          [
            bbox2.right - CANVAS_LEFT_MARGIN,
            bbox2.top - CANVAS_TOP_MARGIN + Math.round(bbox2.height / 2)
          ],
          [
            bbox2.left - CANVAS_LEFT_MARGIN + Math.round(bbox2.width / 2),
            bbox2.bottom
          ],
          [
            bbox2.left - CANVAS_LEFT_MARGIN,
            bbox2.top - CANVAS_TOP_MARGIN + Math.round(bbox2.height / 2)
          ]
        ];
        hoveredEle.setAttribute("filter", "none");
        let hoveredEleID = hoveredEle.closest(".shape-container").id;
        path = optimisePath(fromRec, toRect, SHAPE_LEADING_MARGIN);
        line.getElementsByClassName("shape")[0].setAttribute("points", path);
        line
          .getElementsByClassName("shape-proxy")[0]
          .setAttribute("points", path);
        line
          .getElementsByClassName("shape")[0]
          .setAttribute("data-shape2", hoveredEleID);

        this.staticData.attached[
          hoveredEle.closest(".shape-container").id
        ].lines.add(this.staticData.drawLine.id);
      } else {
        // users draw a line to the empty space, no targeting shape to link
        let p = [e.clientX - CANVAS_LEFT_MARGIN, e.clientY - CANVAS_TOP_MARGIN];
        path = optimisePath(fromRec, [p, p, p, p], SHAPE_LEADING_MARGIN);
        line.getElementsByClassName("shape")[0].setAttribute("points", path);
        line
          .getElementsByClassName("shape-proxy")[0]
          .setAttribute("points", path);
      }

      line
        .getElementsByClassName("shape")[0]
        .setAttribute("data-shape1", this.state.selectedElementID);
      this.staticData.attached[this.state.selectedElementID].lines.add(
        this.staticData.drawLine.id
      );

      this.staticData.drawLine.hoveredElement = null;
      this.staticData.drawLine.id = "";
      this.staticData.drawLine.points = [];
      this.staticData.drawLine.element = null;
    }

    if (!this.staticData.action || !this.staticData.dragging) {
      // dbl-click to enter text? this satisfies this "if", the result is: action/dragging both are false????
      this.staticData.action = "";
      this.staticData.dragging = false;
      return;
    }
    this.staticData.action = ""; // empty action means you are clicking on empty space, false dragging means you are clicking then release, no movement
  };

  translate = e => {
    if (
      this.staticData.selected.element.getElementsByClassName("polyline-shape")
        .length > 0
    )
      return; // polylines are not allowed to be translated by moving handlers in this implt.

    let x = e.clientX - CANVAS_LEFT_MARGIN,
      y = e.clientY - CANVAS_TOP_MARGIN;
    let deltaX = x - this.staticData.transform.startX;
    let deltaY = y - this.staticData.transform.startY;
    this.staticData.transform.startX = x;
    this.staticData.transform.startY = y;
    this.staticData.transform.matrix[4] += deltaX;
    this.staticData.transform.matrix[5] += deltaY;

    this.staticData.handlersPos = this.staticData.handlersPos.map(p => [
      (p[0] += deltaX),
      (p[1] += deltaY)
    ]);

    let placeholder = this.staticData.selector.getElementsByTagName(
      "polygon"
    )[0]; // place-holder is a <polygon >
    placeholder.setAttribute(
      "points",
      this.staticData.handlersPos.slice(0, 4).join(" ")
    ); // 4 scale handlers, 1 rotate handler, for place-holder polygon, only the first 4 is needed
  };

  render() {
    return (
      <Fragment>
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
          tabIndex="0"
          // onKeyUp={this.keyUpHandler}
          // onDoubleClick={this.onDblClick}
          onMouseMove={this.onMouseMove}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
        >
          <defs>
            <pattern
              id="small-grid"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 8 0 L 0 0 0 8"
                fill="none"
                stroke="#BDBDBD"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="medium-grid"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 16 0 L 0 0 0 16"
                fill="none"
                stroke="#BDBDBD"
                strokeWidth="0.5"
              />
            </pattern>

            <pattern
              id="grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect width="80" height="80" fill="url(#medium-grid)" />
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="#BDBDBD"
                strokeWidth="1"
              />
            </pattern>

            <filter id="blurFilter2" y="-10" height="40" x="-10" width="150">
              <feOffset in="SourceAlpha" dx="3" dy="3" result="offset2" />
              <feGaussianBlur in="offset2" stdDeviation="3" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <marker
              xmlns="http://www.w3.org/2000/svg"
              id="marker-arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth={MARKER_ARROW_WIDTH}
              markerHeight={MARKER_ARROW_HEIGHT}
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>

            <linearGradient
              id="poop-gradient"
              x1="-492.7"
              y1="3.63"
              x2="-490.65"
              y2="4.59"
              gradientTransform="translate(10519.1 -59.42) scale(21.33)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          <g className="all-shape-wrapper">
            {createElements(this.state, this.staticData, {
              onHover: this.onHover,
              onHoverOut: this.onHoverOut,
              onTextBlur: this.onTextBlur,
              onCtxMenu: this.onCtxMenu
            })}
          </g>
          <g id="selector-layer">
            {this.state.selectedElementID
              ? showHandlers(this.staticData)
              : null}
          </g>
        </svg>
      </Fragment>
    );
  }
}

export default Index;

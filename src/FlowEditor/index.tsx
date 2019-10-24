import React from "react";
import { fromJS } from "immutable";
import { constants } from "./constants/index";
import WorkSpace from "./components/workspace";
import Panel from "./components/Panel";
import ShapeWrapper from "./components/ShapeWrapper";

interface FlowEditorState {
  selectedElementID: string;
  objList: string[];
}

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
    console.log(e, "elliot131---===");
  };

  render() {
    const { CANVAS_LEFT_MARGIN } = constants;
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
          <ShapeWrapper />
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

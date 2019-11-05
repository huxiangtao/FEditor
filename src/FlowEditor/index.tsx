import React from "react";
import { fromJS, List } from "immutable";
import BackGround from "./components/BackGround";
import Panel from "./components/Panel";
import "antd/dist/antd.css";
import ShapeWrap from "./components/ShapeWrap";
import _ from "lodash";
import {
  randomString,
  updateHandlersPos,
  optimisePath,
  updatePaths
} from "./utils";
import { updateObjListLines } from "./reducer";
import regularShapes from "./regularShapes";
import ShapeHandler from "./components/ShapeHandler";
import "./style.css";
import Store from "./store";
import RunButton from "./components/runButton";
import TestChild from "./components/TestChild";
import CreateApp from "./components/createApp";

interface FlowEditorState {
  selectedElementID: string;
  objList: List<any> | undefined;
  curMouseButton: number | undefined;
  modalVisible: boolean;
  appList: any[];
  transDataPointMap: Map<string, boolean>;
  taskStateMap: Map<string, string>;
}

export default class FlowEditor extends React.Component<any, FlowEditorState> {
  staticData: Store;

  constructor(props: any) {
    super(props);
    this.staticData = new Store();
  }
  state = {
    selectedElementID: "",
    objList: fromJS([]),
    curMouseButton: undefined,
    modalVisible: false,
    appList: [
      { id: "app1", type: "task", name: "app1" },
      { id: "app2", type: "logic", name: "判断" },
      { id: "app3", type: "human", name: "人工" },
      { id: "app4", type: "pause", name: "暂停" }
    ],
    transDataPointMap: fromJS({}),
    taskStateMap: fromJS({})
  };

  componentDidMount = () => {
    this.staticData.selector = document.getElementById("selector-layer");
  };

  componentDidUpdate = () => {
    const id = _.get(this.staticData, "drawLine.id");
    if (id) {
      // user has drawn a line
      const ele = document.getElementById(id);
      if (ele) {
        this.staticData.updateDrawLineElement(ele);
      }
    }
  };

  translate = (e: any) => {
    const matrix = _.get(this.staticData, "transform.matrix");
    const handlersPos = _.get(this.staticData, "handlersPos");
    const deltaPos = this.staticData.countDeltaPos(e.clientX, e.clientY);
    this.staticData.updateStartCoordinate(e.clientX, e.clientY);
    this.staticData.updateMatrix(
      _.merge(matrix, [
        ,
        ,
        ,
        ,
        deltaPos[0] + matrix[4],
        deltaPos[1] + matrix[5]
      ])
    );
    const nextHandlerPos = this.staticData.updateHandlerPos(
      undefined,
      handlersPos.map((p: any) => [
        ((p as number[])[0] += deltaPos[0]),
        ((p as number[])[1] += deltaPos[1])
      ])
    );
    const placeholder = (this.staticData.selector as any).getElementsByTagName(
      "polygon"
    )[0]; // place-holder is a <polygon >
    placeholder && placeholder.setAttribute("points", nextHandlerPos.join(" "));
  };

  drawLine = (e: any) => {
    if (!this.staticData.drawLine.element) return;
    this.staticData.updateDrawLineTargetPointsPos(e.clientX, e.clientY);
    (this.staticData.drawLine.element as any)
      .getElementsByTagName("polyline")[0]
      .setAttribute("points", this.staticData.drawLine.points.join(" "));
  };

  keyUpHandler = (e: any) => {
    const { selectedElementID } = this.state;
    if (!selectedElementID || (e.key !== "Backspace" && e.key !== "Delete"))
      return;
    this.removeShape(selectedElementID);
  };

  onMouseMove = (e: any) => {
    const { action } = this.staticData;
    if (!action) return;
    this.staticData.dragging = true;
    switch (action) {
      case "translate":
        this.translate(e);
        break;
      case "draw-line":
        this.drawLine(e);
        break;
      default:
        console.log("unknown action: ", this.staticData.action);
    }
  };

  onMouseDown = (e: any) => {
    const { selectedElementID } = this.state;
    const target = e.target;
    const selectedEle = target.closest(".shape-container");
    this.staticData.updateStartCoordinate(e.clientX, e.clientY);
    this.setCurMouseButton(e.button);
    if (
      selectedEle &&
      target.classList.contains("shape") &&
      selectedEle.id === selectedElementID
    ) {
      this.staticData.updateActionType("translate");
      return;
    }
    if (selectedEle) {
      this.staticData.updateSelected(selectedEle);
      this.staticData.updateMatrix(
        selectedEle
          .getAttribute("transform")
          .slice(7, -1)
          .split(" ")
          .map(parseFloat)
      );
      this.staticData.updateHandlerPos(selectedEle);
      this.staticData.updateActionType("translate");
      this.setState({ selectedElementID: selectedEle.id });
      return;
    }

    if (target.classList.contains("line-connect-handler")) {
      this.staticData.updateActionType("draw-line");
      const handlerID = parseInt(target.id.split("-")[3]);
      // the moment you click the connect-line handler, a line is being drawn
      // with the same starting and end points
      const startPointPos = this.staticData.getConnectStartPointPos(handlerID);
      const id = (this.staticData.drawLine.id = randomString(12)); // id is used in componentDidUpdate: save the actual line element when its DOM is created
      this.setState({
        objList: this.state.objList.push(
          fromJS({
            id: id,
            type: "polyline",
            stroke: "#424242",
            strokeWidth: 1,
            fill: "none",
            shape1: this.state.selectedElementID,
            shape2: "",
            transform: "matrix(1 0 0 1 0 0)",
            points: `${startPointPos.join(",")} ${startPointPos.join(",")}`
          })
        )
      });
    } else {
      this.staticData.updateSelected(null);
      this.staticData.updateMatrix();
      this.staticData.updateActionType();
      this.setState({ selectedElementID: "" });
    }
  };

  onMouseUp = () => {
    const {
      action,
      dragging,
      selected,
      transform: { matrix }
    } = this.staticData;
    if (!action || !dragging) {
      return;
    }
    const { selectedElementID } = this.state;
    switch (action) {
      case "translate":
        const mStr = `matrix(${matrix.join(" ")})`;
        (selected as any).setAttribute("transform", mStr);
        break;
      case "draw-line":
        // current draw line element
        const line = _.get(this.staticData, "drawLine.element");
        if (!line) break;
        const lineId = _.get(this.staticData, "drawLine.id");
        const { objList } = this.state;
        const fromRec = this.staticData.getFromRec();
        const hoveredEle = _.get(this.staticData, "drawLine.hoveredElement");
        if (hoveredEle) {
          const hoveredEleID = (hoveredEle as any).closest(".shape-container")
            .id;
          const validateResult = this.staticData.validate(
            selectedElementID,
            hoveredEleID
          );
          if (!validateResult) {
            this.removeShape(lineId);
            this.staticData.resetDrawLineId();
          } else {
            const toRect = this.staticData.getToRec(hoveredEle);
            (hoveredEle as any).setAttribute("filter", "none");
            const path = optimisePath(fromRec, toRect);
            this.setState({
              objList: updateObjListLines(objList, lineId, path)
            });
            (line as any)
              .getElementsByClassName("shape")[0]
              .setAttribute("data-shape2", hoveredEleID); // NOTE: set target shape of the line
            this.staticData.addLineMap(
              (hoveredEle as any).closest(".shape-container").id,
              lineId
            ); // NOTE: add line obj to target shape lines Set
            this.staticData.createLine(lineId, selectedElementID, hoveredEleID);
            this.staticData.linkNode(selectedElementID, hoveredEleID, lineId);
          }
        } else {
          // NOTE: remove no target shape line
          this.removeShape(lineId);
        }
        break;
      default:
        console.log("unknown action in mouseup");
    }
    // update element lines position
    if (dragging && action === "translate") {
      updateHandlersPos(this.staticData);
      if (selectedElementID) {
        const lines = (this.staticData as any).attached[selectedElementID]
          .lines;
        if (lines.size > 0) {
          const newPathMap = updatePaths(selected, lines);
          const { objList } = this.state;
          // update ObjList List
          this.setState({
            objList: updateObjListLines(objList, lines, newPathMap)
          });
        }
      }
    }
    this.staticData.dragging = false;
    this.staticData.resetActionType();
  };

  createShape = (
    type: string,
    id: string,
    title: string,
    position: number[]
  ) => {
    const { objList } = this.state;
    const matrix = [1, 0, 0, 1, position[0], position[1]];
    const newShape = (regularShapes as any)[type];
    const shapeId = `${id}_${randomString(12)}`;
    const customProps = {
      id: shapeId,
      transform: `matrix(${matrix.join(" ")})`
    };
    Object.assign(newShape, customProps);
    // set new node int NodeMap
    if (type === "logic") {
      this.staticData.createNode(shapeId, type, {
        title: title,
        inputsNum: 1,
        outputsNum: 2
      });
    } else {
      this.staticData.createNode(shapeId, type);
    }
    this.setState({
      objList: objList.push(fromJS(newShape))
    });
  };

  onHover = (e: any) => {
    if (this.staticData.action !== "draw-line") return;
    const classList = e.target.classList;
    if (
      classList.contains("polyline-shape") ||
      classList.contains("curved-shape")
    ) {
      this.staticData.drawLine.hoveredElement = null;
      return;
    }
    if (!_.isEqual(this.staticData.drawLine.hoveredElement, e.target)) {
      this.staticData.drawLine.hoveredElement = e.target;
      const hoveredEleID = (e.target as any).closest(".shape-container").id;
      if (hoveredEleID !== this.state.selectedElementID) {
        (this.staticData.drawLine.hoveredElement as any).setAttribute(
          "filter",
          "url(#blurFilter2)"
        );
      }
    }
  };

  removeShape = (shapeID: any) => {
    const { objList } = this.state;
    const shapeIdx = objList.findIndex((s: any) => s.get("id") === shapeID);
    //const lines = (this.staticData as any).attached[shapeID].lines; remove relation lines
    if (shapeIdx > -1) {
      this.setState({
        objList: objList.delete(shapeIdx),
        selectedElementID: ""
      });
    }
  };

  onContextMenu = (e: any) => {
    // TODO:huxt add context menu
    this.setCurMouseButton(e.button);
  };

  onDragOver = (e: any) => {
    e.preventDefault();
  };

  setCurMouseButton = (n: number) => {
    this.setState({ curMouseButton: n });
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

  showAppForm = () => {
    this.setState({
      modalVisible: true
    });
  };

  createApp = (app: any) => {
    const { appList } = this.state;
    this.setState({
      appList: [...appList, app]
    });
  };

  broadCastLineState = (lineId: string, state: boolean) => {
    //广播完成任务的node id
    const { transDataPointMap } = this.state;
    this.setState({
      transDataPointMap: transDataPointMap.set(lineId, state)
    });
  };

  broadCastTaskState = (nodeId: string, state: string) => {
    const { taskStateMap } = this.state;
    this.setState({
      taskStateMap: taskStateMap.set(nodeId, state)
    });
  };

  render() {
    const {
      objList,
      selectedElementID,
      curMouseButton,
      appList,
      transDataPointMap,
      taskStateMap
    } = this.state;
    objList.forEach((o: any) => {
      if (!o) {
        return;
      }
      const objID = o.get("id");
      // NOTE: only shape has this struct
      if (
        !(this.staticData as any).attached[objID] &&
        !_.includes(["polyline", "animate_circle"], o.get("type"))
      ) {
        this.staticData.addAttached(objID, {
          lines: new Set(),
          text: "",
          type: o.get("type")
        });
      }
    });
    return (
      <div>
        <Panel
          createShape={this.createShape}
          showAppForm={this.showAppForm}
          appList={appList}
        />
        <div id="work-space" tabIndex={0} onKeyUpCapture={this.keyUpHandler}>
          <svg
            id="work-space-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            baseProfile="full"
            onDragOver={this.onDragOver}
            onMouseMove={this.onMouseMove}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
          >
            <BackGround />
            <ShapeWrap
              selectedElementID={selectedElementID}
              objList={objList}
              transDataPointMap={transDataPointMap}
              taskStateMap={taskStateMap}
              staticData={this.staticData}
              handlers={{
                onHover: this.onHover,
                onContextMenu: this.onContextMenu,
                broadCastTaskState: this.broadCastTaskState,
                broadCastLineState: this.broadCastLineState
              }}
            />
            <g id="selector-layer">
              {selectedElementID && curMouseButton === 0 ? (
                <ShapeHandler staticData={this.staticData} />
              ) : null}
            </g>
          </svg>
        </div>
        <RunButton
          staticData={this.staticData}
          taskStateMap={taskStateMap}
          broadCastTaskState={this.broadCastTaskState}
          broadCastLineState={this.broadCastLineState}
        />
        <CreateApp
          modalVisible={this.state.modalVisible}
          handleCancel={this.handleCancel}
          createApp={this.createApp}
        />
        {/* <TestChild /> */}
      </div>
    );
  }
}

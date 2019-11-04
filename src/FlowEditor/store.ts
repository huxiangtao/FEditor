import {
  randomString,
  pointTransform,
} from "./utils";
import { fromJS, Map } from "immutable";
import _ from "lodash";
import TreeNode from './TreeNode';
import Line from './Line';
import { constants } from "./constants/index";
interface AttachedItem {
  lines: Set<any>
  text: string
  type: string
}
interface Attached {
  [ id: string ]: AttachedItem
}
export default class Store {
  constructor () {
    this.attached = {};
    this.NodeMap = fromJS( {} )
    this.LineMap = fromJS( {} )
  }

  selected: any

  attached: Attached

  Node = {};

  NodeMap: Map<string, TreeNode>

  LineMap: Map<string, Line>

  selector: any

  dragging = false

  action = ""

  drawLine = {
    id: "", // the lineID of the current line that user is drawing
    element: null, // svg polyline element that user is drawing
    points: [], // array of 2 points(value of 'points' attribute after joining). When drawing, there are only 2 points(start/end) for simplicity sake.
    hoveredElement: null
  }

  transform = {
    // todo: all coordinates and matrix should be rounded to integer, floats consume too much space.
    matrix: [ 1, 0, 0, 1, 0, 0 ],
    startX: 0,
    startY: 0,
    cx: 0,
    cy: 0 // center point of current shape after transform
  }
  handlersPos = [
    [],
    [],
    [],
    [],
  ]
  bbox = { x: 0, y: 0, w: 0, h: 0 }

  createNode( id: string ) {
    this.NodeMap = this.NodeMap.set( id, new TreeNode( id, fromJS( {} ), fromJS( {} ), fromJS( {} ), fromJS( {} ) ) );
  }

  createLine( id: string, frId: string, toId: string ) {
    const frObj = this.NodeMap.get( frId );
    const toObj = this.NodeMap.get( toId );
    this.LineMap = this.LineMap.set( id, new Line( id, frObj as TreeNode, toObj as TreeNode ) )
  }

  // TODO:huxt get root node of the flow
  getRootNode() {
    return this.NodeMap.size > 0 ? this.NodeMap.first() : null;
  }

  linkNode( fromId: string, toId: string, lineId: string ) {
    const fromInstance = this.NodeMap.get( fromId )
    const toInstance = this.NodeMap.get( toId )
    const nextNodes = ( fromInstance as TreeNode ).nextNodes;
    const preNodes = ( toInstance as TreeNode ).preNodes;
    const nextLines = ( fromInstance as TreeNode ).nextLines;
    const preLines = ( toInstance as TreeNode ).preLines;
    const lineInstance = this.LineMap.get( lineId );
    // linkNode
    ( fromInstance as TreeNode ).nextNodes = nextNodes.set( toId, toInstance as TreeNode );
    ( toInstance as TreeNode ).preNodes = preNodes.set( fromId, fromInstance as TreeNode );
    // linkLine
    ( fromInstance as TreeNode ).nextLines = nextLines.set( lineId, lineInstance as Line );
    ( toInstance as TreeNode ).preLines = preLines.set( lineId, lineInstance as Line );
  }

  getNode( id: string ) {
    return this.NodeMap.get( id );
  }

  updateSelected( select: any ) {
    if ( select ) {
      // NOTE: if set new selected element
      // should update the drawline id of this selected element

      this.selected = select;
      this.drawLine.id = randomString( 12 );
      // also should update handlerPos
      this.updateHandlerPos( select );
    }

  }

  updateStartCoordinate( x: number, y: number ) {
    const { CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN } = constants;
    this.transform.startX = x - CANVAS_LEFT_MARGIN;
    this.transform.startY = y - CANVAS_TOP_MARGIN;
  }

  updateMatrix( arr: number[] = [ 1, 0, 0, 1, 0, 0 ] ) {
    this.transform.matrix = arr;
  }

  updateHandlerPos( select: any, posArr?: number[][] ): number[][] {
    if ( posArr ) {
      ( this.handlersPos as any ) = posArr;
    } else {
      const x = this.bbox.x = select.getAttribute( "data-bboxx" ) * 1;
      const y = this.bbox.y = select.getAttribute( "data-bboxy" ) * 1;
      const w = this.bbox.w = select.getAttribute( "data-bboxw" ) * 1;
      const h = this.bbox.h = select.getAttribute( "data-bboxh" ) * 1;
      const handlersPos = [ [ x, y ], [ x + w, y ], [ x + w, y + h ], [ x, y + h ] ];
      ( this.handlersPos as any ) = handlersPos.map( p =>
        pointTransform( this.transform.matrix, p ) );
    }
    return this.handlersPos;
  }

  updateActionType( action: string = "" ) {
    this.action = action;
  }

  resetActionType() {
    this.action = "";
  }

  getConnectStartPointPos( handlerID: number ): number[] {
    const { CANVAS_LEFT_MARGIN } = constants;
    if ( this.selected ) {
      const bbox = this.getShapeBoundingClientRect();
      const candidatePoints = [
        [ bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2, bbox.top ], // top
        [ bbox.right - CANVAS_LEFT_MARGIN, bbox.top + bbox.height / 2 ], // right
        [ bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2, bbox.bottom ], // bottom
        [ bbox.left - CANVAS_LEFT_MARGIN, bbox.top + bbox.height / 2 ] // left
      ];
      ( this.drawLine.points as any ) = [ candidatePoints[ handlerID ], // start point pos
      candidatePoints[ handlerID ] ]
      return candidatePoints[ handlerID ]
    } else {
      return []
    }
  }

  private getShapeBoundingClientRect(): any {
    if ( this.selected ) {
      const shape = this.selected.getElementsByClassName( 'shape' )[ 0 ]
      return shape.getBoundingClientRect();
    }
    return {}
  }

  getFromRec(): number[][] {
    const {
      CANVAS_LEFT_MARGIN,
      CANVAS_TOP_MARGIN,
    } = constants;
    const bbox = this.getShapeBoundingClientRect();
    return [
      // the 4 points go from [top, right, bottom, left]
      [
        bbox.left - CANVAS_LEFT_MARGIN + Math.round( bbox.width / 2 ),
        bbox.top - CANVAS_TOP_MARGIN
      ],
      [
        bbox.right - CANVAS_LEFT_MARGIN,
        bbox.top - CANVAS_TOP_MARGIN + Math.round( bbox.height / 2 )
      ],
      [
        bbox.left - CANVAS_LEFT_MARGIN + Math.round( bbox.width / 2 ),
        bbox.bottom
      ],
      [
        bbox.left - CANVAS_LEFT_MARGIN,
        bbox.top - CANVAS_TOP_MARGIN + Math.round( bbox.height / 2 )
      ]
    ];
  }

  getToRec( hoveredEle: any ): number[][] {
    const {
      CANVAS_LEFT_MARGIN,
      CANVAS_TOP_MARGIN,
    } = constants;
    const bbox2 = ( hoveredEle as any ).getBoundingClientRect();
    return [
      [
        bbox2.left - CANVAS_LEFT_MARGIN + Math.round( bbox2.width / 2 ),
        bbox2.top - CANVAS_TOP_MARGIN
      ],
      [
        bbox2.right - CANVAS_LEFT_MARGIN,
        bbox2.top - CANVAS_TOP_MARGIN + Math.round( bbox2.height / 2 )
      ],
      [
        bbox2.left - CANVAS_LEFT_MARGIN + Math.round( bbox2.width / 2 ),
        bbox2.bottom
      ],
      [
        bbox2.left - CANVAS_LEFT_MARGIN,
        bbox2.top - CANVAS_TOP_MARGIN + Math.round( bbox2.height / 2 )
      ]
    ];
  }

  updateDrawLineElement( ele: any ) {
    this.drawLine.element = ele;
  }

  updateDrawLineTargetPointsPos( x: number, y: number ) {
    const { CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN } = constants;
    ( this.drawLine.points[ 1 ] as number[] ) = [ x - CANVAS_LEFT_MARGIN, y - CANVAS_TOP_MARGIN ]
  }

  updateHoverElement( ele: any ) {
    this.drawLine.hoveredElement = ele;
  }

  resetDrawLineId() {
    this.drawLine.id = ""
  }

  addAttached( id: string, val: any ) {
    ( this.attached as any )[ id ] = val;
  }

  addLineMap( eleId: string, lineId: string ) {
    ( this.attached as any )[ eleId ].lines.add( lineId );
  }

  countDeltaPos( clientX: number, clientY: number ): number[] {
    const { CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN } = constants;
    const posArr = [];
    const x = clientX - CANVAS_LEFT_MARGIN,
      y = clientY - CANVAS_TOP_MARGIN;
    const startX = _.get( this, "transform.startX" ),
      startY = _.get( this, "transform.startY" );
    posArr[ 0 ] = x - startX;
    posArr[ 1 ] = y - startY;
    return posArr;
  }
}
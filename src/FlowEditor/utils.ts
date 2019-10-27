import { constants } from "./constants/index";
import { fromJS } from "immutable";
export function randomNumber( min: number, max: number ): number {
  min = Math.ceil( min );
  max = Math.floor( max );
  return Math.floor( Math.random() * ( max - min ) ) + min; //The maximum is exclusive and the minimum is inclusive
}

function dec2hex( dec: number ) {
  return ( "0" + dec.toString( 16 ) ).substr( -2 );
}

function makeStr( len: number ) {
  len = len || 12; // 12 characters long by default
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for ( let i = 0; i < len; i++ ) {
    text += possible.charAt( Math.floor( Math.random() * possible.length ) );
  }
  return text;
}

export function randomString( len: number ) {
  let arr = new Uint8Array( ( len || 12 ) / 2 ); // 12 characters long by default
  if ( window.crypto ) {
    window.crypto.getRandomValues( arr );
    return Array.from( arr, dec2hex ).join( "" );
  } else {
    return makeStr( len );
  }
}

export function pointTransform( m: number[], p: number[] ) {
  // m = [a,b,c,d,e,f], p = [x,y]
  return [ m[ 0 ] * p[ 0 ] + m[ 2 ] * p[ 1 ] + m[ 4 ], m[ 1 ] * p[ 0 ] + m[ 3 ] * p[ 1 ] + m[ 5 ] ];
}

export function lineConnHandlers( bbox: any ) {
  const { CANVAS_LEFT_MARGIN, ARROW_WIDTH, ARROW_HEIGHT } = constants;
  return [
    `M ${ bbox.left -
    CANVAS_LEFT_MARGIN +
    bbox.width / 2 -
    ARROW_WIDTH / 2 }, ${ bbox.top - 35 } h ${ ARROW_WIDTH } L ${ bbox.left -
    CANVAS_LEFT_MARGIN +
    bbox.width / 2 }, ${ bbox.top - 35 - ARROW_HEIGHT } z`,
    `M ${ bbox.right - CANVAS_LEFT_MARGIN + 35 }, ${ bbox.top +
    bbox.height / 2 -
    ARROW_WIDTH / 2 } v ${ ARROW_WIDTH } L ${ bbox.right -
    CANVAS_LEFT_MARGIN +
    35 +
    ARROW_HEIGHT }, ${ bbox.top + bbox.height / 2 } z`,
    `M ${ bbox.left -
    CANVAS_LEFT_MARGIN +
    bbox.width / 2 -
    ARROW_WIDTH / 2 }, ${ bbox.bottom + 35 } h ${ ARROW_WIDTH } L ${ bbox.left -
    CANVAS_LEFT_MARGIN +
    bbox.width / 2 }, ${ bbox.bottom + 35 + ARROW_HEIGHT } z`,
    `M ${ bbox.left - CANVAS_LEFT_MARGIN - 35 }, ${ bbox.top +
    bbox.height / 2 -
    ARROW_WIDTH / 2 } v ${ ARROW_WIDTH } L ${ bbox.left -
    CANVAS_LEFT_MARGIN -
    35 -
    ARROW_HEIGHT }, ${ bbox.top + bbox.height / 2 } z`
  ];
}

export function updateHandlersPos( staticData: any ) {
  const lineConnector = lineConnHandlers(
    staticData.selected.element.getBoundingClientRect()
  );
  Array.from( staticData.selector.getElementsByClassName( "handler" ) ).forEach(
    ( h: any, idx ) => {
      h.setAttribute( "d", lineConnector[ idx ] );
    }
  );
}

function init( rect: any ) { // rect is a array of 4 points, return an initialized object
  return [
    {
      point: [ rect[ 0 ][ 0 ], rect[ 0 ][ 1 ] ],
      orient: 'horizontal',
      position: 'top', fromDirection: ''
    },
    {
      point: [ rect[ 1 ][ 0 ], rect[ 1 ][ 1 ] ],
      position: 'right',
      orient: 'vertical', fromDirection: ''
    },
    {
      point: [ rect[ 2 ][ 0 ], rect[ 2 ][ 1 ] ],
      position: 'bottom',
      orient: 'horizontal', fromDirection: ''
    },
    {
      point: [ rect[ 3 ][ 0 ], rect[ 3 ][ 1 ] ],
      position: 'left',
      orient: 'vertical', fromDirection: ''
    },
  ];
}

// edge case: fromPoint and toPoint are too close, draw a straight line between them, no need to turn
// edge cases: 第一步就和目标点垂直, 且可以直连. 走一步就可以直连(此时会有多个option, 但其他option非最佳), 垂直/水平 距离很接近, 可能差1个像素, 1/2个像素round后正好可以走.
// todo: if the xDistance or yDistance is less than leading shape margin(35px), draw a straight line between them, no need to optimise.
// todo: user computer is gonna crash if there are some bugs in this algorithm. please inspect the code very carefully, avoid any edge cases.
function walk( from: any, to: any, breadcrumb: any ) {
  if ( ( from.point[ 0 ] === to.point[ 0 ] && to.orient === 'horizontal' ) // X is the same, just move Y, and we are done
    || ( from.point[ 1 ] === to.point[ 1 ] && to.orient === 'vertical' ) ) { // Y is the same, just move X, and we are done
    breadcrumb.push( [ to.point[ 0 ], to.point[ 1 ] ] );
    return
  }

  let xDistance = Math.abs( from.point[ 0 ] - to.point[ 0 ] ),
    yDistance = Math.abs( from.point[ 1 ] - to.point[ 1 ] );

  let directions = {
    'goTop': [ 0, - yDistance ],
    'goRight': [ xDistance, 0 ],
    'goBottom': [ 0, yDistance ],
    'goLeft': [ -xDistance, 0 ]
  };
  // try to move at 4 directions(up/right/bottom/left, and figure out which one could get closer to the end point)
  for ( let dir in directions ) {
    if ( from.fromDirection === 'top' && dir === 'goBottom' ) {
      continue // if the last step is coming from top, the current move shouldn't be moving toward bottom. Otherwise, why couldn't we move longer in the last step. But there is exception
    } else if ( from.fromDirection === 'right' && dir === 'goLeft' ) {
      continue
    } else if ( from.fromDirection === 'bottom' && dir === 'goTop' ) {
      continue
    } else if ( from.fromDirection === 'left' && dir === 'goRight' ) {
      continue
    }

    if ( from.point[ 0 ] + ( directions as any )[ dir ][ 0 ] === to.point[ 0 ] ) {
      from.fromDirection = from.point[ 0 ] + ( directions as any )[ dir ][ 0 ] > from.point[ 0 ] ? 'left' : 'right'; // x is growing(moving from left), shrinking(moving from right)
      if ( to.orient === 'horizontal' ) { // bingo, we are one more step to the target point by moving x
        from.point[ 0 ] += ( directions as any )[ dir ][ 0 ];
      } else { // go halfway, then let the next move make the turn
        from.point[ 0 ] += Math.round( ( directions as any )[ dir ][ 0 ] / 2 );
      }
      breadcrumb.push( [ from.point[ 0 ], from.point[ 1 ] ] );
      walk( from, to, breadcrumb );
      break;

    } else if ( from.point[ 1 ] + ( directions as any )[ dir ][ 1 ] === to.point[ 1 ] ) {
      from.fromDirection = from.point[ 1 ] + ( directions as any )[ dir ][ 1 ] > from.point[ 1 ] ? 'top' : 'bottom'; // y is growing(moving from top), shrinking(moving from bottom)
      if ( to.orient === 'vertical' ) { // bingo, we are one more step to the target point by moving y
        from.point[ 1 ] += ( directions as any )[ dir ][ 1 ];
      } else {
        from.point[ 1 ] += Math.round( ( directions as any )[ dir ][ 1 ] / 2 );
      }
      breadcrumb.push( [ from.point[ 0 ], from.point[ 1 ] ] );
      walk( from, to, breadcrumb );
      break;
    }
  }
}

export function optimisePath( rectA: any, rectB: any, leadingMargin: any ) { // both are arrays of 4 points(top, right, bottom, left). return value is a path string passed as d attribute value of <polyline> tag
  // 2 lines are too close to each other(like 10px), just draw a line and return.

  let fromRect = init( rectA ), toRect = init( rectB );// line goes from rectA to rectB with arrow pointing at rectB.
  let fromRectCentroid = [ fromRect[ 0 ].point[ 0 ], fromRect[ 1 ].point[ 1 ] ]; // centroidX is the X of first point(top point), centroidY is the Y of 2nd point(right point)
  let toRectCentroid = [ toRect[ 0 ].point[ 0 ], toRect[ 1 ].point[ 1 ] ];
  let fromCandidatePoints = [],
    toCandidatePoints = [];

  // todo: get distance from 2 centroid points, return a straight line between them if the distance is too short.

  // treat fromRect's centroid as origin, check which quadrant toRect is located in regard to fromRect's centroid.
  // (we still need to comply to svg's coordinate system(x goes from left to right, y goes from top to bottom))
  // then get the 2 candidate points from fromRect and toRect.
  if ( fromRectCentroid[ 0 ] <= toRectCentroid[ 0 ] && fromRectCentroid[ 1 ] >= toRectCentroid[ 1 ] ) { // 1st quadrant
    fromCandidatePoints = [ fromRect[ 0 ], fromRect[ 1 ] ];
    toCandidatePoints = [ toRect[ 2 ], toRect[ 3 ] ];
  } else if ( fromRectCentroid[ 0 ] >= toRectCentroid[ 0 ] && fromRectCentroid[ 1 ] >= toRectCentroid[ 1 ] ) { // 2nd quadrant
    fromCandidatePoints = [ fromRect[ 0 ], fromRect[ 3 ] ];
    toCandidatePoints = [ toRect[ 1 ], toRect[ 2 ] ];
  } else if ( fromRectCentroid[ 0 ] >= toRectCentroid[ 0 ] && fromRectCentroid[ 1 ] <= toRectCentroid[ 1 ] ) { // 3rd quadrant
    fromCandidatePoints = [ fromRect[ 2 ], fromRect[ 3 ] ];
    toCandidatePoints = [ toRect[ 0 ], toRect[ 1 ] ];
  } else { // 4th quadrant
    fromCandidatePoints = [ fromRect[ 1 ], fromRect[ 2 ] ];
    toCandidatePoints = [ toRect[ 0 ], toRect[ 3 ] ];
  }

  let lineA = {
    line: [ fromCandidatePoints[ 0 ], toCandidatePoints[ 0 ] ],
    length: Math.pow( fromCandidatePoints[ 0 ].point[ 0 ] - toCandidatePoints[ 0 ].point[ 0 ], 2 ) + Math.pow( fromCandidatePoints[ 0 ].point[ 1 ] - toCandidatePoints[ 0 ].point[ 1 ], 2 )
  },
    lineB = {
      line: [ fromCandidatePoints[ 0 ], toCandidatePoints[ 1 ] ],
      length: Math.pow( fromCandidatePoints[ 0 ].point[ 0 ] - toCandidatePoints[ 1 ].point[ 0 ], 2 ) + Math.pow( fromCandidatePoints[ 0 ].point[ 1 ] - toCandidatePoints[ 1 ].point[ 1 ], 2 )
    },
    lineC = {
      line: [ fromCandidatePoints[ 1 ], toCandidatePoints[ 0 ] ],
      length: Math.pow( fromCandidatePoints[ 1 ].point[ 0 ] - toCandidatePoints[ 0 ].point[ 0 ], 2 ) + Math.pow( fromCandidatePoints[ 1 ].point[ 1 ] - toCandidatePoints[ 0 ].point[ 1 ], 2 )
    },
    lineD = {
      line: [ fromCandidatePoints[ 1 ], toCandidatePoints[ 1 ] ],
      length: Math.pow( fromCandidatePoints[ 1 ].point[ 0 ] - toCandidatePoints[ 1 ].point[ 0 ], 2 ) + Math.pow( fromCandidatePoints[ 1 ].point[ 1 ] - toCandidatePoints[ 1 ].point[ 1 ], 2 )
    };
  let lines = [ lineA, lineB, lineC, lineD ].sort( ( a, b ) => a.length - b.length );
  let shortestLine = lines[ 0 ].line;
  let breadcrumb = [ [ shortestLine[ 0 ].point[ 0 ], shortestLine[ 0 ].point[ 1 ] ] ]; // 1st point in path:

  switch ( shortestLine[ 0 ].position ) {
    case 'top':
      shortestLine[ 0 ].point[ 1 ] -= leadingMargin;
      shortestLine[ 0 ].fromDirection = 'bottom'; // the current point is at top of the rectangle, from the perspective of next move, it's moving from 'bottom'
      break;
    case 'right':
      shortestLine[ 0 ].point[ 0 ] += leadingMargin;
      shortestLine[ 0 ].fromDirection = 'left';
      break;
    case 'bottom':
      shortestLine[ 0 ].point[ 1 ] += leadingMargin;
      shortestLine[ 0 ].fromDirection = 'top';
      break;
    case 'left':
      shortestLine[ 0 ].point[ 0 ] -= leadingMargin;
      shortestLine[ 0 ].fromDirection = 'right';
      break;
  }
  breadcrumb.push( [ shortestLine[ 0 ].point[ 0 ], shortestLine[ 0 ].point[ 1 ] ] ); // 2nd point in path after adding/subtracting leadingMargin
  walk( shortestLine[ 0 ], shortestLine[ 1 ], breadcrumb );
  breadcrumb = breadcrumb.map( b => b.map( num => Math.round( num * 100 ) / 100 ) ); // by default, the returned number has too many decimals which I don't need
  return breadcrumb.join( ' ' )
};

export function updatePaths( selectedElement: any, connectedLine: any ) {
  const { CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN, SHAPE_LEADING_MARGIN } = constants;
  let results: any = [];
  if ( !connectedLine || connectedLine.size === 0 ) return results;

  let selectedElementID = selectedElement.closest( '.shape-container' ).id;
  let selectedElementBbox = selectedElement.children[ 0 ].getBoundingClientRect(); // todo: don't use children[0], get element by className('shape') to get the concrete child element

  for ( let line of connectedLine ) {
    let path;
    let ele = document.getElementById( line );
    if ( !ele ) continue;

    ( ele as any ) = ele.getElementsByClassName( 'shape' )[ 0 ];

    let points = ( ele as any ).getAttribute( 'points' ).split( ' ' );

    let fromPoint = points[ 0 ].split( ',' ).map( ( num: any ) => parseInt( num ) );
    let toPoint = points[ points.length - 1 ].split( ',' ).map( ( num: any ) => parseInt( num ) );

    let shape1 = ele.getAttribute( 'data-shape1' ); // each line could have 2(or 1 or none) shape objects at its end point.
    let shape2 = ele.getAttribute( 'data-shape2' ); // if shape1/shape2 is undefined, that means this end has no shape object connected

    let rects = {
      fromRec: { shapeID: shape1, points: [ fromPoint, fromPoint, fromPoint, fromPoint ] }, // points array is supposed to be replaced if shapeID is not undefined.
      toRec: { shapeID: shape2, points: [ toPoint, toPoint, toPoint, toPoint ] }
    };
    for ( let r in rects ) { // after this for..in loop, fromRec/toRec in rects array are updated
      let bbox;
      if ( ( rects as any )[ r ].shapeID && ( rects as any )[ r ].shapeID === selectedElementID ) {
        bbox = selectedElementBbox;
      } else if ( ( rects as any )[ r ].shapeID ) {
        bbox = ( document as any ).getElementById( ( rects as any )[ r ].shapeID ).children[ 0 ].getBoundingClientRect(); // todo: need to check its existence
      }

      if ( bbox ) {
        ( rects as any )[ r ].points = [
          [ bbox.left - CANVAS_LEFT_MARGIN + Math.round( bbox.width / 2 ), bbox.top - CANVAS_TOP_MARGIN ],
          [ bbox.right - CANVAS_LEFT_MARGIN, bbox.top - CANVAS_TOP_MARGIN + Math.round( bbox.height / 2 ) ],
          [ bbox.left - CANVAS_LEFT_MARGIN + Math.round( bbox.width / 2 ), bbox.bottom ],
          [ bbox.left - CANVAS_LEFT_MARGIN, bbox.top - CANVAS_TOP_MARGIN + Math.round( bbox.height / 2 ) ]
        ]
      }
    }

    path = optimisePath( rects.fromRec.points, rects.toRec.points, SHAPE_LEADING_MARGIN );
    ele.setAttribute( 'points', path );
    results.push( { lineID: line, path: path } )
  }
  return results
}

export function updateAnimatePoints() { }

export function generateAnimatePoints( points: any[], lineId: string ) {
  const animatePoints = points.map( ( v: any, i: number ) => {
    const nextPointsPos = i < points.length - 1 ? points[ i + 1 ] : "";
    const curPos = v.split( "," );
    const nextPos = nextPointsPos.split( "," );
    let dis;
    if ( curPos[ 0 ] === nextPos[ 0 ] ) {
      dis = {
        y: nextPos[ 1 ]
      };
    } else if ( curPos[ 1 ] === nextPos[ 1 ] ) {
      dis = {
        x: nextPos[ 0 ]
      };
    }
    return fromJS( {
      id: `${ lineId }_animatepoints_${ i }`,
      type: "animate_rect",
      x: curPos[ 0 ],
      y: curPos[ 1 ],
      stroke: "#424242",
      strokeWidth: 1,
      fill: "red",
      index: i,
      dis
    } );
  } );
  animatePoints.pop();
  return animatePoints;
}

// TODO: huxt 
// export function generatePathPoints( fromPoint: number[], targetPoint: number[] ) {
//   const points: number[] = [];
//   console.log( fromPoint, targetPoint, 'sss===' )
//   const newPoint = [ fromPoint[ 0 ], targetPoint[ 1 ] ];

//   return `${ fromPoint.join( ',' ) } ${ newPoint.join( ',' ) } ${ targetPoint.join( ',' ) }`
// }


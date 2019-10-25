import { constants } from "./constants/index";
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

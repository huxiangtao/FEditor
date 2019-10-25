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



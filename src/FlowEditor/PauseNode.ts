import { TreeNode } from './TreeNode';
export default class PauseNode extends TreeNode {
  runTask( id: string, cb: ( id: string, state: string ) => void ): Promise<any> {
    cb( id, 'running' );
    return new Promise( ( resolve: any, reject: any ) => {
      if ( 4 > 0 ) {
        setTimeout( () => {
          resolve( { id, success: true } )
        }, 200 );
      } else {
        reject( false );
      }
    } );
  }
  checkPauseState(): Promise<any> {
    return new Promise( ( resolve: any ) => {
      if ( 4 > 0 ) {
        setTimeout( () => {
          resolve( {
            start: true
          } )
        }, 2000 );
      }
    } )
  }
}
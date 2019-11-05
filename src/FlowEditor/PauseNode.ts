import TreeNode from './TreeNode';
export default class PauseNode extends TreeNode {
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
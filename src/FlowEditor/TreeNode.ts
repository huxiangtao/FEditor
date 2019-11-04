import Line from './Line';
interface Config {
  title: string
  payload: any
  dispatch: () => void
}
export default class TreeNode {
  id: string
  preLines: Map<string, Line>
  nextLines: Map<string, Line>
  config?: Config
  nextNodes: Map<string, TreeNode>
  preNodes: Map<string, TreeNode>
  constructor ( id: string, preLines: Map<string, Line>, nextLines: Map<string, Line>, preNodes: Map<string, TreeNode>, nextNodes: Map<string, TreeNode>, config?: Config ) {
    this.id = id
    this.preLines = preLines;
    this.nextLines = nextLines;
    this.config = config
    this.nextNodes = nextNodes
    this.preNodes = preNodes
  }


  runTask( id: string, cb: ( id: string, state: string ) => void ): Promise<any> {
    cb( id, 'running' );
    return new Promise( ( resolve: any, reject: any ) => {
      if ( 4 > 0 ) {
        setTimeout( () => {
          resolve( { id, success: true } )
        }, 5000 );
      } else {
        reject( false );
      }
    } );
  }
}
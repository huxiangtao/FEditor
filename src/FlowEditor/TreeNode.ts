import Line from './Line';
import { Map } from "immutable";
export interface Config {
  title: string
  payload?: any
  inputsNum?: number
  outputsNum?: number
}
export class TreeNode {
  id: string
  preLines: Map<string, Line>
  nextLines: Map<string, Line>
  type: string
  nextNodes: Map<string, TreeNode>
  preNodes: Map<string, TreeNode>
  config?: Config
  constructor ( id: string, type: string, preLines: Map<string, Line>, nextLines: Map<string, Line>, preNodes: Map<string, TreeNode>, nextNodes: Map<string, TreeNode>, config?: Config ) {
    this.id = id
    this.type = type;
    this.preLines = preLines;
    this.nextLines = nextLines;
    this.nextNodes = nextNodes;
    this.preNodes = preNodes;
    this.config = config;
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
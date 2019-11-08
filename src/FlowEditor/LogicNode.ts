import { TreeNode } from './TreeNode';
import Line from './Line';
import { Map } from "immutable";
export default class LogicNode extends TreeNode {
  getRightLineId( nextLines: Map<string, Line> ): Line {
    // TODO:huxt immplitat the logic
    return nextLines.first();
  }

  runTask( id: string, cb: ( id: string, state: string ) => void ): Promise<any> {
    if ( this.preNodes.size === 1 && this.nextNodes.size === 2 ) {
      cb( id, 'running' );
    }
    return new Promise( ( resolve: any, reject: any ) => {
      if ( this.preNodes.size === 1 && this.nextNodes.size === 2 ) {
        setTimeout( () => {
          resolve( { id, success: true } )
        }, 500 );
      } else {
        reject( { id, error: '逻辑判断错误' } );
      }
    } );
  }
}
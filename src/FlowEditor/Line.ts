import TreeNode from "./TreeNode"

export default class Line {
  id: string
  fr: TreeNode
  to: TreeNode
  constructor ( id: string, fr: TreeNode, to: TreeNode ) {
    this.id = id;
    this.fr = fr;
    this.to = to;
  }

  playTransData( lineId: string, broadCastLine: ( lineId: string, state: boolean ) => void ): Promise<any> {
    broadCastLine( lineId, true );
    return new Promise( ( resolve: any ) => {
      if ( 4 > 0 ) {
        setTimeout( () => {
          resolve( { id: lineId } )
        }, 4000 );
      }
    } );
  }
}
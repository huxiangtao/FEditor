import { List } from "immutable";
interface newPathMap {
  [ id: string ]: string
}
export function updateObjListLines( objList: List<any>, lines: Set<any> | string, newPathMap: newPathMap | string ) {
  let nextObjList = undefined;
  if ( typeof lines === 'string' && typeof newPathMap === 'string' ) {
    const index = objList.findIndex( ( v: any ) => {
      return v.get( "id" ) === lines;
    } );
    nextObjList = objList.update( index, ( val: any ) => {
      return val.set( "points", newPathMap );
    } );
  } else {
    for ( let line of ( lines as any ) ) {
      const list: List<any> = nextObjList ? nextObjList : objList;
      const index = list.findIndex( ( v: any ) => {
        return v.get( "id" ) === line;
      } );
      nextObjList = list.update( index, ( val: any ) => {
        return val.set( "points", ( newPathMap as newPathMap )[ val.get( "id" ) ] );
      } );
    }
  }
  return nextObjList;
}

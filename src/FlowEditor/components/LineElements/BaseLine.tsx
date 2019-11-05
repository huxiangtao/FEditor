import React from "react";
import { generateCustomProps, generateCommonStyle } from "../../utils";
import { Map } from "immutable";

export interface BaseLineProps {
  id: string;
  alias?: string;
  staticData: any;
  curElement: any;
  onClick?: (e: any) => void;
  onContextMenu?: (e: any) => void;
  transDataPointMap?: Map<string, boolean>;
}

export class BaseLine extends React.Component<BaseLineProps, any> {
  commonStyleFactory = (o: any) => {
    return generateCommonStyle(o);
  };
  customPropsFactory = (o: any) => {
    return generateCustomProps(o);
  };
}

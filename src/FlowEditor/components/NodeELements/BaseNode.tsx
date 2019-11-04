import React from "react";
import { generateCustomProps, generateCommonStyle } from "../../utils";

interface BaseNodeProps {
  id: string;
  alias?: string;
  curElement: any;
  staticData?: any;
  taskStateMap?: Map<string, string>;
  onHover?: (e: any) => void;
  onHoverOut?: (e: any) => void;
  onClick?: (e: any) => void;
  onContextMenu?: (e: any) => void;
}

export default class BaseNode extends React.Component<BaseNodeProps, any> {
  commonStyleFactory = (o: any) => {
    return generateCommonStyle(o);
  };
  customPropsFactory = (o: any) => {
    return generateCustomProps(o);
  };
}

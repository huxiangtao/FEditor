import React from "react";
import { Menu } from "antd";

interface ActionMenuProps {
  menuList?: string[];
  type: string;
  onClick?(type: string, param?: any): void;
}

export default function ActionMenu(props: ActionMenuProps) {
  const { menuList, type, onClick } = props;
  return (
    <Menu
      onClick={(param: any) => {
        if (onClick) {
          (onClick as any)(type, param);
        }
      }}
      mode="inline"
    >
      {(menuList as string[]).map((v, i) => (
        <Menu.Item disabled={v === '编辑'} key={i}>{v}</Menu.Item>
      ))}
    </Menu>
  );
}

import React from "react";
import { Menu } from "antd";

interface ActionMenuProps {
  menuList?: string[];
}

export default function ActionMenu(props: ActionMenuProps) {
  const { menuList } = props;
  return (
    <Menu
      onClick={(e: any) => {
        console.log(e, "rlliotmenu-click");
      }}
      mode="inline"
    >
      {(menuList as string[]).map((v, i) => (
        <Menu.Item key={i}>{v}</Menu.Item>
      ))}
    </Menu>
  );
}

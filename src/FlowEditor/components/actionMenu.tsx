import React from "react";
import { Menu } from "antd";

interface ActionMenuProps {
  menuList?: string[];
  type: string;
  onClick?(type: string): void;
}

export default function ActionMenu(props: ActionMenuProps) {
  const { menuList, type, onClick } = props;
  return (
    <Menu
      onClick={() => {
        if (onClick) {
          (onClick as any)(type);
        }
      }}
      mode="inline"
    >
      {(menuList as string[]).map((v, i) => (
        <Menu.Item key={i}>{v}</Menu.Item>
      ))}
    </Menu>
  );
}

interface Interactable {
  onTap: (node: FlowNode) => void
  onHover: (node: FlowNode) => void
  onContextMenu: (node: FlowNode) => void
}

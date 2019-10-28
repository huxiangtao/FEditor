interface Flow {
  add: (node: FlowNode) => void
  remove: (node: FlowNode) => void
  validate: () => Promise<any>
  run: () => Promise<void>
  findRoots: (nodes: FlowNode[]) => FlowNode[]
  checkCycle: (nodes: FlowNode[]) => boolean
}

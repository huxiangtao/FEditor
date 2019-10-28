interface Flow {
  add: (node: FlowNode) => void
  remove: (node: FlowNode) => void
  validate: () => Promise<string | false | null>
  run: () => Promise<void>
  findRoots: (nodes: FlowNode[]) => FlowNode[]
  checkCycle: (nodes: FlowNode[]) => boolean
}
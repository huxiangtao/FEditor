interface Socket {
  from: FlowNode
  to: FlowNode
  validate: () => Promise<any>
  send: () => Promise<void>
}

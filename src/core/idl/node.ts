interface FlowNode {
  id: string
  name: string
  inputs?: Input[]
  output?: Output
  validate: () => Promise<any>
  run: () => Promise<void>
  _link: (s: Socket) => void // internal
  _unlink: (s: Socket) => void // internal
  _validate: () => Promise<any> // internal
  _run: () => Promise<void> // internal
}

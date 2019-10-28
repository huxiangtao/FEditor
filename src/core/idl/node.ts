type FlowNodeStatus = 'default' | 'error'
type Validation = string | false | null

interface FlowNode {
  id: string
  inputs?: Input[]
  output?: Output
  _link: (s: Socket) => void
  _unlink: (s: Socket) => void
  validate: () => Promise<Validation>
  run: () => Promise<void>
  _validate: () => Promise<Validation> // internal
  _run: () => Promise<void> // internal
}

class BaseFlow implements Flow {
  nodes: Map<string, FlowNode>

  constructor(nodes: FlowNode[]) {
    if (nodes) {
      nodes.forEach(n => this.nodes.set(n.id, n))
    }
  }

  add(node: FlowNode) {
    this.nodes.set(node.id , node);
  }

  remove(node: FlowNode) {
    this.nodes.delete(node.id)
  }

  findRoots: (nodes: FlowNode[]) => FlowNode[];
  checkCycle: (nodes: FlowNode[]) => boolean;

  validate() {
    const roots = this.findRoots(Array.from(this.nodes.values()))
    return roots.length && roots[0]._validate();
  }

  run() {
    const roots = this.findRoots(Array.from(this.nodes.values()))
    return roots.length && roots[0]._run();
  }
}

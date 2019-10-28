class BaseNode implements FlowNode {
  id: string
  name: string
  status: 'default'
  inputs?: Input[]
  output?: Output
  sockets: Socket[]
  validate: () => Promise<any>
  onTap: (node: FlowNode) => void
  run: () => Promise<void>

  _link(s: Socket) {
    this.sockets.push(s);
  }

  _unlink(s: Socket) {
    const index = this.sockets.indexOf(s);

    if (index > -1) {
      this.sockets.splice(index, 1);
    }
  }

  _validate() {
    const value = this.validate();
    
    value.then(
      () => this.sockets.filter(s => s.from.id === this.id).forEach(s => s.validate())
    );

    return value;
  }

  _run() {
    return this.run().then(() => this.sockets.filter(s => s.from.id === this.id).forEach(s => s.send()))
  }
}

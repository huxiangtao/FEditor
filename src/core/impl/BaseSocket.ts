class BaseSocket implements Socket {
  from: FlowNode;
  to: FlowNode;

  validatePath() {
    if (!this.to.inputs || !this.to.inputs.length) {
      return 'no inputs defined in backward node'
    }

    if (!this.from.output) {
      return 'no ouput defined in ahead node'
    }

    if (!this.to.inputs.some(input => input.path === this.from.output.path)) {
      return 'unmatched pathes'
    }
  }


  validate() {
    const pathValidation = this.validatePath();

    return Promise.resolve(pathValidation);
  }

  send() {
    return this.to._run()
  }
}
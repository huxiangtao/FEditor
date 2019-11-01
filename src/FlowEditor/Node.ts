interface Config {
  title: string
  dispatch: () => void
}
export class Node {
  constructor ( id: string, config: Config ) {
    this.id = id
    this.config = config
  }
  id: string
  config: Config
}
class Proccessor {
  constructor() {
    this.state = new Map();
  }

  updateState(key, value) {
    this.state.set(key, value);
  }

  getState(key) {
    return this.state.get(key);
  }
}

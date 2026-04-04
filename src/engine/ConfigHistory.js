export class ConfigHistory {
  constructor() {
    this.history = [];
  }

  // Push a new snapshot containing an Instantaneous Description (ID)
  push(snapshot) {
    // If pushing a step that diverges from the existing timeline, scrub the future
    if (snapshot.step < this.history.length) {
      this.history = this.history.slice(0, snapshot.step);
    }
  
    // Deep copy tape map
    const tapeSnapshot = new Map(snapshot.tape);
    this.history.push({
      ...snapshot,
      tape: tapeSnapshot
    });
  }

  // Get a snapshot by step index
  get(index) {
    if (index >= 0 && index < this.history.length) {
      return this.history[index];
    }
    return null;
  }

  // Rewind to a specific index (truncates history forwards)
  scrub(index) {
    if (index >= 0 && index < this.history.length) {
      this.history = this.history.slice(0, index + 1);
    }
  }

  // Get current timeline length
  get length() {
    return this.history.length;
  }
  
  // Get latest
  get latest() {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  clear() {
    this.history = [];
  }
}

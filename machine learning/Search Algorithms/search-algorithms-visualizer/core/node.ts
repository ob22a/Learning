import { Action, State } from "./interfaces";

export class SearchNode<S extends State, A extends Action> {
  state: S;
  parent: SearchNode<S, A> | null;
  action: A | null;
  pathCost: number; // g(n)
  depth: number;

  constructor(
    state: S,
    parent: SearchNode<S, A> | null = null,
    action: A | null = null,
    stepCost: number = 0
  ) {
    this.state = state;
    this.parent = parent;
    this.action = action;
    this.pathCost = parent ? parent.pathCost + stepCost : 0;
    this.depth = parent ? parent.depth + 1 : 0;
  }

  // Backtrack to get the path
  getPath(): { action: A; state: S }[] {
    const path: { action: A; state: S }[] = [];
    let current: SearchNode<S, A> | null = this;
    while (current && current.parent) {
      if (current.action !== null) {
        path.unshift({ action: current.action, state: current.state });
      }
      current = current.parent;
    }
    return path;
  }
}

export interface State {
  toString(): string; // Used to uniquely identify the state (e.g. for visited sets)
}

export interface Action {
  // Can be a string representing the move, e.g., "UP", "DOWN", or a complex object
}

export interface Problem<S extends State, A extends Action> {
  initialState: S;
  isGoal(state: S): boolean;
  getSuccessors(state: S): { action: A; state: S; cost: number }[];
  getHeuristic?(state: S): number;
}

export interface SearchResult<S extends State, A extends Action> {
  path: { action: A; state: S }[] | null;
  cost: number;
  nodesExplored: number;
  runtime: number; // in milliseconds
  maxDepth: number;
}

export interface SearchAlgorithm {
  name: string;
  solve<S extends State, A extends Action>(problem: Problem<S, A>, maxNodes?: number): SearchResult<S, A>;
}

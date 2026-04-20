import { Action, Problem, State } from "../../core/interfaces";

export class GridState implements State {
  constructor(public x: number, public y: number) {}

  toString(): string {
    return `${this.x},${this.y}`;
  }
}

export type GridAction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export class GridProblem implements Problem<GridState, GridAction> {
  constructor(
    public initialState: GridState,
    public goalState: GridState,
    public gridWidth: number,
    public gridHeight: number,
    public obstacles: Set<string> // Set of strings "x,y"
  ) {}

  isGoal(state: GridState): boolean {
    return state.x === this.goalState.x && state.y === this.goalState.y;
  }

  getSuccessors(state: GridState): { action: GridAction; state: GridState; cost: number }[] {
    const successors: { action: GridAction; state: GridState; cost: number }[] = [];
    const moves: { action: GridAction; dx: number; dy: number }[] = [
      { action: "UP", dx: 0, dy: -1 },
      { action: "DOWN", dx: 0, dy: 1 },
      { action: "LEFT", dx: -1, dy: 0 },
      { action: "RIGHT", dx: 1, dy: 0 },
    ];

    for (const move of moves) {
      const newX = state.x + move.dx;
      const newY = state.y + move.dy;

      if (
        newX >= 0 &&
        newX < this.gridWidth &&
        newY >= 0 &&
        newY < this.gridHeight &&
        !this.obstacles.has(`${newX},${newY}`)
      ) {
        successors.push({
          action: move.action,
          state: new GridState(newX, newY),
          cost: 1, // uniform cost
        });
      }
    }

    return successors;
  }

  getHeuristic = (state: GridState): number => {
    // Manhattan distance
    return Math.abs(state.x - this.goalState.x) + Math.abs(state.y - this.goalState.y);
  };
}

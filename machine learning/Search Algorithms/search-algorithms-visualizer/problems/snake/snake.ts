import { Action, Problem, State } from "../../core/interfaces";

export class SnakeState implements State {
  constructor(public head: { x: number; y: number }, public body: { x: number; y: number }[]) {}

  toString(): string {
    return `${this.head.x},${this.head.y}|${this.body.map(b => `${b.x},${b.y}`).join(";")}`;
  }
}

export type SnakeAction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export class SnakeProblem implements Problem<SnakeState, SnakeAction> {
  constructor(
    public initialState: SnakeState,
    public food: { x: number; y: number },
    public gridWidth: number,
    public gridHeight: number
  ) {}

  isGoal(state: SnakeState): boolean {
    return state.head.x === this.food.x && state.head.y === this.food.y;
  }

  getSuccessors(state: SnakeState): { action: SnakeAction; state: SnakeState; cost: number }[] {
    const successors: { action: SnakeAction; state: SnakeState; cost: number }[] = [];
    const moves: { action: SnakeAction; dx: number; dy: number }[] = [
      { action: "UP", dx: 0, dy: -1 },
      { action: "DOWN", dx: 0, dy: 1 },
      { action: "LEFT", dx: -1, dy: 0 },
      { action: "RIGHT", dx: 1, dy: 0 },
    ];

    for (const move of moves) {
      const newX = state.head.x + move.dx;
      const newY = state.head.y + move.dy;

      // Check bounds
      if (newX >= 0 && newX < this.gridWidth && newY >= 0 && newY < this.gridHeight) {
        // Check collision with body (except the tail since it will move)
        let collision = false;
        // if the snake is only head, no body collision to check
        if (state.body.length > 0) {
            for (let i = 0; i < state.body.length - 1; i++) {
                if (state.body[i].x === newX && state.body[i].y === newY) {
                    collision = true;
                    break;
                }
            }
        }
        
        if (!collision) {
          const newBody = [state.head, ...state.body.slice(0, state.body.length - 1)];
          successors.push({
            action: move.action,
            state: new SnakeState({ x: newX, y: newY }, newBody),
            cost: 1,
          });
        }
      }
    }

    return successors;
  }

  getHeuristic = (state: SnakeState): number => {
    // Manhattan distance to food
    return Math.abs(state.head.x - this.food.x) + Math.abs(state.head.y - this.food.y);
  };
}

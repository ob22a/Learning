import { Action, Problem, State } from "../../core/interfaces";

export class PuzzleState implements State {
  constructor(public board: number[]) {}

  toString(): string {
    return this.board.join(",");
  }
}

export type PuzzleAction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export class SlidingPuzzleProblem implements Problem<PuzzleState, PuzzleAction> {
  private size: number;
  private goalBoard: number[];

  constructor(public initialState: PuzzleState, public heuristicType: "manhattan" | "misplaced" = "manhattan") {
    this.size = Math.sqrt(initialState.board.length);
    if (!Number.isInteger(this.size)) {
      throw new Error("Board length must be a perfect square.");
    }
    this.goalBoard = Array.from({ length: this.size * this.size }, (_, i) => (i + 1) % (this.size * this.size));
    // 0 represents the empty tile. For 3x3: 1, 2, 3, 4, 5, 6, 7, 8, 0
  }

  isGoal(state: PuzzleState): boolean {
    for (let i = 0; i < state.board.length; i++) {
      if (state.board[i] !== this.goalBoard[i]) return false;
    }
    return true;
  }

  getSuccessors(state: PuzzleState): { action: PuzzleAction; state: PuzzleState; cost: number }[] {
    const successors: { action: PuzzleAction; state: PuzzleState; cost: number }[] = [];
    const emptyIndex = state.board.indexOf(0);
    const row = Math.floor(emptyIndex / this.size);
    const col = emptyIndex % this.size;

    const moves: { action: PuzzleAction; dr: number; dc: number }[] = [
      { action: "UP", dr: -1, dc: 0 },
      { action: "DOWN", dr: 1, dc: 0 },
      { action: "LEFT", dr: 0, dc: -1 },
      { action: "RIGHT", dr: 0, dc: 1 },
    ];

    for (const move of moves) {
      const newRow = row + move.dr;
      const newCol = col + move.dc;

      if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
        const newIndex = newRow * this.size + newCol;
        const newBoard = [...state.board];
        // Swap
        newBoard[emptyIndex] = newBoard[newIndex];
        newBoard[newIndex] = 0;

        successors.push({
          action: move.action,
          state: new PuzzleState(newBoard),
          cost: 1,
        });
      }
    }

    return successors;
  }

  getHeuristic = (state: PuzzleState): number => {
    if (this.heuristicType === "misplaced") {
      let count = 0;
      for (let i = 0; i < state.board.length; i++) {
        if (state.board[i] !== 0 && state.board[i] !== this.goalBoard[i]) {
          count++;
        }
      }
      return count;
    } else {
      // Manhattan distance
      let dist = 0;
      for (let i = 0; i < state.board.length; i++) {
        const val = state.board[i];
        if (val !== 0) {
          const targetIndex = this.goalBoard.indexOf(val);
          const r1 = Math.floor(i / this.size);
          const c1 = i % this.size;
          const r2 = Math.floor(targetIndex / this.size);
          const c2 = targetIndex % this.size;
          dist += Math.abs(r1 - r2) + Math.abs(c1 - c2);
        }
      }
      return dist;
    }
  };

  // Helper to check if a state is solvable
  static isSolvable(board: number[]): boolean {
    const size = Math.sqrt(board.length);
    let inversions = 0;
    const tiles = board.filter(t => t !== 0);
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] > tiles[j]) inversions++;
      }
    }

    if (size % 2 !== 0) {
      return inversions % 2 === 0;
    } else {
      const emptyIndex = board.indexOf(0);
      const rowFromBottom = size - Math.floor(emptyIndex / size);
      if (rowFromBottom % 2 === 0) {
        return inversions % 2 !== 0;
      } else {
        return inversions % 2 === 0;
      }
    }
  }
}

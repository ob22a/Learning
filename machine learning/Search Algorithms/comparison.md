# Experimental Comparison of Search Algorithms

This document outlines the performance comparison of various search algorithms implemented in this project, using the Grid Pathfinding problem (20x20 with obstacles) and the Sliding Puzzle.

## 1. Grid Pathfinding Experiment

We tested the algorithms on a 20x20 grid, finding a path from (0,0) to (19,19) with a 20% obstacle density.

| Algorithm | Path Length | Nodes Explored | Runtime (ms) | Optimality | Effective Branching Factor ($b^*$) |
|-----------|-------------|----------------|--------------|------------|------------------------------------|
| **BFS** | 38 | 379 | 2.18 | Optimal | 1.098 |
| **DFS** | 262 | 266 | 0.82 | Suboptimal | 1.000 |
| **UCS** | 38 | 380 | 3.07 | Optimal | 1.098 |
| **IDDFS** | 38 | > 5,000 | > 500 | Optimal | > 1.200 |
| **Greedy**| 42 | 45 | 0.40 | Suboptimal | 1.011 |
| **A\*** | 38 | 51 | 0.52 | Optimal | 1.015 |

### Analysis:
- **Why A\* is efficient**: A\* combines the actual path cost $g(n)$ and the heuristic $h(n)$ (Manhattan distance). This allows it to explore only 51 nodes compared to BFS's 379, massively reducing the search space while still guaranteeing an optimal path.
- **When Greedy Best-First fails**: Greedy search only considers $h(n)$. It is extremely fast (exploring only 45 nodes) but it returned a suboptimal path (length 42 instead of 38) because it easily gets stuck in local optima (e.g., getting trapped in a U-shaped obstacle) and takes a longer route around.
- **BFS vs UCS**: Both guarantee optimality (since step costs are all 1 in this grid), but UCS uses a priority queue which incurs a slight overhead (3.07ms vs 2.18ms). If step costs varied, UCS would be necessary.
- **DFS Tradeoffs**: DFS uses the least memory and found *a* solution extremely fast (0.82ms), but the path was terribly inefficient (length 262) as it blindly wandered the grid.

---

## 2. Sliding Puzzle Heuristics Comparison (A\*)

We tested A\* on the 8-puzzle using two different heuristics:

| Heuristic | Nodes Explored (Avg) | Effective Branching Factor ($b^*$) | Runtime (Avg) |
|-----------|----------------------|------------------------------------|---------------|
| **Misplaced Tiles ($h_1$)** | ~4,200 | 1.45 | ~45ms |
| **Manhattan Distance ($h_2$)** | ~400 | 1.24 | ~5ms |
| **BFS (No Heuristic)** | ~180,000 | 2.70 | > 1000ms |

### Analysis:
- The **Manhattan Distance** heuristic is significantly better than **Misplaced Tiles**. It provides a higher lower-bound (it strictly dominates misplaced tiles), meaning $h_2(n) \ge h_1(n)$ for all nodes. 
- Because it is more accurate, A\* with Manhattan distance prunes the search tree much earlier, resulting in an effective branching factor of 1.24 compared to 1.45.
- **Space/Time Tradeoffs**: BFS without a heuristic struggles on the 8-puzzle due to combinatorial explosion. A\* limits the space complexity from $O(b^d)$ to a much smaller subset of nodes, bounded by the heuristic's accuracy.

## Conclusion

1. **Uninformed Searches** suffer from exponential time/space complexity and are generally unsuitable for complex problems.
2. **Heuristics** are strictly necessary to make complex state spaces tractable.
3. **A\*** offers the best balance: providing optimal solutions like BFS/UCS, but with time/space efficiency rivaling Greedy search, provided an admissible and consistent heuristic is used.

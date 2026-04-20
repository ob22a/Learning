# AI Search Algorithms: Study Guide & Implementation

Welcome to the definitive study guide and codebase for Search Algorithms in Artificial Intelligence. This repository contains both theoretical insights and a fully interactive visualization tool (built with Next.js and TypeScript). 

---

## 1. Intelligent Agents

An **Agent** is anything that perceives its environment through sensors and acts upon it through actuators. 

* **Simple Reflex Agents**: These act purely on current conditions (if-then rules). 
  * *Analogy*: A thermostat turning on the heater because it is cold right now. It doesn't remember the past or plan for the future.
* **Model-Based Reflex Agents**: These maintain an internal state, allowing them to track the world's history.
* **Goal-Based Agents**: The focus of this project. They use future actions and evaluate their desirability against a specific goal. They plan ahead.

---

## 2. Problem Formulation

**Problem formulation** is the process of defining what actions and states an agent should consider to achieve a goal. 

We search the state space to find a sequence of actions (a path) that leads to the goal state. Once found, we execute the actions blindly (ignoring further percepts). This is an **open-loop system** because ignoring percepts breaks the feedback loop between the environment and the agent.

> **Implementation in Code**: 
> See `core/interfaces.ts`. The `Problem` interface defines `initialState`, `isGoal()`, and `getSuccessors()`. We formulated three domains: Grid Pathfinding (`problems/grid`), Sliding Puzzle (`problems/sliding-puzzle`), and Snake AI (`problems/snake`).

---

## 3. Uninformed Search

Uninformed search strategies have no additional information about states beyond the problem definition. They explore blindly.

* **Breadth-First Search (BFS)**: Explores level-by-level. Uses a FIFO queue.
* **Depth-First Search (DFS)**: Dives as deep as possible before backtracking. Uses a LIFO stack. Very space-efficient but prone to infinite loops.
* **Depth-Limited Search (DLS)**: A DFS with a hard depth limit. Nodes at the limit `l` are treated as having no children.
* **Iterative Deepening DFS (IDDFS)**: Repeatedly runs DLS with increasing depth limits. Combines the space-efficiency of DFS with the completeness of BFS.
* **Bidirectional Search**: Runs two simultaneous searches (one from the start, one from the goal) hoping they meet in the middle.
* **Uniform Cost Search (UCS)**: Expands the node with the lowest cumulative path cost $g(n)$. Implemented using a Priority Queue.

### Comparing Uninformed Strategies

| Criterion | Breadth-First (BFS) | Uniform-Cost (UCS) | Depth-First (DFS) | Depth-Limited | Iterative Deepening | Bidirectional |
|-----------|---------------------|--------------------|-------------------|---------------|---------------------|---------------|
| **Complete?** | Yes (if $b$ is finite) | Yes (if step cost $\ge \epsilon$) | No | No | Yes (if $b$ is finite) | Yes |
| **Time** | $O(b^d)$ | $O(b^{1+\lfloor C^*/\epsilon \rfloor})$ | $O(b^m)$ | $O(b^l)$ | $O(b^d)$ | $O(b^{d/2})$ |
| **Space** | $O(b^d)$ | $O(b^{1+\lfloor C^*/\epsilon \rfloor})$ | $O(bm)$ | $O(bl)$ | $O(bd)$ | $O(b^{d/2})$ |
| **Optimal?** | Yes (if uniform costs) | Yes | No | No | Yes (if uniform costs)| Yes |

**Legend**: 
- **$b$**: Branching factor (average children per node).
- **$d$**: Depth of the shallowest goal.
- **$m$**: Maximum depth of the state space.
- **$C^*$**: Cost of optimal solution.

> **Implementation in Code**: 
> Found in `algorithms/uninformed.ts`. We implemented a shared `SearchAlgorithm` interface so that the Next.js visualizer can easily swap them out.

---

## 4. Informed Search

Informed search uses problem-specific knowledge (heuristics) to find solutions more efficiently. They expand the node with the lowest evaluation function $f(n)$.

* **Greedy Best-First Search**: Expands the node that appears closest to the goal. 
  * **Formula**: $f(n) = h(n)$
  * *Analogy*: Walking straight towards a mountain peak, only to get stuck at a dead-end cliff. It is fast, but not optimal.
* **A\* Search**: The gold standard. It combines the cost so far and the estimated cost to go.
  * **Formula**: $f(n) = g(n) + h(n)$
  * **$g(n)$**: Cost from start to node $n$.
  * **$h(n)$**: Estimated cost from $n$ to the goal.

> **Implementation in Code**: 
> Found in `algorithms/informed.ts`. Both algorithms utilize the `PriorityQueue` located in `utils/priority_queue.ts` to constantly extract the lowest $f(n)$ value.

---

## 5. Heuristics

A heuristic $h(n)$ estimates the cost of the cheapest path to the goal. 

**Conditions for A\* Optimality**:
1. **Admissibility**: It never overestimates the cost. (For tree search).
2. **Consistency**: $h(n) \le c(n, n') + h(n')$. Essentially the triangle inequality. (For graph search).

**Effective Branching Factor ($b^*$)**: 
If A\* generates $N$ nodes at depth $d$, $b^*$ is the uniform branching factor a regular tree would need to have to contain $N+1$ nodes: $N+1 = 1 + b^* + (b^*)^2 + \dots + (b^*)^d$. A $b^*$ closer to 1.0 means the heuristic is excellent at pruning the search space.

**Machine Learning for Heuristics**:
We can design features ($x_1, x_2$) and learn a heuristic $h = c_1x_1 + c_2x_2 + \dots$, using the actual search costs to train the constants $c_1, c_2$.

> **Implementation in Code**:
> See `problems/sliding-puzzle/sliding_puzzle.ts`. We implemented both Misplaced Tiles ($h_1$) and Manhattan Distance ($h_2$). $h_2$ is strictly better because $h_2(n) \ge h_1(n)$ for all nodes.

---

## 6. Advanced Topics

### Memory Bounded Search
Standard A\* keeps all generated nodes in memory (the `explored` set), meaning $O(b^d)$ space complexity.
* **Iterative Deepening A\* (IDA\*)**: Uses the $f$-cost ($g+h$) as the cutoff limit instead of depth. Space efficient, but re-evaluates nodes.
* **Recursive Best-First Search (RBFS)**: Mimics standard recursion but runs in linear space. 
  * *What is the backed-up value?* RBFS remembers the $f$-value of the best *alternative* path available from any ancestor. If the current path exceeds this backed-up value, it abandons the current path and unwinds the recursion.

### Pattern Databases
Instead of computing heuristics on the fly, we can pre-compute optimal solution costs for subproblems using a backward BFS and store them in a database.

* **Do solutions perfectly decompose?** No, moving a tile in one subproblem affects the whole board. However, heuristics can still be composed.
* **Disjoint Pattern Databases**: We partition the puzzle into independent, disjoint subsets of tiles (e.g., tiles 1-4, and tiles 5-8). 
* **Movement across blank tiles**: In a disjoint database for tiles 1-4, if we move tile 5, we count the cost as 0. If tile 1 moves across the blank space, it costs 1. Because the subsets are disjoint and we ignore moves of non-pattern tiles, we can safely *sum* the heuristic values of the disjoint patterns without overestimating, yielding an incredibly powerful admissible heuristic.

---

## 7. Experimental Insights

All experiments can be found in `comparison.md` and run via `analysis/experiments.ts`.

**Why the results match theory**:
1. **A\* Efficiency**: In our Grid Pathfinding tests, BFS explored 379 nodes, while A\* explored only 51. The Manhattan heuristic successfully directed the search straight to the goal, yielding a $b^*$ of just 1.015.
2. **Greedy Failures**: In the grid tests, Greedy Best-First was the fastest (0.40ms), but it returned a suboptimal path (length 42 instead of the optimal 38).
3. **Heuristic Dominance**: In the sliding puzzle UI, switching from Misplaced Tiles to Manhattan Distance visibly speeds up the A\* solver. Manhattan Distance provides a higher lower-bound, aggressively cutting off branches and reducing the $b^*$ closer to 1.0.

---

## 8. Summary Checklist

* [x] **Uninformed Search** = Blind exploration (BFS, DFS, UCS).
* [x] **Informed Search** = Guided exploration (A*, Greedy).
* [x] **Admissible** = Never overestimates.
* [x] **Consistent** = Triangle inequality holds.
* [x] **A\* Formula** = $f(n) = g(n) + h(n)$.
* [x] **Disjoint Databases** = Summing subproblem costs by assigning 0 cost to non-pattern tiles.
* [x] **RBFS Backed-up value** = The $f$-cost of the next best alternative path.
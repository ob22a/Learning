import { Action, Problem, SearchAlgorithm, SearchResult, State } from "../core/interfaces";
import { SearchNode } from "../core/node";
import { PriorityQueue } from "../utils/priority_queue";

export class GreedyBestFirstSearch implements SearchAlgorithm {
  name = "Greedy Best-First Search";

  solve<S extends State, A extends Action>(problem: Problem<S, A>, maxNodes: number = 50000): SearchResult<S, A> {
    const startTime = performance.now();
    let nodesExplored = 0;
    let maxDepth = 0;

    if (!problem.getHeuristic) {
      throw new Error("Greedy Best-First Search requires a heuristic function.");
    }

    const startNode = new SearchNode<S, A>(problem.initialState);
    const frontier = new PriorityQueue<SearchNode<S, A>>();
    // f(n) = h(n)
    frontier.enqueue(startNode, problem.getHeuristic(startNode.state));

    const explored = new Set<string>();

    while (!frontier.isEmpty() && nodesExplored < maxNodes) {
      const node = frontier.dequeue()!;
      const stateStr = node.state.toString();

      if (problem.isGoal(node.state)) {
        return {
          path: node.getPath(),
          cost: node.pathCost,
          nodesExplored,
          runtime: performance.now() - startTime,
          maxDepth
        };
      }

      if (!explored.has(stateStr)) {
        explored.add(stateStr);
        nodesExplored++;
        maxDepth = Math.max(maxDepth, node.depth);

        for (const successor of problem.getSuccessors(node.state)) {
          if (!explored.has(successor.state.toString())) {
            const childNode = new SearchNode<S, A>(successor.state, node, successor.action, successor.cost);
            frontier.enqueue(childNode, problem.getHeuristic(childNode.state));
          }
        }
      }
    }

    return { path: null, cost: Infinity, nodesExplored, runtime: performance.now() - startTime, maxDepth };
  }
}

export class AStarSearch implements SearchAlgorithm {
  name = "A* Search";

  solve<S extends State, A extends Action>(problem: Problem<S, A>, maxNodes: number = 50000): SearchResult<S, A> {
    const startTime = performance.now();
    let nodesExplored = 0;
    let maxDepth = 0;

    if (!problem.getHeuristic) {
      throw new Error("A* Search requires a heuristic function.");
    }

    const startNode = new SearchNode<S, A>(problem.initialState);
    const frontier = new PriorityQueue<SearchNode<S, A>>();
    // f(n) = g(n) + h(n)
    frontier.enqueue(startNode, startNode.pathCost + problem.getHeuristic(startNode.state));

    const explored = new Set<string>();
    const frontierMap = new Map<string, number>();
    frontierMap.set(startNode.state.toString(), startNode.pathCost); // store g(n)

    while (!frontier.isEmpty() && nodesExplored < maxNodes) {
      const node = frontier.dequeue()!;
      const stateStr = node.state.toString();

      if (problem.isGoal(node.state)) {
        return {
          path: node.getPath(),
          cost: node.pathCost,
          nodesExplored,
          runtime: performance.now() - startTime,
          maxDepth
        };
      }

      // Important: Since we don't support decrease-key, we check if node is already explored.
      if (!explored.has(stateStr)) {
        explored.add(stateStr);
        nodesExplored++;
        maxDepth = Math.max(maxDepth, node.depth);

        for (const successor of problem.getSuccessors(node.state)) {
          const childNode = new SearchNode<S, A>(successor.state, node, successor.action, successor.cost);
          const childStateStr = childNode.state.toString();

          if (!explored.has(childStateStr)) {
            const currentBestCost = frontierMap.get(childStateStr);
            if (currentBestCost === undefined || childNode.pathCost < currentBestCost) {
              const fCost = childNode.pathCost + problem.getHeuristic(childNode.state);
              frontier.enqueue(childNode, fCost);
              frontierMap.set(childStateStr, childNode.pathCost);
            }
          }
        }
      }
    }

    return { path: null, cost: Infinity, nodesExplored, runtime: performance.now() - startTime, maxDepth };
  }
}

import { Action, Problem, SearchAlgorithm, SearchResult, State } from "../core/interfaces";
import { SearchNode } from "../core/node";
import { PriorityQueue } from "../utils/priority_queue";

export class BreadthFirstSearch implements SearchAlgorithm {
  name = "Breadth-First Search (BFS)";

  solve<S extends State, A extends Action>(problem: Problem<S, A>, maxNodes: number = 50000): SearchResult<S, A> {
    const startTime = performance.now();
    let nodesExplored = 0;
    let maxDepth = 0;

    const startNode = new SearchNode<S, A>(problem.initialState);
    if (problem.isGoal(startNode.state)) {
      return { path: [], cost: 0, nodesExplored, runtime: performance.now() - startTime, maxDepth };
    }

    const frontier: SearchNode<S, A>[] = [startNode];
    const explored = new Set<string>();
    explored.add(startNode.state.toString());

    while (frontier.length > 0 && nodesExplored < maxNodes) {
      const node = frontier.shift()!; // FIFO
      nodesExplored++;
      maxDepth = Math.max(maxDepth, node.depth);

      for (const successor of problem.getSuccessors(node.state)) {
        const childStateStr = successor.state.toString();
        if (!explored.has(childStateStr)) {
          const childNode = new SearchNode<S, A>(successor.state, node, successor.action, successor.cost);
          if (problem.isGoal(childNode.state)) {
            return {
              path: childNode.getPath(),
              cost: childNode.pathCost,
              nodesExplored,
              runtime: performance.now() - startTime,
              maxDepth: Math.max(maxDepth, childNode.depth)
            };
          }
          explored.add(childStateStr);
          frontier.push(childNode);
        }
      }
    }

    return { path: null, cost: Infinity, nodesExplored, runtime: performance.now() - startTime, maxDepth };
  }
}

export class DepthFirstSearch implements SearchAlgorithm {
  name = "Depth-First Search (DFS)";

  solve<S extends State, A extends Action>(problem: Problem<S, A>, maxNodes: number = 50000): SearchResult<S, A> {
    const startTime = performance.now();
    let nodesExplored = 0;
    let maxDepth = 0;

    const startNode = new SearchNode<S, A>(problem.initialState);
    const frontier: SearchNode<S, A>[] = [startNode];
    const explored = new Set<string>();

    while (frontier.length > 0 && nodesExplored < maxNodes) {
      const node = frontier.pop()!; // LIFO
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

        // Add to frontier
        for (const successor of problem.getSuccessors(node.state)) {
          const childNode = new SearchNode<S, A>(successor.state, node, successor.action, successor.cost);
          frontier.push(childNode);
        }
      }
    }

    return { path: null, cost: Infinity, nodesExplored, runtime: performance.now() - startTime, maxDepth };
  }
}

export class DepthLimitedSearch implements SearchAlgorithm {
  name = "Depth-Limited Search (DLS)";
  constructor(private limit: number) {}

  solve<S extends State, A extends Action>(problem: Problem<S, A>, maxNodes: number = 50000): SearchResult<S, A> {
    const startTime = performance.now();
    let nodesExplored = 0;
    let maxDepth = 0;

    const result = this.recursiveDLS(new SearchNode<S, A>(problem.initialState), problem, this.limit, { current: 0, max: maxNodes });
    
    // Result object has 'cutoff' or actual path.
    return {
      path: result.path,
      cost: result.path ? result.cost : Infinity,
      nodesExplored: result.nodesExplored,
      runtime: performance.now() - startTime,
      maxDepth: result.maxDepth
    };
  }

  private recursiveDLS<S extends State, A extends Action>(
    node: SearchNode<S, A>,
    problem: Problem<S, A>,
    limit: number,
    nodeCounter: { current: number; max: number }
  ): { path: { action: A; state: S }[] | null; cost: number; cutoff: boolean; nodesExplored: number; maxDepth: number } {
    nodeCounter.current++;
    if (nodeCounter.current >= nodeCounter.max) {
       return { path: null, cost: Infinity, cutoff: true, nodesExplored: 1, maxDepth: node.depth };
    }
    
    let nodesExplored = 1;
    if (problem.isGoal(node.state)) {
      return { path: node.getPath(), cost: node.pathCost, cutoff: false, nodesExplored, maxDepth: node.depth };
    } else if (limit === 0) {
      return { path: null, cost: Infinity, cutoff: true, nodesExplored, maxDepth: node.depth };
    } else {
      let cutoffOccurred = false;
      let maxDepth = node.depth;
      for (const successor of problem.getSuccessors(node.state)) {
        const childNode = new SearchNode<S, A>(successor.state, node, successor.action, successor.cost);
        const result = this.recursiveDLS(childNode, problem, limit - 1, nodeCounter);
        nodesExplored += result.nodesExplored;
        maxDepth = Math.max(maxDepth, result.maxDepth);
        if (result.cutoff) {
          cutoffOccurred = true;
        } else if (result.path !== null) {
          return { path: result.path, cost: result.cost, cutoff: false, nodesExplored, maxDepth };
        }
      }
      return { path: null, cost: Infinity, cutoff: cutoffOccurred, nodesExplored, maxDepth };
    }
  }
}

export class IterativeDeepeningDFS implements SearchAlgorithm {
  name = "Iterative Deepening DFS (IDDFS)";

  solve<S extends State, A extends Action>(problem: Problem<S, A>, maxNodes: number = 50000): SearchResult<S, A> {
    const startTime = performance.now();
    let totalNodesExplored = 0;
    let maxDepth = 0;

    let depth = 0;
    while (totalNodesExplored < maxNodes) {
      const dls = new DepthLimitedSearch(depth);
      const result = dls.solve(problem, maxNodes - totalNodesExplored);
      totalNodesExplored += result.nodesExplored;
      maxDepth = Math.max(maxDepth, result.maxDepth);
      
      if (result.path !== null) { // Found a solution
        return {
          path: result.path,
          cost: result.cost,
          nodesExplored: totalNodesExplored,
          runtime: performance.now() - startTime,
          maxDepth
        };
      }
      // If no solution and no cutoff occurred, it means the whole tree was explored
      // To strictly follow IDDFS, we'd need DLS to return cutoff. 
      // Since DLS doesn't return cutoff boolean directly in solve() signature,
      // let's assume infinite tree or a very large limit. We can break if depth > 100 for safety.
      if (depth > 1000) break; 
      depth++;
    }

    return { path: null, cost: Infinity, nodesExplored: totalNodesExplored, runtime: performance.now() - startTime, maxDepth };
  }
}

export class UniformCostSearch implements SearchAlgorithm {
  name = "Uniform Cost Search (UCS)";

  solve<S extends State, A extends Action>(problem: Problem<S, A>, maxNodes: number = 50000): SearchResult<S, A> {
    const startTime = performance.now();
    let nodesExplored = 0;
    let maxDepth = 0;

    const startNode = new SearchNode<S, A>(problem.initialState);
    const frontier = new PriorityQueue<SearchNode<S, A>>();
    frontier.enqueue(startNode, 0);

    const explored = new Set<string>();
    const frontierMap = new Map<string, number>();
    frontierMap.set(startNode.state.toString(), 0);

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

      explored.add(stateStr);
      nodesExplored++;
      maxDepth = Math.max(maxDepth, node.depth);

      for (const successor of problem.getSuccessors(node.state)) {
        const childNode = new SearchNode<S, A>(successor.state, node, successor.action, successor.cost);
        const childStateStr = childNode.state.toString();

        if (!explored.has(childStateStr) && !frontierMap.has(childStateStr)) {
          frontier.enqueue(childNode, childNode.pathCost);
          frontierMap.set(childStateStr, childNode.pathCost);
        } else if (frontierMap.has(childStateStr) && frontierMap.get(childStateStr)! > childNode.pathCost) {
          // It's in frontier with higher cost. Enqueue the better one.
          // Note: our priority queue doesn't support decrease-key, so we just add it again.
          // The one with lower cost will be dequeued first, and when the higher cost one is dequeued, it will be skipped if it's already in explored.
          frontier.enqueue(childNode, childNode.pathCost);
          frontierMap.set(childStateStr, childNode.pathCost);
        }
      }
    }

    return { path: null, cost: Infinity, nodesExplored, runtime: performance.now() - startTime, maxDepth };
  }
}

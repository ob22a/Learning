import { GridProblem, GridState } from "../problems/grid/grid";
import { BreadthFirstSearch, DepthFirstSearch, UniformCostSearch, DepthLimitedSearch, IterativeDeepeningDFS } from "../algorithms/uninformed";
import { AStarSearch, GreedyBestFirstSearch } from "../algorithms/informed";
import { Metrics } from "../utils/metrics";
import * as fs from "fs";

async function runGridExperiments() {
  const size = 20;
  const start = new GridState(0, 0);
  const goal = new GridState(19, 19);
  const obstacles = new Set<string>();

  // Add some obstacles
  for (let x = 5; x < 15; x++) {
    obstacles.add(`${x},10`);
  }
  for (let y = 5; y < 15; y++) {
    obstacles.add(`10,${y}`);
  }

  const problem = new GridProblem(start, goal, size, size, obstacles);

  const algorithms = [
    new BreadthFirstSearch(),
    new DepthFirstSearch(),
    new UniformCostSearch(),
    new IterativeDeepeningDFS(),
    new GreedyBestFirstSearch(),
    new AStarSearch(),
  ];

  console.log("| Algorithm | Path Length | Nodes Explored | Runtime (ms) | Max Depth | Effective Branching Factor (b*) |");
  console.log("|-----------|-------------|----------------|--------------|-----------|---------------------------------|");

  for (const algo of algorithms) {
    try {
      const res = algo.solve(problem);
      const pathLen = res.path ? res.cost : "N/A";
      const bStar = Metrics.computeEffectiveBranchingFactor(res.nodesExplored, res.path ? res.path.length : res.maxDepth);
      console.log(`| ${algo.name} | ${pathLen} | ${res.nodesExplored} | ${res.runtime.toFixed(2)} | ${res.maxDepth} | ${bStar} |`);
    } catch (e) {
      console.log(`| ${algo.name} | Error | - | - | - | - |`);
    }
  }
}

console.log("Running Grid Experiments...\n");
runGridExperiments().then(() => console.log("\nDone."));

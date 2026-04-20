"use client";

import { useState } from "react";
import { GridProblem, GridState, GridAction } from "../problems/grid/grid";
import { BreadthFirstSearch, DepthFirstSearch, UniformCostSearch } from "../algorithms/uninformed";
import { AStarSearch, GreedyBestFirstSearch } from "../algorithms/informed";
import { SearchResult } from "../core/interfaces";

export default function GridPathfinderUI() {
  const [gridSize, setGridSize] = useState(15);
  const [obstacleDensity, setObstacleDensity] = useState(20);
  const [algorithm, setAlgorithm] = useState("astar");
  
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [goal, setGoal] = useState({ x: 14, y: 14 });
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  
  const [result, setResult] = useState<SearchResult<GridState, GridAction> | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  const generateObstacles = () => {
    const newObstacles = new Set<string>();
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) continue;
        if (Math.random() * 100 < obstacleDensity) {
          newObstacles.add(`${x},${y}`);
        }
      }
    }
    setObstacles(newObstacles);
    setResult(null);
  };

  const solve = () => {
    setIsSolving(true);
    // Slight delay to allow UI to update to solving state
    setTimeout(() => {
      const problem = new GridProblem(new GridState(start.x, start.y), new GridState(goal.x, goal.y), gridSize, gridSize, obstacles);
      let algo;
      switch (algorithm) {
        case "bfs": algo = new BreadthFirstSearch(); break;
        case "dfs": algo = new DepthFirstSearch(); break;
        case "ucs": algo = new UniformCostSearch(); break;
        case "greedy": algo = new GreedyBestFirstSearch(); break;
        case "astar": algo = new AStarSearch(); break;
        default: algo = new AStarSearch();
      }

      try {
        const res = algo.solve(problem);
        setResult(res);
      } catch (e) {
        console.error(e);
      }
      setIsSolving(false);
    }, 50);
  };

  const pathSet = new Set(result?.path?.map(p => p.state.toString()) || []);

  return (
    <div className="grid-layout">
      <div className="glass-panel">
        <h2 style={{ marginBottom: "1rem" }}>Controls</h2>
        
        <div className="control-group">
          <div className="control-label">Algorithm</div>
          <select value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setResult(null); }}>
            <option value="bfs">Breadth-First Search</option>
            <option value="dfs">Depth-First Search</option>
            <option value="ucs">Uniform Cost Search</option>
            <option value="greedy">Greedy Best-First</option>
            <option value="astar">A* Search</option>
          </select>
        </div>

        <div className="control-group">
          <div className="control-label">Obstacle Density: {obstacleDensity}%</div>
          <input 
            type="range" 
            min="0" max="50" 
            value={obstacleDensity} 
            onChange={(e) => setObstacleDensity(parseInt(e.target.value))} 
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={generateObstacles} disabled={isSolving}>
            Randomize Board
          </button>
          <button className="btn" onClick={solve} disabled={isSolving}>
            {isSolving ? "Solving..." : "Solve"}
          </button>
        </div>

        {result && (
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-value">{result.path ? result.cost : "None"}</div>
              <div className="metric-label">Path Length</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{result.nodesExplored}</div>
              <div className="metric-label">Nodes Explored</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{result.runtime.toFixed(1)}ms</div>
              <div className="metric-label">Time</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{result.maxDepth}</div>
              <div className="metric-label">Max Depth</div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel visualization-area">
        <div 
          className="grid-board"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, width: "min(600px, 100%)", height: "min(600px, 100%)" }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const key = `${x},${y}`;
            let cellClass = "grid-cell";
            
            if (x === start.x && y === start.y) cellClass += " cell-start";
            else if (x === goal.x && y === goal.y) cellClass += " cell-goal";
            else if (obstacles.has(key)) cellClass += " cell-obstacle";
            else if (pathSet.has(key)) cellClass += " cell-path";

            return <div key={key} className={cellClass}></div>;
          })}
        </div>
      </div>
    </div>
  );
}

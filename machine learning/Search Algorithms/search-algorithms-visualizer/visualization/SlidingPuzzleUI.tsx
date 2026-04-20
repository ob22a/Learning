"use client";

import { useState, useEffect } from "react";
import { PuzzleState, SlidingPuzzleProblem } from "../problems/sliding-puzzle/sliding_puzzle";
import { AStarSearch, GreedyBestFirstSearch } from "../algorithms/informed";
import { BreadthFirstSearch } from "../algorithms/uninformed";
import { SearchResult } from "../core/interfaces";

export default function SlidingPuzzleUI() {
  const [board, setBoard] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [algorithm, setAlgorithm] = useState("astar-manhattan");
  const [result, setResult] = useState<SearchResult<PuzzleState, any> | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [isSolvable, setIsSolvable] = useState(true);
  const [playbackPath, setPlaybackPath] = useState<number[][]>([]);
  const [playbackIndex, setPlaybackIndex] = useState(-1);

  const shuffleBoard = () => {
    let newBoard = [...board];
    let solvable = false;
    while (!solvable) {
      newBoard.sort(() => Math.random() - 0.5);
      solvable = SlidingPuzzleProblem.isSolvable(newBoard);
    }
    setBoard(newBoard);
    setIsSolvable(true);
    setResult(null);
    setPlaybackPath([]);
    setPlaybackIndex(-1);
  };

  const solve = () => {
    if (!isSolvable) return;
    setIsSolving(true);
    setPlaybackPath([]);
    setPlaybackIndex(-1);
    
    setTimeout(() => {
      const isManhattan = algorithm.includes("manhattan");
      const algoType = algorithm.split("-")[0];
      
      const problem = new SlidingPuzzleProblem(
        new PuzzleState(board),
        isManhattan ? "manhattan" : "misplaced"
      );

      let algo;
      if (algoType === "astar") algo = new AStarSearch();
      else if (algoType === "greedy") algo = new GreedyBestFirstSearch();
      else algo = new BreadthFirstSearch();

      try {
        const res = algo.solve(problem);
        setResult(res);
        if (res.path) {
          const pathBoards = res.path.map(p => p.state.board);
          setPlaybackPath([board, ...pathBoards]);
          setPlaybackIndex(0);
        }
      } catch (e) {
        console.error(e);
      }
      setIsSolving(false);
    }, 50);
  };

  // Playback animation
  useEffect(() => {
    if (playbackPath.length > 0 && playbackIndex >= 0 && playbackIndex < playbackPath.length) {
      const timer = setTimeout(() => {
        setBoard(playbackPath[playbackIndex]);
        if (playbackIndex < playbackPath.length - 1) {
          setPlaybackIndex(i => i + 1);
        }
      }, 300); // 300ms per step
      return () => clearTimeout(timer);
    }
  }, [playbackPath, playbackIndex]);

  const size = Math.sqrt(board.length);

  return (
    <div className="grid-layout">
      <div className="glass-panel">
        <h2 style={{ marginBottom: "1rem" }}>Controls</h2>
        
        <div className="control-group">
          <div className="control-label">Algorithm & Heuristic</div>
          <select value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setResult(null); }}>
            <option value="astar-manhattan">A* (Manhattan Distance)</option>
            <option value="astar-misplaced">A* (Misplaced Tiles)</option>
            <option value="greedy-manhattan">Greedy (Manhattan Distance)</option>
            <option value="bfs">Breadth-First Search (Slow)</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={shuffleBoard} disabled={isSolving || (playbackIndex > 0 && playbackIndex < playbackPath.length - 1)}>
            Shuffle Solvable
          </button>
          <button className="btn" onClick={solve} disabled={isSolving || !isSolvable || (playbackIndex > 0 && playbackIndex < playbackPath.length - 1)}>
            {isSolving ? "Solving..." : "Solve Algorithm"}
          </button>
        </div>

        {!isSolvable && (
          <div style={{ color: "var(--accent)", marginTop: "1rem" }}>
            Current board is mathematically unsolvable. Please shuffle.
          </div>
        )}

        {result && playbackPath.length === 0 && !result.path && (
          <div style={{ color: "var(--accent)", marginTop: "1rem" }}>
            No solution found within limits.
          </div>
        )}

        {result && (
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-value">{result.path ? result.cost : "None"}</div>
              <div className="metric-label">Moves</div>
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
              <div className="metric-value">
                {playbackIndex >= 0 ? `${playbackIndex} / ${playbackPath.length - 1}` : "Done"}
              </div>
              <div className="metric-label">Playback Step</div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel visualization-area">
        <div 
          className="puzzle-board"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: "min(400px, 100%)", height: "min(400px, 100vw)" }}
        >
          {board.map((tile, i) => (
            <div key={i} className={`puzzle-tile ${tile === 0 ? "empty" : ""}`}>
              {tile !== 0 ? tile : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

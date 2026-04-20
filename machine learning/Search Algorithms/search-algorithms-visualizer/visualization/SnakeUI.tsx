"use client";

import { useState, useEffect, useRef } from "react";
import { SnakeState, SnakeProblem, SnakeAction } from "../problems/snake/snake";
import { AStarSearch } from "../algorithms/informed";
import { BreadthFirstSearch } from "../algorithms/uninformed";

export default function SnakeUI() {
  const gridSize = 20;
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState("astar");
  const [score, setScore] = useState(0);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = (currentSnake: { x: number; y: number }[]) => {
    let newFood:{x:number,y:number};
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      // Ensure food is not on snake
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setFood({ x: 5, y: 5 });
    setScore(0);
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    setIsAutoPlaying(false);
  };

  const getNextMove = (currentSnake: { x: number; y: number }[], currentFood: { x: number; y: number }) => {
    const initialState = new SnakeState(currentSnake[0], currentSnake.slice(1));
    const problem = new SnakeProblem(initialState, currentFood, gridSize, gridSize);
    const algo = algorithm === "astar" ? new AStarSearch() : new BreadthFirstSearch();

    try {
      const result = algo.solve(problem, 2000); // Limit to 2000 nodes to prevent UI freeze
      if (result.path && result.path.length > 0) {
        return result.path[0].action as SnakeAction;
      }
    } catch (e) {
      console.error("AI Error:", e);
    }
    
    // Fallback: If no path found (node limit reached or no route to food), pick any safe move
    const safeMoves = problem.getSuccessors(initialState);
    if (safeMoves.length > 0) {
      // Optional: sort to pick the move that brings it closer to food using manhattan distance
      safeMoves.sort((a, b) => problem.getHeuristic(a.state) - problem.getHeuristic(b.state));
      return safeMoves[0].action as SnakeAction;
    }

    return null; // AI truly trapped with 0 valid moves
  };

  const playStep = () => {
    setSnake((prevSnake) => {
      const nextAction = getNextMove(prevSnake, food);
      if (!nextAction) {
        // Snake is stuck
        setIsAutoPlaying(false);
        alert("Game Over! Snake got stuck.");
        return prevSnake;
      }

      let dx = 0, dy = 0;
      if (nextAction === "UP") dy = -1;
      else if (nextAction === "DOWN") dy = 1;
      else if (nextAction === "LEFT") dx = -1;
      else if (nextAction === "RIGHT") dx = 1;

      const newHead = { x: prevSnake[0].x + dx, y: prevSnake[0].y + dy };
      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 1);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  };

  useEffect(() => {
    if (isAutoPlaying) {
      gameLoopRef.current = setTimeout(() => {
        playStep();
      }, 100);
    }
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [snake, isAutoPlaying]);

  return (
    <div className="grid-layout">
      <div className="glass-panel">
        <h2 style={{ marginBottom: "1rem" }}>Snake AI Controls</h2>
        
        <div className="control-group">
          <div className="control-label">Algorithm</div>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} disabled={isAutoPlaying}>
            <option value="astar">A* Search (Fast)</option>
            <option value="bfs">Breadth-First Search</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button 
            className={`btn ${isAutoPlaying ? 'btn-secondary' : ''}`} 
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? "Pause AI" : "Start Auto-AI"}
          </button>
          <button className="btn btn-secondary" onClick={resetGame}>
            Reset
          </button>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-value">{score}</div>
            <div className="metric-label">Apples Eaten</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{snake.length}</div>
            <div className="metric-label">Length</div>
          </div>
        </div>
      </div>

      <div className="glass-panel visualization-area">
        <div 
          className="grid-board"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`, 
            width: "min(500px, 100%)", 
            height: "min(500px, 100vw)",
            backgroundColor: "rgba(0,0,0,0.8)",
            border: "2px solid var(--border-highlight)"
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            let bg = "transparent";
            if (isHead) bg = "var(--primary)";
            else if (isBody) bg = "var(--secondary)";
            else if (isFood) bg = "var(--accent)";

            return (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: bg,
                  borderRadius: isFood ? "50%" : isHead ? "4px" : "2px",
                  transition: isAutoPlaying ? "none" : "background-color 0.1s"
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

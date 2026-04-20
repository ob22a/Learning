"use client";

import { useState } from "react";
import GridPathfinderUI from "../visualization/GridPathfinderUI";
import SlidingPuzzleUI from "../visualization/SlidingPuzzleUI";
import SnakeUI from "../visualization/SnakeUI";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"grid" | "puzzle" | "snake">("grid");

  return (
    <div className="container">
      <h1 className="title">AI Search Algorithms</h1>
      <p className="subtitle">Interactive visualizer for informed and uninformed search strategies.</p>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === "grid" ? "active" : ""}`}
          onClick={() => setActiveTab("grid")}
        >
          Grid Pathfinding
        </button>
        <button 
          className={`tab ${activeTab === "puzzle" ? "active" : ""}`}
          onClick={() => setActiveTab("puzzle")}
        >
          Sliding Puzzle
        </button>
        <button 
          className={`tab ${activeTab === "snake" ? "active" : ""}`}
          onClick={() => setActiveTab("snake")}
        >
          Snake AI
        </button>
      </div>

      <div className="visualization-container">
        {activeTab === "grid" && <GridPathfinderUI />}
        {activeTab === "puzzle" && <SlidingPuzzleUI />}
        {activeTab === "snake" && <SnakeUI />}
      </div>
    </div>
  );
}


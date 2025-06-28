"use client";

import { useState, useEffect } from "react";
import { getOverlayState, useOverlayState, OverlayState } from "../lib/overlayState";
import MatchView from "./components/MatchView";
import StartingSoon from "./components/StartingSoon";
import Results from "./components/Results";

export default function Overlay() {
  const [currentTime, setCurrentTime] = useState("");
  const [overlayState, setLocalOverlayState] = useState<OverlayState>({
    mode: 'starting-soon',
    matchTitle: 'FRC Stream Overlay',
    matchTime: '00:00',
    gameFileLocation: '',
    redScore: 0,
    blueScore: 0,
    redOPR: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
    blueOPR: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
    lastUpdated: Date.now(),
  });

  useEffect(() => {
    // Load initial state
    const loadInitialState = async () => {
      const state = await getOverlayState();
      setLocalOverlayState(state);
    };
    
    loadInitialState();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const cleanup = useOverlayState((state) => {
      setLocalOverlayState(state);
    });

    return () => {
      clearInterval(timer);
      if (cleanup) cleanup();
    };
  }, []);

  const renderOverlayContent = () => {
    switch (overlayState.mode) {
      case 'match':
        return <MatchView state={overlayState} currentTime={currentTime} />;
      case 'results':
        return <Results state={overlayState} currentTime={currentTime} />;
      case 'starting-soon':
      default:
        return <StartingSoon state={overlayState} currentTime={currentTime} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      {renderOverlayContent()}
    </div>
  );
}
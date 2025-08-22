"use client";

import { useState, useEffect } from "react";
import { getOverlayState, subscribeToOverlayState, OverlayState } from "../lib/overlayState";
import MatchView from "./components/MatchView";
import StartingSoon from "./components/StartingSoon";
import Results from "./components/Results";
import SeriesIndicator from "./components/SeriesIndicator";

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
    seriesEnabled: false,
    seriesType: 'bo3',
    redAllianceName: 'Red Alliance',
    blueAllianceName: 'Blue Alliance',
    redSeriesScore: 0,
    blueSeriesScore: 0,
    allianceBranding: false,
    redTeamId: undefined,
    blueTeamId: undefined,
    redPrimaryColor: undefined,
    redSecondaryColor: undefined,
    bluePrimaryColor: undefined,
    blueSecondaryColor: undefined,
  });

  useEffect(() => {
    // Load initial state
    const loadInitialState = async () => {
      const state = await getOverlayState();
      setLocalOverlayState(state);
    };
    
    loadInitialState();
    
    // Subscribe to state changes
    const cleanup = subscribeToOverlayState((state) => {
      setLocalOverlayState(state);
    });
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

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
      {overlayState.seriesEnabled && (
        <SeriesIndicator
          seriesType={overlayState.seriesType}
          redScore={overlayState.redSeriesScore}
          blueScore={overlayState.blueSeriesScore}
          redAllianceName={overlayState.redAllianceName}
          blueAllianceName={overlayState.blueAllianceName}
          allianceBranding={overlayState.allianceBranding}
          redPrimaryColor={overlayState.redPrimaryColor}
          redSecondaryColor={overlayState.redSecondaryColor}
          bluePrimaryColor={overlayState.bluePrimaryColor}
          blueSecondaryColor={overlayState.blueSecondaryColor}
          flippedTeams={overlayState.flippedTeams}
        />
      )}
      {renderOverlayContent()}
    </div>
  );
}
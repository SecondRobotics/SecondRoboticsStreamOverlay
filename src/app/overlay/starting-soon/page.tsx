"use client";

import { useState, useEffect } from "react";
import { getOverlayState, subscribeToOverlayState, OverlayState } from "../../lib/overlayState";
import StartingSoon from "../components/StartingSoon";
import SeriesIndicator from "../components/SeriesIndicator";

export default function StartingSoonOverlay() {
  const [currentTime, setCurrentTime] = useState("");
  const [overlayState, setLocalOverlayState] = useState<OverlayState>({
    mode: 'starting-soon',
    matchTitle: 'FRC Stream Overlay',
    matchTime: '00:00',
    gameFileLocation: '',
    gameState: '',
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
    // Tournament mode
    tournamentModeEnabled: false,
    tournamentPath: '',
    matchNumber: '',
    redTeamId: undefined,
    blueTeamId: undefined,
    redPrimaryColor: undefined,
    redSecondaryColor: undefined,
    bluePrimaryColor: undefined,
    blueSecondaryColor: undefined,
    // Field 2 properties
    field2Enabled: false,
    field2MatchTime: '00:00',
    field2GameFileLocation: '',
    field2GameState: '',
    field2RedScore: 0,
    field2BlueScore: 0,
    field2RedOPR: [],
    field2BlueOPR: [],
    field2SeriesEnabled: false,
    field2SeriesType: 'bo3',
    field2RedAllianceName: 'Red Alliance',
    field2BlueAllianceName: 'Blue Alliance',
    field2RedSeriesScore: 0,
    field2BlueSeriesScore: 0,
    field2AllianceBranding: false,
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
        />
      )}
      <StartingSoon state={overlayState} currentTime={currentTime} />
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { subscribeToOverlayState, OverlayState } from "../../../lib/overlayState";
import MatchView from "../../components/MatchView";
import SeriesIndicator from "../../components/SeriesIndicator";

export default function Field2MatchViewPage() {
  const [overlayState, setOverlayState] = useState<OverlayState | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Force high speed polling for match view
    const unsubscribe = subscribeToOverlayState((state) => {
      setOverlayState(state);
    }, { forceHighSpeed: true });

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(timer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!overlayState || !overlayState.field2Enabled) {
    return null;
  }

  // Map Field 2 properties to Field 1 format for MatchView component
  const field2State: OverlayState = {
    ...overlayState,
    matchTitle: overlayState.matchTitle, // Shared event name
    matchTime: overlayState.field2MatchTime || '00:00',
    gameFileLocation: overlayState.field2GameFileLocation || '',
    redScore: overlayState.field2RedScore || 0,
    blueScore: overlayState.field2BlueScore || 0,
    redOPR: overlayState.field2RedOPR || [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
    blueOPR: overlayState.field2BlueOPR || [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
    seriesEnabled: overlayState.field2SeriesEnabled || false,
    seriesType: overlayState.field2SeriesType || 'bo3',
    redAllianceName: overlayState.field2RedAllianceName || 'Red Alliance',
    blueAllianceName: overlayState.field2BlueAllianceName || 'Blue Alliance',
    redSeriesScore: overlayState.field2RedSeriesScore || 0,
    blueSeriesScore: overlayState.field2BlueSeriesScore || 0,
    redTeamId: overlayState.field2RedTeamId,
    blueTeamId: overlayState.field2BlueTeamId,
    redPrimaryColor: overlayState.field2RedPrimaryColor,
    redSecondaryColor: overlayState.field2RedSecondaryColor,
    bluePrimaryColor: overlayState.field2BluePrimaryColor,
    blueSecondaryColor: overlayState.field2BlueSecondaryColor,
    allianceBranding: overlayState.field2AllianceBranding || false,
    flippedTeams: overlayState.field2FlippedTeams || false,
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      {field2State.seriesEnabled && (
        <SeriesIndicator 
          seriesType={field2State.seriesType}
          redScore={field2State.redSeriesScore}
          blueScore={field2State.blueSeriesScore}
          redAllianceName={field2State.redAllianceName}
          blueAllianceName={field2State.blueAllianceName}
          allianceBranding={field2State.allianceBranding}
          redPrimaryColor={field2State.redPrimaryColor}
          redSecondaryColor={field2State.redSecondaryColor}
          bluePrimaryColor={field2State.bluePrimaryColor}
          blueSecondaryColor={field2State.blueSecondaryColor}
          flippedTeams={field2State.flippedTeams}
        />
      )}
      <MatchView state={field2State} currentTime={currentTime} />
    </div>
  );
}
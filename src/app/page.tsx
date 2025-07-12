"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getOverlayState, setOverlayState, useOverlayState, OverlayState } from "./lib/overlayState";
import FileViewer from "./components/FileViewer";
import { Team, loadTeams } from "./lib/teams";

export default function Dashboard() {
  const [overlayUrl, setOverlayUrl] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [overlayState, setLocalOverlayState] = useState<OverlayState>({
    mode: 'starting-soon',
    matchTitle: 'FRC Stream Overlay',
    matchTime: '00:00',
    startingTime: '',
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
  });
  const [isEditing, setIsEditing] = useState<string | null>(null);

  useEffect(() => {
    // Load initial state and teams
    const loadInitialData = async () => {
      const [state, teamsData] = await Promise.all([
        getOverlayState(),
        loadTeams()
      ]);
      setLocalOverlayState(state);
      setTeams(teamsData);
    };
    
    loadInitialData();
    
    const cleanup = useOverlayState((state) => {
      // Only update state if user isn't currently editing a field
      if (!isEditing) {
        setLocalOverlayState(state);
      }
    });
    
    return cleanup;
  }, [isEditing]);

  const copyOverlayUrl = async () => {
    const url = `${window.location.origin}/overlay`;
    setOverlayUrl(url);
    await navigator.clipboard.writeText(url);
    alert("Overlay URL copied to clipboard!");
  };

  const setOverlayMode = async (mode: OverlayState['mode']) => {
    // Update local state immediately for instant UI feedback
    setLocalOverlayState(prev => ({ ...prev, mode }));
    // Then update server state
    await setOverlayState({ mode });
  };

  const updateOverlayData = async (field: string, value: string | number) => {
    // Update local state immediately for instant UI feedback
    setLocalOverlayState(prev => ({ ...prev, [field]: value }));
    // Then update server state
    await setOverlayState({ [field]: value });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Stream Overlay Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and manage your stream overlay settings
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Overlay Management
            </h2>
            <div className="space-y-3">
              <Link
                href="/overlay"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-center transition-colors"
              >
                View Overlay
              </Link>
              <button
                onClick={copyOverlayUrl}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Copy Overlay URL
              </button>
              {overlayUrl && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 break-all">
                  {overlayUrl}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Overlay Mode
            </h2>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Current: <span className="font-medium capitalize">{overlayState.mode.replace('-', ' ')}</span>
              </div>
              <button
                onClick={() => setOverlayMode('starting-soon')}
                className={`w-full font-medium py-2 px-4 rounded-md transition-colors ${
                  overlayState.mode === 'starting-soon' 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white'
                }`}
              >
                Starting Soon
              </button>
              <button
                onClick={() => setOverlayMode('match')}
                className={`w-full font-medium py-2 px-4 rounded-md transition-colors ${
                  overlayState.mode === 'match' 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white'
                }`}
              >
                Match View
              </button>
              <button
                onClick={() => setOverlayMode('results')}
                className={`w-full font-medium py-2 px-4 rounded-md transition-colors ${
                  overlayState.mode === 'results' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white'
                }`}
              >
                Results
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Display Settings
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={overlayState.matchTitle}
                  onChange={(e) => setLocalOverlayState(prev => ({ ...prev, matchTitle: e.target.value }))}
                  onFocus={() => setIsEditing('matchTitle')}
                  onBlur={(e) => {
                    setIsEditing(null);
                    updateOverlayData('matchTitle', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter event name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Starting Time
                </label>
                <input
                  type="datetime-local"
                  value={overlayState.startingTime || ''}
                  onChange={(e) => setLocalOverlayState(prev => ({ ...prev, startingTime: e.target.value }))}
                  onFocus={() => setIsEditing('startingTime')}
                  onBlur={(e) => {
                    setIsEditing(null);
                    updateOverlayData('startingTime', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Scores are automatically read from Score_R.txt and Score_B.txt files in the game file location.
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Game File Settings
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Game File Location
                </label>
                <input
                  type="text"
                  value={overlayState.gameFileLocation}
                  onChange={(e) => setLocalOverlayState(prev => ({ ...prev, gameFileLocation: e.target.value }))}
                  onFocus={() => setIsEditing('gameFileLocation')}
                  onBlur={(e) => {
                    setIsEditing(null);
                    updateOverlayData('gameFileLocation', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter game file path or URL"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Path to your game data file (e.g., /path/to/game.json or https://example.com/game.json)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Best-of Series Settings
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="seriesEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Best-of Series
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={overlayState.seriesEnabled}
                  onClick={() => {
                    const enabled = !overlayState.seriesEnabled;
                    setLocalOverlayState(prev => ({ ...prev, seriesEnabled: enabled }));
                    setOverlayState({ seriesEnabled: enabled });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    overlayState.seriesEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span className="sr-only">Enable Best-of Series</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      overlayState.seriesEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {overlayState.seriesEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <label htmlFor="allianceBranding" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Alliance Branding
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={overlayState.allianceBranding}
                      onClick={() => {
                        const enabled = !overlayState.allianceBranding;
                        setLocalOverlayState(prev => ({ ...prev, allianceBranding: enabled }));
                        setOverlayState({ allianceBranding: enabled });
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        overlayState.allianceBranding ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span className="sr-only">Enable Alliance Branding</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          overlayState.allianceBranding ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Series Type
                    </label>
                    <select
                      value={overlayState.seriesType}
                      onChange={(e) => {
                        const seriesType = e.target.value as 'bo3' | 'bo5' | 'bo7';
                        setLocalOverlayState(prev => ({ ...prev, seriesType, redSeriesScore: 0, blueSeriesScore: 0 }));
                        setOverlayState({ seriesType, redSeriesScore: 0, blueSeriesScore: 0 });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="bo3">Best of 3</option>
                      <option value="bo5">Best of 5</option>
                      <option value="bo7">Best of 7</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Red Alliance Name
                      </label>
                      <input
                        type="text"
                        value={overlayState.redAllianceName}
                        onChange={(e) => setLocalOverlayState(prev => ({ ...prev, redAllianceName: e.target.value }))}
                        onFocus={() => setIsEditing('redAllianceName')}
                        onBlur={(e) => {
                          setIsEditing(null);
                          updateOverlayData('redAllianceName', e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Red Alliance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Blue Alliance Name
                      </label>
                      <input
                        type="text"
                        value={overlayState.blueAllianceName}
                        onChange={(e) => setLocalOverlayState(prev => ({ ...prev, blueAllianceName: e.target.value }))}
                        onFocus={() => setIsEditing('blueAllianceName')}
                        onBlur={(e) => {
                          setIsEditing(null);
                          updateOverlayData('blueAllianceName', e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Blue Alliance"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Red Team
                      </label>
                      <select
                        value={overlayState.redTeamId || ''}
                        onChange={(e) => {
                          const teamId = e.target.value;
                          const team = teams.find(t => t.id === teamId);
                          if (team) {
                            setLocalOverlayState(prev => ({ 
                              ...prev, 
                              redTeamId: team.id,
                              redAllianceName: team.name,
                              redPrimaryColor: team.primaryColor,
                              redSecondaryColor: team.secondaryColor
                            }));
                            setOverlayState({ 
                              redTeamId: team.id,
                              redAllianceName: team.name,
                              redPrimaryColor: team.primaryColor,
                              redSecondaryColor: team.secondaryColor
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Custom Team</option>
                        {teams.length > 0 ? teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        )) : <option disabled>Loading teams...</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Blue Team
                      </label>
                      <select
                        value={overlayState.blueTeamId || ''}
                        onChange={(e) => {
                          const teamId = e.target.value;
                          const team = teams.find(t => t.id === teamId);
                          if (team) {
                            setLocalOverlayState(prev => ({ 
                              ...prev, 
                              blueTeamId: team.id,
                              blueAllianceName: team.name,
                              bluePrimaryColor: team.primaryColor,
                              blueSecondaryColor: team.secondaryColor
                            }));
                            setOverlayState({ 
                              blueTeamId: team.id,
                              blueAllianceName: team.name,
                              bluePrimaryColor: team.primaryColor,
                              blueSecondaryColor: team.secondaryColor
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Custom Team</option>
                        {teams.length > 0 ? teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        )) : <option disabled>Loading teams...</option>}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Red Series Score
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newScore = Math.max(0, overlayState.redSeriesScore - 1);
                            setLocalOverlayState(prev => ({ ...prev, redSeriesScore: newScore }));
                            setOverlayState({ redSeriesScore: newScore });
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold text-lg">{overlayState.redSeriesScore}</span>
                        <button
                          onClick={() => {
                            const maxWins = overlayState.seriesType === 'bo3' ? 2 : overlayState.seriesType === 'bo5' ? 3 : 4;
                            const newScore = Math.min(maxWins, overlayState.redSeriesScore + 1);
                            setLocalOverlayState(prev => ({ ...prev, redSeriesScore: newScore }));
                            setOverlayState({ redSeriesScore: newScore });
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Blue Series Score
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newScore = Math.max(0, overlayState.blueSeriesScore - 1);
                            setLocalOverlayState(prev => ({ ...prev, blueSeriesScore: newScore }));
                            setOverlayState({ blueSeriesScore: newScore });
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold text-lg">{overlayState.blueSeriesScore}</span>
                        <button
                          onClick={() => {
                            const maxWins = overlayState.seriesType === 'bo3' ? 2 : overlayState.seriesType === 'bo5' ? 3 : 4;
                            const newScore = Math.min(maxWins, overlayState.blueSeriesScore + 1);
                            setLocalOverlayState(prev => ({ ...prev, blueSeriesScore: newScore }));
                            setOverlayState({ blueSeriesScore: newScore });
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* File Viewer Widget */}
        <div className="mt-8">
          <FileViewer key={overlayState.gameFileLocation} gameFileLocation={overlayState.gameFileLocation} />
        </div>
      </div>
    </div>
  );
}

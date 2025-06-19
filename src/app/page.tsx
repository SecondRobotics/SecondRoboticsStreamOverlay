"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getOverlayState, setOverlayState, useOverlayState, OverlayState } from "./lib/overlayState";

export default function Dashboard() {
  const [overlayUrl, setOverlayUrl] = useState("");
  const [overlayState, setLocalOverlayState] = useState<OverlayState>({
    mode: 'starting-soon',
    matchTitle: 'FRC Stream Overlay',
    matchTime: '00:00',
    alliance1Score: 0,
    alliance2Score: 0,
    lastUpdated: Date.now(),
  });

  useEffect(() => {
    // Load initial state
    const loadInitialState = async () => {
      const state = await getOverlayState();
      setLocalOverlayState(state);
    };
    
    loadInitialState();
    
    const cleanup = useOverlayState((state) => {
      setLocalOverlayState(state);
    });
    
    return cleanup;
  }, []);

  const copyOverlayUrl = async () => {
    const url = `${window.location.origin}/overlay`;
    setOverlayUrl(url);
    await navigator.clipboard.writeText(url);
    alert("Overlay URL copied to clipboard!");
  };

  const setOverlayMode = (mode: OverlayState['mode']) => {
    setOverlayState({ mode });
  };

  const updateOverlayData = (field: string, value: string | number) => {
    setOverlayState({ [field]: value });
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
                  defaultValue={overlayState.matchTitle}
                  onBlur={(e) => updateOverlayData('matchTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter event name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alliance 1
                  </label>
                  <input
                    type="number"
                    defaultValue={overlayState.alliance1Score}
                    onBlur={(e) => updateOverlayData('alliance1Score', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alliance 2
                  </label>
                  <input
                    type="number"
                    defaultValue={overlayState.alliance2Score}
                    onBlur={(e) => updateOverlayData('alliance2Score', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

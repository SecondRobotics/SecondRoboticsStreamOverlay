import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOverlaySocket } from '../lib/useOverlaySocket';
import { OverlayState } from '../types/overlay';

export default function Dashboard() {
  const { state, updateState, isConnected } = useOverlaySocket();
  const [overlayUrl, setOverlayUrl] = useState('');

  const copyOverlayUrl = async () => {
    const url = `${window.location.origin}/overlay`;
    setOverlayUrl(url);
    await navigator.clipboard.writeText(url);
    alert('Overlay URL copied to clipboard!');
  };

  const setOverlayMode = (mode: OverlayState['mode']) => {
    updateState({ mode });
  };

  const handleFieldChange = (field: keyof OverlayState, value: string | number) => {
    updateState({ [field]: value });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Stream Overlay Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure and manage your stream overlay settings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Overlay Management
            </h2>
            <div className="space-y-3">
              <Link
                to="/overlay"
                target="_blank"
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
                Current:{' '}
                <span className="font-medium capitalize">{state.mode.replace('-', ' ')}</span>
              </div>
              <button
                onClick={() => setOverlayMode('starting-soon')}
                className={`w-full font-medium py-2 px-4 rounded-md transition-colors ${
                  state.mode === 'starting-soon'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white'
                }`}
              >
                Starting Soon
              </button>
              <button
                onClick={() => setOverlayMode('match')}
                className={`w-full font-medium py-2 px-4 rounded-md transition-colors ${
                  state.mode === 'match'
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
                  value={state.matchTitle}
                  onChange={(e) => handleFieldChange('matchTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter event name"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Scores are automatically read from Score_R.txt and Score_B.txt files in the game
                file location.
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
                  value={state.gameFileLocation}
                  onChange={(e) => handleFieldChange('gameFileLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter game file path"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Local directory path containing Score_R.txt, Score_B.txt, Timer.txt, and OPR.txt
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Live Data Preview
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Red Score:</span>
                <span className="font-mono text-red-600 dark:text-red-400">{state.redScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Blue Score:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{state.blueScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Match Time:</span>
                <span className="font-mono">{state.matchTime}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="text-gray-600 dark:text-gray-400 mb-1">Red OPR:</div>
                {state.redOPR.map((p, i) => (
                  <div key={i} className="text-xs text-red-600 dark:text-red-400 pl-2">
                    {p.username || '(empty)'}: {p.score}
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="text-gray-600 dark:text-gray-400 mb-1">Blue OPR:</div>
                {state.blueOPR.map((p, i) => (
                  <div key={i} className="text-xs text-blue-600 dark:text-blue-400 pl-2">
                    {p.username || '(empty)'}: {p.score}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

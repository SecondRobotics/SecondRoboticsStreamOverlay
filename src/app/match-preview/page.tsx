'use client';

import { useState, useEffect, useMemo } from 'react';
import { OverlayState } from '../lib/overlayState';
import { Team, loadTeams } from '../lib/teams';
import Image from 'next/image';

export default function MatchPreview() {
  const [state, setState] = useState<OverlayState | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch('/api/overlay-state');
        const data = await response.json();
        setState(data);
      } catch (error) {
        console.error('Error fetching overlay state:', error);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadTeams().then(setTeams);
  }, []);

  // Function to get team logo path based on team name
  const getTeamLogoPath = (teamName: string): string | null => {
    if (!teamName) return null;
    
    // Map team names to logo file names
    const logoMap: { [key: string]: string } = {
      'PL:UNC': 'PL_UNC.PNG',
      'Team Cooked': 'Team Cooked.png',
      'Kryptonite': 'Kryptonite.png'
    };
    
    const logoFileName = logoMap[teamName];
    return logoFileName ? `/Team_Logos/${logoFileName}` : null;
  };

  // Find teams based on IDs
  const redTeam = useMemo(() => 
    teams.find(t => t.id === state?.redTeamId), 
    [teams, state?.redTeamId]
  );
  
  const blueTeam = useMemo(() => 
    teams.find(t => t.id === state?.blueTeamId), 
    [teams, state?.blueTeamId]
  );


  const renderSeriesBoxes = (score: number, color: 'red' | 'blue') => {
    if (!state?.seriesEnabled) return null;
    
    const totalGames = state.seriesType === 'bo3' ? 3 : state.seriesType === 'bo5' ? 5 : 7;
    const winsNeeded = Math.ceil(totalGames / 2);
    const boxes = [];
    
    const useCustomColor = color === 'red' ? 
      (state.allianceBranding && state.redPrimaryColor) : 
      (state.allianceBranding && state.bluePrimaryColor);
    const customColor = color === 'red' ? state.redPrimaryColor : state.bluePrimaryColor;
    
    for (let i = 0; i < winsNeeded; i++) {
      const isWon = i < score;
      
      const boxStyle: React.CSSProperties = {};
      if (isWon && useCustomColor) {
        boxStyle.backgroundColor = customColor;
        boxStyle.boxShadow = `0 10px 15px -3px ${customColor}80`;
      }
      
      boxes.push(
        <div
          key={i}
          className={`w-12 h-4 rounded transition-all duration-300 ${
            !useCustomColor ? (
              isWon 
                ? color === 'red' 
                  ? 'bg-red-600 shadow-lg shadow-red-600/50' 
                  : 'bg-blue-600 shadow-lg shadow-blue-600/50'
                : 'bg-gray-700 opacity-50'
            ) : (
              isWon ? '' : 'bg-gray-700 opacity-50'
            )
          }`}
          style={boxStyle}
        />
      );
    }
    return boxes;
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col relative z-10">
        
        {/* Event Name */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-4xl font-bold text-white tracking-wide">{state.matchTitle}</h1>
        </div>

        {/* VS Layout */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Red Alliance */}
          <div 
            className="flex-1 flex flex-col items-center justify-center relative animate-pulse-slow"
            style={{
              background: state.allianceBranding && state.redPrimaryColor 
                ? `linear-gradient(to right, ${state.redPrimaryColor}, ${state.redSecondaryColor || state.redPrimaryColor})`
                : 'linear-gradient(to right, rgba(220, 38, 38, 0.3), rgba(239, 68, 68, 0.2))'
            }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent animate-float"></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-float-delayed"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-red-400/10 rounded-full blur-lg animate-bounce-slow"></div>
            
            <div className="text-center relative z-10">
              {/* Team Logo */}
              {state.allianceBranding && getTeamLogoPath(state.redAllianceName) && (
                <div className="mb-6 w-96 h-96 mx-auto relative">
                  <Image
                    src={getTeamLogoPath(state.redAllianceName)!}
                    alt={state.redAllianceName}
                    width={384}
                    height={384}
                    style={{ objectFit: 'contain' }}
                    className="drop-shadow-lg"
                  />
                </div>
              )}
              
              <h2 className="text-7xl font-black text-red-300 tracking-wider animate-glow-red">
                {state.seriesEnabled ? state.redAllianceName : 'RED'}
              </h2>
              
              {/* Team Players */}
              {state.allianceBranding && redTeam?.players && (
                <div className="mt-6 space-y-2">
                  {redTeam.players.map((player, index) => (
                    <div key={index} className="text-xl text-red-200/80 font-medium">
                      {player}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Color Reference */}
              {state.allianceBranding && state.redPrimaryColor && (
                <div className="mt-6 flex gap-2 justify-center">
                  <div 
                    className="w-12 h-12 rounded border-2 border-white/50"
                    style={{ backgroundColor: state.redPrimaryColor }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-12 h-12 rounded border-2 border-white/50"
                    style={{ backgroundColor: state.redSecondaryColor || state.redPrimaryColor }}
                    title="Secondary Color"
                  />
                </div>
              )}
            </div>
            
            {/* Red Series Indicator - Bottom */}
            {state.seriesEnabled && (
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-black/60 backdrop-blur-sm border border-red-500/30 rounded-lg p-4">
                  <div className="flex space-x-3 justify-center">
                    {renderSeriesBoxes(state.redSeriesScore, 'red')}
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Blue Alliance */}
          <div 
            className="flex-1 flex flex-col items-center justify-center relative animate-pulse-slow"
            style={{
              background: state.allianceBranding && state.bluePrimaryColor 
                ? `linear-gradient(to left, ${state.bluePrimaryColor}, ${state.blueSecondaryColor || state.bluePrimaryColor})`
                : 'linear-gradient(to left, rgba(37, 99, 235, 0.3), rgba(59, 130, 246, 0.2))'
            }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-400/5 to-transparent animate-float"></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-float-delayed"></div>
            <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-lg animate-bounce-slow"></div>
            
            <div className="text-center relative z-10">
              {/* Team Logo */}
              {state.allianceBranding && getTeamLogoPath(state.blueAllianceName) && (
                <div className="mb-6 w-96 h-96 mx-auto relative">
                  <Image
                    src={getTeamLogoPath(state.blueAllianceName)!}
                    alt={state.blueAllianceName}
                    width={384}
                    height={384}
                    style={{ objectFit: 'contain' }}
                    className="drop-shadow-lg"
                  />
                </div>
              )}
              
              <h2 className="text-7xl font-black text-blue-300 tracking-wider animate-glow-blue">
                {state.seriesEnabled ? state.blueAllianceName : 'BLUE'}
              </h2>
              
              {/* Team Players */}
              {state.allianceBranding && blueTeam?.players && (
                <div className="mt-6 space-y-2">
                  {blueTeam.players.map((player, index) => (
                    <div key={index} className="text-xl text-blue-200/80 font-medium">
                      {player}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Color Reference */}
              {state.allianceBranding && state.bluePrimaryColor && (
                <div className="mt-6 flex gap-2 justify-center">
                  <div 
                    className="w-12 h-12 rounded border-2 border-white/50"
                    style={{ backgroundColor: state.bluePrimaryColor }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-12 h-12 rounded border-2 border-white/50"
                    style={{ backgroundColor: state.blueSecondaryColor || state.bluePrimaryColor }}
                    title="Secondary Color"
                  />
                </div>
              )}
            </div>
            
            {/* Blue Series Indicator - Bottom */}
            {state.seriesEnabled && (
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
                  <div className="flex space-x-3 justify-center">
                    {renderSeriesBoxes(state.blueSeriesScore, 'blue')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes pulse-glow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            transform: scale(1);
          }
          50% { 
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
            transform: scale(1.05);
          }
        }

        @keyframes glow-red {
          0%, 100% { 
            text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
          }
          50% { 
            text-shadow: 0 0 40px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.3);
          }
        }

        @keyframes glow-blue {
          0%, 100% { 
            text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
          }
          50% { 
            text-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.3);
          }
        }

        @keyframes border-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-glow-red {
          animation: glow-red 3s ease-in-out infinite;
        }

        .animate-glow-blue {
          animation: glow-blue 3s ease-in-out infinite;
        }

        .animate-border-glow {
          animation: border-glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
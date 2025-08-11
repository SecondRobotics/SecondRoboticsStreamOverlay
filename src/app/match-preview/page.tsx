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
        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm border-b border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          <div className="relative z-10 text-center py-3">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              {state.matchTitle}
            </h1>
          </div>
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
            <div className="absolute inset-0 animate-float" style={{
              background: state.allianceBranding && state.redSecondaryColor
                ? `radial-gradient(circle at 30% 50%, ${state.redSecondaryColor}10, transparent)`
                : 'radial-gradient(circle at 30% 50%, rgba(239, 68, 68, 0.05), transparent)'
            }}></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-xl animate-float-delayed" style={{
              backgroundColor: state.allianceBranding && state.redPrimaryColor
                ? `${state.redPrimaryColor}15`
                : 'rgba(239, 68, 68, 0.1)'
            }}></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full blur-lg animate-bounce-slow" style={{
              backgroundColor: state.allianceBranding && state.redSecondaryColor
                ? `${state.redSecondaryColor}15`
                : 'rgba(248, 113, 113, 0.1)'
            }}></div>
            
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
                    className="w-96 h-96"
                    className="drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_35px_70px_rgba(0,0,0,0.9)] transition-all duration-300 animate-float-subtle"
                  />
                </div>
              )}
              
              <h2 
                className="text-7xl font-black tracking-wider drop-shadow-2xl"
                style={{
                  color: state.allianceBranding && state.redPrimaryColor ? 'white' : '#fca5a5',
                  textShadow: state.allianceBranding && state.redPrimaryColor 
                    ? `0 0 40px ${state.redPrimaryColor}, 0 0 80px ${state.redSecondaryColor || state.redPrimaryColor}`
                    : undefined
                }}
              >
                {state.seriesEnabled ? state.redAllianceName : 'RED'}
              </h2>
              
              {/* Team Players */}
              {state.allianceBranding && redTeam?.players && (
                <div className="mt-6">
                  <div 
                    className="backdrop-blur-sm rounded-lg px-4 py-2 border"
                    style={{
                      backgroundColor: state.redSecondaryColor ? `${state.redSecondaryColor}20` : 'rgba(0, 0, 0, 0.3)',
                      borderColor: state.redPrimaryColor ? `${state.redPrimaryColor}40` : 'rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    {redTeam.players.map((player, index) => (
                      <div key={index} className="text-lg text-white font-medium">
                        {player}
                      </div>
                    ))}
                  </div>
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
            <div className="absolute inset-0 animate-float" style={{
              background: state.allianceBranding && state.blueSecondaryColor
                ? `radial-gradient(circle at 70% 50%, ${state.blueSecondaryColor}10, transparent)`
                : 'radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.05), transparent)'
            }}></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full blur-xl animate-float-delayed" style={{
              backgroundColor: state.allianceBranding && state.bluePrimaryColor
                ? `${state.bluePrimaryColor}15`
                : 'rgba(59, 130, 246, 0.1)'
            }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full blur-lg animate-bounce-slow" style={{
              backgroundColor: state.allianceBranding && state.blueSecondaryColor
                ? `${state.blueSecondaryColor}15`
                : 'rgba(96, 165, 250, 0.1)'
            }}></div>
            
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
                    className="w-96 h-96"
                    className="drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_35px_70px_rgba(0,0,0,0.9)] transition-all duration-300 animate-float-subtle"
                  />
                </div>
              )}
              
              <h2 
                className="text-7xl font-black tracking-wider drop-shadow-2xl"
                style={{
                  color: state.allianceBranding && state.bluePrimaryColor ? 'white' : '#93c5fd',
                  textShadow: state.allianceBranding && state.bluePrimaryColor 
                    ? `0 0 40px ${state.bluePrimaryColor}, 0 0 80px ${state.blueSecondaryColor || state.bluePrimaryColor}`
                    : undefined
                }}
              >
                {state.seriesEnabled ? state.blueAllianceName : 'BLUE'}
              </h2>
              
              {/* Team Players */}
              {state.allianceBranding && blueTeam?.players && (
                <div className="mt-6">
                  <div 
                    className="backdrop-blur-sm rounded-lg px-4 py-2 border"
                    style={{
                      backgroundColor: state.blueSecondaryColor ? `${state.blueSecondaryColor}20` : 'rgba(0, 0, 0, 0.3)',
                      borderColor: state.bluePrimaryColor ? `${state.bluePrimaryColor}40` : 'rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    {blueTeam.players.map((player, index) => (
                      <div key={index} className="text-lg text-white font-medium">
                        {player}
                      </div>
                    ))}
                  </div>
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

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes float-subtle {
          0% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(2deg); }
          50% { transform: translateY(-8px) rotate(0deg); }
          75% { transform: translateY(-18px) rotate(-2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
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

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-float-subtle {
          animation: float-subtle 8s linear infinite;
        }
      `}</style>
    </>
  );
}
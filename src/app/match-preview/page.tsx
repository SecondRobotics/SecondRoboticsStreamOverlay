'use client';

import { useState, useEffect, useMemo } from 'react';
import { OverlayState } from '../lib/overlayState';
import { Team, loadTeams } from '../lib/teams';
import Image from 'next/image';

export default function MatchPreview() {
  const [state, setState] = useState<OverlayState | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournamentPlayers, setTournamentPlayers] = useState<{red: string[], blue: string[]}>({red: [], blue: []});

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

  // Use tournament players from overlay state
  useEffect(() => {
    if (state?.tournamentModeEnabled && (state?.tournamentRedPlayers || state?.tournamentBluePlayers)) {
      setTournamentPlayers({
        red: state.tournamentRedPlayers || [],
        blue: state.tournamentBluePlayers || []
      });
    } else {
      setTournamentPlayers({red: [], blue: []});
    }
  }, [state?.tournamentModeEnabled, state?.tournamentRedPlayers, state?.tournamentBluePlayers]);


  // Find teams based on IDs
  const redTeam = useMemo(() => 
    teams.find(t => t.id === state?.redTeamId), 
    [teams, state?.redTeamId]
  );
  
  const blueTeam = useMemo(() => 
    teams.find(t => t.id === state?.blueTeamId), 
    [teams, state?.blueTeamId]
  );

  // Swap team data when flipped
  const leftTeam = state?.flippedTeams ? blueTeam : redTeam;
  const rightTeam = state?.flippedTeams ? redTeam : blueTeam;
  const leftAllianceName = state?.flippedTeams ? state?.blueAllianceName : state?.redAllianceName;
  const rightAllianceName = state?.flippedTeams ? state?.redAllianceName : state?.blueAllianceName;
  const leftSeriesScore = state?.flippedTeams ? state?.blueSeriesScore : state?.redSeriesScore;
  const rightSeriesScore = state?.flippedTeams ? state?.redSeriesScore : state?.blueSeriesScore;
  const leftPrimaryColor = state?.flippedTeams ? state?.bluePrimaryColor : state?.redPrimaryColor;
  const rightPrimaryColor = state?.flippedTeams ? state?.redPrimaryColor : state?.bluePrimaryColor;
  const leftSecondaryColor = state?.flippedTeams ? state?.blueSecondaryColor : state?.redSecondaryColor;
  const rightSecondaryColor = state?.flippedTeams ? state?.redSecondaryColor : state?.blueSecondaryColor;
  const leftIsRed = !state?.flippedTeams;
  const rightIsRed = !!state?.flippedTeams;

  // Tournament players (considering flipped teams)
  const leftTournamentPlayers = state?.flippedTeams ? tournamentPlayers.blue : tournamentPlayers.red;
  const rightTournamentPlayers = state?.flippedTeams ? tournamentPlayers.red : tournamentPlayers.blue;


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
      }
      
      boxes.push(
        <div
          key={i}
          className={`w-12 h-4 rounded transition-all duration-300 ${
            !useCustomColor ? (
              isWon 
                ? color === 'red' 
                  ? 'bg-red-600' 
                  : 'bg-blue-600'
                : 'bg-white opacity-30'
            ) : (
              isWon ? '' : 'bg-white opacity-30'
            )
          }`}
          style={{
            ...boxStyle,
            boxShadow: isWon 
              ? useCustomColor && customColor
                ? `0 0 30px ${customColor}, 0 0 60px ${customColor}99`
                : (color === 'red' ? '0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.6)' : '0 0 30px rgba(59, 130, 246, 1), 0 0 60px rgba(59, 130, 246, 0.6)')
              : '0 0 20px rgba(255, 255, 255, 0.4)'
          }}
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
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Complex abstract noise pattern */}
        <div className="absolute inset-0 opacity-12" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 50%),
            conic-gradient(from 0deg at 60% 80%, transparent 0deg, rgba(255,255,255,0.15) 90deg, transparent 180deg, rgba(255,255,255,0.1) 270deg, transparent 360deg)
          `,
          backgroundSize: '800px 600px, 600px 800px, 400px 400px, 1000px 1000px',
          filter: 'blur(1px)'
        }}></div>
        {/* Flowing organic shapes */}
        <div className="absolute inset-0 opacity-8" style={{
          backgroundImage: `
            radial-gradient(ellipse 400px 200px at 10% 60%, rgba(255,255,255,0.1) 0%, transparent 40%),
            radial-gradient(ellipse 300px 600px at 90% 30%, rgba(255,255,255,0.08) 0%, transparent 35%),
            radial-gradient(ellipse 500px 150px at 50% 90%, rgba(255,255,255,0.12) 0%, transparent 45%)
          `,
          backgroundSize: '1200px 800px, 800px 1200px, 1000px 600px',
          transform: 'rotate(15deg) scale(1.2)'
        }}></div>
        {/* Random scattered dots */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `radial-gradient(circle at 15% 35%, white 1px, transparent 2px),
                           radial-gradient(circle at 85% 15%, white 1.5px, transparent 2px),
                           radial-gradient(circle at 35% 85%, white 1px, transparent 2px),
                           radial-gradient(circle at 65% 65%, white 1px, transparent 2px)`,
          backgroundSize: '300px 300px, 250px 250px, 180px 180px, 220px 220px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col relative z-20">
        
        {/* Event Name */}
        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm border-b border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          <div className="relative z-10 text-center py-3">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              {state.matchTitle}
            </h1>
            {state.matchNumber && state.matchNumber.trim() && (
              <div className="mt-2">
                <span className="text-lg text-white/80 font-medium">
                  {state.matchNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* VS Layout */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Alliance */}
          <div 
            className="flex-1 flex flex-col items-center justify-center relative animate-pulse-slow border-r border-white/10"
            style={{
              background: state.allianceBranding && leftPrimaryColor 
                ? `linear-gradient(to right, ${leftPrimaryColor}, ${leftSecondaryColor || leftPrimaryColor})`
                : leftIsRed 
                  ? 'linear-gradient(to right, rgba(220, 38, 38, 0.3), rgba(239, 68, 68, 0.2))'
                  : 'linear-gradient(to right, rgba(37, 99, 235, 0.3), rgba(59, 130, 246, 0.2))',
              boxShadow: state.allianceBranding && leftPrimaryColor
                ? `inset 0 0 60px ${leftPrimaryColor}20, inset -4px 0 20px ${leftPrimaryColor}30`
                : leftIsRed
                  ? 'inset 0 0 60px rgba(220, 38, 38, 0.1), inset -4px 0 20px rgba(239, 68, 68, 0.2)'
                  : 'inset 0 0 60px rgba(37, 99, 235, 0.1), inset -4px 0 20px rgba(59, 130, 246, 0.2)'
            }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 animate-float" style={{
              background: state.allianceBranding && leftSecondaryColor
                ? `radial-gradient(circle at 30% 50%, ${leftSecondaryColor}10, transparent)`
                : leftIsRed
                  ? 'radial-gradient(circle at 30% 50%, rgba(239, 68, 68, 0.05), transparent)'
                  : 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.05), transparent)'
            }}></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-xl animate-float-delayed" style={{
              backgroundColor: state.allianceBranding && leftPrimaryColor
                ? `${leftPrimaryColor}15`
                : leftIsRed
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(59, 130, 246, 0.1)'
            }}></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full blur-lg animate-bounce-slow" style={{
              backgroundColor: state.allianceBranding && leftSecondaryColor
                ? `${leftSecondaryColor}15`
                : leftIsRed
                  ? 'rgba(248, 113, 113, 0.1)'
                  : 'rgba(96, 165, 250, 0.1)'
            }}></div>
            
            <div className="text-center relative z-10">
              {/* Team Logo */}
              {state.allianceBranding && leftTeam?.logo && (
                <div className="mb-6 w-80 h-80 mx-auto relative">
                  <Image
                    src={`/Team_Logos/${leftTeam.logo}`}
                    alt={leftAllianceName || 'Team Logo'}
                    width={320}
                    height={320}
                    style={{ 
                      objectFit: 'contain',
                      filter: state.allianceBranding && leftPrimaryColor
                        ? `drop-shadow(0 0 30px ${leftPrimaryColor}80) drop-shadow(0 0 60px ${leftSecondaryColor || leftPrimaryColor}40)`
                        : undefined
                    }}
                    className="w-80 h-80 drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_35px_70px_rgba(0,0,0,0.9)] transition-all duration-300 animate-float-subtle"
                  />
                </div>
              )}
              
              <h2 
                className="text-5xl font-black tracking-wider drop-shadow-2xl"
                style={{
                  color: state.allianceBranding && leftPrimaryColor ? 'white' : (leftIsRed ? '#fca5a5' : '#93c5fd'),
                  textShadow: state.allianceBranding && leftPrimaryColor 
                    ? `0 0 40px ${leftPrimaryColor}, 0 0 80px ${leftSecondaryColor || leftPrimaryColor}`
                    : undefined
                }}
              >
                {state.seriesEnabled ? leftAllianceName : (leftIsRed ? 'RED' : 'BLUE')}
              </h2>
              
              {/* Team Players */}
              {((state.allianceBranding && leftTeam?.players) || (state.tournamentModeEnabled && leftTournamentPlayers.length > 0)) && (
                <div className="mt-6">
                  <div 
                    className="backdrop-blur-sm rounded-lg px-4 py-2 border w-64 mx-auto"
                    style={{
                      backgroundColor: leftSecondaryColor ? `${leftSecondaryColor}20` : 'rgba(0, 0, 0, 0.3)',
                      borderColor: leftPrimaryColor ? `${leftPrimaryColor}40` : (leftIsRed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)')
                    }}
                  >
                    {state.tournamentModeEnabled && leftTournamentPlayers.length > 0 
                      ? leftTournamentPlayers.map((player, index) => (
                          <div key={index} className="text-lg text-white font-medium">
                            {player}
                          </div>
                        ))
                      : leftTeam?.players?.map((player, index) => (
                          <div key={index} className="text-lg text-white font-medium">
                            {player}
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>
            
            {/* Left Series Indicator - Bottom */}
            {state.seriesEnabled && (
              <div className="absolute bottom-8 left-8 right-8">
                <div className={`bg-black/90 backdrop-blur-md border-2 rounded-lg p-4 shadow-xl ${
                  leftIsRed ? 'border-red-500/50' : 'border-blue-500/50'
                }`}>
                  <div className="flex space-x-3 justify-center">
                    {renderSeriesBoxes(leftSeriesScore || 0, leftIsRed ? 'red' : 'blue')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* VS Separator */}
          <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
            <div className="bg-black/60 backdrop-blur-lg border border-white/30 rounded-full w-24 h-24 flex items-center justify-center shadow-2xl">
              <span className="text-white text-2xl font-black tracking-widest">VS</span>
            </div>
          </div>

          {/* Right Alliance */}
          <div 
            className="flex-1 flex flex-col items-center justify-center relative animate-pulse-slow border-l border-white/10"
            style={{
              background: state.allianceBranding && rightPrimaryColor 
                ? `linear-gradient(to left, ${rightPrimaryColor}, ${rightSecondaryColor || rightPrimaryColor})`
                : rightIsRed
                  ? 'linear-gradient(to left, rgba(220, 38, 38, 0.3), rgba(239, 68, 68, 0.2))'
                  : 'linear-gradient(to left, rgba(37, 99, 235, 0.3), rgba(59, 130, 246, 0.2))',
              boxShadow: state.allianceBranding && rightPrimaryColor
                ? `inset 0 0 60px ${rightPrimaryColor}20, inset 4px 0 20px ${rightPrimaryColor}30`
                : rightIsRed
                  ? 'inset 0 0 60px rgba(220, 38, 38, 0.1), inset 4px 0 20px rgba(239, 68, 68, 0.2)'
                  : 'inset 0 0 60px rgba(37, 99, 235, 0.1), inset 4px 0 20px rgba(59, 130, 246, 0.2)'
            }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 animate-float" style={{
              background: state.allianceBranding && rightSecondaryColor
                ? `radial-gradient(circle at 70% 50%, ${rightSecondaryColor}10, transparent)`
                : rightIsRed
                  ? 'radial-gradient(circle at 70% 50%, rgba(239, 68, 68, 0.05), transparent)'
                  : 'radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.05), transparent)'
            }}></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full blur-xl animate-float-delayed" style={{
              backgroundColor: state.allianceBranding && rightPrimaryColor
                ? `${rightPrimaryColor}15`
                : rightIsRed
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(59, 130, 246, 0.1)'
            }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full blur-lg animate-bounce-slow" style={{
              backgroundColor: state.allianceBranding && rightSecondaryColor
                ? `${rightSecondaryColor}15`
                : rightIsRed
                  ? 'rgba(248, 113, 113, 0.1)'
                  : 'rgba(96, 165, 250, 0.1)'
            }}></div>
            
            <div className="text-center relative z-10">
              {/* Team Logo */}
              {state.allianceBranding && rightTeam?.logo && (
                <div className="mb-6 w-80 h-80 mx-auto relative">
                  <Image
                    src={`/Team_Logos/${rightTeam.logo}`}
                    alt={rightAllianceName || 'Team Logo'}
                    width={320}
                    height={320}
                    style={{ 
                      objectFit: 'contain',
                      filter: state.allianceBranding && rightPrimaryColor
                        ? `drop-shadow(0 0 30px ${rightPrimaryColor}80) drop-shadow(0 0 60px ${rightSecondaryColor || rightPrimaryColor}40)`
                        : undefined
                    }}
                    className="w-80 h-80 drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_35px_70px_rgba(0,0,0,0.9)] transition-all duration-300 animate-float-subtle"
                  />
                </div>
              )}
              
              <h2 
                className="text-5xl font-black tracking-wider drop-shadow-2xl"
                style={{
                  color: state.allianceBranding && rightPrimaryColor ? 'white' : (rightIsRed ? '#fca5a5' : '#93c5fd'),
                  textShadow: state.allianceBranding && rightPrimaryColor 
                    ? `0 0 40px ${rightPrimaryColor}, 0 0 80px ${rightSecondaryColor || rightPrimaryColor}`
                    : undefined
                }}
              >
                {state.seriesEnabled ? rightAllianceName : (rightIsRed ? 'RED' : 'BLUE')}
              </h2>
              
              {/* Team Players */}
              {((state.allianceBranding && rightTeam?.players) || (state.tournamentModeEnabled && rightTournamentPlayers.length > 0)) && (
                <div className="mt-6">
                  <div 
                    className="backdrop-blur-sm rounded-lg px-4 py-2 border w-64 mx-auto"
                    style={{
                      backgroundColor: rightSecondaryColor ? `${rightSecondaryColor}20` : 'rgba(0, 0, 0, 0.3)',
                      borderColor: rightPrimaryColor ? `${rightPrimaryColor}40` : (rightIsRed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)')
                    }}
                  >
                    {state.tournamentModeEnabled && rightTournamentPlayers.length > 0 
                      ? rightTournamentPlayers.map((player, index) => (
                          <div key={index} className="text-lg text-white font-medium">
                            {player}
                          </div>
                        ))
                      : rightTeam?.players?.map((player, index) => (
                          <div key={index} className="text-lg text-white font-medium">
                            {player}
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Series Indicator - Bottom */}
            {state.seriesEnabled && (
              <div className="absolute bottom-8 left-8 right-8">
                <div className={`bg-black/90 backdrop-blur-md border-2 rounded-lg p-4 shadow-xl ${
                  rightIsRed ? 'border-red-500/50' : 'border-blue-500/50'
                }`}>
                  <div className="flex space-x-3 justify-center">
                    {renderSeriesBoxes(rightSeriesScore || 0, rightIsRed ? 'red' : 'blue')}
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
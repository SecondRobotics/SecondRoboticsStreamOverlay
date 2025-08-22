import { OverlayState } from "../../lib/overlayState";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { pointsDifferentialTracker } from "../../lib/pointsDifferentialTracker";
import { Team, loadTeams } from "../../lib/teams";

interface MatchViewProps {
  state: OverlayState;
  currentTime: string;
}

export default function MatchView({ state, currentTime }: MatchViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prevScores, setPrevScores] = useState({ red: state.redScore, blue: state.blueScore });
  const [scoreChanged, setScoreChanged] = useState({ red: false, blue: false });
  const [animatingScores, setAnimatingScores] = useState({ red: state.redScore, blue: state.blueScore });
  const [prevOPR, setPrevOPR] = useState({ red: state.redOPR, blue: state.blueOPR });
  const [oprChanged, setOprChanged] = useState({ red: new Set<string>(), blue: new Set<string>() });
  const [animatingOPR, setAnimatingOPR] = useState({ red: state.redOPR, blue: state.blueOPR });
  const [showAutonomous, setShowAutonomous] = useState(false);
  const [gameState, setGameState] = useState<string>('');
  const [showTimer, setShowTimer] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  // Memoize sorted OPR arrays to prevent unnecessary re-calculations
  const sortedRedOPR = useMemo(() => {
    return [...animatingOPR.red]
      .filter(player => player.username && player.username.trim() !== '')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [animatingOPR.red]);
  
  const sortedBlueOPR = useMemo(() => {
    return [...animatingOPR.blue]
      .filter(player => player.username && player.username.trim() !== '')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [animatingOPR.blue]);


  // Get teams by ID
  const redTeam = useMemo(() => 
    teams.find(t => t.id === state.redTeamId),
    [teams, state.redTeamId]
  );
  
  const blueTeam = useMemo(() => 
    teams.find(t => t.id === state.blueTeamId),
    [teams, state.blueTeamId]
  );

  // Swap team data and components when flipped
  const leftTeam = useMemo(() => 
    state.flippedTeams ? blueTeam : redTeam,
    [state.flippedTeams, redTeam, blueTeam]
  );
  
  const rightTeam = useMemo(() => 
    state.flippedTeams ? redTeam : blueTeam,
    [state.flippedTeams, redTeam, blueTeam]
  );


  const leftOPR = useMemo(() => 
    state.flippedTeams ? sortedBlueOPR : sortedRedOPR,
    [state.flippedTeams, sortedRedOPR, sortedBlueOPR]
  );
  
  const rightOPR = useMemo(() => 
    state.flippedTeams ? sortedRedOPR : sortedBlueOPR,
    [state.flippedTeams, sortedRedOPR, sortedBlueOPR]
  );

  const leftOPRChanged = useMemo(() => 
    state.flippedTeams ? oprChanged.blue : oprChanged.red,
    [state.flippedTeams, oprChanged.red, oprChanged.blue]
  );
  
  const rightOPRChanged = useMemo(() => 
    state.flippedTeams ? oprChanged.red : oprChanged.blue,
    [state.flippedTeams, oprChanged.red, oprChanged.blue]
  );

  const leftAnimatingScore = useMemo(() => 
    state.flippedTeams ? animatingScores.blue : animatingScores.red,
    [state.flippedTeams, animatingScores.red, animatingScores.blue]
  );
  
  const rightAnimatingScore = useMemo(() => 
    state.flippedTeams ? animatingScores.red : animatingScores.blue,
    [state.flippedTeams, animatingScores.red, animatingScores.blue]
  );

  const leftScoreChanged = useMemo(() => 
    state.flippedTeams ? scoreChanged.blue : scoreChanged.red,
    [state.flippedTeams, scoreChanged.red, scoreChanged.blue]
  );
  
  const rightScoreChanged = useMemo(() => 
    state.flippedTeams ? scoreChanged.red : scoreChanged.blue,
    [state.flippedTeams, scoreChanged.red, scoreChanged.blue]
  );

  const leftAllianceName = useMemo(() => 
    state.flippedTeams ? state.blueAllianceName : state.redAllianceName,
    [state.flippedTeams, state.redAllianceName, state.blueAllianceName]
  );
  
  const rightAllianceName = useMemo(() => 
    state.flippedTeams ? state.redAllianceName : state.blueAllianceName,
    [state.flippedTeams, state.redAllianceName, state.blueAllianceName]
  );

  const leftIsRed = !state.flippedTeams;
  const rightIsRed = state.flippedTeams;

  // Parse time string to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
  };

  // Determine timer color based on time
  const getTimerColor = useMemo(() => {
    const totalSeconds = parseTimeToSeconds(state.matchTime);
    if (totalSeconds === 0) return 'text-red-500';
    if (totalSeconds <= 30) return 'text-yellow-400';
    if (totalSeconds <= 150 && totalSeconds > 135) return 'text-green-400'; // Auto period
    return 'text-white';
  }, [state.matchTime]);

  // Load teams data
  useEffect(() => {
    loadTeams().then(setTeams);
  }, []);

  useEffect(() => {
    // Entrance animation with delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Autonomous period animation
    const totalSeconds = parseTimeToSeconds(state.matchTime);
    if (totalSeconds <= 150 && totalSeconds > 135) { // 2:30 to 2:15
      setShowAutonomous(true);
    } else {
      setShowAutonomous(false);
    }
  }, [state.matchTime]);

  useEffect(() => {
    // Read GameState.txt for debugging
    if (state.gameFileLocation) {
      const readGameState = async () => {
        try {
          const response = await fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/GameState.txt')}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          });
          if (response.ok) {
            const text = await response.text();
            const trimmedState = text.trim();
            setGameState(trimmedState);
            // Show/hide timer based on game state
            setShowTimer(trimmedState !== 'FINISHED');
            
            // Start/stop differential tracking based on game state
            if (trimmedState !== 'FINISHED' && !pointsDifferentialTracker.isActive()) {
              pointsDifferentialTracker.startLogging(state.gameFileLocation);
            } else if (trimmedState === 'FINISHED' && pointsDifferentialTracker.isActive()) {
              pointsDifferentialTracker.stopLogging();
            }
          }
        } catch {
          setGameState('Error reading GameState.txt');
          // If we can't read the game state, show the timer by default
          setShowTimer(true);
        }
      };
      
      readGameState();
      const interval = setInterval(readGameState, 100);
      return () => clearInterval(interval);
    } else {
      // If no game file location, show timer by default
      setShowTimer(true);
      setGameState('');
    }
  }, [state.gameFileLocation]);

  useEffect(() => {
    // Score change animation
    if (prevScores.red !== state.redScore) {
      setScoreChanged(prev => ({ ...prev, red: true }));
      setAnimatingScores(prev => ({ ...prev, red: state.redScore }));
      setTimeout(() => setScoreChanged(prev => ({ ...prev, red: false })), 500);
    }
    
    if (prevScores.blue !== state.blueScore) {
      setScoreChanged(prev => ({ ...prev, blue: true }));
      setAnimatingScores(prev => ({ ...prev, blue: state.blueScore }));
      setTimeout(() => setScoreChanged(prev => ({ ...prev, blue: false })), 500);
    }
    
    // Log points differential when scores change
    pointsDifferentialTracker.logPoint(state.redScore, state.blueScore, state.matchTime, gameState);
    
    setPrevScores({ red: state.redScore, blue: state.blueScore });
  }, [state.redScore, state.blueScore, state.matchTime, gameState]);

  useEffect(() => {
    // Update animating OPR to match current state
    setAnimatingOPR({ red: state.redOPR, blue: state.blueOPR });
    
    // OPR change animation
    const animateOPRChanges = (alliance: 'red' | 'blue') => {
      const currentOPR = state[alliance === 'red' ? 'redOPR' : 'blueOPR'];
      const prevOPRData = prevOPR[alliance];
      const changedPlayers = new Set<string>();
      
      currentOPR.forEach((player, index) => {
        const prevPlayer = prevOPRData[index];
        if (prevPlayer && prevPlayer.username === player.username && prevPlayer.score !== player.score) {
          changedPlayers.add(player.username);
          
          // Animate from old score to new score
          const startScore = prevPlayer.score;
          const endScore = player.score;
          const startTime = Date.now();
          const duration = 200;
          
          const animateScore = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.round(startScore + (endScore - startScore) * easeOutCubic);
            
            setAnimatingOPR(prev => ({
              ...prev,
              [alliance]: prev[alliance].map(p => 
                p.username === player.username ? { ...p, score: currentScore } : p
              )
            }));
            
            if (progress < 1) {
              requestAnimationFrame(animateScore);
            } else {
              setOprChanged(prev => ({
                ...prev,
                [alliance]: new Set([...prev[alliance]].filter(name => name !== player.username))
              }));
            }
          };
          
          requestAnimationFrame(animateScore);
        }
      });
      
      if (changedPlayers.size > 0) {
        setOprChanged(prev => ({
          ...prev,
          [alliance]: new Set([...prev[alliance], ...changedPlayers])
        }));
      }
    };
    
    animateOPRChanges('red');
    animateOPRChanges('blue');
    
    setPrevOPR({ red: state.redOPR, blue: state.blueOPR });
  }, [state.redOPR, state.blueOPR]);


  return (
    <>
      <div className="absolute top-4 left-4 bg-gray-900/85 backdrop-blur-sm rounded-lg p-3 border border-white/30 animate-fade-in">
        <div className="text-lg font-bold">
          {state.matchTitle}
        </div>
        {state.matchNumber && state.matchNumber.trim() && (
          <div className="text-sm text-white/80 mt-1">
            {state.matchNumber}
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-gray-900/85 backdrop-blur-sm rounded-lg p-3 border border-white/30 animate-fade-in">
          <div className="text-sm font-mono">
            {currentTime}
          </div>
        </div>
        
      </div>


      <div className={`absolute bottom-4 left-4 right-4 transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <div className="flex flex-col items-center gap-2">
          {/* Timer Container */}
          <div className={`relative transition-all duration-700 ${showTimer ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            {/* Autonomous Animation - Above timer */}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-green-600/90 rounded-lg px-6 py-2 transition-all duration-700 ${
              showAutonomous ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}>
              <span className="text-lg font-bold text-white">AUTO</span>
            </div>
            
            <div className="bg-gray-900/85 backdrop-blur-sm rounded-lg px-8 py-3 border border-white/30">
              <div className={`text-6xl font-bold font-mono animate-pulse transition-colors duration-300 ${getTimerColor}`}>{state.matchTime}</div>
            </div>
          </div>
          
          {/* Score Container */}
          <div 
            className="backdrop-blur-sm rounded-lg p-6 border border-white/30 shadow-2xl w-full relative"
            style={{
              background: state.allianceBranding && state.redPrimaryColor && state.bluePrimaryColor
                ? `linear-gradient(135deg, 
                    ${state.redPrimaryColor}40 0%, 
                    ${state.redSecondaryColor || state.redPrimaryColor}25 30%, 
                    rgba(17, 24, 39, 0.85) 50%, 
                    ${state.blueSecondaryColor || state.bluePrimaryColor}25 70%, 
                    ${state.bluePrimaryColor}40 100%)`
                : 'rgba(17, 24, 39, 0.85)'
            }}
          >
            {/* Team Logos */}
            {state.allianceBranding && (
              <>
                {/* Left Side Logo */}
                {leftTeam?.logo && (
                  <div className="absolute left-0 top-0 bottom-0 w-80 z-15 rounded-lg overflow-hidden">
                    <img
                      src={`/Team_Logos/${leftTeam.logo}`}
                      alt={`${leftAllianceName} Logo`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain' 
                      }}
                      className="drop-shadow-lg"
                    />
                  </div>
                )}
                
                {/* Right Side Logo */}
                {rightTeam?.logo && (
                  <div className="absolute right-0 top-0 bottom-0 w-80 z-15 rounded-lg overflow-hidden">
                    <img
                      src={`/Team_Logos/${rightTeam.logo}`}
                      alt={`${rightAllianceName} Logo`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain' 
                      }}
                      className="drop-shadow-lg"
                    />
                  </div>
                )}
              </>
            )}

            {/* Logo centered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 z-10">
              <Image
                src="/assets/src-light-logo.png"
                alt="SRC Logo"
                fill
                style={{ objectFit: 'contain' }}
                className="drop-shadow-lg"
              />
            </div>
            
            <div className="flex items-center justify-center">
              {/* Left side */}
              <div className="flex items-center justify-end gap-4 flex-1">
                {/* Left Alliance OPR */}
                <div className={`text-sm opacity-90 space-y-2 text-right ${leftIsRed ? 'text-red-100' : 'text-blue-100'}`}>
                  {leftOPR.map((player, index) => (
                    <div 
                      key={player.username || `left-player-${index}`} 
                      className="flex items-center justify-end gap-2"
                    >
                      <span className="truncate max-w-[120px]">{player.username}</span>
                      <span className={`font-mono px-3 py-1.5 rounded text-sm ${
                        leftIsRed ? 'bg-red-700/50' : 'bg-blue-700/50'
                      } ${
                        leftOPRChanged.has(player.username) ? 'animate-score-text-change' : ''
                      }`}>{player.score}</span>
                    </div>
                  ))}
                </div>
                
                {/* Left Score */}
                <div className={`rounded-lg p-8 text-center min-w-[180px] mr-16 ${
                  leftIsRed ? 'bg-red-600/80 animate-red-glow' : 'bg-blue-600/80 animate-blue-glow'
                }`}>
                  <div className={`text-6xl font-mono font-bold text-white ${
                    leftScoreChanged ? 'animate-score-text-change' : ''
                  }`}>{leftAnimatingScore}</div>
                </div>
              </div>
              
              {/* Center logo space */}
              <div className="w-24"></div>
              
              {/* Right side */}
              <div className="flex items-center justify-start gap-4 flex-1">
                {/* Right Score */}
                <div className={`rounded-lg p-8 text-center min-w-[180px] ml-16 ${
                  rightIsRed ? 'bg-red-600/80 animate-red-glow' : 'bg-blue-600/80 animate-blue-glow'
                }`}>
                  <div className={`text-6xl font-mono font-bold text-white ${
                    rightScoreChanged ? 'animate-score-text-change' : ''
                  }`}>{rightAnimatingScore}</div>
                </div>
                
                {/* Right Alliance OPR */}
                <div className={`text-sm opacity-90 space-y-2 text-left ${rightIsRed ? 'text-red-100' : 'text-blue-100'}`}>
                  {rightOPR.map((player, index) => (
                    <div 
                      key={player.username || `right-player-${index}`} 
                      className="flex items-center justify-start gap-2"
                    >
                      <span className={`font-mono px-3 py-1.5 rounded text-sm ${
                        rightIsRed ? 'bg-red-700/50' : 'bg-blue-700/50'
                      } ${
                        rightOPRChanged.has(player.username) ? 'animate-score-text-change' : ''
                      }`}>{player.score}</span>
                      <span className="truncate max-w-[120px]">{player.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes score-text-change {
          0% { 
            transform: scale(1);
            text-shadow: 0 0 0px rgba(255, 255, 255, 0);
          }
          50% { 
            transform: scale(1.1);
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6);
          }
          100% { 
            transform: scale(1);
            text-shadow: 0 0 0px rgba(255, 255, 255, 0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-score-text-change {
          animation: score-text-change 0.5s ease-out;
        }

        @keyframes red-glow {
          0%, 100% { 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          50% { 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.3);
          }
        }

        @keyframes blue-glow {
          0%, 100% { 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          50% { 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3);
          }
        }

        .animate-red-glow {
          animation: red-glow 3s ease-in-out infinite;
        }

        .animate-blue-glow {
          animation: blue-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-border {
          0%, 100% { 
            border-opacity: 0.8;
            filter: brightness(1);
          }
          50% { 
            border-opacity: 1;
            filter: brightness(1.3);
          }
        }

        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
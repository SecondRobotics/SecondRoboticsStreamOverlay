import { OverlayState } from "../../lib/overlayState";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

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
  // Memoize sorted OPR arrays to prevent unnecessary re-calculations
  const sortedRedOPR = useMemo(() => 
    [...animatingOPR.red].sort((a, b) => b.score - a.score),
    [animatingOPR.red]
  );
  
  const sortedBlueOPR = useMemo(() => 
    [...animatingOPR.blue].sort((a, b) => b.score - a.score),
    [animatingOPR.blue]
  );


  useEffect(() => {
    // Entrance animation
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Score change animation with scrolling effect
    if (prevScores.red !== state.redScore) {
      setScoreChanged(prev => ({ ...prev, red: true }));
      
      // Animate from old score to new score
      const startScore = prevScores.red;
      const endScore = state.redScore;
      const startTime = Date.now();
      const duration = 200; // Animation duration in ms
      
      const animateScore = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(startScore + (endScore - startScore) * easeOutCubic);
        
        setAnimatingScores(prev => ({ ...prev, red: currentScore }));
        
        if (progress < 1) {
          requestAnimationFrame(animateScore);
        } else {
          setScoreChanged(prev => ({ ...prev, red: false }));
        }
      };
      
      requestAnimationFrame(animateScore);
    }
    
    if (prevScores.blue !== state.blueScore) {
      setScoreChanged(prev => ({ ...prev, blue: true }));
      
      // Animate from old score to new score
      const startScore = prevScores.blue;
      const endScore = state.blueScore;
      const startTime = Date.now();
      const duration = 200; // Animation duration in ms
      
      const animateScore = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(startScore + (endScore - startScore) * easeOutCubic);
        
        setAnimatingScores(prev => ({ ...prev, blue: currentScore }));
        
        if (progress < 1) {
          requestAnimationFrame(animateScore);
        } else {
          setScoreChanged(prev => ({ ...prev, blue: false }));
        }
      };
      
      requestAnimationFrame(animateScore);
    }
    
    setPrevScores({ red: state.redScore, blue: state.blueScore });
  }, [state.redScore, state.blueScore]);

  useEffect(() => {
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
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-fade-in">
        <div className="text-lg font-bold">
          {state.matchTitle}
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-fade-in">
        <div className="text-sm font-mono">
          {currentTime}
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-fade-in">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono animate-pulse">{state.matchTime}</div>
          <div className="text-xs text-gray-300">MATCH TIME</div>
        </div>
      </div>

      <div className={`absolute bottom-4 left-4 right-4 transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-center gap-6">
            {/* Red Alliance OPR */}
            <div className="text-xs text-red-100 opacity-90 space-y-1 text-right">
              {sortedRedOPR.map((player, index) => (
                <div 
                  key={player.username} 
                  className="flex items-center justify-end gap-2"
                >
                  <span className="truncate max-w-[100px]">{player.username}</span>
                  <span className={`font-mono bg-red-700/50 px-2 py-1 rounded ${
                    oprChanged.red.has(player.username) ? 'animate-score-text-change' : ''
                  }`}>{player.score}</span>
                </div>
              ))}
            </div>
            
            {/* Red Score */}
            <div className="bg-red-600/80 rounded-lg p-6 text-center min-w-[150px] animate-red-glow">
              <div className={`text-5xl font-mono font-bold ${
                scoreChanged.red ? 'animate-score-text-change' : ''
              }`}>{animatingScores.red}</div>
            </div>
            
            {/* Logo */}
            <div className="relative w-20 h-20 mx-4">
              <Image
                src="/assets/src-light-logo.png"
                alt="SRC Logo"
                fill
                style={{ objectFit: 'contain' }}
                className="drop-shadow-lg"
              />
            </div>
            
            {/* Blue Score */}
            <div className="bg-blue-600/80 rounded-lg p-6 text-center min-w-[150px] animate-blue-glow">
              <div className={`text-5xl font-mono font-bold ${
                scoreChanged.blue ? 'animate-score-text-change' : ''
              }`}>{animatingScores.blue}</div>
            </div>
            
            {/* Blue Alliance OPR */}
            <div className="text-xs text-blue-100 opacity-90 space-y-1 text-left">
              {sortedBlueOPR.map((player, index) => (
                <div 
                  key={player.username} 
                  className="flex items-center justify-start gap-2"
                >
                  <span className={`font-mono bg-blue-700/50 px-2 py-1 rounded ${
                    oprChanged.blue.has(player.username) ? 'animate-score-text-change' : ''
                  }`}>{player.score}</span>
                  <span className="truncate max-w-[100px]">{player.username}</span>
                </div>
              ))}
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
            color: rgba(255, 255, 255, 1);
          }
          50% { 
            color: rgba(255, 255, 255, 1);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          }
          100% { 
            color: rgba(255, 255, 255, 1);
          }
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

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-score-text-change {
          animation: score-text-change 0.2s ease-out;
        }

        .animate-red-glow {
          animation: red-glow 3s ease-in-out infinite;
        }

        .animate-blue-glow {
          animation: blue-glow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
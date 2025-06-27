import { OverlayState } from "../../lib/overlayState";
import { useEffect, useState } from "react";
import Image from "next/image";

interface MatchViewProps {
  state: OverlayState;
  currentTime: string;
}

export default function MatchView({ state, currentTime }: MatchViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prevScores, setPrevScores] = useState({ red: state.redScore, blue: state.blueScore });
  const [scoreChanged, setScoreChanged] = useState({ red: false, blue: false });

  useEffect(() => {
    // Entrance animation
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Score change animation
    if (prevScores.red !== state.redScore) {
      setScoreChanged(prev => ({ ...prev, red: true }));
      setTimeout(() => setScoreChanged(prev => ({ ...prev, red: false })), 600);
    }
    if (prevScores.blue !== state.blueScore) {
      setScoreChanged(prev => ({ ...prev, blue: true }));
      setTimeout(() => setScoreChanged(prev => ({ ...prev, blue: false })), 600);
    }
    setPrevScores({ red: state.redScore, blue: state.blueScore });
  }, [state.redScore, state.blueScore, prevScores.red, prevScores.blue]);

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
              {state.redOPR.map((player, index) => (
                <div key={index} className="flex items-center justify-end gap-2">
                  <span className="truncate max-w-[100px]">{player.username}</span>
                  <span className="font-mono bg-red-700/50 px-2 py-1 rounded">{player.score}</span>
                </div>
              ))}
            </div>
            
            {/* Red Score */}
            <div className={`bg-red-600/80 rounded-lg p-6 text-center min-w-[150px] ${
              scoreChanged.red ? 'animate-score-change bg-red-500' : ''
            }`}>
              <div className="text-5xl font-mono font-bold">{state.redScore}</div>
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
            <div className={`bg-blue-600/80 rounded-lg p-6 text-center min-w-[150px] ${
              scoreChanged.blue ? 'animate-score-change bg-blue-500' : ''
            }`}>
              <div className="text-5xl font-mono font-bold">{state.blueScore}</div>
            </div>
            
            {/* Blue Alliance OPR */}
            <div className="text-xs text-blue-100 opacity-90 space-y-1 text-left">
              {state.blueOPR.map((player, index) => (
                <div key={index} className="flex items-center justify-start gap-2">
                  <span className="font-mono bg-blue-700/50 px-2 py-1 rounded">{player.score}</span>
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

        @keyframes score-change {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
          100% { transform: scale(1); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-score-change {
          animation: score-change 0.6s ease-out;
        }
      `}</style>
    </>
  );
}
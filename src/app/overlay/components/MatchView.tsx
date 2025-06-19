import { OverlayState } from "../../lib/overlayState";
import { useEffect, useState } from "react";

interface MatchViewProps {
  state: OverlayState;
  currentTime: string;
}

export default function MatchView({ state, currentTime }: MatchViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prevScores, setPrevScores] = useState({ alliance1: state.alliance1Score, alliance2: state.alliance2Score });
  const [scoreChanged, setScoreChanged] = useState({ alliance1: false, alliance2: false });

  useEffect(() => {
    // Entrance animation
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Score change animation
    if (prevScores.alliance1 !== state.alliance1Score) {
      setScoreChanged(prev => ({ ...prev, alliance1: true }));
      setTimeout(() => setScoreChanged(prev => ({ ...prev, alliance1: false })), 600);
    }
    if (prevScores.alliance2 !== state.alliance2Score) {
      setScoreChanged(prev => ({ ...prev, alliance2: true }));
      setTimeout(() => setScoreChanged(prev => ({ ...prev, alliance2: false })), 600);
    }
    setPrevScores({ alliance1: state.alliance1Score, alliance2: state.alliance2Score });
  }, [state.alliance1Score, state.alliance2Score]);

  return (
    <>
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold animate-fade-in">{state.matchTitle}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`bg-blue-600/80 rounded p-4 text-center ${
              scoreChanged.alliance1 ? 'animate-score-change bg-blue-500' : ''
            }`}>
              <div className="text-lg font-bold">Alliance 1</div>
              <div className="text-3xl font-mono font-bold">{state.alliance1Score}</div>
            </div>
            <div className={`bg-red-600/80 rounded p-4 text-center ${
              scoreChanged.alliance2 ? 'animate-score-change bg-red-500' : ''
            }`}>
              <div className="text-lg font-bold">Alliance 2</div>
              <div className="text-3xl font-mono font-bold">{state.alliance2Score}</div>
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
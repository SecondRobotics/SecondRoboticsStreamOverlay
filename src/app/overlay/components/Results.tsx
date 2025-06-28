import { OverlayState } from "../../lib/overlayState";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import PointsDifferentialGraph from "../../components/PointsDifferentialGraph";
import { pointsDifferentialTracker, PointsDifferentialData } from "../../lib/pointsDifferentialTracker";

interface ResultsProps {
  state: OverlayState;
  currentTime: string;
}

export default function Results({ state, currentTime }: ResultsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(true);
  const [differentialData, setDifferentialData] = useState<PointsDifferentialData[]>([]);
  const [gameData, setGameData] = useState({
    autoLeaveR: '0',
    autoLeaveB: '0',
    autoR: '0',
    autoB: '0',
    teleProcR: '0',
    teleNetR: '0',
    teleProcB: '0',
    teleNetB: '0',
    autoL1R: '0',
    autoL2R: '0',
    autoL3R: '0',
    autoL4R: '0',
    teleL1R: '0',
    teleL2R: '0',
    teleL3R: '0',
    teleL4R: '0',
    autoL1B: '0',
    autoL2B: '0',
    autoL3B: '0',
    autoL4B: '0',
    teleL1B: '0',
    teleL2B: '0',
    teleL3B: '0',
    teleL4B: '0',
    majFoulsR: '0',
    minFoulsR: '0',
    majFoulsB: '0',
    minFoulsB: '0'
  });

  // Memoize sorted OPR arrays
  const sortedRedOPR = useMemo(() => {
    return [...state.redOPR]
      .filter(player => player.username && player.username.trim() !== '')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [state.redOPR]);
  
  const sortedBlueOPR = useMemo(() => {
    return [...state.blueOPR]
      .filter(player => player.username && player.username.trim() !== '')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [state.blueOPR]);

  // Determine winner
  const winner = state.redScore > state.blueScore ? 'red' : 
                 state.blueScore > state.redScore ? 'blue' : 'tie';

  // Calculate Algae scores
  const algaeScores = useMemo(() => {
    const redProc = parseInt(gameData.teleProcR) || 0;
    const redNet = parseInt(gameData.teleNetR) || 0;
    const blueProc = parseInt(gameData.teleProcB) || 0;
    const blueNet = parseInt(gameData.teleNetB) || 0;

    return {
      red: (redProc * 6) + (redNet * 4),
      blue: (blueProc * 6) + (blueNet * 4)
    };
  }, [gameData.teleProcR, gameData.teleNetR, gameData.teleProcB, gameData.teleNetB]);

  // Calculate Coral scores
  const coralScores = useMemo(() => {
    // Red alliance coral calculation
    const redAutoL1 = parseInt(gameData.autoL1R) || 0;
    const redAutoL2 = parseInt(gameData.autoL2R) || 0;
    const redAutoL3 = parseInt(gameData.autoL3R) || 0;
    const redAutoL4 = parseInt(gameData.autoL4R) || 0;
    const redTeleL1 = parseInt(gameData.teleL1R) || 0;
    const redTeleL2 = parseInt(gameData.teleL2R) || 0;
    const redTeleL3 = parseInt(gameData.teleL3R) || 0;
    const redTeleL4 = parseInt(gameData.teleL4R) || 0;

    // Blue alliance coral calculation
    const blueAutoL1 = parseInt(gameData.autoL1B) || 0;
    const blueAutoL2 = parseInt(gameData.autoL2B) || 0;
    const blueAutoL3 = parseInt(gameData.autoL3B) || 0;
    const blueAutoL4 = parseInt(gameData.autoL4B) || 0;
    const blueTeleL1 = parseInt(gameData.teleL1B) || 0;
    const blueTeleL2 = parseInt(gameData.teleL2B) || 0;
    const blueTeleL3 = parseInt(gameData.teleL3B) || 0;
    const blueTeleL4 = parseInt(gameData.teleL4B) || 0;

    return {
      red: (redAutoL1 * 3) + (redAutoL2 * 4) + (redAutoL3 * 6) + (redAutoL4 * 7) + 
           (redTeleL1 * 2) + (redTeleL2 * 3) + (redTeleL3 * 4) + (redTeleL4 * 5),
      blue: (blueAutoL1 * 3) + (blueAutoL2 * 4) + (blueAutoL3 * 6) + (blueAutoL4 * 7) + 
            (blueTeleL1 * 2) + (blueTeleL2 * 3) + (blueTeleL3 * 4) + (blueTeleL4 * 5)
    };
  }, [
    gameData.autoL1R, gameData.autoL2R, gameData.autoL3R, gameData.autoL4R,
    gameData.teleL1R, gameData.teleL2R, gameData.teleL3R, gameData.teleL4R,
    gameData.autoL1B, gameData.autoL2B, gameData.autoL3B, gameData.autoL4B,
    gameData.teleL1B, gameData.teleL2B, gameData.teleL3B, gameData.teleL4B
  ]);

  // Calculate Fouls scores
  const foulScores = useMemo(() => {
    const redMajFouls = parseInt(gameData.majFoulsR) || 0;
    const redMinFouls = parseInt(gameData.minFoulsR) || 0;
    const blueMajFouls = parseInt(gameData.majFoulsB) || 0;
    const blueMinFouls = parseInt(gameData.minFoulsB) || 0;

    return {
      red: (redMajFouls * 6) + (redMinFouls * 2),
      blue: (blueMajFouls * 6) + (blueMinFouls * 2)
    };
  }, [gameData.majFoulsR, gameData.minFoulsR, gameData.majFoulsB, gameData.minFoulsB]);

  useEffect(() => {
    // Show immediately, no delay
    setIsVisible(true);
    
    // Get differential data from tracker
    setDifferentialData(pointsDifferentialTracker.getData());

    return () => {
      // Exit animation when component unmounts
      setIsExiting(true);
    };
  }, []);

  useEffect(() => {
    // Read files in background after render
    if (state.gameFileLocation) {
      const readGameFiles = async () => {
        try {
          const [
            autoLeaveR, autoLeaveB, autoR, autoB,
            teleProcR, teleNetR, teleProcB, teleNetB,
            autoL1R, autoL2R, autoL3R, autoL4R,
            teleL1R, teleL2R, teleL3R, teleL4R,
            autoL1B, autoL2B, autoL3B, autoL4B,
            teleL1B, teleL2B, teleL3B, teleL4B,
            majFoulsR, minFoulsR, majFoulsB, minFoulsB
          ] = await Promise.all([
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_leave_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_leave_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_proc_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_net_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_proc_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_net_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_l1_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_l2_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_l3_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_l4_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_l1_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_l2_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_l3_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_l4_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_l1_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_l2_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_l3_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Auto_l4_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_l1_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_l2_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_l3_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/Tele_l4_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/MajFouls_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/MinFouls_R.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/MajFouls_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim()),
            fetch(`/api/read-file?path=${encodeURIComponent(state.gameFileLocation + '/MinFouls_B.txt')}`).then(r => r.ok ? r.text() : '0').then(t => t.trim())
          ]);

          setGameData({
            autoLeaveR, autoLeaveB, autoR, autoB,
            teleProcR, teleNetR, teleProcB, teleNetB,
            autoL1R, autoL2R, autoL3R, autoL4R,
            teleL1R, teleL2R, teleL3R, teleL4R,
            autoL1B, autoL2B, autoL3B, autoL4B,
            teleL1B, teleL2B, teleL3B, teleL4B,
            majFoulsR, minFoulsR, majFoulsB, minFoulsB
          });
        } catch (error) {
          console.error('Results: Error reading game files:', error);
        }
      };

      // Start file reading immediately but don't block render
      readGameFiles();
    }
  }, [state.gameFileLocation]);

  return (
    <>
      {/* Background with Texture */}
      <div className={`fixed inset-0 bg-gradient-to-br from-red-500 via-purple-600 to-blue-500 transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}></div>
      <div className={`fixed inset-0 texture-overlay transition-all duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}></div>

      {/* Main Results Content */}
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 relative z-10 transition-all duration-700 ${
        isExiting ? 'opacity-0 translate-y-8' : isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Event Title - Outside Container */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 -rotate-90 origin-center z-20">
          <div className="text-center whitespace-nowrap">
            <h1 className="text-6xl font-black text-white/90 mb-4 tracking-widest">{state.matchTitle}</h1>
            <div className="text-2xl text-gray-300/80 font-light tracking-wide">MATCH RESULTS</div>
          </div>
        </div>

        {/* Main Results Container */}
        <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl p-12 border border-white/30 shadow-2xl max-w-6xl w-full">
          

          {/* Score Display */}
          <div className="flex items-center justify-center gap-16 mb-12">
            {/* Red Score */}
            <div className="text-center">
              <div className={`text-8xl font-mono font-bold p-8 rounded-xl ${
                winner === 'red' ? 'bg-red-600/80 animate-winner-glow' : 'bg-red-600/40'
              }`}>
                {state.redScore}
              </div>
            </div>

            {/* VS */}
            <div className="text-4xl font-bold text-gray-400">VS</div>

            {/* Blue Score */}
            <div className="text-center">
              <div className={`text-8xl font-mono font-bold p-8 rounded-xl ${
                winner === 'blue' ? 'bg-blue-600/80 animate-winner-glow' : 'bg-blue-600/40'
              }`}>
                {state.blueScore}
              </div>
            </div>
          </div>


          {/* OPR Contributions */}
          <div className="grid grid-cols-2 gap-8">
            {/* Red Alliance OPR */}
            <div>
              <div className="space-y-3">
                {sortedRedOPR.map((player, index) => (
                  <div 
                    key={player.username || `red-player-${index}`}
                    className="bg-red-700/20 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center border border-red-400/40"
                  >
                    <span className="text-lg font-semibold text-red-100">{player.username}</span>
                    <span className="text-xl font-mono font-bold text-red-200 bg-red-600/40 backdrop-blur-sm px-3 py-1.5 rounded">
                      {player.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blue Alliance OPR */}
            <div>
              <div className="space-y-3">
                {sortedBlueOPR.map((player, index) => (
                  <div 
                    key={player.username || `blue-player-${index}`}
                    className="bg-blue-700/20 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center border border-blue-400/40"
                  >
                    <span className="text-lg font-semibold text-blue-100">{player.username}</span>
                    <span className="text-xl font-mono font-bold text-blue-200 bg-blue-600/40 backdrop-blur-sm px-3 py-1.5 rounded">
                      {player.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Points Differential Graph */}
          {differentialData.length > 0 && (
            <div className="mt-8">
              <PointsDifferentialGraph data={differentialData} />
            </div>
          )}

          {/* Logo */}
          <div className="flex justify-center mt-8">
            <div className="w-24 h-24 relative">
              <Image
                src="/assets/src-light-logo.png"
                alt="SRC Logo"
                fill
                style={{ objectFit: 'contain' }}
                className="drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes winner-glow {
          0% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          1% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 1px rgba(255, 255, 255, 0.01), 0 0 2px rgba(255, 255, 255, 0.005); }
          2% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 2px rgba(255, 255, 255, 0.02), 0 0 4px rgba(255, 255, 255, 0.01); }
          3% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 3px rgba(255, 255, 255, 0.03), 0 0 6px rgba(255, 255, 255, 0.015); }
          4% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 4px rgba(255, 255, 255, 0.04), 0 0 8px rgba(255, 255, 255, 0.02); }
          5% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 5px rgba(255, 255, 255, 0.05), 0 0 10px rgba(255, 255, 255, 0.025); }
          6% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 6px rgba(255, 255, 255, 0.06), 0 0 12px rgba(255, 255, 255, 0.03); }
          7% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 7px rgba(255, 255, 255, 0.07), 0 0 14px rgba(255, 255, 255, 0.035); }
          8% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 8px rgba(255, 255, 255, 0.08), 0 0 16px rgba(255, 255, 255, 0.04); }
          9% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 9px rgba(255, 255, 255, 0.09), 0 0 18px rgba(255, 255, 255, 0.045); }
          10% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 10px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.05); }
          11% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 11px rgba(255, 255, 255, 0.11), 0 0 22px rgba(255, 255, 255, 0.055); }
          12% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 12px rgba(255, 255, 255, 0.12), 0 0 24px rgba(255, 255, 255, 0.06); }
          13% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 13px rgba(255, 255, 255, 0.13), 0 0 26px rgba(255, 255, 255, 0.065); }
          14% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 14px rgba(255, 255, 255, 0.14), 0 0 28px rgba(255, 255, 255, 0.07); }
          15% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 15px rgba(255, 255, 255, 0.15), 0 0 30px rgba(255, 255, 255, 0.075); }
          16% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 16px rgba(255, 255, 255, 0.16), 0 0 32px rgba(255, 255, 255, 0.08); }
          17% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 17px rgba(255, 255, 255, 0.17), 0 0 34px rgba(255, 255, 255, 0.085); }
          18% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 18px rgba(255, 255, 255, 0.18), 0 0 36px rgba(255, 255, 255, 0.09); }
          19% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 19px rgba(255, 255, 255, 0.19), 0 0 38px rgba(255, 255, 255, 0.095); }
          20% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 20px rgba(255, 255, 255, 0.2), 0 0 40px rgba(255, 255, 255, 0.1); }
          21% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 21px rgba(255, 255, 255, 0.21), 0 0 42px rgba(255, 255, 255, 0.105); }
          22% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 22px rgba(255, 255, 255, 0.22), 0 0 44px rgba(255, 255, 255, 0.11); }
          23% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 23px rgba(255, 255, 255, 0.23), 0 0 46px rgba(255, 255, 255, 0.115); }
          24% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 24px rgba(255, 255, 255, 0.24), 0 0 48px rgba(255, 255, 255, 0.12); }
          25% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 25px rgba(255, 255, 255, 0.25), 0 0 50px rgba(255, 255, 255, 0.125); }
          26% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 26px rgba(255, 255, 255, 0.26), 0 0 52px rgba(255, 255, 255, 0.13); }
          27% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 27px rgba(255, 255, 255, 0.27), 0 0 54px rgba(255, 255, 255, 0.135); }
          28% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 28px rgba(255, 255, 255, 0.28), 0 0 56px rgba(255, 255, 255, 0.14); }
          29% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 29px rgba(255, 255, 255, 0.29), 0 0 58px rgba(255, 255, 255, 0.145); }
          30% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.15); }
          31% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 31px rgba(255, 255, 255, 0.31), 0 0 62px rgba(255, 255, 255, 0.155); }
          32% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 32px rgba(255, 255, 255, 0.32), 0 0 64px rgba(255, 255, 255, 0.16); }
          33% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 33px rgba(255, 255, 255, 0.33), 0 0 66px rgba(255, 255, 255, 0.165); }
          34% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 34px rgba(255, 255, 255, 0.34), 0 0 68px rgba(255, 255, 255, 0.17); }
          35% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 35px rgba(255, 255, 255, 0.35), 0 0 70px rgba(255, 255, 255, 0.175); }
          36% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 36px rgba(255, 255, 255, 0.36), 0 0 72px rgba(255, 255, 255, 0.18); }
          37% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 37px rgba(255, 255, 255, 0.37), 0 0 74px rgba(255, 255, 255, 0.185); }
          38% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 38px rgba(255, 255, 255, 0.38), 0 0 76px rgba(255, 255, 255, 0.19); }
          39% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 39px rgba(255, 255, 255, 0.39), 0 0 78px rgba(255, 255, 255, 0.195); }
          40% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 80px rgba(255, 255, 255, 0.2); }
          41% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 41px rgba(255, 255, 255, 0.41), 0 0 82px rgba(255, 255, 255, 0.205); }
          42% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 42px rgba(255, 255, 255, 0.42), 0 0 84px rgba(255, 255, 255, 0.21); }
          43% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 43px rgba(255, 255, 255, 0.43), 0 0 86px rgba(255, 255, 255, 0.215); }
          44% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 44px rgba(255, 255, 255, 0.44), 0 0 88px rgba(255, 255, 255, 0.22); }
          45% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 45px rgba(255, 255, 255, 0.45), 0 0 90px rgba(255, 255, 255, 0.225); }
          46% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 46px rgba(255, 255, 255, 0.46), 0 0 92px rgba(255, 255, 255, 0.23); }
          47% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 47px rgba(255, 255, 255, 0.47), 0 0 94px rgba(255, 255, 255, 0.235); }
          48% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 48px rgba(255, 255, 255, 0.48), 0 0 96px rgba(255, 255, 255, 0.24); }
          49% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 49px rgba(255, 255, 255, 0.49), 0 0 98px rgba(255, 255, 255, 0.245); }
          50% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 50px rgba(255, 255, 255, 0.5), 0 0 100px rgba(255, 255, 255, 0.25); }
          51% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 49px rgba(255, 255, 255, 0.49), 0 0 98px rgba(255, 255, 255, 0.245); }
          52% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 48px rgba(255, 255, 255, 0.48), 0 0 96px rgba(255, 255, 255, 0.24); }
          53% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 47px rgba(255, 255, 255, 0.47), 0 0 94px rgba(255, 255, 255, 0.235); }
          54% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 46px rgba(255, 255, 255, 0.46), 0 0 92px rgba(255, 255, 255, 0.23); }
          55% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 45px rgba(255, 255, 255, 0.45), 0 0 90px rgba(255, 255, 255, 0.225); }
          56% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 44px rgba(255, 255, 255, 0.44), 0 0 88px rgba(255, 255, 255, 0.22); }
          57% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 43px rgba(255, 255, 255, 0.43), 0 0 86px rgba(255, 255, 255, 0.215); }
          58% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 42px rgba(255, 255, 255, 0.42), 0 0 84px rgba(255, 255, 255, 0.21); }
          59% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 41px rgba(255, 255, 255, 0.41), 0 0 82px rgba(255, 255, 255, 0.205); }
          60% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 80px rgba(255, 255, 255, 0.2); }
          61% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 39px rgba(255, 255, 255, 0.39), 0 0 78px rgba(255, 255, 255, 0.195); }
          62% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 38px rgba(255, 255, 255, 0.38), 0 0 76px rgba(255, 255, 255, 0.19); }
          63% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 37px rgba(255, 255, 255, 0.37), 0 0 74px rgba(255, 255, 255, 0.185); }
          64% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 36px rgba(255, 255, 255, 0.36), 0 0 72px rgba(255, 255, 255, 0.18); }
          65% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 35px rgba(255, 255, 255, 0.35), 0 0 70px rgba(255, 255, 255, 0.175); }
          66% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 34px rgba(255, 255, 255, 0.34), 0 0 68px rgba(255, 255, 255, 0.17); }
          67% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 33px rgba(255, 255, 255, 0.33), 0 0 66px rgba(255, 255, 255, 0.165); }
          68% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 32px rgba(255, 255, 255, 0.32), 0 0 64px rgba(255, 255, 255, 0.16); }
          69% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 31px rgba(255, 255, 255, 0.31), 0 0 62px rgba(255, 255, 255, 0.155); }
          70% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.15); }
          71% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 29px rgba(255, 255, 255, 0.29), 0 0 58px rgba(255, 255, 255, 0.145); }
          72% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 28px rgba(255, 255, 255, 0.28), 0 0 56px rgba(255, 255, 255, 0.14); }
          73% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 27px rgba(255, 255, 255, 0.27), 0 0 54px rgba(255, 255, 255, 0.135); }
          74% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 26px rgba(255, 255, 255, 0.26), 0 0 52px rgba(255, 255, 255, 0.13); }
          75% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 25px rgba(255, 255, 255, 0.25), 0 0 50px rgba(255, 255, 255, 0.125); }
          76% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 24px rgba(255, 255, 255, 0.24), 0 0 48px rgba(255, 255, 255, 0.12); }
          77% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 23px rgba(255, 255, 255, 0.23), 0 0 46px rgba(255, 255, 255, 0.115); }
          78% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 22px rgba(255, 255, 255, 0.22), 0 0 44px rgba(255, 255, 255, 0.11); }
          79% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 21px rgba(255, 255, 255, 0.21), 0 0 42px rgba(255, 255, 255, 0.105); }
          80% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 20px rgba(255, 255, 255, 0.2), 0 0 40px rgba(255, 255, 255, 0.1); }
          81% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 19px rgba(255, 255, 255, 0.19), 0 0 38px rgba(255, 255, 255, 0.095); }
          82% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 18px rgba(255, 255, 255, 0.18), 0 0 36px rgba(255, 255, 255, 0.09); }
          83% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 17px rgba(255, 255, 255, 0.17), 0 0 34px rgba(255, 255, 255, 0.085); }
          84% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 16px rgba(255, 255, 255, 0.16), 0 0 32px rgba(255, 255, 255, 0.08); }
          85% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 15px rgba(255, 255, 255, 0.15), 0 0 30px rgba(255, 255, 255, 0.075); }
          86% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 14px rgba(255, 255, 255, 0.14), 0 0 28px rgba(255, 255, 255, 0.07); }
          87% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 13px rgba(255, 255, 255, 0.13), 0 0 26px rgba(255, 255, 255, 0.065); }
          88% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 12px rgba(255, 255, 255, 0.12), 0 0 24px rgba(255, 255, 255, 0.06); }
          89% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 11px rgba(255, 255, 255, 0.11), 0 0 22px rgba(255, 255, 255, 0.055); }
          90% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 10px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.05); }
          91% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 9px rgba(255, 255, 255, 0.09), 0 0 18px rgba(255, 255, 255, 0.045); }
          92% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 8px rgba(255, 255, 255, 0.08), 0 0 16px rgba(255, 255, 255, 0.04); }
          93% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 7px rgba(255, 255, 255, 0.07), 0 0 14px rgba(255, 255, 255, 0.035); }
          94% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 6px rgba(255, 255, 255, 0.06), 0 0 12px rgba(255, 255, 255, 0.03); }
          95% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 5px rgba(255, 255, 255, 0.05), 0 0 10px rgba(255, 255, 255, 0.025); }
          96% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 4px rgba(255, 255, 255, 0.04), 0 0 8px rgba(255, 255, 255, 0.02); }
          97% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 3px rgba(255, 255, 255, 0.03), 0 0 6px rgba(255, 255, 255, 0.015); }
          98% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 2px rgba(255, 255, 255, 0.02), 0 0 4px rgba(255, 255, 255, 0.01); }
          99% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 1px rgba(255, 255, 255, 0.01), 0 0 2px rgba(255, 255, 255, 0.005); }
          100% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        }

        @keyframes texture-flow {
          0% { background-position: 0px 0px, 0px 0px, 0px 0px; }
          100% { background-position: 60px 60px, 60px 60px, 60px 60px; }
        }

        .texture-overlay {
          background-image: 
            linear-gradient(45deg, rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px);
          background-size: 60px 60px, 60px 60px, 60px 60px;
          animation: texture-flow 15s linear infinite;
          opacity: 0.8;
        }

        .animate-winner-glow {
          animation: winner-glow 3s ease-in-out infinite;
        }

        @keyframes winner-text {
          0%, 100% { 
            transform: scale(1);
            text-shadow: 0 0 0px rgba(255, 255, 255, 0);
          }
          50% { 
            transform: scale(1.05);
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.4);
          }
        }

        .animate-winner-text {
          animation: winner-text 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
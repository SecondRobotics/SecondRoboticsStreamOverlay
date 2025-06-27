import { useState, useEffect } from 'react';

interface ScoreData {
  redScore: number;
  blueScore: number;
  error?: string;
}

export const useScores = (gameFileLocation: string) => {
  const [scores, setScores] = useState<ScoreData>({ redScore: 0, blueScore: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gameFileLocation || gameFileLocation.trim() === '') {
      setScores({ redScore: 0, blueScore: 0 });
      return;
    }

    const readScoreFile = async (filePath: string): Promise<number> => {
      try {
        const response = await fetch(`file://${filePath}`, { cache: 'no-store' });
        if (response.ok) {
          const content = await response.text();
          const score = parseInt(content.trim());
          return isNaN(score) ? 0 : score;
        }
      } catch (error) {
        // Fallback to try reading as local file URL
        try {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.txt';
          
          // For browser security, we'll need to use File System Access API or file input
          // But for real-time, let's try a different approach with live file watching
        } catch (e) {
          console.warn(`Cannot read file directly: ${filePath}`);
        }
      }
      return 0;
    };

    const pollScores = async () => {
      try {
        const redPath = `${gameFileLocation}/Score_R.txt`;
        const bluePath = `${gameFileLocation}/Score_B.txt`;
        
        // Ultra-fast parallel file reads with no JSON parsing overhead
        const [redResponse, blueResponse] = await Promise.all([
          fetch(`/api/read-file?path=${encodeURIComponent(redPath)}`, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          }).catch(() => ({ ok: false, text: () => Promise.resolve('0') })),
          fetch(`/api/read-file?path=${encodeURIComponent(bluePath)}`, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          }).catch(() => ({ ok: false, text: () => Promise.resolve('0') }))
        ]);

        const [redText, blueText] = await Promise.all([
          redResponse.text(),
          blueResponse.text()
        ]);

        const redScore = parseInt(redText) || 0;
        const blueScore = parseInt(blueText) || 0;

        setScores(prevScores => {
          if (prevScores.redScore !== redScore || prevScores.blueScore !== blueScore) {
            return { redScore, blueScore };
          }
          return prevScores;
        });
      } catch (error) {
        // Silently fail and keep previous scores - don't spam console
        setScores(prevScores => prevScores);
      }
    };

    pollScores();

    // Ultra-fast polling - every 16ms (60fps)
    const interval = setInterval(pollScores, 16);

    return () => clearInterval(interval);
  }, [gameFileLocation]);

  return { scores, loading };
};
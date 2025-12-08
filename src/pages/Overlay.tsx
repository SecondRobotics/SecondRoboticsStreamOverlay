import { useState, useEffect } from 'react';
import { useOverlaySocket } from '../lib/useOverlaySocket';
import MatchView from '../components/overlay/MatchView';
import StartingSoon from '../components/overlay/StartingSoon';

export default function Overlay() {
  const { state } = useOverlaySocket();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderOverlayContent = () => {
    switch (state.mode) {
      case 'match':
        return <MatchView state={state} currentTime={currentTime} />;
      case 'starting-soon':
      default:
        return <StartingSoon state={state} currentTime={currentTime} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      {renderOverlayContent()}
    </div>
  );
}

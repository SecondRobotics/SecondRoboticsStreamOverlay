"use client";

import { OverlayState } from "../../lib/overlayState";
import { useState, useEffect } from "react";

interface StartingSoonProps {
  state: OverlayState;
  currentTime: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function StartingSoon({ state, currentTime }: StartingSoonProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const updateCountdown = () => {
      if (state.startingTime) {
        const now = new Date().getTime();
        const startTime = new Date(state.startingTime).getTime();
        const diff = startTime - now;

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setTimeRemaining({ days, hours, minutes, seconds });
        } else {
          setTimeRemaining(null);
        }
      } else {
        setTimeRemaining(null);
      }
    };

    // Run immediately, then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [state.startingTime, isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const animationInterval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(animationInterval);
  }, [isClient]);

  const formatTimeUnit = (value: number) => value.toString().padStart(2, '0');

  return (
    <>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
              linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)
            `
          }}
        />
        
        {/* SRC Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <img 
            src="/assets/src-light-logo.png" 
            alt="SRC Logo Background" 
            className="h-[600px] w-auto"
          />
        </div>

        {/* Primary light beams */}
        {isClient && Array.from({ length: 16 }).map((_, i) => (
          <div
            key={`primary-${i}`}
            className="absolute opacity-10"
            style={{
              left: '50%',
              top: '50%',
              width: '2px',
              height: '120%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(168,85,247,0.5) 50%, rgba(59,130,246,0.4) 80%, transparent 100%)',
              transformOrigin: 'center center',
              transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)`,
              animation: `beam-pulse ${6 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}

        {/* Secondary rotating beams */}
        {isClient && Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`secondary-${i}`}
            className="absolute opacity-8"
            style={{
              left: '50%',
              top: '50%',
              width: '1px',
              height: '80%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(147,51,234,0.3) 30%, rgba(79,70,229,0.4) 70%, transparent 100%)',
              transformOrigin: 'center center',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              animation: `beam-rotate ${15 + i * 2}s linear infinite, beam-fade ${4 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}

        {/* Energy waves */}
        {isClient && Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`wave-${i}`}
            className="absolute rounded-full border opacity-5"
            style={{
              left: '50%',
              top: '50%',
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              borderColor: i % 2 === 0 ? 'rgba(168,85,247,0.3)' : 'rgba(59,130,246,0.3)',
              borderWidth: '1px',
              transform: 'translate(-50%, -50%)',
              animation: `wave-expand ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`
            }}
          />
        ))}

        {/* Pulsing dots */}
        {isClient && Array.from({ length: 20 }).map((_, i) => {
          const angle = (i * 18) * Math.PI / 180;
          const radius = 250 + (i % 3) * 50;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={`dot-${i}`}
              className="absolute w-1 h-1 rounded-full opacity-20"
              style={{
                left: '50%',
                top: '50%',
                background: i % 3 === 0 ? 'rgba(255,255,255,0.8)' : i % 3 === 1 ? 'rgba(168,85,247,0.8)' : 'rgba(59,130,246,0.8)',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                animation: `dot-pulse ${3 + (i % 4)}s ease-in-out infinite, dot-orbit ${20 + i * 2}s linear infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          );
        })}

        {/* Animated rings */}
        {isClient && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-20"
            style={{
              transform: `rotate(${animationPhase}deg)`,
            }}
          >
            <div className="w-96 h-96 border border-white rounded-full"></div>
            <div className="absolute w-80 h-80 border border-purple-300 rounded-full animate-pulse"></div>
            <div className="absolute w-64 h-64 border border-blue-300 rounded-full" 
                 style={{ animation: 'spin 8s linear infinite reverse' }}></div>
          </div>
        )}
      </div>

      {/* Current Time Display */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-lg">
        <div className="text-sm font-mono text-white">
          {currentTime}
        </div>
      </div>


      {/* Event Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h2 className="text-2xl font-bold text-white/90 tracking-wide">
          {state.matchTitle}
        </h2>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <div className="mb-8">
            <h1 
              className="text-8xl font-bold text-white mb-6 drop-shadow-2xl"
              style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}
            >
              Starting Soon
            </h1>
          </div>

          {timeRemaining && (
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="grid grid-cols-3 gap-8 text-center">
                {[
                  { label: 'Hours', value: timeRemaining.hours + (timeRemaining.days * 24) },
                  { label: 'Minutes', value: timeRemaining.minutes },
                  { label: 'Seconds', value: timeRemaining.seconds }
                ].map((unit, index) => ( // eslint-disable-line @typescript-eslint/no-unused-vars
                  <div key={unit.label} className="flex flex-col items-center">
                    <div 
                      className="text-7xl font-bold text-white mb-2 transition-all duration-300"
                      style={{
                        textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
                        animation: unit.label === 'Seconds' ? 'pulse 1s ease-in-out infinite' : 'none'
                      }}
                    >
                      {formatTimeUnit(unit.value)}
                    </div>
                    <div className="text-lg font-medium text-white/80 uppercase tracking-wider">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!timeRemaining && state.startingTime && (
            <div className="bg-red-600/80 backdrop-blur-md rounded-2xl p-6 border border-red-400/30 shadow-2xl">
              <h2 className="text-4xl font-bold text-white">Stream is Starting!</h2>
            </div>
          )}

          {!state.startingTime && (
            <div className="bg-yellow-600/80 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30 shadow-2xl">
              <h2 className="text-2xl font-bold text-white">Set starting time in dashboard</h2>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes glow {
          from {
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(168, 85, 247, 0.3);
          }
          to {
            text-shadow: 0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px rgba(168, 85, 247, 0.5);
          }
        }

        @keyframes beam-pulse {
          0%, 100% { 
            opacity: 0.05; 
            transform: translate(-50%, -50%) scaleY(0.8) scaleX(0.5); 
          }
          50% { 
            opacity: 0.15; 
            transform: translate(-50%, -50%) scaleY(1.3) scaleX(1.2); 
          }
        }

        @keyframes beam-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes beam-fade {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.12; }
        }

        @keyframes wave-expand {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(0.8); 
            opacity: 0.1; 
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2); 
            opacity: 0.03; 
          }
        }

        @keyframes dot-pulse {
          0%, 100% { 
            opacity: 0.1; 
            transform: translate(-50%, -50%) scale(0.5); 
          }
          50% { 
            opacity: 0.4; 
            transform: translate(-50%, -50%) scale(1.5); 
          }
        }

        @keyframes dot-orbit {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(var(--radius, 250px)) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(var(--radius, 250px)) rotate(-360deg); }
        }
      `}</style>
    </>
  );
}
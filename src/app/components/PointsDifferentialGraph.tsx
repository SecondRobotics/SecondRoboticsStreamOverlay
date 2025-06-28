import { useEffect, useState, useMemo } from 'react';
import { PointsDifferentialData } from '../lib/pointsDifferentialTracker';

interface PointsDifferentialGraphProps {
  data: PointsDifferentialData[];
}

export default function PointsDifferentialGraph({ data }: PointsDifferentialGraphProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Calculate graph dimensions and scaling
  const graphData = useMemo(() => {
    if (data.length === 0) return null;

    const maxDiff = Math.max(...data.map(d => Math.abs(d.differential)));
    const graphHeight = 200;
    const graphWidth = 800; // Increased width
    const padding = 40;

    // Create SVG path for the differential line
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (graphWidth - 2 * padding);
      const y = padding + (graphHeight - 2 * padding) / 2 - (point.differential / (maxDiff || 1)) * (graphHeight - 2 * padding) / 2;
      return `${x},${y}`;
    });

    const path = `M ${points.join(' L ')}`;
    const zeroLineY = padding + (graphHeight - 2 * padding) / 2;

    return {
      path,
      points: data.map((point, index) => ({
        x: padding + (index / (data.length - 1)) * (graphWidth - 2 * padding),
        y: padding + (graphHeight - 2 * padding) / 2 - (point.differential / (maxDiff || 1)) * (graphHeight - 2 * padding) / 2,
        differential: point.differential,
        gameTime: point.gameTime,
        redScore: point.redScore,
        blueScore: point.blueScore
      })),
      zeroLineY,
      maxDiff,
      graphWidth,
      graphHeight,
      padding
    };
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!graphData || data.length === 0) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Points Differential Over Time</h3>
        <div className="text-gray-400 text-center py-8">
          No differential data available for this match
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-white/20 transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <h3 className="text-xl font-bold text-white mb-4">Points Differential Over Time</h3>
      
      <div className="flex items-start gap-6">
        {/* Graph Container */}
        <div className="relative flex-1">
          <svg
            width="100%"
            height={graphData.graphHeight}
            viewBox={`0 0 ${graphData.graphWidth} ${graphData.graphHeight}`}
            className="overflow-visible w-full"
          >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Zero line */}
          <line
            x1={graphData.padding}
            y1={graphData.zeroLineY}
            x2={graphData.graphWidth - graphData.padding}
            y2={graphData.zeroLineY}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Differential line */}
          <path
            d={graphData.path}
            stroke="url(#differentialGradient)"
            strokeWidth="3"
            fill="none"
            className="animate-draw-line"
            style={{
              strokeDasharray: '1000',
              strokeDashoffset: '1000',
              animation: 'drawLine 2s ease-out forwards'
            }}
          />
          
          {/* Data points */}
          {graphData.points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={point.differential > 0 ? '#ef4444' : point.differential < 0 ? '#3b82f6' : '#6b7280'}
                stroke="white"
                strokeWidth="2"
                className="animate-fade-in-point"
                style={{
                  animationDelay: `${index * 0.05 + 1}s`
                }}
              />
              
              {/* Tooltip trigger (invisible larger circle) */}
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="transparent"
                className="hover:opacity-50"
              >
                <title>
                  {`${point.gameTime} - Red: ${point.redScore}, Blue: ${point.blueScore}, Diff: ${point.differential > 0 ? '+' : ''}${point.differential}`}
                </title>
              </circle>
            </g>
          ))}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="differentialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: '#ef4444', stopOpacity: 0.8}} />
              <stop offset="50%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0.8}} />
            </linearGradient>
          </defs>
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400" style={{marginTop: `${graphData.padding}px`, height: `${graphData.graphHeight - 2 * graphData.padding}px`}}>
            <span>+{graphData.maxDiff}</span>
            <span>0</span>
            <span>-{graphData.maxDiff}</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-col space-y-3 text-sm min-w-[120px]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">Red Leading</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Blue Leading</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-300">Tied</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fadeInPoint {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-point {
          opacity: 0;
          animation: fadeInPoint 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
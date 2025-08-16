import React, { useMemo } from 'react';

interface SeriesIndicatorProps {
  seriesType: 'bo3' | 'bo5' | 'bo7';
  redScore: number;
  blueScore: number;
  redAllianceName: string;
  blueAllianceName: string;
  allianceBranding?: boolean;
  redPrimaryColor?: string;
  redSecondaryColor?: string;
  bluePrimaryColor?: string;
  blueSecondaryColor?: string;
  flippedTeams?: boolean;
}

export default function SeriesIndicator({ 
  seriesType = 'bo3', 
  redScore = 0, 
  blueScore = 0,
  redAllianceName = 'Red Alliance',
  blueAllianceName = 'Blue Alliance',
  allianceBranding = false,
  redPrimaryColor,
  redSecondaryColor,
  bluePrimaryColor,
  blueSecondaryColor,
  flippedTeams = false
}: SeriesIndicatorProps) {
  const validSeriesType = seriesType || 'bo3';
  const totalGames = validSeriesType === 'bo3' ? 3 : validSeriesType === 'bo5' ? 5 : 7;
  const winsNeeded = Math.ceil(totalGames / 2);

  // Memoize color calculations - only recalculate when alliance branding settings change
  const colorConfig = useMemo(() => ({
    redTextColor: allianceBranding && redPrimaryColor ? redPrimaryColor : '#EF4444',
    blueTextColor: allianceBranding && bluePrimaryColor ? bluePrimaryColor : '#3B82F6',
    useRedCustomColor: allianceBranding && redPrimaryColor,
    useBlueCustomColor: allianceBranding && bluePrimaryColor,
    redBoxColor: redPrimaryColor,
    blueBoxColor: bluePrimaryColor
  }), [allianceBranding, redPrimaryColor, bluePrimaryColor]);

  const renderBoxes = (score: number, color: 'red' | 'blue') => {
    const boxes = [];
    const useCustomColor = color === 'red' ? colorConfig.useRedCustomColor : colorConfig.useBlueCustomColor;
    const customColor = color === 'red' ? colorConfig.redBoxColor : colorConfig.blueBoxColor;
    
    for (let i = 0; i < winsNeeded; i++) {
      const isWon = i < score;
      
      const boxStyle: React.CSSProperties = {};
      if (isWon && useCustomColor) {
        boxStyle.backgroundColor = customColor;
        boxStyle.boxShadow = `0 10px 15px -3px ${customColor}80, 0 0 0 1px rgba(255,255,255,0.2)`;
        boxStyle.border = '1px solid rgba(255,255,255,0.3)';
      }
      
      boxes.push(
        <div
          key={i}
          className={`w-10 h-3 rounded transition-all duration-300 border ${
            !useCustomColor ? (
              isWon 
                ? color === 'red' 
                  ? 'bg-red-600 shadow-lg shadow-red-600/50 border-white/30' 
                  : 'bg-blue-600 shadow-lg shadow-blue-600/50 border-white/30'
                : 'bg-gray-800 opacity-60 border-gray-600'
            ) : (
              isWon ? '' : 'bg-gray-800 opacity-60 border-gray-600'
            )
          }`}
          style={boxStyle}
        />
      );
    }
    return boxes;
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/95 backdrop-blur-md rounded-lg p-6 shadow-2xl border border-white/20">
      <div className="flex items-center justify-center" style={{
        transform: flippedTeams ? 'scaleX(-1)' : 'none'
      }}>
        <div className="flex flex-col items-center space-y-3 w-48">
          <span 
            className="font-bold text-sm uppercase tracking-wider text-center drop-shadow-lg"
            style={{ 
              color: colorConfig.redTextColor,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              transform: flippedTeams ? 'scaleX(-1)' : 'none'
            }}
          >
            {redAllianceName}
          </span>
          <div className="flex space-x-2 justify-center w-full">
            {renderBoxes(redScore, 'red')}
          </div>
        </div>
        
        <div className="text-white text-xl font-bold mx-16 drop-shadow-lg" style={{ 
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          transform: flippedTeams ? 'scaleX(-1)' : 'none'
        }}>
          {validSeriesType.toUpperCase()}
        </div>
        
        <div className="flex flex-col items-center space-y-3 w-48">
          <span 
            className="font-bold text-sm uppercase tracking-wider text-center drop-shadow-lg"
            style={{ 
              color: colorConfig.blueTextColor,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              transform: flippedTeams ? 'scaleX(-1)' : 'none'
            }}
          >
            {blueAllianceName}
          </span>
          <div className="flex space-x-2 justify-center w-full">
            {renderBoxes(blueScore, 'blue')}
          </div>
        </div>
      </div>
    </div>
  );
}
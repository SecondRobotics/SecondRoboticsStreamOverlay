import React from 'react';

interface SeriesIndicatorProps {
  seriesType: 'bo3' | 'bo5' | 'bo7';
  redScore: number;
  blueScore: number;
  redAllianceName: string;
  blueAllianceName: string;
}

export default function SeriesIndicator({ 
  seriesType = 'bo3', 
  redScore = 0, 
  blueScore = 0,
  redAllianceName = 'Red Alliance',
  blueAllianceName = 'Blue Alliance'
}: SeriesIndicatorProps) {
  const validSeriesType = seriesType || 'bo3';
  const totalGames = validSeriesType === 'bo3' ? 3 : validSeriesType === 'bo5' ? 5 : 7;
  const winsNeeded = Math.ceil(totalGames / 2);

  const renderBoxes = (score: number, color: 'red' | 'blue') => {
    const boxes = [];
    for (let i = 0; i < winsNeeded; i++) {
      const isWon = i < score;
      boxes.push(
        <div
          key={i}
          className={`w-10 h-3 rounded transition-all duration-300 ${
            isWon 
              ? color === 'red' 
                ? 'bg-red-600 shadow-lg shadow-red-600/50' 
                : 'bg-blue-600 shadow-lg shadow-blue-600/50'
              : 'bg-gray-700 opacity-50'
          }`}
        />
      );
    }
    return boxes;
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-6 shadow-2xl">
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 w-48">
          <span className="text-red-500 font-bold text-sm uppercase tracking-wider text-center">
            {redAllianceName}
          </span>
          <div className="flex space-x-2 justify-center w-full">
            {renderBoxes(redScore, 'red')}
          </div>
        </div>
        
        <div className="text-white text-xl font-bold mx-16">
          {validSeriesType.toUpperCase()}
        </div>
        
        <div className="flex flex-col items-center space-y-3 w-48">
          <span className="text-blue-500 font-bold text-sm uppercase tracking-wider text-center">
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
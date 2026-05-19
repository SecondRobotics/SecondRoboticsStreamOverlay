interface AllianceIndicatorsProps {
  isRed: boolean | undefined;
  hubActive: boolean;
  energized: boolean;
  supercharged: boolean;
  traversal: boolean;
  align: 'left' | 'right';
}

export default function AllianceIndicators({
  isRed, hubActive, energized, supercharged, traversal, align
}: AllianceIndicatorsProps) {
  const activeBg = isRed ? 'bg-red-500/80' : 'bg-blue-500/80';
  const inactiveBg = 'bg-gray-700/50';

  const rps = [
    { label: '⚡', name: 'Energized',    active: energized },
    { label: '⚡⚡', name: 'Supercharged', active: supercharged },
    { label: '🏔', name: 'Traversal',    active: traversal },
  ];

  return (
    <div className={`flex flex-col gap-1 items-${align === 'left' ? 'end' : 'start'}`}>
      {/* Shift arrow */}
      <div className={`flex items-center gap-1 mb-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className={`text-xs font-bold uppercase tracking-wide transition-all duration-500 ${
          hubActive
            ? isRed
              ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.9)]'
              : 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.9)]'
            : 'text-gray-600'
        }`}>Shift</span>
        <span className={`text-xl transition-all duration-500 ${
          hubActive
            ? isRed
              ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.9)]'
              : 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.9)]'
            : 'text-gray-700'
        }`}>
          {align === 'left' ? '◀' : '▶'}
        </span>
      </div>

      {/* RP indicators */}
      <div className={`flex gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {rps.map(rp => (
          <div
            key={rp.name}
            title={rp.name}
            className={`flex flex-col items-center px-2 py-1 rounded text-xs font-bold transition-all duration-300 ${
              rp.active ? activeBg + ' text-white' : inactiveBg + ' text-gray-500'
            }`}
          >
            <span>{rp.label}</span>
            <span className="text-[10px] leading-tight">{rp.name.slice(0, 5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
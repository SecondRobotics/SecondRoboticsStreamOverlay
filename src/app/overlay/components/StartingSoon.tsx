import { OverlayState } from "../../lib/overlayState";

interface StartingSoonProps {
  state: OverlayState;
  currentTime: string;
}

export default function StartingSoon({ state, currentTime }: StartingSoonProps) {
  return (
    <>
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="text-sm font-mono">
          {currentTime}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-bold text-white">Starting Soon</h1>
        </div>
      </div>
    </>
  );
}
import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  onComplete: () => void;
  fpPhoto: string;
}

export default function DustingExperiment({ onComplete, fpPhoto }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dustLevel, setDustLevel] = useState(0);
  const [isDusting, setIsDusting] = useState(false);
  const [brushPos, setBrushPos] = useState({ x: -100, y: -100 });
  const [brushSize, setBrushSize] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [lastDustTime, setLastDustTime] = useState(0);
  const dustTrailRef = useRef<{ x: number; y: number; a: number }[]>([]);
  const [trail, setTrail] = useState<{ x: number; y: number; a: number }[]>([]);

  const addDust = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastDustTime < 8) return;
    setLastDustTime(now);

    const cx = 0.5, cy = 0.48;
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 0.22 + brushSize * 0.06;
    const gain = Math.max(0, 1 - dist / radius) * (1.5 + brushSize * 1.2);
    setDustLevel((prev) => Math.min(100, prev + gain));

    dustTrailRef.current.push({ x, y, a: 1 });
    if (dustTrailRef.current.length > 80) dustTrailRef.current.shift();
    dustTrailRef.current = dustTrailRef.current
      .map((p) => ({ ...p, a: p.a - 0.012 }))
      .filter((p) => p.a > 0);
    setTrail([...dustTrailRef.current]);
  }, [lastDustTime, brushSize]);

  const handleMove = (e: React.MouseEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setBrushPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (isDusting) addDust(x, y);
  };

  const handleTouch = (e: React.TouchEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    setBrushPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    if (isDusting) addDust(x, y);
  };

  useEffect(() => {
    if (dustLevel >= 98 && !revealed) {
      setRevealed(true);
      setTimeout(onComplete, 2200);
    }
  }, [dustLevel, revealed, onComplete]);

  const fpFilter = (() => {
    if (dustLevel < 20) return `grayscale(1) brightness(0.15) contrast(3)`;
    if (dustLevel < 50) return `grayscale(1) brightness(${0.15 + dustLevel * 0.005}) contrast(2.5)`;
    if (dustLevel < 80) return `grayscale(0.7) sepia(0.6) brightness(${0.4 + dustLevel * 0.005}) contrast(2) saturate(2)`;
    return `grayscale(0.2) sepia(1) brightness(1.0) contrast(2) saturate(4) hue-rotate(5deg)`;
  })();

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🖌️</span>
        <h3 className="text-lg font-bold text-[#f5c542]">실험 2: 지문 가루 채취</h3>
      </div>
      <p className="text-[#e7e3d6]/70 text-xs mb-2">
        <b className="text-[#f5c542]">마우스를 꾹 누른 채 계속 문질러</b> 가루를 골고루 뿌려보세요.
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-[#f5c542]">브러시</span>
        {[1, 2, 3].map((s) => (
          <button key={s} onClick={() => setBrushSize(s)}
            className={`w-7 h-7 rounded-full border-2 text-[10px] font-bold
              ${brushSize === s ? "border-[#f5c542] bg-[#f5c542]/20 text-[#f5c542]" : "border-[#2a3040] text-[#e7e3d6]/50"}`}
          >{s}</button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] text-[#f5c542] w-20">가루 묻힘</span>
        <div className="progress-track flex-1 h-2.5 rounded-full overflow-hidden">
          <div className="progress-fill h-full rounded-full" style={{ width: `${dustLevel}%` }} />
        </div>
        <span className="text-[10px] text-[#e7e3d6]/60 w-10 text-right">{Math.round(dustLevel)}%</span>
      </div>

      <div
        ref={stageRef}
        className="relative w-full h-64 rounded-xl overflow-hidden cursor-none select-none"
        style={{
          background: "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 40%, #2e2e2e 70%, #1f1f1f 100%)",
          border: "2px solid #3a3a3a",
        }}
        onMouseDown={() => setIsDusting(true)}
        onMouseUp={() => setIsDusting(false)}
        onMouseLeave={() => setIsDusting(false)}
        onMouseMove={handleMove}
        onTouchStart={() => setIsDusting(true)}
        onTouchEnd={() => setIsDusting(false)}
        onTouchMove={handleTouch}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)" }}
        />

        {/* 숨겨진 실제 지문 — 가루 채취하면 드러남 */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: Math.min(1, dustLevel / 95), transition: "opacity 0.3s" }}
        >
          <img
            src={fpPhoto}
            alt="지문"
            draggable={false}
            style={{
              width: 200,
              height: 200,
              objectFit: "contain",
              filter: fpFilter,
              transition: "filter 0.4s",
            }}
          />
        </div>

        {trail.map((p, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x * 100}%`, top: `${p.y * 100}%`,
              width: 15 + brushSize * 8, height: 15 + brushSize * 8,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(40,40,40,0.7) 0%, transparent 70%)",
              opacity: p.a * 0.5,
            }}
          />
        ))}

        <div className="absolute inset-0 flashlight pointer-events-none"
          style={{ "--mx": `${brushPos.x}px`, "--my": `${brushPos.y}px` } as React.CSSProperties}
        />

        {brushPos.x > 0 && (
          <div className="absolute pointer-events-none z-10"
            style={{
              left: brushPos.x - (12 + brushSize * 4),
              top: brushPos.y - (12 + brushSize * 4),
              width: 24 + brushSize * 8, height: 24 + brushSize * 8,
            }}
          >
            <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow-lg">
              <rect x="18" y="15" width="14" height="28" rx="2" fill="#8b6914" />
              <rect x="18" y="38" width="14" height="8" rx="2" fill="#c0c0c0" />
              <ellipse cx="25" cy="44" rx={8 + brushSize * 2} ry={4 + brushSize} fill="#2a2a2a" />
            </svg>
          </div>
        )}

        {revealed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-4xl mb-2">✨</p>
              <p className="text-[#f5c542] text-lg font-bold">지문 발견!</p>
              <p className="text-[#e7e3d6]/70 text-xs mt-1">테이프로 리프팅할 준비 완료</p>
            </div>
          </div>
        )}

        {dustLevel < 5 && !isDusting && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1.5 rounded-lg text-[10px] text-[#e7e3d6]/80 pointer-events-none">
            💡 마우스를 누른 채 계속 문지르세요
          </div>
        )}
      </div>

      {revealed && (
        <p className="text-center text-[#f5c542]/80 text-[10px] mt-2 tracking-wider">
          가루가 지문의 기름 성분에 달라붙어 패턴이 드러났어요!
        </p>
      )}
    </div>
  );
}

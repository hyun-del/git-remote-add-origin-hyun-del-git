import { useState, useRef } from "react";

interface Props {
  onComplete: () => void;
  fpPhoto: string;
}

export default function LiftingExperiment({ onComplete, fpPhoto }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"intro" | "placing" | "pressing" | "peeling" | "scanning" | "done">("intro");
  const [tapeY, setTapeY] = useState(0);
  const [pressProgress, setPressProgress] = useState(0);
  const [lifted, setLifted] = useState(false);

  const startPlacing = () => {
    setPhase("placing");
    let y = 0;
    const timer = setInterval(() => {
      y += 4;
      setTapeY(y);
      if (y >= 100) { clearInterval(timer); setPhase("pressing"); }
    }, 18);
  };

  const pressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startPress = () => {
    if (phase !== "pressing") return;
    pressTimer.current = setInterval(() => {
      setPressProgress((p) => {
        if (p >= 100) {
          if (pressTimer.current) clearInterval(pressTimer.current);
          setPhase("peeling");
          return 100;
        }
        return p + 4;
      });
    }, 50);
  };
  const endPress = () => { if (pressTimer.current) clearInterval(pressTimer.current); };

  const [peelProgress, setPeelProgress] = useState(0);
  const [isPeeling, setIsPeeling] = useState(false);
  const peelStartY = useRef(0);

  const startPeel = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "peeling") return;
    setIsPeeling(true);
    peelStartY.current = "touches" in e ? e.touches[0].clientY : e.clientY;
  };
  const movePeel = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPeeling || !stageRef.current) return;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const delta = Math.max(0, peelStartY.current - y);
    const rect = stageRef.current.getBoundingClientRect();
    const progress = Math.min(100, (delta / rect.height) * 200);
    setPeelProgress(progress);
    if (progress >= 100) {
      setIsPeeling(false);
      setLifted(true);
      setPhase("scanning");
      setTimeout(() => { setPhase("done"); setTimeout(onComplete, 1500); }, 3000);
    }
  };
  const endPeel = () => {
    if (!isPeeling) return;
    setIsPeeling(false);
    if (peelProgress < 100) setPeelProgress(0);
  };

  const getTapeStyle = (): React.CSSProperties => {
    if (phase === "intro") return { top: "-10%", transform: "translateX(-50%)" };
    if (phase === "placing") return { top: `${-10 + tapeY * 1.1}%`, transform: "translateX(-50%)" };
    if (phase === "pressing") return {
      top: "100%",
      transform: `translateX(-50%) translateY(-100%) scaleY(${1 + pressProgress * 0.004})`,
    };
    if (phase === "peeling") {
      const tilt = Math.min(15, peelProgress * 0.2);
      return {
        top: `calc(100% - ${peelProgress * 2.5}%)`,
        transform: `translateX(-50%) translateY(-100%) rotate(${tilt}deg)`,
        opacity: 1 - peelProgress * 0.002,
      };
    }
    if (phase === "scanning" || phase === "done")
      return { top: "-15%", transform: "translateX(-50%) translateY(-50%)", opacity: 0 };
    return {};
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📋</span>
        <h3 className="text-lg font-bold text-[#f5c542]">실험 3: 테이프 리프팅</h3>
      </div>
      <p className="text-[#e7e3d6]/70 text-xs mb-3">
        <b className="text-[#f5c542]">1)</b> 테이프를 내려놓고&nbsp;
        <b className="text-[#f5c542]">2)</b> 꾹 눌러 붙인 다음&nbsp;
        <b className="text-[#f5c542]">3)</b> 위로 드래그해서 떼어내세요.
      </p>

      <div
        ref={stageRef}
        className="relative w-full h-60 rounded-xl overflow-hidden"
        style={{ background: "#1a1a1a", border: "2px solid #3a3a3a" }}
        onMouseMove={movePeel}
        onMouseUp={endPeel}
        onMouseLeave={endPeel}
        onTouchMove={movePeel}
        onTouchEnd={endPeel}
      >
        {/* 표면 지문 */}
        {!lifted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={fpPhoto}
              alt="지문"
              draggable={false}
              style={{
                width: 180, height: 180, objectFit: "contain",
                filter: "grayscale(0.2) sepia(1) saturate(4) brightness(0.95) contrast(2) hue-rotate(5deg)",
              }}
            />
          </div>
        )}

        {/* 보존 카드 (리프트 후) */}
        {lifted && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-52 h-40 rounded flex flex-col items-center justify-center gap-1"
            style={{ background: "#f5f0e0", border: "1px solid #c0b090", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
          >
            <img
              src={fpPhoto}
              alt="채취된 지문"
              draggable={false}
              style={{
                width: 110, height: 110, objectFit: "contain",
                filter: "grayscale(1) contrast(2.5) brightness(0.35)",
              }}
            />
            <span className="text-[7px] text-gray-500 font-mono">EVIDENCE #FP-001</span>
          </div>
        )}

        {/* 테이프 */}
        <div
          className="absolute left-1/2 w-44 h-3.5 transition-all duration-300"
          style={{
            ...getTapeStyle(),
            background: "linear-gradient(180deg, rgba(200,220,240,0.55) 0%, rgba(200,220,240,0.3) 50%, rgba(200,220,240,0.55) 100%)",
            border: "1px solid rgba(200,220,240,0.4)",
            backdropFilter: "blur(1px)",
            zIndex: 20,
            cursor: phase === "peeling" ? "grab" : "default",
          }}
          onMouseDown={startPeel}
          onTouchStart={startPeel}
        >
          {phase === "peeling" && peelProgress > 10 && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <img
                src={fpPhoto}
                alt=""
                draggable={false}
                style={{
                  width: 44, height: 14, objectFit: "cover", objectPosition: "center",
                  filter: "grayscale(1) contrast(3) brightness(0.4) opacity(0.6)",
                }}
              />
            </div>
          )}
        </div>

        {/* 스캔 라인 */}
        {phase === "scanning" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="scan-line" />
          </div>
        )}

        {phase === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <p className="text-4xl mb-2">📦</p>
              <p className="text-[#f5c542] text-lg font-bold">증거 보존 완료</p>
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[9px] text-[#f5c542] tracking-wider">
          {phase === "intro" && "STEP 1 / 3"}
          {phase === "placing" && "STEP 1 / 3 — 내려놓는 중..."}
          {phase === "pressing" && "STEP 2 / 3 — 꾹 눌러 붙이기"}
          {phase === "peeling" && `STEP 3 / 3 — 위로 드래그 (${Math.round(peelProgress)}%)`}
          {phase === "scanning" && "분석 중..."}
          {phase === "done" && "완료 ✓"}
        </div>

        {phase === "intro" && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1.5 rounded-lg text-[10px] text-[#e7e3d6]/80 pointer-events-none">
            💡 아래 버튼을 눌러 테이프를 내려놓으세요
          </div>
        )}
        {phase === "peeling" && !isPeeling && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1.5 rounded-lg text-[10px] text-[#f5c542] pointer-events-none animate-pulse">
            🖐️ 테이프를 위로 드래그하세요!
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <StepDot active={phase !== "intro"} label="부착" />
          <StepDot active={["pressing","peeling","scanning","done"].includes(phase)} label="압착" />
          <StepDot active={["scanning","done"].includes(phase)} label="리프트" />
        </div>
        <div>
          {phase === "intro" && (
            <button onClick={startPlacing} className="btn-primary px-4 py-2 rounded-lg text-xs">
              테이프 내려놓기
            </button>
          )}
          {phase === "pressing" && (
            <button
              onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
              onTouchStart={startPress} onTouchEnd={endPress}
              className="btn-primary px-4 py-2 rounded-lg text-xs select-none"
            >
              🖐️ 꾹 누르고 있기 ({pressProgress}%)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${active ? "bg-[#f5c542]" : "bg-[#2a3040]"}`} />
      <span className={`text-[10px] ${active ? "text-[#f5c542]" : "text-[#e7e3d6]/40"}`}>{label}</span>
    </div>
  );
}

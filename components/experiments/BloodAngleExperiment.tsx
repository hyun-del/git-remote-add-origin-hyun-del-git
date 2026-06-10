import { useState, useRef } from "react";
import bloodAngleImg from "@assets/image_1781066290718.png";

interface Props { onComplete: () => void; }

interface Drop {
  angle: number;
  w: number;
  h: number;
  label: string;
}

const DROPS: Drop[] = [
  { angle: 90, w: 70, h: 70, label: "A" },
  { angle: 60, w: 70, h: 60, label: "B" },
  { angle: 45, w: 70, h: 50, label: "C" },
  { angle: 30, w: 70, h: 35, label: "D" },
];

const ANGLE_CHOICES = [90, 60, 45, 30];

interface MatchState {
  [label: string]: number | null;
}

function BloodDrop({ w, h, label }: { w: number; h: number; label: string }) {
  const tailLen = 18 - (h / w) * 14;
  return (
    <svg width={w + 30} height={h + 30} viewBox={`0 0 ${w + 30} ${h + 30}`}>
      <ellipse cx={(w + 30) / 2} cy={(h + 30) / 2} rx={w / 2} ry={h / 2}
        fill="#991b1b" opacity="0.95" />
      <ellipse cx={(w + 30) / 2 - 5} cy={(h + 30) / 2 - 5} rx={w / 2 - 4} ry={h / 2 - 4}
        fill="#b91c1c" opacity="0.7" />
      {h < w - 8 && (
        <path
          d={`M${(w + 30) / 2 - h * 0.18} ${(h + 30) / 2 + h / 2 - 2} Q${(w + 30) / 2 - h * 0.08} ${(h + 30) / 2 + h / 2 + tailLen} ${(w + 30) / 2 + h * 0.08} ${(h + 30) / 2 + h / 2 + tailLen}`}
          stroke="#7f1d1d" strokeWidth="3" fill="none" opacity="0.6"
        />
      )}
      <text x={(w + 30) / 2} y={(h + 30) / 2 + 4}
        textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" opacity="0.9">
        {label}
      </text>
    </svg>
  );
}

export default function BloodAngleExperiment({ onComplete }: Props) {
  const shuffledDrops = useRef<Drop[]>([...DROPS].sort(() => Math.random() - 0.5));
  const shuffledAngles = useRef<number[]>([...ANGLE_CHOICES].sort(() => Math.random() - 0.5));
  const [matches, setMatches] = useState<MatchState>({});
  const [dragging, setDragging] = useState<number | null>(null);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [showRef, setShowRef] = useState(false);

  const correctFor = (label: string) => DROPS.find((d) => d.label === label)!.angle;

  const handleDrop = (label: string) => {
    if (dragging === null) return;
    const correct = correctFor(label);
    if (dragging === correct) {
      const next = { ...matches, [label]: dragging };
      setMatches(next);
      const done = shuffledDrops.current.every((d) => next[d.label] === d.angle);
      if (done) { setAllDone(true); setTimeout(onComplete, 2200); }
    } else {
      setWrongFlash(label);
      setTimeout(() => setWrongFlash(null), 600);
    }
    setDragging(null);
  };

  if (allDone) {
    return (
      <div className="py-10 text-center">
        <p className="text-5xl mb-3">📐✅</p>
        <p className="text-[#f5c542] font-bold text-lg">각도 분석 완료!</p>
        <p className="text-[#e7e3d6]/50 text-xs mt-2">다음 단계로 이동 중...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📐</span>
        <h3 className="text-lg font-bold text-[#f5c542]">실험 6: 충격 각도 분석</h3>
      </div>

      {/* 원리 설명 + 공식 */}
      <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#f5c542]/20 mb-3">
        <p className="text-[#e7e3d6]/80 text-xs leading-relaxed">
          혈액이 표면에 닿을 때 생기는 <b className="text-[#f5c542]">타원의 모양</b>으로 충격 각도를 알 수 있습니다.
          <button onClick={() => setShowFormula((v) => !v)} className="ml-2 text-[#f5c542] underline text-[10px]">
            {showFormula ? "▾ 공식 숨기기" : "▸ 공식 보기"}
          </button>
        </p>
        {showFormula && (
          <div className="mt-2 p-2 bg-[#0d1220] rounded border border-[#f5c542]/10">
            <p className="text-center text-[#f5c542] font-mono font-bold text-sm">sin(θ) = 너비(W) / 길이(L)</p>
            <div className="grid grid-cols-4 gap-1 mt-2">
              {DROPS.map((d) => (
                <div key={d.angle} className="text-center text-[9px] text-[#e7e3d6]/60">
                  <b className="text-[#f5c542]">{d.angle}°</b><br />
                  W/L = {(Math.sin((d.angle * Math.PI) / 180)).toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 실제 혈흔 각도 참고 사진 */}
      <div className="mb-4 rounded-lg overflow-hidden border border-[#2a3040]">
        <button
          onClick={() => setShowRef((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#0a0e1a] hover:bg-[#0d1220] transition-colors"
        >
          <span className="text-[10px] text-[#e7e3d6]/60 flex items-center gap-1.5">
            📷 실제 혈흔 사진으로 각도 비교하기
          </span>
          <span className="text-[#f5c542] text-[10px]">{showRef ? "▾ 닫기" : "▸ 열기"}</span>
        </button>
        {showRef && (
          <div className="bg-white">
            <img
              src={bloodAngleImg}
              alt="충격 각도에 따른 혈흔 형태: 90도(원형), 60도(약간 타원), 30도(길쭉한 타원+꼬리)"
              className="w-full object-contain max-h-52"
            />
            <div className="flex justify-around px-2 py-1.5 bg-[#0a0e1a]">
              {[["90°", "완전한 원형"], ["60°", "약간 타원"], ["30°", "길쭉+꼬리"]].map(([deg, desc]) => (
                <div key={deg} className="text-center">
                  <span className="text-[#f5c542] font-bold text-[10px]">{deg}</span>
                  <p className="text-[#e7e3d6]/50 text-[9px]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-[#e7e3d6]/70 text-xs mb-3">
        아래 <b className="text-[#f5c542]">각도 값을 드래그</b>해서 맞는 혈흔 모양에 놓으세요.
      </p>

      {/* 각도 값 패널 (드래그 소스) */}
      <div className="flex gap-3 justify-center mb-5 flex-wrap">
        {shuffledAngles.current.map((angle) => {
          const isUsed = Object.values(matches).includes(angle);
          return (
            <div key={angle}
              draggable={!isUsed}
              onDragStart={() => setDragging(angle)}
              onDragEnd={() => setDragging(null)}
              className={`px-4 py-2 rounded-lg border-2 font-bold font-mono text-sm transition-all select-none
                ${isUsed
                  ? "opacity-20 border-[#1a2030] text-[#e7e3d6]/30 cursor-not-allowed"
                  : dragging === angle
                  ? "border-[#f5c542] bg-[#f5c542]/20 text-[#f5c542] opacity-50 cursor-grabbing"
                  : "border-[#f5c542]/40 text-[#f5c542] bg-[#0d1220] cursor-grab hover:border-[#f5c542]"}`}
            >
              {angle}°
            </div>
          );
        })}
      </div>

      {/* 혈흔 드롭 슬롯 */}
      <div className="grid grid-cols-2 gap-3">
        {shuffledDrops.current.map((d) => {
          const matched = matches[d.label];
          const isWrong = wrongFlash === d.label;
          return (
            <div key={d.label}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(d.label)}
              className={`rounded-xl p-3 border-2 flex flex-col items-center gap-2 transition-all
                ${matched
                  ? "border-green-500 bg-green-500/10"
                  : isWrong
                  ? "border-red-500 bg-red-500/10"
                  : "border-[#2a3040] bg-[#0d1220] hover:border-red-900"}`}
            >
              <BloodDrop w={d.w} h={d.h} label={d.label} />
              {matched
                ? <span className="text-green-400 font-bold text-xs">✓ {matched}°</span>
                : isWrong
                ? <span className="text-red-400 font-bold text-xs">✗ 틀렸어요</span>
                : <span className="text-[#e7e3d6]/30 text-xs">각도를 여기에</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-center text-[10px] text-[#e7e3d6]/40">
        맞춘 혈흔: {Object.keys(matches).length} / {DROPS.length}
      </div>
    </div>
  );
}

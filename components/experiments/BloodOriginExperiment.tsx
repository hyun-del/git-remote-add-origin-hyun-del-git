import { useState, useRef, useCallback } from "react";

interface Props { onComplete: () => void; }

interface BloodDrop {
  id: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  angle: number;
}

/* 원점 (실제 정답 위치, %) */
const ORIGIN = { x: 38, y: 30 };

/* 혈흔들 — 각 각도는 원점을 향하도록 설계 */
const DROPS: BloodDrop[] = [
  { id: 1, cx: 72, cy: 65, rx: 22, ry: 10, angle: 35 },
  { id: 2, cx: 60, cy: 78, rx: 20, ry: 9,  angle: -20 },
  { id: 3, cx: 22, cy: 68, rx: 18, ry: 8,  angle: -150 },
  { id: 4, cx: 78, cy: 40, rx: 24, ry: 11, angle: 170 },
  { id: 5, cx: 45, cy: 82, rx: 16, ry: 7,  angle: -50 },
];

function dropAxis(d: BloodDrop, svgW: number, svgH: number) {
  const cx = (d.cx / 100) * svgW;
  const cy = (d.cy / 100) * svgH;
  const rad = (d.angle * Math.PI) / 180;
  const len = 220;
  return {
    x1: cx - Math.cos(rad) * len,
    y1: cy - Math.sin(rad) * len,
    x2: cx + Math.cos(rad) * len,
    y2: cy + Math.sin(rad) * len,
  };
}

/* 힌트 화살표: 각 혈흔 → 발원지 방향 */
function HintArrow({ d, W, H }: { d: BloodDrop; W: number; H: number }) {
  const cx = (d.cx / 100) * W;
  const cy = (d.cy / 100) * H;
  const ox = (ORIGIN.x / 100) * W;
  const oy = (ORIGIN.y / 100) * H;
  const dx = ox - cx;
  const dy = oy - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;
  const arrowLen = 40;
  const endX = cx + nx * arrowLen;
  const endY = cy + ny * arrowLen;
  const headLen = 10;
  const headAngle = Math.atan2(ny, nx);
  const h1x = endX - headLen * Math.cos(headAngle - 0.45);
  const h1y = endY - headLen * Math.sin(headAngle - 0.45);
  const h2x = endX - headLen * Math.cos(headAngle + 0.45);
  const h2y = endY - headLen * Math.sin(headAngle + 0.45);
  return (
    <g opacity="0.9">
      <line x1={cx} y1={cy} x2={endX} y2={endY} stroke="#fbbf24" strokeWidth="2.5" />
      <polygon points={`${endX},${endY} ${h1x},${h1y} ${h2x},${h2y}`} fill="#fbbf24" />
    </g>
  );
}

export default function BloodOriginExperiment({ onComplete }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [guess, setGuess] = useState<{ x: number; y: number } | null>(null);
  const [result, setResult] = useState<"correct" | "close" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const W = 500, H = 360;

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (done) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGuess({ x, y });

    const dx = x - ORIGIN.x, dy = y - ORIGIN.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    setAttempts((a) => a + 1);
    if (dist < 10) {
      setResult("correct");
      setDone(true);
      setTimeout(onComplete, 2500);
    } else if (dist < 20) {
      setResult("close");
    } else {
      setResult("wrong");
    }
  }, [done, onComplete]);

  const reset = () => {
    setGuess(null);
    setResult(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🎯</span>
        <h3 className="text-lg font-bold text-[#f5c542]">실험 7: 혈흔 발원지 추정</h3>
      </div>

      {/* 발원지 찾는 방법 안내 (접이식) */}
      <div className="bg-[#0a0e1a] rounded-lg border border-[#f5c542]/25 mb-3">
        <button
          onClick={() => setShowGuide((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#0d1220] transition-colors rounded-lg"
        >
          <span className="text-[#f5c542] font-bold text-xs flex items-center gap-2">
            📚 발원지 찾는 방법 — 클릭해서 보기
          </span>
          <span className="text-[#e7e3d6]/50 text-xs">{showGuide ? "▾ 닫기" : "▸ 열기"}</span>
        </button>
        {showGuide && (
          <div className="px-3 pb-3 text-xs text-[#e7e3d6]/80 space-y-3 border-t border-[#f5c542]/10 pt-3">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-[#f5c542]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#f5c542] font-bold text-[10px]">①</span>
              </div>
              <div>
                <p className="font-bold text-white mb-0.5">혈흔의 긴 쪽(장축)을 보세요</p>
                <p className="text-[#e7e3d6]/60 text-[10px]">타원형 혈흔은 방향이 있습니다. 길쭉한 방향이 혈액이 날아온 방향입니다.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-[#f5c542]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#f5c542] font-bold text-[10px]">②</span>
              </div>
              <div>
                <p className="font-bold text-white mb-0.5">노란 점선(장축 연장선)을 따라가세요</p>
                <p className="text-[#e7e3d6]/60 text-[10px]">각 혈흔의 장축을 무한히 연장한 선(노란 점선)이 화면에 표시됩니다.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-[#f5c542]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#f5c542] font-bold text-[10px]">③</span>
              </div>
              <div>
                <p className="font-bold text-white mb-0.5">모든 점선이 모이는 곳을 찾으세요</p>
                <p className="text-[#e7e3d6]/60 text-[10px]">5개의 점선이 한 점 근처에서 교차합니다. 그 교차점이 <b className="text-[#f5c542]">발원지(피해자 위치)</b>입니다.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold text-[10px]">④</span>
              </div>
              <div>
                <p className="font-bold text-white mb-0.5">교차점을 클릭하세요</p>
                <p className="text-[#e7e3d6]/60 text-[10px]">점선들이 가장 밀집된 지점을 클릭하면 발원지를 특정할 수 있습니다.</p>
              </div>
            </div>
            <div className="p-2 bg-[#fbbf24]/10 rounded border border-[#fbbf24]/20">
              <p className="text-[#fbbf24] text-[10px]">
                💡 <b>팁:</b> 아래 <b>방향 힌트</b> 버튼을 누르면 각 혈흔에서 발원지 방향으로 화살표가 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 범례 + 힌트 버튼 */}
      <div className="flex gap-3 mb-2 items-center flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] text-[#e7e3d6]/50">
          <div className="w-3 h-1 rounded" style={{ background: "#ef4444" }} /> 혈흔
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#e7e3d6]/50">
          <div className="w-4 h-px" style={{ borderTop: "1px dashed #f5c542" }} /> 장축 연장선
        </div>
        {guess && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#e7e3d6]/50">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: "#60a5fa" }} /> 나의 추정
          </div>
        )}
        <div className="flex-1" />
        <button
          onClick={() => setShowHint((v) => !v)}
          className={`text-[10px] px-2.5 py-1 rounded border transition-all
            ${showHint
              ? "border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/10"
              : "border-[#2a3040] text-[#e7e3d6]/50 hover:border-[#fbbf24]/50 hover:text-[#fbbf24]/70"}`}
        >
          💡 방향 힌트 {showHint ? "ON" : "OFF"}
        </button>
      </div>

      {/* SVG 범죄 현장 */}
      <div className="rounded-xl overflow-hidden border-2 border-[#2a3040] mb-3 cursor-crosshair"
        style={{ background: "#111" }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full"
          style={{ display: "block" }} onClick={handleSvgClick}>
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#222" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" />

          {/* 장축 연장선 — 항상 표시 */}
          {DROPS.map((d) => {
            const ax = dropAxis(d, W, H);
            return (
              <line key={`axis-${d.id}`}
                x1={ax.x1} y1={ax.y1} x2={ax.x2} y2={ax.y2}
                stroke="#f5c542" strokeWidth="1.2" strokeDasharray="10 6" opacity="0.55"
              />
            );
          })}

          {/* 힌트 화살표 */}
          {showHint && DROPS.map((d) => (
            <HintArrow key={`hint-${d.id}`} d={d} W={W} H={H} />
          ))}

          {/* 혈흔 */}
          {DROPS.map((d) => {
            const cx = (d.cx / 100) * W;
            const cy = (d.cy / 100) * H;
            return (
              <g key={d.id} transform={`rotate(${d.angle} ${cx} ${cy})`}>
                {/* 외곽 불규칙 테두리 효과 */}
                <ellipse cx={cx} cy={cy} rx={d.rx + 2} ry={d.ry + 2}
                  fill="#5a0000" opacity="0.4" />
                <ellipse cx={cx} cy={cy} rx={d.rx} ry={d.ry}
                  fill="#8b0000" opacity="0.97" />
                <ellipse cx={cx - 3} cy={cy - 2} rx={d.rx - 5} ry={d.ry - 3}
                  fill="#c41e1e" opacity="0.6" />
                {/* 광택 */}
                <ellipse cx={cx - d.rx * 0.3} cy={cy - d.ry * 0.3} rx={d.rx * 0.25} ry={d.ry * 0.2}
                  fill="white" opacity="0.08" />
                {/* 꼬리 */}
                <path
                  d={`M ${cx - d.rx + 4} ${cy - 2} Q ${cx - d.rx - 10} ${cy + 5} ${cx - d.rx - 7} ${cy + 8}`}
                  stroke="#6b0000" strokeWidth="5" fill="none" opacity="0.55"
                />
              </g>
            );
          })}

          {/* 정답 위치 — 완료 시 */}
          {done && (
            <>
              <circle cx={(ORIGIN.x / 100) * W} cy={(ORIGIN.y / 100) * H} r={22}
                fill="none" stroke="#4ade80" strokeWidth="2.5" opacity="0.9" />
              <circle cx={(ORIGIN.x / 100) * W} cy={(ORIGIN.y / 100) * H} r={7}
                fill="#4ade80" opacity="0.95" />
              <text x={(ORIGIN.x / 100) * W} y={(ORIGIN.y / 100) * H - 28}
                textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="bold">
                발원지 ✓
              </text>
            </>
          )}

          {/* 사용자 추정 위치 */}
          {guess && !done && (
            <g>
              <circle cx={(guess.x / 100) * W} cy={(guess.y / 100) * H} r={14}
                fill="none" stroke="#60a5fa" strokeWidth="2" />
              <circle cx={(guess.x / 100) * W} cy={(guess.y / 100) * H} r={4}
                fill="#60a5fa" />
              <text x={(guess.x / 100) * W} y={(guess.y / 100) * H - 18}
                textAnchor="middle" fill="#60a5fa" fontSize="11">
                추정
              </text>
            </g>
          )}

          {!guess && (
            <text x={W / 2} y={H - 14} textAnchor="middle" fill="#ffffff25" fontSize="12">
              점선들이 모이는 곳을 클릭하세요
            </text>
          )}
        </svg>
      </div>

      {/* 결과 피드백 */}
      {result && !done && (
        <div className={`rounded-lg p-3 text-xs font-bold mb-3
          ${result === "close"
            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
            : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              {result === "close" ? (
                <>
                  <p>🔥 거의 다 왔어요! ({attempts}번째 시도)</p>
                  <p className="font-normal text-[10px] mt-1 text-yellow-300/70">
                    노란 점선들이 가장 촘촘하게 교차하는 지점을 더 정확히 클릭해보세요.
                  </p>
                </>
              ) : (
                <>
                  <p>✗ 아직 멀어요. ({attempts}번째 시도)</p>
                  <p className="font-normal text-[10px] mt-1 text-red-300/70">
                    💡 힌트: 노란 점선(---) 5개가 <b>한 곳에서 교차</b>하는 지점을 찾으세요.
                    방향 힌트 버튼을 켜면 화살표로 방향을 확인할 수 있어요.
                  </p>
                </>
              )}
            </div>
            <button onClick={reset}
              className="shrink-0 underline text-[10px] opacity-70 hover:opacity-100">
              다시 클릭
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="rounded-lg p-3 text-center bg-green-500/10 border border-green-500/30">
          <p className="text-green-400 font-bold text-sm">🎯 발원지 특정 성공!</p>
          <p className="text-[#e7e3d6]/60 text-xs mt-1 leading-relaxed">
            모든 혈흔의 장축 연장선(점선)이 한 점에서 만납니다.<br />
            실제 수사에서 이 방법으로 피해자가 있었던 위치를 추정합니다.
          </p>
        </div>
      )}

      {!done && !result && (
        <div className="text-center text-[#e7e3d6]/35 text-[10px] leading-relaxed">
          💡 <b className="text-[#e7e3d6]/50">방법을 모르겠다면</b> 위의 「발원지 찾는 방법」을 펼쳐보세요.<br />
          「방향 힌트」를 켜면 각 혈흔에서 발원지 방향으로 화살표가 나타납니다.
        </div>
      )}
    </div>
  );
}

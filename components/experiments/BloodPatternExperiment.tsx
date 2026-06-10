import { useState, useRef, useEffect } from "react";
import bloodDripImg from "@assets/image_1781066084905.png";

interface Props { onComplete: () => void; }

type PatType = "drip" | "impact" | "transfer";

interface Pattern {
  id: PatType;
  name: string;
  en: string;
  color: string;
  cause: string;
  features: string[];
  desc: string;
}

const PATTERNS: Pattern[] = [
  {
    id: "drip",
    name: "낙하혈흔",
    en: "Passive / Drip",
    color: "#ef4444",
    cause: "중력에 의해 혈액이 수직으로 떨어졌을 때",
    features: ["거의 완전한 원형", "가장자리 거칠고 불규칙", "위성혈흔(satellite) 주변 산재"],
    desc: "높이가 높을수록 외곽이 더 불규칙해지고 위성혈흔이 많이 생깁니다. 표면이 매끄러울수록 더 완전한 원형에 가깝습니다.",
  },
  {
    id: "impact",
    name: "충격혈흔",
    en: "Impact Spatter",
    color: "#f97316",
    cause: "강한 힘(충격)이 혈액에 가해졌을 때",
    features: ["중심부 + 방사형 미세 혈흔", "작은 방울이 사방으로 퍼짐", "크기 1mm 이하 다수"],
    desc: "폭발적 힘의 방향으로 혈흔이 더 길게 퍼집니다. 방향 추정이 가능합니다.",
  },
  {
    id: "transfer",
    name: "이동혈흔",
    en: "Transfer / Swipe",
    color: "#a855f7",
    cause: "혈액 묻은 물체·신체가 표면을 스치며 이동할 때",
    features: ["타원형·길쭉한 형태", "이동 방향으로 꼬리", "선형 또는 호(弧)형"],
    desc: "신발·의류·도구의 흔적이 남아 이동 경로 파악에 활용됩니다.",
  },
];

/* ── 혈흔 패턴 시각 컴포넌트 ── */
function DripReal() {
  return (
    <img
      src={bloodDripImg}
      alt="낙하혈흔 실제 사진"
      className="w-full h-full object-cover"
      style={{ filter: "brightness(0.92) contrast(1.05)" }}
    />
  );
}

function Impact({ size = 120 }: { size?: number }) {
  const drops: { x: number; y: number; r: number; deg: number }[] = [];
  const rng = [0.61,0.14,0.82,0.47,0.93,0.28,0.75,0.38,0.67,0.19,0.85,0.52,
               0.09,0.71,0.44,0.96,0.33,0.88,0.56,0.22,0.77,0.41,0.63,0.17];
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * 360 + rng[i] * 15 - 7;
    const dist = 22 + rng[(i + 3) % 24] * 32;
    drops.push({
      x: 60 + dist * Math.cos((angle * Math.PI) / 180),
      y: 60 + dist * Math.sin((angle * Math.PI) / 180),
      r: 1.5 + rng[(i + 7) % 24] * 3,
      deg: angle,
    });
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="10" fill="#991b1b" />
      {drops.map((d, i) => (
        <g key={i}>
          <ellipse cx={d.x} cy={d.y} rx={d.r} ry={d.r * 0.55}
            fill="#dc2626" opacity="0.8"
            transform={`rotate(${d.deg} ${d.x} ${d.y})`} />
          {d.r > 2.5 && (
            <line x1={60} y1={60} x2={d.x} y2={d.y}
              stroke="#7f1d1d" strokeWidth="0.3" opacity="0.2" />
          )}
        </g>
      ))}
    </svg>
  );
}

function Transfer({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="60" rx="46" ry="14" fill="#991b1b" opacity="0.9" transform="rotate(-15 60 60)" />
      <ellipse cx="68" cy="55" rx="38" ry="10" fill="#b91c1c" opacity="0.7" transform="rotate(-15 68 55)" />
      <path d="M20 67 Q40 80 55 68" stroke="#7f1d1d" strokeWidth="5" fill="none" opacity="0.6" />
      <path d="M90 48 Q100 52 98 58 Q96 64 88 67" stroke="#dc2626" strokeWidth="3" fill="none" opacity="0.5" />
      <line x1="30" y1="60" x2="85" y2="55" stroke="#7f1d1d" strokeWidth="1.5" opacity="0.3" strokeDasharray="3 4" />
      <line x1="28" y1="64" x2="80" y2="60" stroke="#7f1d1d" strokeWidth="1" opacity="0.2" strokeDasharray="2 5" />
    </svg>
  );
}

/* 낙하혈흔 카드용 — 실제 사진을 래핑 */
function DripSvgSized({ size = 120 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="overflow-hidden rounded-md">
      <DripReal />
    </div>
  );
}

const RENDER_MAP: Record<PatType, (size?: number) => JSX.Element> = {
  drip:     (size) => <DripSvgSized size={size} />,
  impact:   (size) => <Impact size={size} />,
  transfer: (size) => <Transfer size={size} />,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BloodPatternExperiment({ onComplete }: Props) {
  const [phase, setPhase] = useState<"observe" | "quiz">("observe");
  const [selected, setSelected] = useState<PatType | null>(null);
  const [viewed, setViewed] = useState<Set<PatType>>(new Set());

  const quizOrder = useRef<PatType[]>(shuffle(["drip", "impact", "transfer"]));
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<Record<number, boolean>>({});
  const [wrongFlash, setWrongFlash] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) { setTimeout(onComplete, 1800); }
  }, [done, onComplete]);

  const handleGuess = (guess: PatType) => {
    const correct = quizOrder.current[quizIdx];
    if (guess === correct) {
      const next = { ...quizAnswered, [quizIdx]: true };
      setQuizAnswered(next);
      if (quizIdx >= quizOrder.current.length - 1) { setDone(true); }
      else { setTimeout(() => setQuizIdx((q) => q + 1), 800); }
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 500);
    }
  };

  /* 퀴즈 화면 */
  if (phase === "quiz") {
    if (done) {
      return (
        <div className="py-10 text-center">
          <p className="text-5xl mb-3">🩸✅</p>
          <p className="text-[#f5c542] font-bold text-lg">모두 맞췄어요!</p>
          <p className="text-[#e7e3d6]/50 text-xs mt-2">다음 단계로 이동 중...</p>
        </div>
      );
    }
    const currentType = quizOrder.current[quizIdx];
    const isCorrect = quizAnswered[quizIdx];
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🩸</span>
          <h3 className="text-lg font-bold text-[#f5c542]">실험 5-2: 혈흔 패턴 퀴즈</h3>
        </div>
        <div className="flex items-center gap-2 mb-4">
          {[0,1,2].map((i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= quizIdx ? (quizAnswered[i] ? "bg-green-500" : "bg-[#f5c542]") : "bg-[#2a3040]"}`} />
          ))}
        </div>
        <p className="text-[#e7e3d6]/70 text-xs mb-3">
          이 혈흔 패턴은 어떤 유형인가요? (<b className="text-[#f5c542]">{quizIdx + 1}/3</b>)
        </p>
        <div className="flex justify-center mb-4">
          <div className={`rounded-xl p-4 bg-[#1a0808] border-2 transition-all overflow-hidden
            ${isCorrect ? "border-green-500" : wrongFlash ? "border-red-500" : "border-[#3a1010]"}`}
            style={{ width: 160, height: 160 }}>
            <div className="w-full h-full flex items-center justify-center">
              {RENDER_MAP[currentType](128)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {PATTERNS.map((p) => (
            <button key={p.id} onClick={() => handleGuess(p.id)} disabled={!!isCorrect}
              className={`rounded-xl p-3 border-2 text-center transition-all
                ${isCorrect && p.id === currentType
                  ? "border-green-500 bg-green-500/10"
                  : wrongFlash ? "border-red-500/40 bg-red-500/5"
                  : "border-[#2a3040] bg-[#0d1220] hover:border-[#f5c542]/60"}`}
            >
              <p className="font-bold text-sm" style={{ color: p.color }}>{p.name}</p>
              <p className="text-[#e7e3d6]/40 text-[9px]">{p.en}</p>
            </button>
          ))}
        </div>
        {wrongFlash && (
          <p className="text-center text-red-400 font-bold text-xs mt-3">✗ 다시 살펴보세요!</p>
        )}
        {isCorrect && (
          <p className="text-center text-green-400 font-bold text-xs mt-3">
            ✓ 정답! {quizIdx < 2 ? "다음 패턴으로..." : ""}
          </p>
        )}
      </div>
    );
  }

  /* 관찰 화면 */
  const info = selected ? PATTERNS.find((p) => p.id === selected)! : null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🩸</span>
        <h3 className="text-lg font-bold text-[#f5c542]">실험 5: 혈흔 패턴 관찰</h3>
      </div>
      <p className="text-[#e7e3d6]/70 text-xs mb-4">
        혈흔에는 <b className="text-white">3가지 주요 패턴</b>이 있습니다. 카드를 클릭해서 각 패턴의 특징을 살펴보세요.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {PATTERNS.map((p) => (
          <button key={p.id} onClick={() => { setSelected(p.id); setViewed((v) => new Set([...v, p.id])); }}
            className={`rounded-xl p-3 border-2 bg-[#0d1220] transition-all relative
              ${selected === p.id ? "shadow-lg" : "border-[#1e2a3a] hover:border-red-900"}`}
            style={{ borderColor: selected === p.id ? p.color : undefined }}
          >
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#1a0808] flex items-center justify-center">
                {RENDER_MAP[p.id](80)}
              </div>
            </div>
            <p className="font-bold text-xs text-center" style={{ color: p.color }}>{p.name}</p>
            <p className="text-[#e7e3d6]/40 text-[9px] text-center">{p.en}</p>
            {viewed.has(p.id) && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {info && (
        <div className="rounded-xl p-4 border mb-4" style={{ borderColor: `${info.color}40`, background: `${info.color}08` }}>
          <div className="flex gap-3 items-start">
            <div className="w-20 h-20 rounded-lg bg-[#1a0808] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {RENDER_MAP[info.id](80)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-sm" style={{ color: info.color }}>{info.name}</h4>
                <span className="text-[#e7e3d6]/40 text-[9px]">({info.en})</span>
              </div>
              <p className="text-[#e7e3d6]/50 text-[10px] mb-2 italic">📍 원인: {info.cause}</p>
              <p className="text-[#e7e3d6]/75 text-xs leading-relaxed mb-2">{info.desc}</p>
              <div className="flex flex-wrap gap-1">
                {info.features.map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded"
                    style={{ background: `${info.color}15`, color: info.color }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 낙하혈흔 실사 참고 */}
      {selected === "drip" && (
        <div className="rounded-lg overflow-hidden border border-[#ef444430] mb-4">
          <div className="text-[9px] text-[#e7e3d6]/40 px-3 py-1.5 bg-[#0a0e1a]">
            📷 실제 낙하혈흔 — 격자지 위에 수직 낙하한 혈흔 (위성혈흔 확인 가능)
          </div>
          <img src={bloodDripImg} alt="실제 낙하혈흔" className="w-full max-h-48 object-contain bg-white" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[#e7e3d6]/40 text-[11px]">
          {viewed.size < 3 ? `${3 - viewed.size}개 더 살펴보세요` : "✓ 모두 확인! 퀴즈를 시작하세요."}
        </p>
        <button onClick={() => setPhase("quiz")} disabled={viewed.size < 3}
          className="btn-primary px-5 py-2 rounded-lg text-xs disabled:opacity-30">
          패턴 퀴즈 시작 →
        </button>
      </div>
    </div>
  );
}

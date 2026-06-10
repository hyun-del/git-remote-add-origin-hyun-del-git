import { useState, useRef, useEffect } from "react";

interface Props { onComplete: () => void; }

type FpType = "arc" | "whorl" | "loop";

interface PatternInfo {
  id: FpType;
  name: string;
  en: string;
  color: string;
  frequency: string;
  desc: string;
  features: string[];
  photo1: string;
  photo2: string;
}

const PATTERNS: PatternInfo[] = [
  {
    id: "arc",
    name: "호형문",
    en: "Arc",
    color: "#60a5fa",
    frequency: "약 5%",
    desc: "융선이 한쪽에서 다른 쪽으로 완만하게 활 모양으로 휘어지는 유형. 삼각형 델타가 없으며, 가장 단순한 구조를 가집니다.",
    features: ["델타 없음", "활 모양 곡선", "좌우 대칭에 가까움"],
    photo1: "/fp-arc-1.png",
    photo2: "/fp-arc-2.png",
  },
  {
    id: "whorl",
    name: "와상문",
    en: "Whorl",
    color: "#f5c542",
    frequency: "약 35%",
    desc: "융선이 중심을 향해 나선형 또는 원형으로 감겨드는 유형. 최소 2개의 델타가 존재하며, 중심부에 소용돌이 모양이 특징입니다.",
    features: ["델타 2개 이상", "나선형/원형 구조", "중심에 소용돌이"],
    photo1: "/fp-whorl-1.png",
    photo2: "/fp-whorl-2.png",
  },
  {
    id: "loop",
    name: "제상문",
    en: "Loop",
    color: "#4ade80",
    frequency: "약 60%",
    desc: "융선이 한쪽에서 들어와 루프(고리) 모양으로 돌아 같은 방향으로 나가는 유형. 델타가 1개 있으며, 가장 흔한 지문 패턴입니다.",
    features: ["델타 1개", "고리(루프) 모양", "가장 흔한 유형"],
    photo1: "/fp-loop-1.png",
    photo2: "/fp-loop-2.png",
  },
];

const ALL_TYPES: FpType[] = ["arc", "whorl", "loop"];

export default function PatternLesson({ onComplete }: Props) {
  const [selected, setSelected] = useState<FpType | null>(null);
  const [viewed, setViewed] = useState<Set<FpType>>(new Set());
  const [stage, setStage] = useState<"observe" | "match">("observe");
  const [matchState, setMatchState] = useState<Record<FpType, FpType | null>>({
    arc: null, whorl: null, loop: null,
  });
  const [dragging, setDragging] = useState<FpType | null>(null);
  const [wrongDrop, setWrongDrop] = useState<FpType | null>(null);
  const [allCorrect, setAllCorrect] = useState(false);
  const shuffled = useRef<FpType[]>([...ALL_TYPES]);

  useEffect(() => {
    const arr: FpType[] = [...ALL_TYPES];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffled.current = arr;
  }, []);

  const handleSelect = (id: FpType) => {
    setSelected(id);
    setViewed((prev) => new Set([...prev, id]));
  };

  const info = selected ? PATTERNS.find((p) => p.id === selected)! : null;

  const onDragStart = (type: FpType) => setDragging(type);
  const onDropTo = (slot: FpType) => {
    if (!dragging) return;
    if (slot === dragging) {
      const next = { ...matchState, [slot]: dragging };
      setMatchState(next);
      const ok = ALL_TYPES.every((p) => next[p] === p);
      if (ok) {
        setAllCorrect(true);
        setTimeout(onComplete, 2000);
      }
    } else {
      setWrongDrop(slot);
      setTimeout(() => setWrongDrop(null), 600);
    }
    setDragging(null);
  };

  const resetMatch = () => {
    setMatchState({ arc: null, whorl: null, loop: null });
    setAllCorrect(false);
  };

  if (stage === "match") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎯</span>
          <h3 className="text-lg font-bold text-[#f5c542]">실험 1-2: 지문 유형 매칭</h3>
        </div>
        <p className="text-[#e7e3d6]/70 text-xs mb-5">
          아래 지문 사진을 <b className="text-[#f5c542]">드래그</b>해서 올바른 유형 이름 슬롯에 놓으세요!
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {ALL_TYPES.map((p) => {
            const patInfo = PATTERNS.find((x) => x.id === p)!;
            const matched = matchState[p] === p;
            const isWrong = wrongDrop === p;
            return (
              <div
                key={p}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropTo(p)}
                className={`rounded-xl p-3 border-2 border-dashed text-center transition-all
                  ${matched
                    ? "border-green-500 bg-green-500/10"
                    : isWrong
                    ? "border-red-500 bg-red-500/10"
                    : "border-[#2a3040] bg-[#0d1220] hover:border-[#f5c542]/50"}
                `}
                style={{ minHeight: 110 }}
              >
                <p className="font-bold text-sm mb-1" style={{ color: patInfo.color }}>
                  {patInfo.name}
                </p>
                <p className="text-[#e7e3d6]/40 text-[10px] mb-2">{patInfo.en}</p>
                {matched ? (
                  <img
                    src={patInfo.photo1}
                    alt={patInfo.name}
                    className="w-16 h-16 object-cover rounded-lg mx-auto border-2 border-green-500 grayscale"
                  />
                ) : (
                  <div className="w-16 h-16 mx-auto rounded-lg border border-dashed border-[#2a3040] flex items-center justify-center">
                    <span className="text-[#e7e3d6]/20 text-xs">여기에</span>
                  </div>
                )}
                {isWrong && (
                  <p className="text-red-400 text-[10px] mt-1 font-bold">틀렸어요!</p>
                )}
                {matched && (
                  <p className="text-green-400 text-[10px] mt-1 font-bold">✓ 정답!</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {shuffled.current.map((p) => {
            const patInfo = PATTERNS.find((x) => x.id === p)!;
            const used = matchState[p] === p;
            return (
              <div
                key={p}
                draggable={!used}
                onDragStart={() => onDragStart(p)}
                className={`rounded-xl p-2 border-2 transition-all
                  ${used
                    ? "opacity-20 border-[#1a2030] bg-[#0d1220] cursor-not-allowed"
                    : "border-[#2a3040] bg-[#0d1220] hover:border-[#f5c542] cursor-grab active:cursor-grabbing"}
                  ${dragging === p ? "opacity-50" : ""}
                `}
              >
                <img
                  src={patInfo.photo1}
                  alt={patInfo.name}
                  className="w-full h-20 object-cover rounded-lg grayscale"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <button onClick={resetMatch} className="btn-ghost px-3 py-1.5 rounded text-[11px]">
            초기화
          </button>
          {allCorrect && (
            <p className="text-green-400 font-bold text-sm animate-pulse">
              🎉 모두 맞췄어요! 다음 단계로 이동합니다...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🔬</span>
        <h3 className="text-lg font-bold text-[#f5c542]">실험 1: 3가지 지문 유형</h3>
      </div>
      <p className="text-[#e7e3d6]/70 text-xs mb-4">
        국제 표준 분류 기준에 따른 <b className="text-white">3가지 지문 유형</b>을 실제 지문 사진으로 관찰해보세요.
        카드를 클릭하면 자세한 설명이 나타납니다.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            className={`rounded-xl p-3 border-2 bg-[#0d1220] transition-all text-left
              ${selected === p.id
                ? "border-opacity-100 shadow-lg"
                : "border-[#1e2a3a] hover:border-opacity-60"}
            `}
            style={{
              borderColor: selected === p.id ? p.color : undefined,
              boxShadow: selected === p.id ? `0 0 12px ${p.color}30` : undefined,
            }}
          >
            <div className="relative overflow-hidden rounded-lg mb-2">
              <img
                src={p.photo1}
                alt={`${p.name} 지문 예시`}
                className="w-full h-28 object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
              {viewed.has(p.id) && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">✓</span>
                </div>
              )}
            </div>
            <p className="font-bold text-sm" style={{ color: p.color }}>{p.name}</p>
            <p className="text-[#e7e3d6]/40 text-[10px]">{p.en}</p>
          </button>
        ))}
      </div>

      {info && (
        <div
          className="rounded-xl p-4 border mb-4 transition-all"
          style={{ borderColor: `${info.color}50`, background: `${info.color}08` }}
        >
          <div className="flex gap-3">
            <img
              src={info.photo2}
              alt={`${info.name} 두 번째 예시`}
              className="w-20 h-20 object-cover rounded-lg grayscale flex-shrink-0 border border-[#2a3040]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-sm" style={{ color: info.color }}>
                  {info.name}
                </h4>
                <span className="text-[#e7e3d6]/40 text-[10px]">({info.en})</span>
                <span
                  className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: `${info.color}20`, color: info.color }}
                >
                  {info.frequency}
                </span>
              </div>
              <p className="text-[#e7e3d6]/75 text-xs leading-relaxed mb-2">{info.desc}</p>
              <div className="flex flex-wrap gap-1">
                {info.features.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ background: `${info.color}15`, color: info.color }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[#e7e3d6]/40 text-[11px]">
          {viewed.size < 3
            ? `${3 - viewed.size}개 카드를 더 살펴보세요`
            : "✓ 모두 확인했어요! 매칭 게임을 시작하세요."}
        </p>
        <button
          onClick={() => setStage("match")}
          disabled={viewed.size < 3}
          className="btn-primary px-5 py-2 rounded-lg text-xs disabled:opacity-30"
        >
          매칭 게임 시작 →
        </button>
      </div>
    </div>
  );
}

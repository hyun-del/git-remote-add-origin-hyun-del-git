import { useState, useRef } from "react";

interface Props {
  onComplete: () => void;
  evidenceType: "arc" | "whorl" | "loop";
  evidencePhoto: string;
}

type FpType = "arc" | "whorl" | "loop";

interface FpInfo {
  id: FpType;
  name: string;
  en: string;
  color: string;
  photo: string;
}

const FP_INFO: Record<FpType, FpInfo> = {
  arc:   { id: "arc",   name: "호형문", en: "Arc",   color: "#60a5fa", photo: "/fp-arc-1.png" },
  whorl: { id: "whorl", name: "와상문", en: "Whorl", color: "#f5c542", photo: "/fp-whorl-1.png" },
  loop:  { id: "loop",  name: "제상문", en: "Loop",  color: "#4ade80", photo: "/fp-loop-1.png" },
};

const ALL_TYPES: FpType[] = ["arc", "whorl", "loop"];

type Phase = "classify" | "minutiae" | "search" | "verify" | "done";

interface Suspect { id: string; name: string; type: FpType; score: number; }

const DATABASE: Omit<Suspect, "score">[] = [
  { id: "DB-001", name: "김민수", type: "arc" },
  { id: "DB-002", name: "박지영", type: "whorl" },
  { id: "DB-003", name: "이상훈", type: "loop" },
  { id: "DB-004", name: "최수연", type: "arc" },
  { id: "DB-005", name: "강태우", type: "whorl" },
  { id: "DB-006", name: "윤서연", type: "loop" },
  { id: "DB-007", name: "조민혁", type: "arc" },
  { id: "DB-008", name: "한예진", type: "whorl" },
];

interface Minutia { x: number; y: number; type: "ending" | "bifurcation"; }

const TARGET_MINUTIAE: Minutia[] = [
  { x: 22, y: 38, type: "bifurcation" },
  { x: 35, y: 62, type: "ending" },
  { x: 48, y: 30, type: "bifurcation" },
  { x: 56, y: 70, type: "ending" },
  { x: 68, y: 42, type: "bifurcation" },
  { x: 78, y: 58, type: "ending" },
];

export default function AFISExperiment({ onComplete, evidenceType, evidencePhoto }: Props) {
  const [phase, setPhase] = useState<Phase>("classify");
  const [classifyGuess, setClassifyGuess] = useState<FpType | null>(null);
  const [classifyError, setClassifyError] = useState(false);
  const [userMinutiae, setUserMinutiae] = useState<Minutia[]>([]);
  const [searchResults, setSearchResults] = useState<Suspect[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintMinutia, setHintMinutia] = useState<Minutia | null>(null);
  const [showHintPanel, setShowHintPanel] = useState(false);
  const evidenceRef = useRef<HTMLDivElement>(null);

  const EVIDENCE_TYPE = evidenceType;
  const EVIDENCE_PHOTO = evidencePhoto;

  const submitClassify = () => {
    if (!classifyGuess) return;
    if (classifyGuess === EVIDENCE_TYPE) { setClassifyError(false); setPhase("minutiae"); }
    else { setClassifyError(true); setTimeout(() => setClassifyError(false), 600); }
  };

  const handleEvidenceClick = (e: React.MouseEvent) => {
    if (!evidenceRef.current || userMinutiae.length >= 6) return;
    const rect = evidenceRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const distances = TARGET_MINUTIAE.map((m) => {
      const dx = m.x - x, dy = m.y - y;
      return Math.sqrt(dx * dx + dy * dy);
    });
    const minDist = Math.min(...distances);
    const nearestIdx = distances.indexOf(minDist);
    const target = TARGET_MINUTIAE[nearestIdx];
    if (minDist < 10) {
      const already = userMinutiae.find((um) => Math.abs(um.x - target.x) < 5 && Math.abs(um.y - target.y) < 5);
      if (!already) setUserMinutiae([...userMinutiae, target]);
    }
  };

  const correctMinutiae = userMinutiae.filter(
    (um) => TARGET_MINUTIAE.some((tm) => Math.abs(tm.x - um.x) < 5 && Math.abs(tm.y - um.y) < 5)
  ).length;

  const useHint = () => {
    const remaining = TARGET_MINUTIAE.filter(
      (tm) => !userMinutiae.some((um) => Math.abs(um.x - tm.x) < 5 && Math.abs(um.y - tm.y) < 5)
    );
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setHintMinutia(pick);
    setHintsUsed((h) => h + 1);
    setTimeout(() => setHintMinutia(null), 4000);
  };

  const proceedToSearch = () => {
    if (correctMinutiae >= 4) { setPhase("search"); runSearch(); }
  };

  const runSearch = () => {
    setSearchProgress(0);
    let progress = 0;
    const timer = setInterval(() => {
      progress += 2.5;
      setSearchProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        const scored: Suspect[] = DATABASE.map((d) => ({
          ...d,
          score: d.type === EVIDENCE_TYPE
            ? 80 + Math.floor(Math.random() * 16)
            : 10 + Math.floor(Math.random() * 30),
        }));
        scored.sort((a, b) => b.score - a.score);
        setSearchResults(scored);
        setPhase("verify");
      }
    }, 60);
  };

  const verifySuspect = (id: string) => {
    if (verifiedId) return;
    const suspect = searchResults.find((s) => s.id === id);
    if (!suspect) return;
    if (suspect.type === EVIDENCE_TYPE) {
      setVerifiedId(id);
      setTimeout(() => { setPhase("done"); setTimeout(onComplete, 2500); }, 2000);
    } else {
      setWrongId(id);
      setTimeout(() => setWrongId(null), 1200);
    }
  };

  const stepLabels = [
    { k: "classify", label: "① 유형분류" },
    { k: "minutiae", label: "② 특징점추출" },
    { k: "search",   label: "③ DB검색" },
    { k: "verify",   label: "④ 일치확인" },
  ];

  const renderStepBar = () => {
    const order = ["classify", "minutiae", "search", "verify"];
    const curIdx = phase === "done" ? 4 : order.indexOf(phase);
    return (
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {stepLabels.map((s, i) => {
          const myIdx = order.indexOf(s.k);
          const active = phase === s.k;
          const done = myIdx < curIdx || phase === "done";
          return (
            <div key={s.k} className="flex items-center">
              <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider
                ${active ? "bg-[#f5c542] text-[#0a0e1a]"
                  : done ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : "bg-[#2a3040] text-[#e7e3d6]/40"}`}
              >{s.label}</div>
              {i < 3 && <div className="w-2 h-px bg-[#2a3040]" />}
            </div>
          );
        })}
      </div>
    );
  };

  /* ── 힌트 안내 메시지 (유형별 다름) ── */
  const classifyHint: Record<FpType, string> = {
    arc:   "활처럼 한 방향으로 흐르는 유형이에요. 삼각주(delta)가 없어요.",
    whorl: "융선이 소용돌이·동심원 모양으로 감기는 유형이에요.",
    loop:  "융선이 한쪽에서 나와 되돌아가는 고리 형태예요.",
  };

  /* ── 단계 1: 유형 분류 ── */
  if (phase === "classify") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💻</span>
          <h3 className="text-lg font-bold text-[#f5c542]">실험 4: AFIS 자동 지문 검색</h3>
        </div>
        <p className="text-[#e7e3d6]/70 text-xs mb-3">
          실제 경찰의 <b>AFIS(자동지문식별시스템)</b>이 어떻게 범인을 찾는지 단계별로 체험해보세요.
        </p>
        {renderStepBar()}

        <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#f5c542]/20 mb-3">
          <p className="text-[#e7e3d6]/80 text-xs leading-relaxed">
            <b className="text-[#f5c542]">① 유형 분류 (Classification)</b><br />
            AFIS는 먼저 지문의 유형을 분류합니다. 아래 현장 증거 지문을 보고 어떤 유형인지 맞춰보세요.
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="rounded-xl p-3 border-2 border-[#f5c542] bg-[#0d1220]">
            <img src={EVIDENCE_PHOTO} alt="증거 지문" className="rounded-lg"
              style={{ width: 160, height: 160, objectFit: "contain", filter: "grayscale(1) contrast(1.5)" }} />
            <p className="text-center text-[10px] text-[#f5c542] mt-2 tracking-wider">CRIME SCENE EVIDENCE</p>
          </div>
        </div>

        <div className={classifyError ? "animate-shake" : ""}>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {ALL_TYPES.map((t) => {
              const info = FP_INFO[t];
              return (
                <button key={t} onClick={() => setClassifyGuess(t)}
                  className={`fp-card rounded-xl p-3 border-2 bg-[#0d1220] transition-all
                    ${classifyGuess === t ? "active" : "border-[#2a3040]"}`}
                >
                  <img src={info.photo} alt={info.name} className="w-full rounded-lg mb-1"
                    style={{ height: 70, objectFit: "contain", filter: "grayscale(1) contrast(1.3)" }} draggable={false} />
                  <p className="text-center font-bold text-[10px]" style={{ color: info.color }}>{info.name}</p>
                  <p className="text-center text-[#e7e3d6]/40 text-[9px]">{info.en}</p>
                </button>
              );
            })}
          </div>
        </div>

        {classifyError && (
          <p className="text-center text-red-400 text-xs font-bold mb-2">
            ✗ 다시 살펴보세요. {classifyHint[EVIDENCE_TYPE]}
          </p>
        )}

        <div className="flex justify-end">
          <button onClick={submitClassify} disabled={!classifyGuess}
            className="btn-primary px-5 py-2 rounded-lg text-xs disabled:opacity-30">
            유형 분류 →
          </button>
        </div>
      </div>
    );
  }

  /* ── 단계 2: 특징점 추출 ── */
  if (phase === "minutiae") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💻</span>
          <h3 className="text-lg font-bold text-[#f5c542]">실험 4: AFIS 자동 지문 검색</h3>
        </div>
        {renderStepBar()}

        <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#f5c542]/20 mb-3">
          <p className="text-[#e7e3d6]/80 text-xs leading-relaxed">
            <b className="text-[#f5c542]">② 특징점 추출 (Minutiae Detection)</b><br />
            AFIS는 리지가 <b>끝나는 점(Ending)</b>과 <b>갈라지는 점(Bifurcation)</b>을 추출합니다.
            증거 지문 위에서 <b className="text-[#f5c542]">리지가 끝나거나 갈라지는 곳을 클릭</b>해 최소 4개를 찾으세요!
          </p>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setShowHintPanel((v) => !v)}
              className="btn-ghost px-3 py-1.5 rounded text-[10px] flex items-center gap-1.5">
              <span>💡</span>
              <span>힌트 {showHintPanel ? "▾" : "▸"}</span>
              {hintsUsed > 0 && (
                <span className="bg-[#f5c542]/20 text-[#f5c542] px-1.5 py-0.5 rounded text-[9px]">
                  사용 {hintsUsed}회
                </span>
              )}
            </button>
            {showHintPanel && (
              <button onClick={useHint} disabled={correctMinutiae >= 6}
                className="btn-primary px-3 py-1.5 rounded-lg text-[10px] disabled:opacity-30">
                🔦 특징점 한 곳 비추기
              </button>
            )}
          </div>
          {showHintPanel && (
            <div className="mt-2 bg-[#0a0e1a] rounded-lg p-3 border border-[#f5c542]/30 text-[10px] text-[#e7e3d6]/80 space-y-2 leading-relaxed">
              <div><b className="text-blue-400">🔵 끝점:</b> 리지 한 가닥이 <b>뚝 끊겨서 끝나는 곳</b>이에요.</div>
              <div><b className="text-red-400">🔴 분기점:</b> 리지가 <b>두 가닥으로 갈라지는 곳</b>이에요.</div>
              <div className="pt-1 border-t border-[#2a3040]">
                <b className="text-[#f5c542]">💡 팁:</b> 지문 <b>중앙 부분</b>에 특징점이 많아요.
              </div>
            </div>
          )}
        </div>

        <div
          ref={evidenceRef}
          onClick={handleEvidenceClick}
          className="relative mx-auto rounded-xl border-2 border-[#f5c542] cursor-crosshair overflow-hidden"
          style={{ width: 300, height: 300, background: "#0d1220" }}
        >
          <img src={EVIDENCE_PHOTO} alt="증거 지문" draggable={false}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", filter: "grayscale(1) contrast(1.5) brightness(1.1)", opacity: 0.85 }} />

          {userMinutiae.map((m, i) => (
            <div key={i} className="absolute pointer-events-none"
              style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}>
              <div className="relative">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  m.type === "ending" ? "border-blue-400 bg-blue-400/30" : "border-red-400 bg-red-400/30"}`} />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#f5c542] text-[8px] font-bold text-[#0a0e1a] flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
            </div>
          ))}

          {userMinutiae.length === 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-1 rounded text-[9px] text-[#f5c542] whitespace-nowrap">
              💡 리지가 끝나거나 갈라지는 곳을 클릭하세요
            </div>
          )}

          {hintMinutia && (
            <div className="absolute pointer-events-none"
              style={{ left: `${hintMinutia.x}%`, top: `${hintMinutia.y}%`, transform: "translate(-50%, -50%)" }}>
              <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border-2 border-[#f5c542] animate-ping" />
              <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border-2 border-[#f5c542] bg-[#f5c542]/20" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👇</div>
            </div>
          )}
        </div>

        {hintMinutia && (
          <p className="text-center text-[#f5c542] text-[10px] font-bold mt-2 animate-pulse">
            💡 노란 원 안에 {hintMinutia.type === "ending" ? "끝점" : "분기점"}이 있어요!
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-blue-400 bg-blue-400/30" />
            <span className="text-[#e7e3d6]/70">끝점 (Ending)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-red-400 bg-red-400/30" />
            <span className="text-[#e7e3d6]/70">분기점 (Bifurcation)</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-[10px] text-[#e7e3d6]/60">
            찾은 특징점: <b className="text-[#f5c542]">{correctMinutiae}/6</b>
            {correctMinutiae >= 4 && <span className="text-green-400 ml-2">✓ 충분!</span>}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setUserMinutiae([])} className="btn-ghost px-3 py-1.5 rounded text-[10px]">리셋</button>
            <button onClick={proceedToSearch} disabled={correctMinutiae < 4}
              className="btn-primary px-5 py-2 rounded-lg text-xs disabled:opacity-30">DB 검색 →</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 단계 3: DB 검색 ── */
  if (phase === "search") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💻</span>
          <h3 className="text-lg font-bold text-[#f5c542]">실험 4: AFIS 자동 지문 검색</h3>
        </div>
        {renderStepBar()}
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="text-5xl animate-pulse">🔍</div>
          <p className="text-[#f5c542] font-bold text-sm">AFIS 검색 중...</p>
          <p className="text-[#e7e3d6]/50 text-[10px]">전국 지문 데이터베이스 1,248,975건 대조</p>
          <div className="w-64 progress-track h-3 rounded-full overflow-hidden">
            <div className="progress-fill h-full rounded-full" style={{ width: `${searchProgress}%` }} />
          </div>
          <span className="text-[10px] text-[#e7e3d6]/40">{Math.round(searchProgress)}%</span>
        </div>
      </div>
    );
  }

  /* ── 단계 4: 일치 확인 ── */
  if (phase === "verify") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💻</span>
          <h3 className="text-lg font-bold text-[#f5c542]">실험 4: AFIS 자동 지문 검색</h3>
        </div>
        {renderStepBar()}

        <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#f5c542]/20 mb-3">
          <p className="text-[#e7e3d6]/80 text-xs leading-relaxed">
            <b className="text-[#f5c542]">④ 일치 확인 (Verification)</b><br />
            검색 완료! <b className="text-[#f5c542]">점수가 가장 높고 유형이 일치하는 사람</b>을 클릭하세요.
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="rounded-lg p-2 border border-[#f5c542] bg-[#0d1220] relative">
            <img src={EVIDENCE_PHOTO} alt="증거 지문"
              style={{ width: 80, height: 80, objectFit: "contain", filter: "grayscale(1) contrast(1.5)" }} />
            {userMinutiae.slice(0, 4).map((m, i) => (
              <div key={i} className="absolute w-2.5 h-2.5 rounded-full border border-[#f5c542] bg-[#f5c542]/40 pointer-events-none"
                style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {searchResults.slice(0, 5).map((s) => {
            const isSelectedWrong = wrongId === s.id;
            const isVerified = verifiedId === s.id;
            const scoreColor = s.score >= 70 ? "text-green-400" : s.score >= 40 ? "text-yellow-400" : "text-[#e7e3d6]/40";
            const sInfo = FP_INFO[s.type];
            return (
              <button key={s.id} onClick={() => verifySuspect(s.id)} disabled={!!verifiedId}
                className={`w-full flex items-center gap-3 p-2 rounded-lg border-2 bg-[#0d1220] text-left transition-all
                  ${isVerified ? "border-green-500 bg-green-500/10"
                    : isSelectedWrong ? "border-red-500 bg-red-500/10 animate-shake"
                    : "border-[#2a3040] hover:border-[#f5c542]"}`}
              >
                <img src={sInfo.photo} alt={sInfo.name} className="rounded flex-shrink-0"
                  style={{ width: 40, height: 40, objectFit: "contain", filter: "grayscale(1) contrast(1.5)" }} draggable={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#e7e3d6] text-xs">{s.name}</span>
                    <span className="text-[9px] text-[#e7e3d6]/40">{s.id}</span>
                  </div>
                  <div className="text-[9px]" style={{ color: sInfo.color }}>{sInfo.name}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold text-lg leading-none ${scoreColor}`}>{s.score}</div>
                  <div className="text-[8px] text-[#e7e3d6]/40">점수</div>
                </div>
                {isVerified && <span className="text-green-400 text-xl ml-1">✓</span>}
                {isSelectedWrong && <span className="text-red-400 text-xl ml-1">✗</span>}
              </button>
            );
          })}
        </div>

        {verifiedId && (
          <div className="mt-3 p-3 rounded-lg text-center font-bold text-xs bg-green-500/10 text-green-400 border border-green-500/30">
            ✓ 특징점이 정확히 일치합니다! 범인 검거! 🎉
          </div>
        )}
        {wrongId && (
          <div className="mt-3 p-3 rounded-lg text-center font-bold text-xs bg-red-500/10 text-red-400 border border-red-500/30">
            ✗ 특징점이 일치하지 않습니다. 다른 용의자를 확인해보세요.
          </div>
        )}
      </div>
    );
  }

  /* ── 완료 ── */
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">💻</span>
        <h3 className="text-lg font-bold text-[#f5c542]">실험 4: AFIS 자동 지문 검색</h3>
      </div>
      {renderStepBar()}
      <div className="py-6 text-center">
        <div className="text-5xl mb-2">🎯</div>
        <p className="text-[#f5c542] font-bold">AFIS 검색 완료!</p>
        <p className="text-[#e7e3d6]/60 text-xs mt-1">실제 경찰도 이런 방식으로 지문을 대조합니다.</p>
        <p className="text-[#e7e3d6]/40 text-[10px] mt-3">다음 단계로 이동 중...</p>
      </div>
    </div>
  );
}

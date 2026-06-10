/**
 * 지문 패턴 SVG 컴포넌트들
 * 한국 과학수사에서 사용하는 5가지 지문 유형:
 * 두형문(Double Loop), 정기문(Central Pocket Whorl), 반기문(Accidental), 쌍기문(Plain Whorl), 호형문(Tented Arch)
 */

interface PatternProps {
  className?: string;
  color?: string;
  size?: number;
}

/* ───────── 1. 두형문 (Double Loop) ─────────
   두 개의 루프가 서로 반대 방향으로 감겨 있는 형태 */
export function DoubleLoopPattern({ className = "", color = "#e7e3d6", size = 100 }: PatternProps) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} className={className}>
      {/* 바깥 리지 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i}
          d={`M ${8 + i * 3} ${115 - i * 3} L ${8 + i * 3} ${30 + i * 2}
              Q ${8 + i * 3} ${20 + i * 2} ${18 + i * 3} ${18 + i * 2}
              Q ${30 + i * 3} ${15 + i * 2} ${35 + i * 3} ${25 + i * 2}
              Q ${40 + i * 3} ${15 + i * 2} ${50 + i * 3} ${20 + i * 2}
              Q ${65 + i * 3} ${15 + i * 2} ${70 + i * 3} ${28 + i * 2}
              L ${92 - i * 3} ${115 - i * 3}`}
          stroke={color} strokeWidth="1.4" fill="none" opacity={0.8} />
      ))}
      {/* 중앙 이중 나선 */}
      <path d="M 35 55 Q 40 45 50 50 Q 60 45 65 55 Q 70 65 60 70 Q 50 75 45 68 Q 40 60 35 55 Z"
        stroke={color} strokeWidth="1.4" fill="none" opacity={0.85} />
      <path d="M 38 58 Q 42 50 50 53 Q 58 50 62 58 Q 66 65 58 68 Q 50 72 46 65 Q 42 60 38 58"
        stroke={color} strokeWidth="1.2" fill="none" opacity={0.85} />
      {/* 삼각주 */}
      <circle cx="15" cy="85" r="2" fill={color} opacity="0.5" />
      <circle cx="85" cy="85" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}

/* ───────── 2. 정기문 (Central Pocket Whorl) ─────────
   루프 안에 작은 소용돌이가 들어 있는 형태 (루프와 와상문의 중간) */
export function CentralPocketPattern({ className = "", color = "#e7e3d6", size = 100 }: PatternProps) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} className={className}>
      {/* 바깥 리지들 */}
      {Array.from({ length: 14 }).map((_, i) => {
        const o = i * 3;
        return i < 5 ? (
          <path key={i}
            d={`M ${10 + o} ${115 - o} L ${10 + o} ${30 + o}`}
            stroke={color} strokeWidth="1.4" fill="none" opacity={0.8} />
        ) : (
          <path key={i}
            d={`M ${10 + o} ${115 - o} L ${10 + o} ${30 + o}
                Q ${15 + o} ${22 + o} ${30 + o} ${20 + o}
                Q ${50} ${18 + o} ${70 - o} ${20 + o}
                Q ${85 - o} ${22 + o} ${90 - o} ${30 + o}
                L ${90 - o} ${115 - o}`}
            stroke={color} strokeWidth="1.4" fill="none" opacity={0.8} />
        );
      })}
      {/* 중앙 포켓 소용돌이 */}
      <circle cx="50" cy="65" r="14" stroke={color} strokeWidth="1.4" fill="none" opacity={0.85} />
      <circle cx="50" cy="65" r="10" stroke={color} strokeWidth="1.2" fill="none" opacity={0.85} />
      <circle cx="50" cy="65" r="6" stroke={color} strokeWidth="1" fill="none" opacity={0.85} />
      {/* 삼각주 */}
      <circle cx="18" cy="75" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}

/* ───────── 3. 반기문 (Accidental Whorl) ─────────
   불규칙하고 복합적인 패턴 — 여러 패턴이 섞인 형태 */
export function AccidentalPattern({ className = "", color = "#e7e3d6", size = 100 }: PatternProps) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} className={className}>
      {/* 바깥 불규칙 리지 */}
      <path d="M 10 115 L 10 40 Q 20 30 30 35 Q 40 25 50 30 Q 60 20 70 35 Q 80 28 90 40 L 90 115"
        stroke={color} strokeWidth="1.4" fill="none" opacity={0.8} />
      <path d="M 15 112 L 15 45 Q 25 38 32 42 Q 42 33 50 38 Q 58 31 68 42 Q 76 37 85 45 L 85 112"
        stroke={color} strokeWidth="1.3" fill="none" opacity={0.75} />
      <path d="M 20 108 L 20 52 Q 28 46 36 50 Q 44 44 50 48 Q 58 42 64 50 Q 72 46 80 52 L 80 108"
        stroke={color} strokeWidth="1.2" fill="none" opacity={0.7} />
      <path d="M 25 105 L 25 60 Q 32 55 40 58 Q 46 53 50 57 Q 56 52 62 58 Q 68 54 75 60 L 75 105"
        stroke={color} strokeWidth="1.1" fill="none" opacity={0.65} />
      {/* 불규칙 내부 패턴 */}
      <path d="M 35 70 Q 45 62 55 70 Q 65 62 68 72" stroke={color} strokeWidth="1.2" fill="none" opacity={0.8} />
      <path d="M 38 80 Q 48 72 58 80" stroke={color} strokeWidth="1.1" fill="none" opacity={0.75} />
      <path d="M 42 90 Q 50 84 58 90" stroke={color} strokeWidth="1" fill="none" opacity={0.7} />
      {/* 삼각주 2개 */}
      <circle cx="18" cy="80" r="2" fill={color} opacity="0.5" />
      <circle cx="82" cy="80" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}

/* ───────── 4. 쌍기문 (Plain Whorl) ─────────
   동심원 또는 나선형으로 리지가 돌고 있는 원형 패턴 */
export function PlainWhorlPattern({ className = "", color = "#e7e3d6", size = 100 }: PatternProps) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} className={className}>
      {Array.from({ length: 14 }).map((_, i) => {
        const rx = 10 + i * 3;
        const ry = 13 + i * 3.5;
        return <ellipse key={i} cx="50" cy="58" rx={rx} ry={ry}
          stroke={color} strokeWidth="1.4" fill="none" opacity={0.8} />;
      })}
      {/* 중심 나선 */}
      <path d="M 50 58 Q 56 52 62 58 Q 66 66 58 70 Q 48 72 44 62 Q 44 52 55 48"
        stroke={color} strokeWidth="1.2" fill="none" opacity={0.85} />
      {/* 두 개의 삼각주 */}
      <circle cx="16" cy="85" r="2.5" fill={color} opacity="0.5" />
      <circle cx="84" cy="85" r="2.5" fill={color} opacity="0.5" />
    </svg>
  );
}

/* ───────── 5. 호형문 (Tented Arch) ─────────
   활 모양이지만 중앙에 뾰족한 봉우리가 있는 아치형 패턴 */
export function TentedArchPattern({ className = "", color = "#e7e3d6", size = 100 }: PatternProps) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} className={className}>
      {Array.from({ length: 12 }).map((_, i) => {
        const offset = i * 3.5;
        const peak = 15 + i * 4;
        const tentHeight = i < 6 ? -8 + i * 1.5 : 0; // 뾰족한 봉우리 만들기
        return (
          <path key={i}
            d={`M ${10 + offset} ${115 - offset}
                Q 50 ${peak + tentHeight} ${90 - offset} ${115 - offset}`}
            stroke={color} strokeWidth="1.4" fill="none" opacity={0.85} />
        );
      })}
      {/* 중앙 세로 축 */}
      <line x1="50" y1="20" x2="50" y2="115" stroke={color} strokeWidth="1"
        opacity={0.3} strokeDasharray="2 3" />
      {/* 삼각주 없음이 특징 */}
    </svg>
  );
}

/** 지문 유형 정보 */
export const PATTERN_INFO = {
  double_loop: {
    name: "두형문",
    en: "Double Loop",
    frequency: "4~5%",
    desc: "두 개의 루프가 서로 반대 방향으로 겹쳐 감겨 있는 형태. 전체 지문 중 약 4~5% 출현.",
    color: "#e74c3c",
  },
  central_pocket: {
    name: "정기문",
    en: "Central Pocket Whorl",
    frequency: "2~4%",
    desc: "루프문 안에 작은 소용돌이가 들어 있는 복합 패턴. 루프와 와상문의 중간 형태.",
    color: "#3498db",
  },
  accidental: {
    name: "반기문",
    en: "Accidental Whorl",
    frequency: "1~2%",
    desc: "여러 지문 패턴이 불규칙하게 섞여 있는 매우 드문 패턴. 가장 희귀한 유형.",
    color: "#9b59b6",
  },
  plain_whorl: {
    name: "쌍기문",
    en: "Plain Whorl",
    frequency: "25~30%",
    desc: "동심원 또는 나선형으로 리지가 빙글빙글 도는 가장 흔한 와상문 유형.",
    color: "#f39c12",
  },
  tented_arch: {
    name: "호형문",
    en: "Tented Arch",
    frequency: "1~3%",
    desc: "활 모양이지만 중앙에 뾰족한 봉우리가 있어 텐트처럼 보이는 아치형 패턴.",
    color: "#2ecc71",
  },
} as const;

export type PatternType = keyof typeof PATTERN_INFO;

/** 유형 목록 — 순서가 UX에 중요 */
export const ALL_PATTERNS: PatternType[] = [
  "double_loop",
  "central_pocket",
  "accidental",
  "plain_whorl",
  "tented_arch",
];

/** 패턴 렌더 유틸 */
export function renderPattern(type: PatternType, color?: string, size?: number) {
  const c = color || "#e7e3d6";
  const s = size || 80;
  switch (type) {
    case "double_loop": return <DoubleLoopPattern color={c} size={s} />;
    case "central_pocket": return <CentralPocketPattern color={c} size={s} />;
    case "accidental": return <AccidentalPattern color={c} size={s} />;
    case "plain_whorl": return <PlainWhorlPattern color={c} size={s} />;
    case "tented_arch": return <TentedArchPattern color={c} size={s} />;
  }
}

interface Props {
  onSelectFingerprint: () => void;
  onSelectBlood: () => void;
  completedFp: boolean;
  completedBlood: boolean;
}

type Category = "basic" | "fire" | "scene" | "forensic" | "blood" | "ballistics" | "main";

interface Technique {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  available: boolean;
  description: string;
  category: Category;
}

const CATEGORY_INFO: Record<Category, { label: string; icon: string; color: string }> = {
  basic:      { label: "기초 수사 기법",    icon: "🔰", color: "#f5c542" },
  fire:       { label: "화재·폭발 수사",    icon: "🔥", color: "#ef4444" },
  scene:      { label: "현장 증거 분석",    icon: "🔍", color: "#3b82f6" },
  forensic:   { label: "법의학 분석",       icon: "🧪", color: "#8b5cf6" },
  blood:      { label: "혈흔 분석",         icon: "🩸", color: "#dc2626" },
  ballistics: { label: "탄도·총상 분석",    icon: "🎯", color: "#059669" },
  main:       { label: "실전 수사",         icon: "🏁", color: "#f59e0b" },
};

const TECHNIQUES: Technique[] = [
  /* ── 기초 ── */
  {
    id: "fingerprint", title: "지문 감식", subtitle: "Fingerprint Analysis",
    icon: "🖐️", available: true, category: "basic",
    description: "가루를 뿌리고 테이프로 떠서 지문 패턴을 대조하는 가장 대표적인 과학 수사 기법",
  },
  {
    id: "dna", title: "DNA 분석", subtitle: "DNA Profiling",
    icon: "🧬", available: false, category: "basic",
    description: "혈액, 타액, 머리카락에서 DNA를 추출해 신원을 확인하는 기법",
  },
  {
    id: "document", title: "문서 감정", subtitle: "Questioned Document",
    icon: "📝", available: false, category: "basic",
    description: "위조 문서, 변조된 필적을 감정하는 기법",
  },

  /* ── 화재·폭발 ── */
  {
    id: "fire_pattern", title: "연소 패턴 분석", subtitle: "Combustion Pattern Analysis",
    icon: "🔥", available: false, category: "fire",
    description: "그을음 형태와 목재 탄화 깊이를 분석하여 발화 지점과 발화 순서를 추적",
  },
  {
    id: "fire_catalyst", title: "촉매제 확인", subtitle: "Accelerant Detection (GC)",
    icon: "⚗️", available: false, category: "fire",
    description: "가스 크로마토그래피로 휘발유 등 방화 촉매제 성분을 검출",
  },
  {
    id: "fire_device", title: "기기 결함 확인", subtitle: "Electrical Fire Analysis",
    icon: "🔌", available: false, category: "fire",
    description: "전기 기기의 구조 분해와 미세 흔적 분석으로 발화 원인 규명",
  },

  /* ── 현장 증거 ── */
  {
    id: "trace_evidence", title: "흔적 정밀 조사", subtitle: "Trace Evidence Analysis",
    icon: "🔬", available: false, category: "scene",
    description: "현장의 지문·족적·의류 잔여물·모발 등 미세 증거를 채취·분석",
  },
  {
    id: "lost_property", title: "유류품 채취", subtitle: "Property Retrieval",
    icon: "🎒", available: false, category: "scene",
    description: "현장에 남겨진 소지품을 수집하여 소유자 및 범행 관련성 추적",
  },
  {
    id: "belongings_check", title: "용의자 소지품 검사", subtitle: "Belongings Forensics",
    icon: "👜", available: false, category: "scene",
    description: "용의자의 소지품에 범행 장소의 증거가 남아 있는지 확인",
  },

  /* ── 법의학 ── */
  {
    id: "autopsy", title: "부검 및 혈액 분석", subtitle: "Autopsy & Toxicology",
    icon: "🔪", available: false, category: "forensic",
    description: "시신 부검과 혈액·장기 분석을 통해 사인, 사망시각, 독극물 검출",
  },
  {
    id: "brainwave", title: "뇌파(P300) 분석", subtitle: "Brainwave P300 Detection",
    icon: "🧠", available: false, category: "forensic",
    description: "용의자의 뇌파 반응을 통해 범행 장면에 대한 기억 여부를 측정",
  },
  {
    id: "bone_injury", title: "뼈 손상 분석", subtitle: "Bone Trauma Analysis",
    icon: "🦴", available: false, category: "forensic",
    description: "골절 형태와 손상 방향을 분석하여 무기 종류와 가해자 특성 추정",
  },
  {
    id: "wound", title: "상처 위치 조사", subtitle: "Wound Pattern Analysis",
    icon: "🩹", available: false, category: "forensic",
    description: "상처의 형태·위치·깊이를 분석하여 가해자의 신체 조건과 자세 추적",
  },

  /* ── 혈흔 ── */
  {
    id: "blood_bpa", title: "혈흔 패턴 분석 (BPA)", subtitle: "Bloodstain Pattern Analysis",
    icon: "🩸", available: true, category: "blood",
    description: "혈흔의 형태(낙하·충격·이동)와 각도 공식으로 발원지와 사건 경위를 재구성하는 기법",
  },
  {
    id: "blood_angle", title: "각도 핏자국 심화", subtitle: "Advanced Angle Analysis",
    icon: "📐", available: false, category: "blood",
    description: "3D 발원지 추정과 스트링 기법으로 혈흔 분석을 심화",
  },

  /* ── 탄도·총상 ── */
  {
    id: "ballistics_entry", title: "입사창·출사창 구분", subtitle: "Entry/Exit Wound Differentiation",
    icon: "🎯", available: false, category: "ballistics",
    description: "총상의 가장자리 모양과 분포로 입사창과 출사창을 구분",
  },
  {
    id: "gunshot_distance", title: "사격 거리 추정", subtitle: "Shooting Distance Estimation",
    icon: "📏", available: false, category: "ballistics",
    description: "총구 잔사(소매흔)와 분포 패턴으로 사격 거리를 추정",
  },
  {
    id: "bullet_path", title: "탄환 경로·각도 분석", subtitle: "Bullet Trajectory Analysis",
    icon: "➡️", available: false, category: "ballistics",
    description: "탄공과 파손 형태를 연결해 탄환의 비행 경로와 발사 각도를 추정",
  },

  /* ── 실전 수사 ── */
  {
    id: "main_case", title: "본편: AI 사건 현장", subtitle: "Main Story — AI Crime Scene",
    icon: "🏁", available: false, category: "main",
    description: "튜토리얼에서 배운 모든 기법을 활용해 AI가 생성한 사건 현장을 직접 수사",
  },
];

export default function TutorialHub({ onSelectFingerprint, onSelectBlood, completedFp, completedBlood }: Props) {
  const categories: Category[] = ["basic", "blood", "fire", "scene", "forensic", "ballistics", "main"];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f5c542]/10 border border-[#f5c542]/30 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-[#f5c542] animate-pulse" />
          <span className="text-[#f5c542] text-xs font-bold tracking-widest">TUTORIAL MODE</span>
        </div>
        <h2 className="text-3xl font-bold text-[#e7e3d6] mb-2">과학수사 기법 실험실</h2>
        <p className="text-[#e7e3d6]/60 text-sm">
          수사관이 되어 <b className="text-[#f5c542]">과학 수사 기법</b>을 하나씩 배워보세요.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => {
          const info = CATEGORY_INFO[cat];
          const items = TECHNIQUES.filter((t) => t.category === cat);
          if (items.length === 0) return null;

          return (
            <section key={cat}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{info.icon}</span>
                <h3 className="text-lg font-bold tracking-wider" style={{ color: info.color }}>
                  {info.label}
                </h3>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${info.color}40, transparent)` }} />
                <span className="text-[10px] text-[#e7e3d6]/40 font-mono">
                  {items.filter((i) => i.available).length}/{items.length} OPEN
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((t) => {
                  const isCompleted =
                    (t.id === "fingerprint" && completedFp) ||
                    (t.id === "blood_bpa" && completedBlood);

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (t.id === "fingerprint") onSelectFingerprint();
                        if (t.id === "blood_bpa") onSelectBlood();
                      }}
                      disabled={!t.available}
                      className={`evidence-card rounded-xl p-4 text-left transition-all relative overflow-hidden
                        ${t.available ? "hover:border-[#f5c542] hover:-translate-y-1 cursor-pointer" : "cursor-not-allowed"}
                        ${isCompleted ? "!border-green-500" : ""}`}
                      style={isCompleted ? { boxShadow: "0 0 0 2px rgba(34,197,94,0.5), 0 0 30px rgba(34,197,94,0.2)" } : undefined}
                    >
                      {isCompleted && (
                        <>
                          <div className="absolute inset-0 bg-green-500/5 pointer-events-none rounded-xl" />
                          <div className="complete-stamp absolute top-1/2 left-1/2 pointer-events-none z-20"
                            style={{ transform: "translate(-50%, -50%) rotate(-12deg)" }}>
                            <div className="border-4 border-green-400 rounded-lg px-4 py-1.5 bg-green-500/15 backdrop-blur-[2px]"
                              style={{ boxShadow: "0 0 20px rgba(34,197,94,0.4), inset 0 0 12px rgba(34,197,94,0.2)" }}>
                              <div className="text-green-400 font-black tracking-[0.2em] text-lg drop-shadow-lg"
                                style={{ fontFamily: "'Courier New', monospace" }}>
                                COMPLETE!
                              </div>
                              <div className="text-green-300/80 text-[8px] tracking-widest text-center mt-0.5">
                                KSI · 수료 인증
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10">
                            ✓
                          </div>
                        </>
                      )}

                      {!t.available && (
                        <div className="lock-overlay absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10">
                          <div className="w-14 h-14 rounded-full bg-[#0a0e1a]/80 border border-[#2a3040] flex items-center justify-center mb-1">
                            <span className="text-2xl">🔒</span>
                          </div>
                          <span className="text-[#e7e3d6]/50 text-[10px] tracking-widest">잠금 해제 예정</span>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="text-3xl flex-shrink-0">{t.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm mb-0.5" style={{ color: isCompleted ? "#22c55e" : "#f5c542" }}>
                            {t.title}
                          </h4>
                          <p className="text-[#e7e3d6]/40 text-[10px] tracking-wide mb-2">{t.subtitle}</p>
                          <p className="text-[#e7e3d6]/70 text-xs leading-relaxed line-clamp-2">{t.description}</p>
                          {t.available && !isCompleted && (
                            <div className="mt-3 text-[#f5c542] text-[10px] font-bold tracking-widest">
                              ▶ 시작하기
                            </div>
                          )}
                          {isCompleted && (
                            <div className="mt-3 text-green-400 text-[10px] font-bold tracking-widest">
                              🏅 수료 완료 · 다시 보기
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

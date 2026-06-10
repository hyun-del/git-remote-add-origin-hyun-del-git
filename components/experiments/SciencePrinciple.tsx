interface Props { onComplete: () => void; }

export default function SciencePrinciple({ onComplete }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧬</span>
        <h3 className="text-lg font-bold text-[#f5c542]">지문 감식의 과학적 원리</h3>
      </div>

      <div className="space-y-3">
        {/* 카드 1: 3대 유형 — 실제 사진 포함 */}
        <div className="p-3 rounded-lg bg-[#0a0e1a] border border-[#2a3040]">
          <div className="flex gap-3 mb-3">
            <span className="text-xl flex-shrink-0">🖐️</span>
            <div>
              <h4 className="text-[#f5c542] font-bold text-xs mb-1">1. 지문의 3대 국제 분류</h4>
              <p className="text-[#e7e3d6]/80 text-xs leading-relaxed">
                국제 표준 기준으로 지문은 크게 <b className="text-[#f5c542]">3가지 유형</b>으로 분류됩니다.
                각 유형은 리지(융선) 흐름 방향, 삼각주(delta) 개수로 구분됩니다.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <TypeCard
              photo="/fp-arc-1.png"
              name="호형문"
              en="Arc"
              color="#60a5fa"
              delta="삼각주 없음"
              freq="약 5%"
              desc="융선이 활처럼 한 방향으로 흐름"
            />
            <TypeCard
              photo="/fp-whorl-1.png"
              name="와상문"
              en="Whorl"
              color="#f5c542"
              delta="삼각주 2개+"
              freq="약 35%"
              desc="동심원·나선 형태로 소용돌이침"
            />
            <TypeCard
              photo="/fp-loop-1.png"
              name="제상문"
              en="Loop"
              color="#4ade80"
              delta="삼각주 1개"
              freq="약 60%"
              desc="한쪽에서 나와 되돌아가는 고리형"
            />
          </div>
        </div>

        <Card icon="🧫" title="2. 왜 지문이 남을까?"
          content="손가락 끝 에크린 땀샘이 분비하는 물, 염분, 아미노산, 기름 성분이 리지(융선)를 따라 표면에 옮겨져 '잠재 지문(Latent Fingerprint)'이 됩니다." />
        <Card icon="🖤" title="3. 지문 가루의 원리"
          content="카본 블랙(검은 가루), 알루미늄(흰 가루) 등이 땀 속 지질(기름 성분)에 물리적으로 달라붙어 리지 패턴을 시각화합니다. 표면 색에 따라 다른 색의 가루를 사용합니다." />
        <Card icon="🔬" title="4. 테이프 리프팅"
          content="투명 접착 테이프로 가루 묻은 지문을 떼어내어 흰색 또는 검은색 보존 카드에 붙이면 영구적인 증거가 됩니다. 이 과정을 '리프팅(Lifting)'이라고 합니다." />
        <Card icon="🧬" title="5. 왜 모든 지문이 다를까?"
          content="태아 10~16주차에 유전자와 자궁 내 환경(혈류, 압력, 양분 농도)이 복합 작용해 완전히 무작위한 패턴이 형성됩니다. 일란성 쌍둥이도 지문은 다릅니다!" />
        <Card icon="💻" title="6. AFIS 자동 지문 인식 시스템"
          content="① 유형 분류 → ② 특징점(Minutiae: 리지 끝점·분기점) 추출 → ③ 데이터베이스 검색 → ④ 점수 기반 일치 확인. 경찰청 AFIS는 수백만 건을 몇 초 만에 대조합니다. 12개 이상의 특징점이 일치하면 동일 인물로 간주합니다." />
      </div>

      <div className="flex justify-end mt-5">
        <button onClick={onComplete} className="btn-primary px-5 py-2 rounded-lg text-xs">
          튜토리얼 완료! 🎉
        </button>
      </div>
    </div>
  );
}

function TypeCard({
  photo, name, en, color, delta, freq, desc,
}: {
  photo: string; name: string; en: string; color: string;
  delta: string; freq: string; desc: string;
}) {
  return (
    <div className="rounded-lg bg-[#0d1220] border border-[#2a3040] p-2 flex flex-col items-center gap-1.5">
      <img
        src={photo}
        alt={name}
        className="rounded"
        style={{ width: "100%", height: 64, objectFit: "contain", filter: "grayscale(1) contrast(1.4)" }}
        draggable={false}
      />
      <p className="font-bold text-[11px]" style={{ color }}>{name}</p>
      <p className="text-[#e7e3d6]/40 text-[9px]">{en}</p>
      <div className="w-full border-t border-[#2a3040] pt-1.5 space-y-0.5">
        <p className="text-[#e7e3d6]/60 text-[9px]">📍 {delta}</p>
        <p className="text-[#e7e3d6]/60 text-[9px]">📊 빈도 {freq}</p>
        <p className="text-[#e7e3d6]/60 text-[9px] leading-tight">{desc}</p>
      </div>
    </div>
  );
}

function Card({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-[#0a0e1a] border border-[#2a3040]">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <h4 className="text-[#f5c542] font-bold text-xs mb-1">{title}</h4>
        <p className="text-[#e7e3d6]/80 text-xs leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

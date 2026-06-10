interface Props { onComplete: () => void; }

function BloodDrop({ w, h }: { w: number; h: number }) {
  return (
    <svg width={60} height={60} viewBox="0 0 60 60">
      <ellipse cx={30} cy={30} rx={w} ry={h} fill="#991b1b" opacity="0.9" />
      <ellipse cx={27} cy={27} rx={w - 4} ry={h - 3} fill="#b91c1c" opacity="0.6" />
    </svg>
  );
}

export default function BloodSciencePrinciple({ onComplete }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🩸</span>
        <h3 className="text-lg font-bold text-[#f5c542]">혈흔 분석의 과학적 원리</h3>
      </div>

      <div className="space-y-3">
        {/* 1 — BPA 원리 & 각도 공식 */}
        <div className="p-3 rounded-lg bg-[#0a0e1a] border border-[#2a3040]">
          <div className="flex gap-3 mb-3">
            <span className="text-xl flex-shrink-0">📐</span>
            <div>
              <h4 className="text-[#f5c542] font-bold text-xs mb-1">1. 충격 각도 계산법</h4>
              <p className="text-[#e7e3d6]/80 text-xs leading-relaxed mb-2">
                혈액이 표면에 닿을 때 생기는 타원의 <b>너비(W)</b>와 <b>길이(L)</b>의 비율로 충격 각도를 계산합니다.
              </p>
              <div className="text-center bg-[#0d1220] rounded p-2 mb-2">
                <p className="font-mono font-bold text-[#f5c542] text-sm">sin(θ) = W ÷ L</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { angle: 30, w: 26, h: 14 },
              { angle: 45, w: 26, h: 18 },
              { angle: 60, w: 26, h: 22 },
              { angle: 90, w: 26, h: 26 },
            ].map(({ angle, w, h }) => (
              <div key={angle} className="text-center">
                <div className="flex justify-center mb-1"><BloodDrop w={w} h={h} /></div>
                <p className="text-[#f5c542] font-bold text-xs">{angle}°</p>
                <p className="text-[#e7e3d6]/40 text-[9px]">W/L={parseFloat((Math.sin((angle * Math.PI) / 180)).toFixed(2))}</p>
              </div>
            ))}
          </div>
        </div>

        <Card icon="🩸" title="2. 혈액은 왜 타원형이 될까?"
          content="혈액은 표면 장력으로 구형을 유지하며 날아옵니다. 비스듬하게 닿으면 충격 방향으로 퍼지면서 타원이 됩니다. 각도가 클수록(수직에 가까울수록) 원형에 가까워집니다." />

        <Card icon="🎯" title="3. 발원지 추정 (Area of Origin)"
          content="긴 모양 혈흔의 장축을 역방향으로 연장하면 혈액이 발생한 방향을 알 수 있습니다. 여러 혈흔의 연장선이 만나는 2D 교점이 '발원 지점(Area of Origin)'입니다. 여기에 높이 계산을 더하면 3D 발원지도 추정할 수 있습니다." />

        <Card icon="💦" title="4. 위성혈흔(Satellite Spatter)이란?"
          content="낙하 혈흔이 표면에 닿을 때 충격으로 작은 방울이 튀어 생기는 주변의 작은 혈흔입니다. 낙하 높이가 높을수록 더 많고 더 멀리 생깁니다." />

        <Card icon="👟" title="5. 이동 혈흔으로 알 수 있는 것"
          content="발자국·신발·옷에서 이동 혈흔이 발견되면 이동 경로와 방향을 알 수 있습니다. 길게 끌린 방향이 이동 방향입니다. 패턴의 시작과 끝 농도를 비교하면 어느 방향으로 이동했는지 구분됩니다." />

        <Card icon="⚖️" title="6. BPA(혈흔 패턴 분석)의 한계"
          content="혈흔 분석은 보조 증거로만 사용됩니다. 표면 재질, 혈액의 응고 정도, 중력 이외의 외력 등 변수가 많아 단독 증거로는 인정받기 어렵습니다. 법의학자·검사·변호인의 상호 검증이 필요합니다." />
      </div>

      <div className="flex justify-end mt-5">
        <button onClick={onComplete} className="btn-primary px-5 py-2 rounded-lg text-xs">
          혈흔 분석 완료! 🎉
        </button>
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

import Avatar, { AvatarPose } from "./Avatar";

interface SceneLayoutProps {
  avatarPose: AvatarPose;
  children: React.ReactNode;
  sceneLabel?: string;
}

/**
 * 3인칭 씬 레이아웃
 * 왼쪽에 플레이어 아바타, 오른쪽에 실험 영역
 * 아바타가 실제로 실험하는 모습을 볼 수 있다.
 */
export default function SceneLayout({ avatarPose, children, sceneLabel }: SceneLayoutProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 씬 배경 프레임 */}
      <div className="relative rounded-2xl overflow-hidden" style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #0d1528 50%, #0a0e1a 100%)",
        border: "2px solid #1e2a40",
        boxShadow: "0 0 60px rgba(0,0,0,0.5), inset 0 0 80px rgba(245,197,66,0.03)",
      }}>
        {/* 상단 장면 표시 바 */}
        {sceneLabel && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0e1a] border-b border-[#1e2a40]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[#e7e3d6]/40 text-[10px] tracking-widest font-mono uppercase">
              {sceneLabel}
            </span>
            <div className="flex-1" />
            <span className="text-[#e7e3d6]/20 text-[10px] font-mono">REC ●</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-0">
          {/* 왼쪽: 플레이어 아바타 (3인칭) */}
          <div className="relative md:w-[240px] flex-shrink-0 flex items-end justify-center p-4 md:p-6 md:min-h-[480px]"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(245,197,66,0.02) 100%)",
            }}
          >
            {/* 아바타 뒤 그라데이션 */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 70%, rgba(245,197,66,0.06) 0%, transparent 60%)",
              }}
            />
            <Avatar pose={avatarPose} size={200} className="relative z-10" />
          </div>

          {/* 오른쪽: 실험 인터랙티브 영역 */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-[#1e2a40] p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 플레이어 아바타 — AI 생성 이미지 기반
 * 아바타 = 플레이어 자신. 3인칭 시점으로 실험하는 모습을 보여준다.
 */
export type AvatarPose = "idle" | "dusting" | "examining" | "lifting" | "comparing";

interface AvatarProps {
  pose: AvatarPose;
  className?: string;
  size?: number;
}

const POSE_MAP: Record<AvatarPose, { src: string; label: string }> = {
  idle: { src: "/avatar-idle.png", label: "대기 중" },
  dusting: { src: "/avatar-dusting.png", label: "가루 뿌리는 중..." },
  examining: { src: "/avatar-examining.png", label: "돋보기로 관찰 중..." },
  lifting: { src: "/avatar-lifting.png", label: "테이프 리프팅 중..." },
  comparing: { src: "/avatar-comparing.png", label: "지문 대조 중..." },
};

export default function Avatar({ pose, className = "", size = 200 }: AvatarProps) {
  const info = POSE_MAP[pose];

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{ width: size }}
    >
      <img
        src={info.src}
        alt={info.label}
        width={size}
        height={size}
        className="drop-shadow-2xl rounded-xl object-contain"
        style={{ imageRendering: "auto" }}
        draggable={false}
      />
      {/* 상태 라벨 */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="bg-[#0a0e1a]/80 border border-[#f5c542]/30 text-[#f5c542] text-[10px] font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
          {info.label}
        </span>
      </div>
    </div>
  );
}

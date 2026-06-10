/**
 * 멘토 NPC 아바타 — 선배 수사관 '이 수사관'
 * 튜토리얼에서 설명을 해주는 NPC 캐릭터
 */
interface MentorAvatarProps {
  size?: number;
  className?: string;
}

export default function MentorAvatar({ size = 160, className = "" }: MentorAvatarProps) {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`} style={{ width: size }}>
      <img
        src="/mentor.png"
        alt="이 수사관"
        width={size}
        height={size}
        className="drop-shadow-2xl rounded-xl object-contain"
        draggable={false}
      />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="bg-[#0a0e1a]/80 border border-[#22c55e]/40 text-[#22c55e] text-[10px] font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
          이 수사관 (선배)
        </span>
      </div>
    </div>
  );
}

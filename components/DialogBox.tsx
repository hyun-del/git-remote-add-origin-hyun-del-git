import { useEffect, useState, useRef } from "react";

interface DialogBoxProps {
  speaker: string;
  lines: string[];
  onComplete: () => void;
  autoAdvance?: boolean;
  typingSpeed?: number;
}

/**
 * 타자기 효과로 대사를 출력하는 대화 상자.
 * 여러 줄을 순서대로 보여주고, 모두 끝나면 onComplete 콜백.
 */
export default function DialogBox({
  speaker,
  lines,
  onComplete,
  autoAdvance = false,
  typingSpeed = 28,
}: DialogBoxProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    skipRef.current = false;
    setDone(false);
    setDisplayed("");
    if (lineIdx >= lines.length) {
      setDone(true);
      return;
    }
    const full = lines[lineIdx];
    let i = 0;
    const timer = setInterval(() => {
      if (skipRef.current) {
        setDisplayed(full);
        clearInterval(timer);
        return;
      }
      i++;
      setDisplayed(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer);
        if (autoAdvance && lineIdx < lines.length - 1) {
          setTimeout(() => {
            setLineIdx((v) => v + 1);
          }, 1200);
        }
      }
    }, typingSpeed);
    return () => clearInterval(timer);
  }, [lineIdx, lines, autoAdvance, typingSpeed]);

  const isTyping = displayed.length < lines[lineIdx]?.length;

  const handleClick = () => {
    if (isTyping) {
      skipRef.current = true;
    } else if (lineIdx < lines.length - 1) {
      setLineIdx((v) => v + 1);
    } else {
      setDone(true);
      onComplete();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto" onClick={handleClick}>
      <div className="dialog-box rounded-xl p-6 cursor-pointer select-none">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#f5c542] animate-pulse" />
          <span className="text-[#f5c542] font-bold tracking-wider text-sm uppercase">
            {speaker}
          </span>
        </div>
        <p className="text-[#e7e3d6] text-base leading-relaxed min-h-[3em] typewriter">
          {displayed}
          {isTyping && <span className="text-[#f5c542]">|</span>}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-[#f5c542]/40 text-xs tracking-widest">
            {lineIdx + 1} / {lines.length}
          </span>
          <span className="text-[#f5c542]/60 text-xs tracking-widest animate-pulse">
            {done ? "계속 ▸" : isTyping ? "[클릭: 건너뛰기]" : "[클릭: 계속]"}
          </span>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

interface ProgressRingProps {
  /** 0-100 percentage to fill */
  value: number;
  /** SVG viewport diameter in px */
  size?: number;
  /** Ring thickness in px */
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (Math.min(value, 100) / 100) * circumference;

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Starts fully empty - the CSS transition animates FROM this state.
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    if (prefersReducedMotion) {
      setOffset(targetOffset);
      return;
    }
    // Runs after the empty ring has actually painted once - THIS is what
    // triggers the CSS transition, since it's a real state change on a
    // later tick, not a value computed once on the initial render.
    const raf = requestAnimationFrame(() => setOffset(targetOffset));
    return () => cancelAnimationFrame(raf);
  }, [targetOffset, prefersReducedMotion]);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3C3835"
          strokeWidth={strokeWidth}
        />
        {/* Foreground fill - animates via CSS transition */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#C9A84C"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
      </svg>
      <span className="absolute font-mono text-3xl text-textPrimary">
        {value}
      </span>
    </div>
  );
}

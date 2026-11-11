import { cn } from "@/lib/utils";
import { scoreBand, type ScoreTone } from "@/lib/scoring";

const TONE_STROKE: Record<ScoreTone, string> = {
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-destructive",
};

export function ScoreRing({
  score,
  size = 168,
  stroke = 12,
  className,
  label = true,
}: {
  score: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const band = scoreBand(score);
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ATS ${score} de 100 — ${band.label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-lilac" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          className={cn(TONE_STROKE[band.tone], "transition-[stroke-dashoffset] duration-1000 ease-out")}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-4xl font-semibold tabular-nums tracking-tight" style={{ fontSize: size * 0.26 }}>
            {score}
          </div>
          {label && <div className="text-xs text-muted-foreground">de 100</div>}
        </div>
      </div>
    </div>
  );
}

export function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-sm text-muted-foreground">—</span>;
  const tone = scoreBand(score).tone;
  return (
    <span
      className={cn(
        "inline-flex min-w-11 justify-center rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums",
        tone === "success" && "bg-success-soft text-success-ink",
        tone === "warning" && "bg-warning-soft text-warning-ink",
        tone === "danger" && "bg-destructive-soft text-destructive-ink",
      )}
    >
      {score}
    </span>
  );
}

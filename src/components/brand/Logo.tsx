import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-8 place-items-center rounded-[10px] bg-gradient-primary text-primary-foreground shadow-glow",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4h7l4 4v12H7z" opacity={0.55} />
        <path d="M9.5 13.5l2 2 4-4.5" />
      </svg>
    </span>
  );
}

export function Logo({ className, to = "/" }: { className?: string; to?: "/" | "/painel" }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2.5 rounded-lg", className)} aria-label="MatchCV AI — início">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        MatchCV <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}

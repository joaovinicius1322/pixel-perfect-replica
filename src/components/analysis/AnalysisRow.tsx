import { Link } from "@tanstack/react-router";
import { Building2, ChevronRight } from "lucide-react";

import { ScorePill } from "@/components/analysis/ScoreRing";
import { StatusBadge } from "@/components/analysis/StatusBadge";
import { formatDate } from "@/lib/format";
import type { AnalysisListItem } from "@/lib/queries";

export function AnalysisRow({ a }: { a: AnalysisListItem }) {
  return (
    <Link
      to="/analises/$id"
      params={{ id: a.id }}
      className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-accent"
    >
      <ScorePill score={a.score} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{a.job_title}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          {a.company && (
            <>
              <Building2 className="size-3" /> {a.company} ·
            </>
          )}{" "}
          {formatDate(a.created_at)}
        </p>
      </div>
      <div className="hidden sm:block">
        <StatusBadge status={a.status} />
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

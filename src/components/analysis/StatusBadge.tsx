import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AnalysisStatus } from "@/lib/queries";

export function StatusBadge({ status }: { status: AnalysisStatus }) {
  if (status === "completed")
    return (
      <Badge variant="success">
        <CheckCircle2 /> Concluída
      </Badge>
    );
  if (status === "failed")
    return (
      <Badge variant="danger">
        <XCircle /> Falhou
      </Badge>
    );
  return (
    <Badge variant="lilac">
      <Loader2 className="animate-spin" /> Processando
    </Badge>
  );
}

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader, PageSkeleton } from "@/components/app/AppShell";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatBytes, formatDate } from "@/lib/format";
import { resumesQuery, type ResumeListItem } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/curriculos")({
  head: () => ({
    meta: [
      { title: "Meus currículos — MatchCV AI" },
      { name: "description", content: "Gerencie os currículos enviados para análise." },
      { property: "og:title", content: "Meus currículos — MatchCV AI" },
      { property: "og:description", content: "Seus currículos salvos com segurança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(resumesQuery()),
  pendingComponent: PageSkeleton,
  component: Resumes,
});

function Resumes() {
  const { data } = useSuspenseQuery(resumesQuery());
  const queryClient = useQueryClient();

  const download = async (r: ResumeListItem) => {
    const { data: signed, error } = await supabase.storage.from("resumes").createSignedUrl(r.file_path, 60, { download: r.file_name });
    if (error || !signed) {
      toast.error("Não foi possível baixar o arquivo.");
      return;
    }
    window.location.assign(signed.signedUrl);
  };

  const remove = async (r: ResumeListItem) => {
    const { error } = await supabase.from("resumes").delete().eq("id", r.id);
    if (error) {
      toast.error("Não foi possível excluir o currículo.");
      return;
    }
    await supabase.storage.from("resumes").remove([r.file_path]);
    queryClient.setQueryData<ResumeListItem[]>(["resumes"], (prev) => prev?.filter((x) => x.id !== r.id));
    queryClient.invalidateQueries({ queryKey: ["analyses"] });
    toast.success("Currículo excluído.");
  };

  const newBtn = (
    <Button asChild variant="hero">
      <Link to="/nova-analise">
        <Plus /> Enviar currículo
      </Link>
    </Button>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title="Meus currículos" description="Arquivos guardados de forma privada na sua conta." actions={newBtn} />
      {data.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum currículo salvo" text="Envie um currículo em uma nova análise e ele aparecerá aqui." action={newBtn} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((r) => (
            <li key={r.id} className="surface-card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-lilac text-primary">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={r.file_name}>{r.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.file_type.toUpperCase()} · {formatBytes(r.file_size)} · {formatDate(r.created_at)}
                  </p>
                </div>
                <ConfirmDelete
                  label={`Excluir ${r.file_name}`}
                  title="Excluir este currículo?"
                  description="O arquivo será removido. Análises feitas com ele continuam no histórico, mas não poderão ser refeitas nem otimizadas."
                  onConfirm={() => remove(r)}
                />
              </div>
              <div className="mt-4">
                <Badge variant="lilac">{r.analyses_count} {r.analyses_count === 1 ? "análise" : "análises"}</Badge>
              </div>
              <div className="mt-5 flex gap-2">
                <Button asChild variant="soft" size="sm" className="flex-1">
                  <Link to="/nova-analise" search={{ resume: r.id }}>
                    <Sparkles /> Nova análise
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => download(r)}>
                  <Download /> Baixar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (MatchCV AI)

- AI calls live only in `src/lib/*.server.ts` (gateway helper + prompts) and are exposed through `src/lib/analysis.functions.ts` server functions with `requireSupabaseAuth`; why: keeps the API key and prompts server-side and every call user-scoped by RLS.
- The ATS score is computed in `src/lib/scoring.ts` (keyword coverage matched in code + weighted AI sub-scores); the AI never returns the final score; why: scores must be deterministic and explainable, never random.
- Resume text is extracted in the browser (`src/lib/resume-extract.ts`, pdfjs/mammoth loaded on demand) and stored in `resumes.extracted_text`; original files go to the private `resumes` bucket under `<user_id>/`; why: PDF/DOCX parsers are not Worker-safe.
- Final resume = original text unless a suggestion is accepted or edited; keywords are added only when the user confirms them (`src/lib/optimization.ts`); why: integrity rule — never invent resume facts.
- PDF export uses jsPDF single-column text in `src/lib/resume-pdf.ts`; why: ATS-readable output (no tables, columns, icons or graphics).
- Signed-in pages live under `src/routes/_authenticated/` (client-only gate) and read data with the browser client via `src/lib/queries.ts` query options.

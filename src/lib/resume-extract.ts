// Browser-only text extraction for PDF and DOCX resumes. Libraries are loaded on demand.

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
export const MIN_RESUME_CHARS = 200;

export type ResumeKind = "pdf" | "docx";

export class ResumeFileError extends Error {}

async function sniff(file: File): Promise<ResumeKind | null> {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return "pdf"; // %PDF
  if (head[0] === 0x50 && head[1] === 0x4b) return "docx"; // PK (zip)
  return null;
}

export async function validateResumeFile(file: File): Promise<ResumeKind> {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
    throw new ResumeFileError("Envie um arquivo PDF ou DOCX.");
  }
  if (file.size === 0) throw new ResumeFileError("O arquivo está vazio.");
  if (file.size > MAX_RESUME_BYTES) throw new ResumeFileError("O arquivo passa de 10 MB. Envie uma versão menor.");
  const kind = await sniff(file);
  if (!kind || (name.endsWith(".pdf") && kind !== "pdf") || (name.endsWith(".docx") && kind !== "docx")) {
    throw new ResumeFileError("O conteúdo do arquivo não corresponde a um PDF ou DOCX válido.");
  }
  return kind;
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items) {
      if ("str" in item) {
        text += item.str;
        text += item.hasEOL ? "\n" : " ";
      }
    }
    pages.push(text);
  }
  await doc.destroy();
  return pages.join("\n\n");
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

export function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractResumeText(file: File, kind: ResumeKind): Promise<string> {
  let raw: string;
  try {
    raw = kind === "pdf" ? await extractPdf(file) : await extractDocx(file);
  } catch (error) {
    console.error(error);
    throw new ResumeFileError("Não conseguimos ler este arquivo. Verifique se ele não está protegido por senha ou corrompido.");
  }
  const text = cleanExtractedText(raw);
  if (text.length < MIN_RESUME_CHARS) {
    throw new ResumeFileError(
      "Encontramos pouco texto no arquivo. Se o PDF for uma imagem escaneada, exporte uma versão com texto selecionável.",
    );
  }
  return text;
}

// ATS-friendly PDF: single column, real selectable text, standard font, no tables/icons/graphics.
import type { FinalResume } from "./optimization";

export async function downloadResumePdf(resume: FinalResume, fileName: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const width = pageW - margin * 2;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const write = (text: string, opts: { size: number; bold?: boolean; indent?: number; gap?: number; color?: number }) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size);
    doc.setTextColor(opts.color ?? 24);
    const lineH = opts.size * 0.42;
    const lines = doc.splitTextToSize(text, width - (opts.indent ?? 0)) as string[];
    for (const line of lines) {
      ensure(lineH);
      doc.text(line, margin + (opts.indent ?? 0), y);
      y += lineH;
    }
    y += opts.gap ?? 0;
  };

  if (resume.name) write(resume.name, { size: 18, bold: true, gap: 1.5 });
  if (resume.contact) write(resume.contact, { size: 9.5, color: 70, gap: 4 });

  for (const section of resume.sections) {
    ensure(14);
    y += 2;
    write(section.title.toUpperCase(), { size: 11, bold: true, gap: 0.5 });
    doc.setDrawColor(180);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
    for (const item of section.items) {
      if (item.kind === "heading") {
        ensure(8);
        y += 1;
        write(item.text, { size: 10.5, bold: true, gap: 1 });
      } else if (item.kind === "subheading") {
        write(item.text, { size: 9.5, color: 70, gap: 1 });
      } else if (item.kind === "bullet") {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        ensure(4.5);
        doc.text("•", margin + 1, y);
        write(item.text, { size: 10, indent: 5, gap: 1 });
      } else {
        write(item.text, { size: 10, gap: 1.5 });
      }
    }
    y += 2;
  }

  doc.setProperties({ title: resume.name ? `Currículo — ${resume.name}` : "Currículo" });
  doc.save(fileName);
}

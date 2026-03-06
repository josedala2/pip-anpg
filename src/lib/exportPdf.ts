import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";

/**
 * Professional PDF export with ANPG branding, headers, footers & page numbers.
 * Captures the report DOM as a high-res image then paginates it into an A4 PDF.
 */
export const exportReportPdf = async (
  reportElementId = "report-content",
  filename = "relatorio_ANPG.pdf",
  orientation: "portrait" | "landscape" = "portrait",
  coverInfo?: {
    title: string;
    blockNames: string[];
    reportTypes: string[];
  }
) => {
  const node = document.getElementById(reportElementId);
  if (!node) throw new Error("Report element not found");

  // Temporarily force light-mode print styles for consistent PDF output
  const root = document.documentElement;
  const wasDark = root.classList.contains("dark");
  if (wasDark) root.classList.remove("dark");

  // Add print-mode class for clean capture
  node.style.background = "white";
  node.style.color = "black";
  node.style.borderRadius = "0";
  node.style.border = "none";
  node.style.boxShadow = "none";

  try {
    // Wait for styles to apply
    await new Promise(r => setTimeout(r, 200));

    // Capture at 2x for crisp output
    const dataUrl = await toPng(node, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      quality: 1,
      style: {
        padding: "24px",
      },
    });

    // Load captured image to get dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    // A4 dimensions in mm (swap for landscape)
    const isLandscape = orientation === "landscape";
    const pageW = isLandscape ? 297 : 210;
    const pageH = isLandscape ? 210 : 297;
    const marginX = 12;
    const marginTop = 28; // space for header
    const marginBottom = 18; // space for footer
    const contentW = pageW - marginX * 2;
    const contentH = pageH - marginTop - marginBottom;

    // Scale image to fit page width
    const imgAspect = img.height / img.width;
    const scaledImgH = contentW * imgAspect;
    const totalPages = Math.ceil(scaledImgH / contentH);

    const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });

    // Load ANPG logo as base64 for header
    let logoBase64: string | null = null;
    try {
      const logoResponse = await fetch(anpgLogoColor);
      const logoBlob = await logoResponse.blob();
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });
    } catch {
      // Logo loading failed, continue without it
    }

    // ─── COVER PAGE ─────────────────────────────────────────
    if (coverInfo) {
      const primary = { r: 0, g: 153, b: 204 };    // ANPG blue
      const darkBlue = { r: 10, g: 30, b: 60 };    // deep navy
      const gold = { r: 212, g: 175, b: 55 };       // accent gold

      // ── Full-page dark gradient background ──
      // Top band - deep navy
      pdf.setFillColor(darkBlue.r, darkBlue.g, darkBlue.b);
      pdf.rect(0, 0, pageW, pageH * 0.65, "F");
      // Bottom band - slightly lighter
      pdf.setFillColor(15, 40, 75);
      pdf.rect(0, pageH * 0.65, pageW, pageH * 0.35, "F");

      // ── Decorative geometric pattern (top-right) ──
      pdf.setDrawColor(primary.r, primary.g, primary.b);
      pdf.setLineWidth(0.3);
      for (let i = 0; i < 8; i++) {
        const opacity = 0.08 + i * 0.02;
        pdf.setDrawColor(primary.r, primary.g, primary.b);
        pdf.setLineWidth(0.2);
        const x = pageW - 20 - i * 12;
        const y = 10 + i * 8;
        pdf.line(x, 0, pageW, y);
      }
      // Bottom-left decorative lines
      for (let i = 0; i < 6; i++) {
        pdf.setLineWidth(0.15);
        pdf.setDrawColor(primary.r, primary.g, primary.b);
        const x = 15 + i * 10;
        pdf.line(0, pageH - 40 + i * 6, x, pageH);
      }

      // ── Gold accent bar at top ──
      pdf.setFillColor(gold.r, gold.g, gold.b);
      pdf.rect(0, 0, pageW, 3, "F");

      // ── Thin blue line below gold ──
      pdf.setDrawColor(primary.r, primary.g, primary.b);
      pdf.setLineWidth(0.5);
      pdf.line(marginX, 8, pageW - marginX, 8);

      // ── Centered logo ──
      if (logoBase64) {
        const logoW = 65;
        const logoH = 26;
        const logoX = (pageW - logoW) / 2;
        try {
          pdf.addImage(logoBase64, "SVG", logoX, pageH * 0.12, logoW, logoH);
        } catch {
          pdf.setFontSize(20);
          pdf.setTextColor(255, 255, 255);
          pdf.text("ANPG", pageW / 2, pageH * 0.16, { align: "center" });
        }
      }

      // ── Gold decorative divider ──
      const divY1 = pageH * 0.24;
      pdf.setDrawColor(gold.r, gold.g, gold.b);
      pdf.setLineWidth(0.8);
      pdf.line(pageW * 0.25, divY1, pageW * 0.75, divY1);
      // Small diamond accent
      const dSize = 2;
      pdf.setFillColor(gold.r, gold.g, gold.b);
      const cx = pageW / 2;
      // Draw diamond shape using triangle pairs
      pdf.setLineWidth(0);
      pdf.triangle(cx, divY1 - dSize, cx + dSize, divY1, cx, divY1 + dSize, "F");
      pdf.triangle(cx, divY1 - dSize, cx - dSize, divY1, cx, divY1 + dSize, "F");

      // ── Main title ──
      pdf.setFontSize(26);
      pdf.setTextColor(255, 255, 255);
      pdf.text(coverInfo.title, pageW / 2, pageH * 0.33, { align: "center" });

      // ── Institution subtitle ──
      pdf.setFontSize(11);
      pdf.setTextColor(primary.r, primary.g, primary.b);
      pdf.text("Agência Nacional de Petróleo, Gás e Biocombustíveis", pageW / 2, pageH * 0.33 + 12, { align: "center" });
      pdf.setFontSize(10);
      pdf.setTextColor(180, 200, 220);
      pdf.text("República de Angola", pageW / 2, pageH * 0.33 + 19, { align: "center" });

      // ── Second gold divider ──
      const divY2 = pageH * 0.33 + 28;
      pdf.setDrawColor(gold.r, gold.g, gold.b);
      pdf.setLineWidth(0.4);
      pdf.line(pageW * 0.35, divY2, pageW * 0.65, divY2);

      // ── Report sections box ──
      let yPos = pageH * 0.52;
      pdf.setFontSize(9);
      pdf.setTextColor(gold.r, gold.g, gold.b);
      pdf.text("SECÇÕES DO RELATÓRIO", pageW / 2, yPos, { align: "center" });
      yPos += 7;
      pdf.setFontSize(9);
      pdf.setTextColor(210, 220, 230);
      coverInfo.reportTypes.forEach((rt) => {
        pdf.text(`▸  ${rt}`, pageW / 2, yPos, { align: "center" });
        yPos += 5.5;
      });

      // ── Blocks section ──
      yPos += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(gold.r, gold.g, gold.b);
      pdf.text("BLOCOS INCLUÍDOS", pageW / 2, yPos, { align: "center" });
      yPos += 7;
      pdf.setFontSize(9);
      pdf.setTextColor(210, 220, 230);
      coverInfo.blockNames.forEach((bn) => {
        pdf.text(`▸  ${bn}`, pageW / 2, yPos, { align: "center" });
        yPos += 5.5;
      });

      // ── Date ──
      const now = new Date();
      const dateStr = now.toLocaleDateString("pt-AO", { year: "numeric", month: "long", day: "numeric" });
      pdf.setFontSize(10);
      pdf.setTextColor(150, 170, 190);
      pdf.text(dateStr, pageW / 2, pageH - 35, { align: "center" });

      // ── Bottom gold accent bar ──
      pdf.setFillColor(gold.r, gold.g, gold.b);
      pdf.rect(0, pageH - 25, pageW, 1, "F");

      // ── Confidencial footer ──
      pdf.setFontSize(7);
      pdf.setTextColor(120, 140, 160);
      pdf.text("CONFIDENCIAL — Uso interno ANPG", pageW / 2, pageH - 18, { align: "center" });

      // ── Bottom gold bar ──
      pdf.setFillColor(gold.r, gold.g, gold.b);
      pdf.rect(0, pageH - 3, pageW, 3, "F");

      // Start content on next page
      pdf.addPage();
    }

    // ─── HEADER / FOOTER HELPERS ─────────────────────────────
    const addHeader = (page: number) => {
      // Top line
      pdf.setDrawColor(0, 153, 204); // primary blue
      pdf.setLineWidth(0.8);
      pdf.line(marginX, 8, pageW - marginX, 8);

      // Logo
      if (logoBase64) {
        try {
          pdf.addImage(logoBase64, "SVG", marginX, 10, 28, 10);
        } catch {
          pdf.setFontSize(10);
          pdf.setTextColor(0, 153, 204);
          pdf.text("ANPG", marginX, 16);
        }
      }

      // Title
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Agência Nacional de Petróleo, Gás e Biocombustíveis", pageW - marginX, 13, { align: "right" });
      pdf.text("República de Angola", pageW - marginX, 17, { align: "right" });

      // Thin separator
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(marginX, 22, pageW - marginX, 22);
    };

    const addFooter = (page: number, total: number) => {
      const y = pageH - 10;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(marginX, y - 3, pageW - marginX, y - 3);

      pdf.setFontSize(7);
      pdf.setTextColor(140, 140, 140);
      pdf.text(
        `Documento gerado automaticamente em ${new Date().toLocaleDateString("pt-AO")} às ${new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}`,
        marginX, y
      );
      pdf.text(`Página ${page} de ${total}`, pageW - marginX, y, { align: "right" });

      // CONFIDENCIAL watermark
      pdf.setFontSize(6);
      pdf.setTextColor(180, 180, 180);
      pdf.text("CONFIDENCIAL — Uso interno ANPG", pageW / 2, y + 4, { align: "center" });
    };

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      addHeader(page + 1);
      addFooter(page + 1, totalPages);

      // Clip and draw the relevant slice of the report image
      const srcY = (page * contentH / scaledImgH) * img.height;
      const srcH = (contentH / scaledImgH) * img.height;

      // Create a canvas for this page slice
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = Math.min(srcH, img.height - srcY);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, srcY, img.width, canvas.height, 0, 0, canvas.width, canvas.height);

      const sliceDataUrl = canvas.toDataURL("image/png");
      const sliceAspect = canvas.height / canvas.width;
      const sliceH = Math.min(contentW * sliceAspect, contentH);

      pdf.addImage(sliceDataUrl, "PNG", marginX, marginTop, contentW, sliceH);
    }

    pdf.save(filename);
    return true;
  } finally {
    // Restore original styles
    node.style.background = "";
    node.style.color = "";
    node.style.borderRadius = "";
    node.style.border = "";
    node.style.boxShadow = "";
    if (wasDark) root.classList.add("dark");
  }
};

import { CompletedWorkoutRecord, GPSActivity } from "../types";

export type StoryTheme = "neon" | "cyber" | "fire" | "stealth";

export interface StoryCardOptions {
  theme?: StoryTheme;
  athleteName?: string;
}

export interface ShareResult {
  success: boolean;
  method: "native_files" | "native_text" | "download_and_redirect" | "error";
  message: string;
}

export class StoryShareService {
  /**
   * Helper to draw a rounded rectangle on a 2D canvas
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /**
   * Generates a 1080x1920 9:16 contextual image for a Completed Workout Record
   */
  public async generateWorkoutImage(
    record: CompletedWorkoutRecord,
    options: StoryCardOptions = {}
  ): Promise<Blob> {
    const theme = options.theme || "neon";
    const athleteName = options.athleteName || "Gabriel Silva";

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    // Colors based on theme
    const colors = this.getThemePalette(theme);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, colors.bg1);
    bgGrad.addColorStop(0.5, colors.bg2);
    bgGrad.addColorStop(1, colors.bg1);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle atmospheric glow
    const radial = ctx.createRadialGradient(540, 420, 20, 540, 420, 550);
    radial.addColorStop(0, `${colors.accent}20`);
    radial.addColorStop(1, "transparent");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1920);

    // Grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1.5;
    for (let x = 60; x < 1080; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 100);
      ctx.lineTo(x, 1820);
      ctx.stroke();
    }
    for (let y = 100; y < 1820; y += 60) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(1020, y);
      ctx.stroke();
    }

    // Border frame safe area
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, 60, 100, 960, 1720, 48);
    ctx.stroke();

    // 2. Top Branding Header
    const logoSize = 72;
    const logoX = 120;
    const logoY = 160;

    ctx.fillStyle = colors.badgeBg;
    this.roundRect(ctx, logoX, logoY, logoSize, logoSize, 20);
    ctx.fill();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, logoX, logoY, logoSize, logoSize, 20);
    ctx.stroke();

    // Lightning glyph
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(logoX + 42, logoY + 16);
    ctx.lineTo(logoX + 24, logoY + 40);
    ctx.lineTo(logoX + 38, logoY + 40);
    ctx.lineTo(logoX + 30, logoY + 58);
    ctx.lineTo(logoX + 50, logoY + 34);
    ctx.lineTo(logoX + 36, logoY + 34);
    ctx.closePath();
    ctx.fill();

    // Brand title
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 42px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("FORZON", logoX + 92, logoY + 46);

    ctx.fillStyle = colors.accent;
    ctx.font = "700 18px 'Courier New', monospace";
    ctx.fillText("WORKOUT LOG · SOBRECARGA", logoX + 94, logoY + 70);

    // Date pill
    const dateStr = new Date(record.completedAt || record.startedAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
    ctx.font = "600 20px 'Courier New', monospace";
    const dateW = ctx.measureText(dateStr).width;
    const pillW = dateW + 36;
    const pillX = 1080 - 120 - pillW;
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    this.roundRect(ctx, pillX, logoY + 14, pillW, 44, 16);
    ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(dateStr, pillX + 18, logoY + 43);

    // 3. Category & Title
    const catY = 280;
    ctx.font = "800 20px -apple-system, BlinkMacSystemFont, sans-serif";
    const catText = "SESSÃO FINALIZADA · TREINO PAGO";
    const catW = ctx.measureText(catText).width;
    ctx.fillStyle = colors.badgeBg;
    this.roundRect(ctx, 120, catY, catW + 36, 40, 12);
    ctx.fill();
    ctx.strokeStyle = `${colors.accent}66`;
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 120, catY, catW + 36, 40, 12);
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.fillText(catText, 138, catY + 27);

    // Session Title
    const titleY = catY + 80;
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 58px -apple-system, BlinkMacSystemFont, sans-serif";
    const titleText = record.title.length > 24 ? record.title.slice(0, 24) + "..." : record.title;
    ctx.fillText(titleText.toUpperCase(), 120, titleY);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 26px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Hipertrofia & Sobrecarga Progressiva", 120, titleY + 42);

    // Athlete Banner
    const athleteY = titleY + 75;
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    this.roundRect(ctx, 120, athleteY, 840, 80, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    this.roundRect(ctx, 120, athleteY, 840, 80, 24);
    ctx.stroke();

    // Avatar
    ctx.fillStyle = colors.badgeBg;
    ctx.beginPath();
    ctx.arc(168, athleteY + 40, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = colors.accent;
    ctx.font = "800 22px sans-serif";
    ctx.fillText(athleteName.charAt(0).toUpperCase(), 160, athleteY + 47);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 26px sans-serif";
    ctx.fillText(athleteName, 210, athleteY + 40);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 20px 'Courier New', monospace";
    ctx.fillText("@forzon.athlete · Atleta Verificado", 210, athleteY + 65);

    // 4. Metrics Grid (4 Cards)
    const gridY = athleteY + 120;
    const cardGap = 24;
    const cardW = (840 - cardGap) / 2;
    const cardH = 190;

    const metricsData = [
      {
        label: "VOLUME TOTAL",
        val: `${record.totalVolumeKg.toLocaleString()} kg`,
        badge: "Cargas Levantadas",
      },
      {
        label: "TEMPO DA SESSÃO",
        val: `${Math.round(record.durationSeconds / 60)} min`,
        badge: "Duração Efetiva",
      },
      {
        label: "SÉRIES & REPETIÇÕES",
        val: `${record.totalSets} / ${record.totalReps}`,
        badge: "Volume de Séries",
      },
      {
        label: "ESFORÇO RPE",
        val: `RPE ${record.perceivedEffortRpe || 8.5}/10`,
        badge: "Intensidade Ótima",
      },
    ];

    metricsData.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 120 + col * (cardW + cardGap);
      const cy = gridY + row * (cardH + cardGap);

      ctx.fillStyle = "rgba(18, 18, 24, 0.85)";
      this.roundRect(ctx, cx, cy, cardW, cardH, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, cx, cy, cardW, cardH, 28);
      ctx.stroke();

      // Top line
      ctx.strokeStyle = `${colors.accent}99`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 32, cy);
      ctx.lineTo(cx + cardW - 32, cy);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 20px sans-serif";
      ctx.fillText(m.label, cx + 30, cy + 48);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 46px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(m.val, cx + 30, cy + 115);

      ctx.fillStyle = colors.badgeBg;
      const bW = ctx.measureText(m.badge).width + 24;
      this.roundRect(ctx, cx + 30, cy + 135, bW, 32, 8);
      ctx.fill();
      ctx.fillStyle = colors.accent;
      ctx.font = "700 18px 'Courier New', monospace";
      ctx.fillText(m.badge, cx + 42, cy + 157);
    });

    // 5. PRs / Highlights Banner
    const prY = gridY + 2 * (cardH + cardGap) + 15;
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    this.roundRect(ctx, 120, prY, 840, 160, 24);
    ctx.fill();
    ctx.strokeStyle = `${colors.accent}44`;
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 120, prY, 840, 160, 24);
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.font = "800 22px sans-serif";
    ctx.fillText("🏆 DESTAQUES & RECORDES DO TREINO", 150, prY + 45);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "500 24px sans-serif";
    const prList =
      record.prsAchieved && record.prsAchieved.length > 0
        ? record.prsAchieved
        : ["Todas as séries cumpridas com cadência controlada", "Meta de volume e RIR prescrito cumprida"];

    prList.slice(0, 2).forEach((pr, idx) => {
      ctx.fillText(`• ${pr}`, 150, prY + 90 + idx * 40);
    });

    // 6. Notes / Quote
    const quoteY = prY + 190;
    ctx.fillStyle = colors.badgeBg;
    this.roundRect(ctx, 120, quoteY, 840, 120, 20);
    ctx.fill();
    ctx.strokeStyle = `${colors.accent}44`;
    ctx.lineWidth = 1;
    this.roundRect(ctx, 120, quoteY, 840, 120, 20);
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.font = "700 20px sans-serif";
    ctx.fillText("FEEDBACK FORZON:", 150, quoteY + 40);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "italic 22px sans-serif";
    const noteText = record.notes || "Sobrecarga progressiva constante! Sem atalhos, cada repetição construiu a evolução de hoje.";
    ctx.fillText(`"${noteText.slice(0, 65)}${noteText.length > 65 ? "..." : ""}"`, 150, quoteY + 80);

    // 7. Footer
    const footerY = 1920 - 240;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(120, footerY);
    ctx.lineTo(960, footerY);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 24px sans-serif";
    ctx.fillText("FORZON PERFORMANCE", 120, footerY + 50);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 18px 'Courier New', monospace";
    ctx.fillText("forzon.app · Inteligência em Cargas", 120, footerY + 80);

    ctx.fillStyle = colors.accent;
    ctx.font = "700 20px 'Courier New', monospace";
    ctx.fillText("#SOBRECARGAPROGRESSIVA", 640, footerY + 50);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 18px 'Courier New', monospace";
    ctx.fillText("#TREINOPAGO", 780, footerY + 80);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas blob conversion failed"));
      }, "image/png");
    });
  }

  /**
   * Generates a 1080x1920 9:16 contextual image for a Completed GPS Activity
   */
  public async generateGPSImage(
    activity: GPSActivity,
    options: StoryCardOptions = {}
  ): Promise<Blob> {
    const theme = options.theme || "cyber";
    const athleteName = options.athleteName || "Gabriel Silva";

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    const colors = this.getThemePalette(theme);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, colors.bg1);
    bgGrad.addColorStop(0.5, colors.bg2);
    bgGrad.addColorStop(1, colors.bg1);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Glow
    const radial = ctx.createRadialGradient(540, 420, 20, 540, 420, 550);
    radial.addColorStop(0, `${colors.accent}25`);
    radial.addColorStop(1, "transparent");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1920);

    // Frame
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, 60, 100, 960, 1720, 48);
    ctx.stroke();

    // Top Header
    const logoX = 120;
    const logoY = 160;
    ctx.fillStyle = colors.badgeBg;
    this.roundRect(ctx, logoX, logoY, 72, 72, 20);
    ctx.fill();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, logoX, logoY, 72, 72, 20);
    ctx.stroke();

    // Compass arrow
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(logoX + 36, logoY + 16);
    ctx.lineTo(logoX + 54, logoY + 54);
    ctx.lineTo(logoX + 36, logoY + 44);
    ctx.lineTo(logoX + 18, logoY + 54);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 42px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("FORZON", logoX + 92, logoY + 46);

    ctx.fillStyle = colors.accent;
    ctx.font = "700 18px 'Courier New', monospace";
    ctx.fillText("OUTDOOR GPS TELEMETRY", logoX + 94, logoY + 70);

    // Date
    const dateStr = new Date(activity.startedAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
    ctx.font = "600 20px 'Courier New', monospace";
    const dateW = ctx.measureText(dateStr).width;
    const pillW = dateW + 36;
    const pillX = 1080 - 120 - pillW;
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    this.roundRect(ctx, pillX, logoY + 14, pillW, 44, 16);
    ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(dateStr, pillX + 18, logoY + 43);

    // Title
    const catY = 280;
    ctx.font = "800 20px -apple-system, BlinkMacSystemFont, sans-serif";
    const catText = "CORRIDA OUTDOOR CONCLUÍDA";
    const catW = ctx.measureText(catText).width;
    ctx.fillStyle = colors.badgeBg;
    this.roundRect(ctx, 120, catY, catW + 36, 40, 12);
    ctx.fill();
    ctx.strokeStyle = `${colors.accent}66`;
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 120, catY, catW + 36, 40, 12);
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.fillText(catText, 138, catY + 27);

    const titleY = catY + 80;
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 58px -apple-system, BlinkMacSystemFont, sans-serif";
    const titleText = activity.title.length > 24 ? activity.title.slice(0, 24) + "..." : activity.title;
    ctx.fillText(titleText.toUpperCase(), 120, titleY);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 26px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Monitoramento de Corrida & Ritmo em Tempo Real", 120, titleY + 42);

    // Athlete Banner
    const athleteY = titleY + 75;
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    this.roundRect(ctx, 120, athleteY, 840, 80, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    this.roundRect(ctx, 120, athleteY, 840, 80, 24);
    ctx.stroke();

    ctx.fillStyle = colors.badgeBg;
    ctx.beginPath();
    ctx.arc(168, athleteY + 40, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = colors.accent;
    ctx.font = "800 22px sans-serif";
    ctx.fillText(athleteName.charAt(0).toUpperCase(), 160, athleteY + 47);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 26px sans-serif";
    ctx.fillText(athleteName, 210, athleteY + 40);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 20px 'Courier New', monospace";
    ctx.fillText("@forzon.athlete · GPS Verificado", 210, athleteY + 65);

    // Metrics Grid
    const gridY = athleteY + 120;
    const cardGap = 24;
    const cardW = (840 - cardGap) / 2;
    const cardH = 190;

    const durationMin = Math.round(activity.durationSeconds / 60);

    const metricsData = [
      {
        label: "DISTÂNCIA TOTAL",
        val: `${activity.distanceKm} km`,
        badge: "Outdoor GPS",
      },
      {
        label: "RITMO MÉDIO (PACE)",
        val: `${activity.averagePaceMinPerKm} /km`,
        badge: "Consistência de Passada",
      },
      {
        label: "DURAÇÃO",
        val: `${durationMin} min`,
        badge: "Tempo em Movimento",
      },
      {
        label: "CALORIAS ESTIMADAS",
        val: `~${activity.caloriesBurnedEstimated} kcal`,
        badge: "Gasto Metabólico",
      },
    ];

    metricsData.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 120 + col * (cardW + cardGap);
      const cy = gridY + row * (cardH + cardGap);

      ctx.fillStyle = "rgba(18, 18, 24, 0.85)";
      this.roundRect(ctx, cx, cy, cardW, cardH, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, cx, cy, cardW, cardH, 28);
      ctx.stroke();

      ctx.strokeStyle = `${colors.accent}99`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 32, cy);
      ctx.lineTo(cx + cardW - 32, cy);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 20px sans-serif";
      ctx.fillText(m.label, cx + 30, cy + 48);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 46px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(m.val, cx + 30, cy + 115);

      ctx.fillStyle = colors.badgeBg;
      const bW = ctx.measureText(m.badge).width + 24;
      this.roundRect(ctx, cx + 30, cy + 135, bW, 32, 8);
      ctx.fill();
      ctx.fillStyle = colors.accent;
      ctx.font = "700 18px 'Courier New', monospace";
      ctx.fillText(m.badge, cx + 42, cy + 157);
    });

    // Splits / Altitude Banner
    const splitsY = gridY + 2 * (cardH + cardGap) + 15;
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    this.roundRect(ctx, 120, splitsY, 840, 160, 24);
    ctx.fill();
    ctx.strokeStyle = `${colors.accent}44`;
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 120, splitsY, 840, 160, 24);
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.font = "800 22px sans-serif";
    ctx.fillText("⚡ TELEMETRIA E ELEVAÇÃO", 150, splitsY + 45);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "500 24px sans-serif";
    ctx.fillText(
      `• Elevação Acumulada: ${activity.elevationGainM ? `+${activity.elevationGainM}m` : "Trajeto Regular / Plano"}`,
      150,
      splitsY + 90
    );
    ctx.fillText(
      `• Splits Registrados: ${activity.splits ? activity.splits.length : 0} parciais com velocidade de cruzeiro estável`,
      150,
      splitsY + 130
    );

    // Quote
    const quoteY = splitsY + 190;
    ctx.fillStyle = colors.badgeBg;
    this.roundRect(ctx, 120, quoteY, 840, 120, 20);
    ctx.fill();
    ctx.strokeStyle = `${colors.accent}44`;
    ctx.lineWidth = 1;
    this.roundRect(ctx, 120, quoteY, 840, 120, 20);
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.font = "700 20px sans-serif";
    ctx.fillText("DIAGNÓSTICO AERÓBICO FORZON:", 150, quoteY + 40);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "italic 22px sans-serif";
    ctx.fillText('"Excelente controle do ritmo cardíaco e consistência de passadas durante todo o percurso."', 150, quoteY + 80);

    // Footer
    const footerY = 1920 - 240;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(120, footerY);
    ctx.lineTo(960, footerY);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 24px sans-serif";
    ctx.fillText("FORZON RUNNERS", 120, footerY + 50);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 18px 'Courier New', monospace";
    ctx.fillText("forzon.app · Outdoor Performance", 120, footerY + 80);

    ctx.fillStyle = colors.accent;
    ctx.font = "700 20px 'Courier New', monospace";
    ctx.fillText("#RUNNERS", 700, footerY + 50);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 18px 'Courier New', monospace";
    ctx.fillText("#TREINOPAGO", 780, footerY + 80);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas blob conversion failed"));
      }, "image/png");
    });
  }

  /**
   * Directly triggers native share via navigator.share with the generated image
   * fallback to download and opening social platform
   */
  public async shareDirectToNative(
    imageBlob: Blob,
    title: string,
    caption: string,
    targetPlatform: "instagram" | "whatsapp"
  ): Promise<ShareResult> {
    const fileName = `forzon-${targetPlatform}-story-${Date.now()}.png`;
    const imageFile = new File([imageBlob], fileName, { type: "image/png" });

    // 1. Try Native File Sharing via Web Share API
    if (
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [imageFile] })
    ) {
      try {
        await navigator.share({
          files: [imageFile],
          title,
          text: caption,
        });
        return {
          success: true,
          method: "native_files",
          message:
            targetPlatform === "instagram"
              ? "Compartilhamento iniciado! Escolha Instagram Stories no seletor."
              : "Compartilhamento iniciado! Escolha WhatsApp > Meu Status no seletor.",
        };
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          return {
            success: false,
            method: "error",
            message: "Compartilhamento cancelado pelo usuário.",
          };
        }
        // If navigator.share fails for any reason, continue to fallback
      }
    }

    // 2. Fallback: Download file + copy caption + deep-link
    const url = URL.createObjectURL(imageBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    // Copy caption to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(caption);
      } catch {
        // clipboard might fail if permission denied
      }
    }

    // Trigger platform
    if (targetPlatform === "instagram") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = "instagram://story";
      } else {
        window.open("https://www.instagram.com/", "_blank");
      }
      return {
        success: true,
        method: "download_and_redirect",
        message:
          "📸 Imagem 9:16 baixada e legenda copiada! Abra o Instagram e selecione a foto no seu Story.",
      };
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        caption
      )}`;
      window.open(whatsappUrl, "_blank");
      return {
        success: true,
        method: "download_and_redirect",
        message:
          "💬 WhatsApp aberto com estatísticas e imagem baixada! Publique no seu Status ou envie no chat.",
      };
    }
  }

  private getThemePalette(theme: StoryTheme) {
    switch (theme) {
      case "cyber":
        return {
          bg1: "#030712",
          bg2: "#0b192c",
          accent: "#06b6d4",
          badgeBg: "rgba(6, 182, 212, 0.15)",
        };
      case "fire":
        return {
          bg1: "#0c0a09",
          bg2: "#240d0d",
          accent: "#f59e0b",
          badgeBg: "rgba(245, 158, 11, 0.15)",
        };
      case "stealth":
        return {
          bg1: "#050505",
          bg2: "#141416",
          accent: "#f8fafc",
          badgeBg: "rgba(255, 255, 255, 0.12)",
        };
      case "neon":
      default:
        return {
          bg1: "#09090b",
          bg2: "#061e12",
          accent: "#10b981",
          badgeBg: "rgba(16, 185, 129, 0.15)",
        };
    }
  }
}

export const storyShareService = new StoryShareService();

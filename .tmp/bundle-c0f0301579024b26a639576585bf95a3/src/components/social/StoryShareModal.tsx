import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Share2,
  Download,
  Copy,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ExternalLink,
  Flame,
  Dumbbell,
  Navigation,
  Trophy,
  TrendingUp,
  Clock,
  Zap,
  Info,
  Check,
} from "lucide-react";

export type StoryTheme = "neon" | "cyber" | "fire" | "stealth";

export interface StoryMetricItem {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon?: "dumbbell" | "navigation" | "flame" | "trophy" | "trending" | "clock" | "zap";
}

export interface StoryData {
  title: string;
  subtitle: string;
  badgeText?: string;
  athleteName: string;
  dateStr: string;
  metrics: StoryMetricItem[];
  highlights?: string[];
  quoteOrDiagnostic?: string;
  type: "progress-30d" | "workout" | "gps" | "custom";
}

interface StoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyData: StoryData;
}

const THEMES: {
  id: StoryTheme;
  name: string;
  tag: string;
  accent: string;
  gradient: string;
  bgColors: [string, string];
  primaryColor: string;
  badgeBg: string;
}[] = [
  {
    id: "neon",
    name: "AthLynx Neon",
    tag: "Sobrecarga & Força",
    accent: "#10b981",
    gradient: "from-emerald-500 to-emerald-600",
    bgColors: ["#09090b", "#061e12"],
    primaryColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.15)",
  },
  {
    id: "cyber",
    name: "Cyber Cyan",
    tag: "Velocidade & Outdoor",
    accent: "#06b6d4",
    gradient: "from-cyan-500 to-blue-600",
    bgColors: ["#030712", "#0b192c"],
    primaryColor: "#06b6d4",
    badgeBg: "rgba(6, 182, 212, 0.15)",
  },
  {
    id: "fire",
    name: "Volcanic Fire",
    tag: "Intensidade Máxima",
    accent: "#f59e0b",
    gradient: "from-amber-500 to-rose-600",
    bgColors: ["#0c0a09", "#240d0d"],
    primaryColor: "#f59e0b",
    badgeBg: "rgba(245, 158, 11, 0.15)",
  },
  {
    id: "stealth",
    name: "Platinum Stealth",
    tag: "Minimalista & Pro",
    accent: "#e2e8f0",
    gradient: "from-neutral-200 to-neutral-400",
    bgColors: ["#050505", "#141416"],
    primaryColor: "#f8fafc",
    badgeBg: "rgba(255, 255, 255, 0.12)",
  },
];

export const StoryShareModal: React.FC<StoryShareModalProps> = ({
  isOpen,
  onClose,
  storyData,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>("neon");
  const [includeQuote, setIncludeQuote] = useState(true);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate formatted caption for sharing
  const captionText = `${storyData.badgeText ? `🏆 [${storyData.badgeText}] ` : ""}FORZON — ${storyData.title}
👤 Atleta: ${storyData.athleteName}
📅 ${storyData.dateStr}
${storyData.metrics
  .map(
    (m) =>
      `• ${m.label}: ${m.value}${m.change ? ` (${m.change})` : ""}`
  )
  .join("\n")}
${
  storyData.highlights && storyData.highlights.length > 0
    ? `\n⭐ Conquistas:\n${storyData.highlights.map((h) => `• ${h}`).join("\n")}`
    : ""
}
${includeQuote && storyData.quoteOrDiagnostic ? `\n💡 "${storyData.quoteOrDiagnostic}"` : ""}

#FORZON #SobrecargaProgressiva #TreinoPago #EvolucaoFitness #Performance`;

  // Draw the 1080x1920 high resolution canvas
  const drawStoryCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement) => {
      const ctx = targetCanvas.getContext("2d");
      if (!ctx) return;

      const W = 1080;
      const H = 1920;
      targetCanvas.width = W;
      targetCanvas.height = H;

      const currentThemeConfig =
        THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

      // 1. Background base
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, currentThemeConfig.bgColors[0]);
      bgGrad.addColorStop(0.5, currentThemeConfig.bgColors[1]);
      bgGrad.addColorStop(1, currentThemeConfig.bgColors[0]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle tech glow circles
      const radialGlow = ctx.createRadialGradient(W / 2, 400, 10, W / 2, 400, 600);
      radialGlow.addColorStop(0, `${currentThemeConfig.primaryColor}22`);
      radialGlow.addColorStop(1, "transparent");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, W, H);

      const radialGlowBottom = ctx.createRadialGradient(W - 200, H - 300, 10, W - 200, H - 300, 500);
      radialGlowBottom.addColorStop(0, `${currentThemeConfig.primaryColor}15`);
      radialGlowBottom.addColorStop(1, "transparent");
      ctx.fillStyle = radialGlowBottom;
      ctx.fillRect(0, 0, W, H);

      // Tech Grid Accent
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1.5;
      const gridSize = 60;
      for (let x = 60; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 100);
        ctx.lineTo(x, H - 150);
        ctx.stroke();
      }
      for (let y = 120; y < H - 150; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(W - 60, y);
        ctx.stroke();
      }

      // Outer border frame (safe area inside story)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;
      roundRect(ctx, 60, 100, W - 120, H - 200, 48);
      ctx.stroke();

      // 2. Top Header Brand Row
      // Logo Icon box
      const logoBoxSize = 72;
      const logoX = 120;
      const logoY = 160;
      ctx.fillStyle = currentThemeConfig.badgeBg;
      roundRect(ctx, logoX, logoY, logoBoxSize, logoBoxSize, 20);
      ctx.fill();
      ctx.strokeStyle = currentThemeConfig.primaryColor;
      ctx.lineWidth = 2.5;
      roundRect(ctx, logoX, logoY, logoBoxSize, logoBoxSize, 20);
      ctx.stroke();

      // Brand lightning glyph in canvas
      ctx.fillStyle = currentThemeConfig.primaryColor;
      ctx.beginPath();
      ctx.moveTo(logoX + 42, logoY + 16);
      ctx.lineTo(logoX + 24, logoY + 40);
      ctx.lineTo(logoX + 38, logoY + 40);
      ctx.lineTo(logoX + 30, logoY + 58);
      ctx.lineTo(logoX + 50, logoY + 34);
      ctx.lineTo(logoX + 36, logoY + 34);
      ctx.closePath();
      ctx.fill();

      // Logo Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("FORZON", logoX + 92, logoY + 46);

      ctx.fillStyle = currentThemeConfig.primaryColor;
      ctx.font = "700 18px 'Courier New', monospace";
      ctx.fillText("PERFORMANCE OS", logoX + 94, logoY + 70);

      // Date / Cycle badge on top right
      ctx.font = "600 22px 'Courier New', monospace";
      const dateText = storyData.dateStr.toUpperCase();
      const dateWidth = ctx.measureText(dateText).width;
      const badgeW = dateWidth + 40;
      const badgeH = 46;
      const badgeX = W - 120 - badgeW;
      const badgeY = logoY + 13;

      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.fillText(dateText, badgeX + 20, badgeY + 30);

      // 3. Athlete Card & Badge
      const athleteY = 280;
      // Pill badge
      if (storyData.badgeText) {
        ctx.font = "800 20px -apple-system, BlinkMacSystemFont, sans-serif";
        const categoryText = storyData.badgeText.toUpperCase();
        const catWidth = ctx.measureText(categoryText).width;
        const catPillW = catWidth + 36;
        const catPillH = 40;

        ctx.fillStyle = currentThemeConfig.badgeBg;
        roundRect(ctx, 120, athleteY, catPillW, catPillH, 12);
        ctx.fill();
        ctx.strokeStyle = `${currentThemeConfig.primaryColor}55`;
        ctx.lineWidth = 1.5;
        roundRect(ctx, 120, athleteY, catPillW, catPillH, 12);
        ctx.stroke();

        ctx.fillStyle = currentThemeConfig.primaryColor;
        ctx.fillText(categoryText, 138, athleteY + 27);
      }

      // Title & Subtitle
      const titleY = athleteY + (storyData.badgeText ? 85 : 40);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 64px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(storyData.title, 120, titleY);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(storyData.subtitle, 120, titleY + 45);

      // Athlete Avatar + Name strip
      const athleteStripY = titleY + 80;
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      roundRect(ctx, 120, athleteStripY, W - 240, 80, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      roundRect(ctx, 120, athleteStripY, W - 240, 80, 24);
      ctx.stroke();

      // Avatar circle
      ctx.fillStyle = currentThemeConfig.badgeBg;
      ctx.beginPath();
      ctx.arc(168, athleteStripY + 40, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = currentThemeConfig.primaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = currentThemeConfig.primaryColor;
      ctx.font = "800 22px sans-serif";
      ctx.fillText(storyData.athleteName.charAt(0).toUpperCase(), 160, athleteStripY + 47);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 26px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(storyData.athleteName, 210, athleteStripY + 40);

      ctx.fillStyle = "#64748b";
      ctx.font = "500 20px 'Courier New', monospace";
      ctx.fillText("@athlynx.athlete", 210, athleteStripY + 65);

      // Verified check icon
      ctx.fillStyle = currentThemeConfig.primaryColor;
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("✓", W - 180, athleteStripY + 47);

      // 4. Metrics Grid (2x2 or 4 Cards)
      const gridStartY = athleteStripY + 120;
      const cardGap = 24;
      const cardWidth = (W - 240 - cardGap) / 2;
      const cardHeight = 190;

      const displayMetrics = storyData.metrics.slice(0, 4);

      displayMetrics.forEach((metric, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cx = 120 + col * (cardWidth + cardGap);
        const cy = gridStartY + row * (cardHeight + cardGap);

        // Card glass background
        ctx.fillStyle = "rgba(18, 18, 24, 0.75)";
        roundRect(ctx, cx, cy, cardWidth, cardHeight, 28);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1.5;
        roundRect(ctx, cx, cy, cardWidth, cardHeight, 28);
        ctx.stroke();

        // Accent top border
        ctx.strokeStyle = `${currentThemeConfig.primaryColor}88`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + 32, cy);
        ctx.lineTo(cx + cardWidth - 32, cy);
        ctx.stroke();

        // Metric label
        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 20px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(metric.label.toUpperCase(), cx + 30, cy + 48);

        // Metric main value
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText(metric.value, cx + 30, cy + 115);

        // Change badge or secondary info
        if (metric.change) {
          const isUp = metric.isPositive !== false;
          const badgeText = `${isUp ? "↗ +" : "↘ "}${metric.change.replace("+", "")}`;
          ctx.font = "700 20px 'Courier New', monospace";
          const tw = ctx.measureText(badgeText).width;

          ctx.fillStyle = isUp ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
          roundRect(ctx, cx + 30, cy + 135, tw + 20, 32, 8);
          ctx.fill();

          ctx.fillStyle = isUp ? "#34d399" : "#f87171";
          ctx.fillText(badgeText, cx + 40, cy + 157);
        }
      });

      // 5. Highlights / Conquistas Box
      const highlightsY = gridStartY + 2 * (cardHeight + cardGap) + 10;
      if (storyData.highlights && storyData.highlights.length > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        roundRect(ctx, 120, highlightsY, W - 240, 160, 24);
        ctx.fill();

        ctx.strokeStyle = `${currentThemeConfig.primaryColor}33`;
        ctx.lineWidth = 1.5;
        roundRect(ctx, 120, highlightsY, W - 240, 160, 24);
        ctx.stroke();

        // Trophy glyph
        ctx.fillStyle = currentThemeConfig.primaryColor;
        ctx.font = "700 22px sans-serif";
        ctx.fillText("⭐ DESTAQUES DA EVOLUÇÃO", 150, highlightsY + 45);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
        storyData.highlights.slice(0, 2).forEach((h, hIdx) => {
          ctx.fillText(`• ${h}`, 150, highlightsY + 90 + hIdx * 40);
        });
      }

      // 6. Diagnostic Quote / Insight Box
      const quoteY = highlightsY + (storyData.highlights?.length ? 185 : 0);
      if (includeQuote && storyData.quoteOrDiagnostic) {
        ctx.fillStyle = currentThemeConfig.badgeBg;
        roundRect(ctx, 120, quoteY, W - 240, 130, 20);
        ctx.fill();

        ctx.strokeStyle = `${currentThemeConfig.primaryColor}44`;
        ctx.lineWidth = 1;
        roundRect(ctx, 120, quoteY, W - 240, 130, 20);
        ctx.stroke();

        ctx.fillStyle = currentThemeConfig.primaryColor;
        ctx.font = "700 20px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText("DIAGNÓSTICO FORZON AI:", 150, quoteY + 42);

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "italic 22px -apple-system, BlinkMacSystemFont, sans-serif";
        // Simple 2-line break if text is long
        const text = storyData.quoteOrDiagnostic;
        if (text.length > 60) {
          const cutIdx = text.lastIndexOf(" ", 60);
          ctx.fillText(`"${text.substring(0, cutIdx)}...`, 150, quoteY + 76);
          ctx.fillText(`${text.substring(cutIdx).trim()}"`, 150, quoteY + 104);
        } else {
          ctx.fillText(`"${text}"`, 150, quoteY + 84);
        }
      }

      // 7. Footer & Hashtag Brand Bar
      const footerY = H - 240;
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.moveTo(120, footerY);
      ctx.lineTo(W - 120, footerY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // FORZON Watermark
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 24px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("FORZON PERFORMANCE", 120, footerY + 50);

      ctx.fillStyle = "#64748b";
      ctx.font = "500 18px 'Courier New', monospace";
      ctx.fillText("athlynx.app · Treino Inteligente & Cargas", 120, footerY + 80);

      // Hashtags
      ctx.fillStyle = currentThemeConfig.primaryColor;
      ctx.font = "700 20px 'Courier New', monospace";
      ctx.fillText("#SOBRECARGAPROGRESSIVA", W - 430, footerY + 50);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 18px 'Courier New', monospace";
      ctx.fillText("#TREINOPAGO", W - 280, footerY + 80);
    },
    [selectedTheme, includeQuote, storyData]
  );

  // Helper function for rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Render both full-res offscreen and downscaled preview canvas
  useEffect(() => {
    if (!isOpen) return;

    if (canvasRef.current) {
      drawStoryCanvas(canvasRef.current);
    }

    if (previewCanvasRef.current && canvasRef.current) {
      const pCanvas = previewCanvasRef.current;
      const pCtx = pCanvas.getContext("2d");
      if (pCtx) {
        pCanvas.width = 360;
        pCanvas.height = 640;
        pCtx.drawImage(canvasRef.current, 0, 0, 360, 640);
      }
    }
  }, [isOpen, drawStoryCanvas]);

  if (!isOpen) return null;

  // Convert canvas to File object
  const getStoryImageFile = async (): Promise<File | null> => {
    if (!canvasRef.current) return null;
    return new Promise((resolve) => {
      canvasRef.current?.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], `athlynx-story-${Date.now()}.png`, {
          type: "image/png",
        });
        resolve(file);
      }, "image/png");
    });
  };

  // Direct PNG Download
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `athlynx-story-${storyData.type}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();

    setActionFeedback("Imagem 9:16 baixada em alta resolução (1080x1920)!");
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Copy Caption to Clipboard
  const handleCopyCaption = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 3000);
    }
  };

  // Share to Instagram Stories
  const handleShareToInstagram = async () => {
    setIsGenerating(true);
    setActionFeedback(null);

    try {
      const file = await getStoryImageFile();

      // Check if browser Web Share API supports file sharing
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `FORZON — ${storyData.title}`,
          text: captionText,
        });
        setActionFeedback("Compartilhamento concluído! Selecione o Instagram Stories.");
        setIsGenerating(false);
        return;
      }

      // Desktop or fallback flow:
      // 1. Download image automatically
      handleDownloadImage();
      // 2. Copy caption
      handleCopyCaption();
      // 3. Try to trigger Instagram deep link or web
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = "instagram://story";
      } else {
        window.open("https://www.instagram.com/", "_blank");
      }

      setActionFeedback(
        "📸 Imagem 1080x1920 baixada e legenda copiada! Abra o Instagram e selecione a imagem da galeria no Story."
      );
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        handleDownloadImage();
        handleCopyCaption();
        setActionFeedback(
          "Imagem baixada e texto copiado! Abra o Instagram Stories e escolha a imagem salva."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Share to WhatsApp (Status and Conversation)
  const handleShareToWhatsApp = async () => {
    setIsGenerating(true);
    setActionFeedback(null);

    try {
      const file = await getStoryImageFile();

      // Check if native share with file works (direct to WhatsApp status)
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `FORZON — ${storyData.title}`,
          text: captionText,
        });
        setActionFeedback("Compartilhamento iniciado! Escolha 'Meu Status' no WhatsApp.");
        setIsGenerating(false);
        return;
      }

      // Fallback: download story image + open WhatsApp with pre-formatted text
      handleDownloadImage();
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        captionText
      )}`;
      window.open(whatsappUrl, "_blank");

      setActionFeedback(
        "💬 WhatsApp aberto com resumo formatado e imagem salva! Publique no seu Status ou envie aos amigos."
      );
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          captionText
        )}`;
        window.open(whatsappUrl, "_blank");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Hidden full-res 1080x1920 canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-neutral-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Compartilhar nos Stories</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  9:16 HD
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Instagram Stories & WhatsApp Status com métricas e visual esportivo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-neutral-800"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {actionFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 9:16 Phone Mockup Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group">
                {/* Phone chassis */}
                <div className="w-[280px] sm:w-[310px] h-[497px] sm:h-[551px] rounded-[42px] p-2.5 bg-neutral-900 border-4 border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col">
                  {/* Top notch */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 mr-2" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                  </div>

                  {/* Story screen area */}
                  <div className="w-full h-full rounded-[32px] overflow-hidden bg-black relative flex items-center justify-center">
                    <canvas
                      ref={previewCanvasRef}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Watermark for preview */}
                    <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                      <span className="text-[9px] font-mono tracking-widest text-white/50 bg-black/60 px-2 py-0.5 rounded-full">
                        PREVIEW 9:16 (1080×1920)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 text-center mt-3">
                Design otimizado automaticamente para enquadramento perfeito em tela cheia.
              </p>
            </div>

            {/* Right Column: Controls, Themes, and Share Triggers */}
            <div className="lg:col-span-7 space-y-5">
              {/* Theme Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Escolha o Estilo Visual do Story</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEMES.map((theme) => {
                    const isSelected = selectedTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? "bg-neutral-900 border-emerald-500 shadow-lg shadow-emerald-500/10"
                            : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg shrink-0 border border-white/20 flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.bgColors[1]})`,
                          }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {theme.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            {theme.tag}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Options */}
              {storyData.quoteOrDiagnostic && (
                <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-200">
                      Incluir Diagnóstico do Coach IA no Story
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Adiciona a caixa com recomendação técnica de treino
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeQuote}
                      onChange={(e) => setIncludeQuote(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              )}

              {/* Direct Social Actions */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Compartilhar Direto
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Instagram Story Button */}
                  <button
                    type="button"
                    onClick={handleShareToInstagram}
                    disabled={isGenerating}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs tracking-wide shadow-lg shadow-rose-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <svg
                      className="w-5 h-5 fill-current shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Instagram Story</span>
                  </button>

                  {/* WhatsApp Status Button */}
                  <button
                    type="button"
                    onClick={handleShareToWhatsApp}
                    disabled={isGenerating}
                    className="p-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-neutral-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <svg
                      className="w-5 h-5 fill-current shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>WhatsApp Status</span>
                  </button>
                </div>

                {/* Secondary Actions: Download & Copy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Baixar Imagem HD (PNG)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {copiedCaption ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Legenda Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-neutral-400" />
                        <span>Copiar Legenda Formatada</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions Accordion / Quick Guide */}
              <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-neutral-300 font-bold">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Como publicar no Story do Whats & Insta:</span>
                </div>
                <div className="space-y-1.5 text-neutral-400 text-[11px] leading-relaxed">
                  <p>
                    <strong className="text-white">📱 No Celular:</strong> Ao tocar em &quot;Instagram Story&quot; ou &quot;WhatsApp Status&quot;, o painel de compartilhamento do seu sistema é aberto. Escolha o app para abrir direto a tela de novo Story/Status com a arte já carregada.
                  </p>
                  <p>
                    <strong className="text-white">💻 No Computador:</strong> Clique em &quot;Baixar Imagem HD&quot; e &quot;Copiar Legenda&quot;, em seguida abra o Instagram Web ou WhatsApp Web para postar nos stories ou enviar para os seus grupos de treino.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-900 bg-neutral-900/60 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-neutral-500 font-mono">
            FORZON SOCIAL ENGINE · 1080×1920 PIXELS
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

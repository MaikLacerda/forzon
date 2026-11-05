import React, { useState } from "react";
import { Sparkles, ExternalLink, X, Tag, Check, ShieldCheck, Flame, Zap } from "lucide-react";

export interface AdBannerProps {
  isPremium: boolean;
  onOpenUpgradeModal: () => void;
  slot?: "inline" | "banner" | "compact";
  className?: string;
}

interface SponsorAd {
  id: string;
  brand: string;
  title: string;
  description: string;
  badge: string;
  couponCode: string;
  discountText: string;
  ctaText: string;
  accentColor: string;
  bgGradient: string;
  category: string;
}

const SPONSOR_ADS: SponsorAd[] = [
  {
    id: "max-titanium",
    brand: "MAX TITANIUM",
    title: "100% Whey Concentrado + Creatina Creapure",
    description: "Eleve sua síntese proteica com a marca líder em nutrição esportiva e laudos 100% aprovados.",
    badge: "Patrocinador Oficial",
    couponCode: "FORZON15",
    discountText: "15% OFF Extra",
    ctaText: "Aproveitar Desconto",
    accentColor: "#ef4444",
    bgGradient: "from-rose-950/40 via-neutral-900 to-neutral-950",
    category: "Suplementação & Performance",
  },
  {
    id: "nike-metcon",
    brand: "NIKE TRAINING",
    title: "Novo Nike Metcon 9 Pro Edition",
    description: "Placa Hyperlift ultra-estável no calcanhar para agachamento pesado, LPO e treinos funcionais.",
    badge: "Equipamento Pro",
    couponCode: "METCON10",
    discountText: "10% OFF no App",
    ctaText: "Ver Modelos",
    accentColor: "#00d2ff",
    bgGradient: "from-cyan-950/40 via-neutral-900 to-neutral-950",
    category: "Calçados & Vestuário",
  },
  {
    id: "growth-supps",
    brand: "GROWTH SUPPLEMENTS",
    title: "Creatina Monohidratada 250g 100% Pura",
    description: "Mais força, explosão e volume celular direto da fábrica com melhor custo-benefício do Brasil.",
    badge: "Qualidade Comprovada",
    couponCode: "GROWTHLYNX",
    discountText: "Frete Grátis",
    ctaText: "Resgatar Oferta",
    accentColor: "#10b981",
    bgGradient: "from-emerald-950/40 via-neutral-900 to-neutral-950",
    category: "Nutrição Direta",
  },
];

export const AdBanner: React.FC<AdBannerProps> = ({
  isPremium,
  onOpenUpgradeModal,
  slot = "banner",
  className = "",
}) => {
  const [adIndex, setAdIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If user has active Pro subscription, never render ads!
  if (isPremium || dismissed) {
    return null;
  }

  const currentAd = SPONSOR_ADS[adIndex % SPONSOR_ADS.length];

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentAd.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNextAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdIndex((prev) => (prev + 1) % SPONSOR_ADS.length);
  };

  if (slot === "compact") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentAd.bgGradient} border border-neutral-800 p-3 sm:p-4 text-xs ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800 shrink-0">
              Anúncio
            </span>
            <div className="truncate">
              <span className="font-bold text-white">{currentAd.brand}: </span>
              <span className="text-neutral-300">{currentAd.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCoupon}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-emerald-400 font-bold border border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
              <span>{copied ? "Copiado!" : currentAd.couponCode}</span>
            </button>

            <button
              onClick={onOpenUpgradeModal}
              className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 flex items-center gap-1 cursor-pointer transition-colors"
              title="Remover anúncios assinando o plano Pro"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Sem Anúncios</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentAd.bgGradient} border border-neutral-800 p-5 sm:p-6 shadow-xl transition-all ${className}`}
    >
      {/* Top Meta Line: Sponsored Indicator + Upgrade CTA */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-800/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800 font-semibold tracking-wider">
            ANÚNCIO PATROCINADO · PLANO FREE
          </span>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            {currentAd.category}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenUpgradeModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-amber-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Remover Anúncios com Pro</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            title="Ocultar temporariamente nesta sessão"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Ad Body */}
      <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              {currentAd.brand}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {currentAd.badge}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {currentAd.title}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {currentAd.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            onClick={handleCopyCoupon}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-700/80 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {copied ? "CUPOM COPIADO!" : `CUPOM: ${currentAd.couponCode} (${currentAd.discountText})`}
            </span>
            {copied && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleNextAd}
              className="text-[11px] text-neutral-400 hover:text-white font-mono transition-colors cursor-pointer py-1"
            >
              Próximo Patrocinador →
            </button>

            <span className="text-[10px] text-neutral-500 font-mono">
              Apoia o plano Gratuito
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

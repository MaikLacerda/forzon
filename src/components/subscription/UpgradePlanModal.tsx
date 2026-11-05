import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  X,
  Zap,
  ShieldCheck,
  Flame,
  Dumbbell,
  Crown,
  EyeOff,
  ChevronRight,
  RotateCcw,
  Star,
} from "lucide-react";
import { UserProfile, SubscriptionPlanOption } from "../../types";
import { storage } from "../../services/storage";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  highlightedFeature?: string;
}

const PLAN_OPTIONS: SubscriptionPlanOption[] = [
  {
    id: "annual",
    name: "Plano Anual Pro",
    priceFormatted: "R$ 19,90",
    periodLabel: "/ mês",
    billedLabel: "R$ 238,80 cobrado anualmente",
    originalPrice: "R$ 29,90",
    savingsPercent: 33,
    isPopular: true,
    features: [
      "100% Livre de Anúncios",
      "Todos os treinos da semana liberados (C, D, etc.)",
      "Todas as modalidades PRO (HYROX, CrossFit, Lutas, Areia)",
      "Visão Computacional e Câmera IA Ilimitada",
      "Economia de R$ 120 por ano",
    ],
  },
  {
    id: "semi_annual",
    name: "Plano Semestral Pro",
    priceFormatted: "R$ 24,90",
    periodLabel: "/ mês",
    billedLabel: "R$ 149,40 a cada 6 meses",
    originalPrice: "R$ 29,90",
    savingsPercent: 17,
    isPopular: false,
    features: [
      "100% Livre de Anúncios",
      "Acesso completo ao plano de treinos e modalidades",
      "Análise biomecânica por IA em tempo real",
      "Economia de R$ 30 por semestre",
    ],
  },
  {
    id: "monthly",
    name: "Plano Mensal Pro",
    priceFormatted: "R$ 29,90",
    periodLabel: "/ mês",
    billedLabel: "Cobrança mensal recorrente",
    isPopular: false,
    features: [
      "100% Livre de Anúncios",
      "Todos os treinos da semana liberados",
      "Acesso completo ao ecossistema multiesportivo",
      "Sem fidelidade: cancele a qualquer momento",
    ],
  },
];

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  highlightedFeature,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<"annual" | "semi_annual" | "monthly">("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [founderCode, setFounderCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeError, setCodeError] = useState("");

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updated: UserProfile = {
        ...profile,
        isPremium: true,
      };
      storage.saveProfile(updated);
      if (onUpdateProfile) onUpdateProfile(updated);
      setIsProcessing(false);
      setJustSubscribed(true);
      setTimeout(() => {
        setJustSubscribed(false);
        onClose();
      }, 2200);
    }, 800);
  };

  const handleApplyFounderCode = () => {
    const clean = founderCode.trim().toUpperCase();
    if (["FORZON-FOUNDER", "MAIKON-VIP", "FORZON2026", "FOUNDER", "MAIKON"].includes(clean)) {
      setIsProcessing(true);
      setTimeout(() => {
        const updated: UserProfile = {
          ...profile,
          isPremium: true,
        };
        storage.saveProfile(updated);
        if (onUpdateProfile) onUpdateProfile(updated);
        setIsProcessing(false);
        setJustSubscribed(true);
        setTimeout(() => {
          setJustSubscribed(false);
          onClose();
        }, 2200);
      }, 500);
    } else {
      setCodeError("Código inválido. Use FORZON-FOUNDER ou MAIKON-VIP.");
    }
  };

  const handleSwitchToFree = () => {
    const updated: UserProfile = {
      ...profile,
      isPremium: false,
    };
    storage.saveProfile(updated);
    if (onUpdateProfile) onUpdateProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success celebratory screen */}
        {justSubscribed ? (
          <div className="py-12 text-center space-y-4 animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto text-cyan-400">
              <Crown className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white">
              Bem-vindo ao FORZON Pro!
            </h2>
            <p className="text-sm text-neutral-300 max-w-md mx-auto">
              Sua assinatura foi ativada com sucesso. Todos os treinos da semana, modalidades PRO e análise de IA foram desbloqueados, e todos os anúncios foram removidos!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>EXPERIÊNCIA 100% LIVRE DE ANÚNCIOS ATIVADA</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with Badge */}
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono tracking-wider">
                <Crown className="w-3.5 h-3.5 text-cyan-400" />
                <span>FORZON PRO · PLANO EXCLUSIVO</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Desbloqueie Todos os Treinos & Remova Anúncios
              </h2>

              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
                No plano gratuito você treina com anúncios e acesso básico. Assine o Pro para liberar o plano completo, modalidades olímpicas e ter foco total sem interrupções.
              </p>

              {highlightedFeature && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold mt-2">
                  🔒 {highlightedFeature} requer o plano FORZON Pro
                </div>
              )}
            </div>

            {/* Current user status indicator */}
            {profile.isPremium && (
              <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Você já é assinante FORZON Pro!</div>
                    <div className="text-[11px] text-neutral-400">Todos os treinos estão liberados e os anúncios desativados.</div>
                  </div>
                </div>

                <button
                  onClick={handleSwitchToFree}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[11px] font-mono text-neutral-300 hover:text-white border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Testar Modo Grátis (Com Anúncios)</span>
                </button>
              </div>
            )}

            {/* Comparison Grid: Free vs Pro */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-2.5 text-xs">
              <div className="grid grid-cols-3 font-mono font-bold text-[11px] text-neutral-400 pb-2 border-b border-neutral-800">
                <span>RECURSO</span>
                <span className="text-center text-neutral-500">GRÁTIS</span>
                <span className="text-right text-cyan-400">FORZON PRO</span>
              </div>

              {[
                { feature: "Treinos A & B Essenciais", free: "Sim", pro: "Sim (100%)" },
                { feature: "Treinos C & D (Hipertrofia Pro)", free: "Bloqueado", pro: "Liberado" },
                { feature: "Modalidades PRO (HYROX, CrossFit, Lutas)", free: "Limitado", pro: "Total Ilimitado" },
                { feature: "Análise de Postura por Câmera / IA", free: "Modo Básico", pro: "Tempo Real Ilimitado" },
                { feature: "Experiência sem Anúncios", free: "Com Anúncios", pro: "Zero Anúncios" },
                { feature: "Bioimpedância & Predições IA", free: "Última aferição", pro: "Histórico Completo" },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 items-center py-1 font-mono text-[11px]">
                  <span className="text-neutral-300 truncate">{row.feature}</span>
                  <span className="text-center text-neutral-500">
                    {row.free === "Sim" || row.free === "Limitado" ? row.free : "✕ Bloqueado"}
                  </span>
                  <span className="text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{row.pro}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Plan selection cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLAN_OPTIONS.map((opt) => {
                const isSelected = selectedPlanId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPlanId(opt.id)}
                    className={`relative p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-b from-emerald-950/60 to-neutral-900 border-emerald-500 shadow-lg shadow-emerald-500/20"
                        : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                    }`}
                  >
                    {opt.isPopular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black font-mono uppercase tracking-wider">
                        Mais Popular
                      </span>
                    )}

                    <div>
                      <div className="text-xs font-bold text-white">{opt.name}</div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-xl font-black text-white">{opt.priceFormatted}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">{opt.periodLabel}</span>
                      </div>
                      {opt.originalPrice && (
                        <div className="text-[10px] text-neutral-500 line-through font-mono mt-0.5">
                          de {opt.originalPrice}
                        </div>
                      )}
                      {opt.savingsPercent && (
                        <div className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                          Economize {opt.savingsPercent}%
                        </div>
                      )}
                      {opt.billedLabel && (
                        <div className="text-[10px] text-neutral-400 font-mono mt-1.5">
                          {opt.billedLabel}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-1 text-[11px] text-neutral-400">
                      {opt.features.slice(0, 2).map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTA Subscribe Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processando Assinatura...</span>
                  </div>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-neutral-950" />
                    <span>
                      {profile.isPremium ? "Mudar / Reativar Plano Pro" : "Assinar Agora e Liberar Tudo"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Garantia de 7 dias
                </span>
                <span>·</span>
                <span>Cancelamento a qualquer hora</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                  Zero anúncios
                </span>
              </div>

              {/* Founder / VIP Access Unlock */}
              <div className="pt-2 text-center border-t border-neutral-800/60">
                {!showCodeInput ? (
                  <button
                    onClick={() => setShowCodeInput(true)}
                    className="text-xs text-neutral-400 hover:text-cyan-400 font-mono transition-colors underline cursor-pointer"
                  >
                    Possui código de Fundador / Cupom VIP?
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl text-left">
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Digite seu cupom VIP ou chave de Fundador:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: FORZON-FOUNDER"
                        value={founderCode}
                        onChange={(e) => {
                          setFounderCode(e.target.value);
                          setCodeError("");
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono uppercase focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        onClick={handleApplyFounderCode}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-neutral-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
                      >
                        Ativar VIP
                      </button>
                    </div>
                    {codeError && <p className="text-[11px] text-rose-400">{codeError}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  Moon,
  Activity,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Brain,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { UserProfile, SleepQuality, IntensityAdjustment, WorkoutSession } from "../../types";
import { aiService } from "../../services/aiService";
import { storage } from "../../services/storage";

interface DailyRecoveryCardProps {
  profile: UserProfile;
  session?: WorkoutSession;
  onProfileUpdated?: (updated: UserProfile) => void;
  compact?: boolean;
}

const SLEEP_OPTIONS: Array<{
  value: SleepQuality;
  label: string;
  emoji: string;
  desc: string;
  colorClass: string;
}> = [
  { value: "Péssima", label: "Péssima", emoji: "😫", desc: "< 5h / agitado", colorClass: "text-rose-400 border-rose-500/30 hover:bg-rose-500/10" },
  { value: "Ruim", label: "Ruim", emoji: "🥱", desc: "5-6h / acordou cansado", colorClass: "text-orange-400 border-orange-500/30 hover:bg-orange-500/10" },
  { value: "Regular", label: "Regular", emoji: "😐", desc: "6-7h / repouso médio", colorClass: "text-amber-400 border-amber-500/30 hover:bg-amber-500/10" },
  { value: "Boa", label: "Boa", emoji: "😊", desc: "7-8h / reparador", colorClass: "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" },
  { value: "Excelente", label: "Excelente", emoji: "⚡", desc: "8h+ / sono profundo", colorClass: "text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10" },
];

export const DailyRecoveryCard: React.FC<DailyRecoveryCardProps> = ({
  profile,
  session,
  onProfileUpdated,
  compact = false,
}) => {
  const [sleep, setSleep] = useState<SleepQuality>(profile.sleepQuality || "Boa");
  const [stress, setStress] = useState<number>(profile.stressLevel ?? 3);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [adjustment, setAdjustment] = useState<IntensityAdjustment | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if profile prop changes
  useEffect(() => {
    if (profile.sleepQuality) setSleep(profile.sleepQuality);
    if (profile.stressLevel !== undefined) setStress(profile.stressLevel);
  }, [profile.sleepQuality, profile.stressLevel]);

  // Run AI intensity adjustment calculation
  const handleCalibrateIntensity = async (newSleep: SleepQuality, newStress: number) => {
    setIsCalibrating(true);
    try {
      const res = await aiService.adjustWorkoutIntensity({
        sleepQuality: newSleep,
        stressLevel: newStress,
        session,
        profile,
      });
      setAdjustment(res);
    } catch (_e) {
      // Handled cleanly via deterministic defaults
    } finally {
      setIsCalibrating(false);
    }
  };

  // Immediate save whenever user updates sleep or stress
  const handleUpdate = async (newSleep: SleepQuality, newStress: number) => {
    setSleep(newSleep);
    setStress(newStress);

    const updatedProfile: UserProfile = {
      ...profile,
      sleepQuality: newSleep,
      stressLevel: newStress,
      lastRecoveryCheckIn: new Date().toISOString(),
    };

    storage.saveProfile(updatedProfile);
    if (onProfileUpdated) onProfileUpdated(updatedProfile);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    // Recalibrate intensity
    await handleCalibrateIntensity(newSleep, newStress);
  };

  // Initial calculation on mount
  useEffect(() => {
    handleCalibrateIntensity(sleep, stress);
  }, []);

  const getStressInfo = (val: number) => {
    if (val <= 3) return { label: "Baixo (Ótimo)", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    if (val <= 6) return { label: "Moderado", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    if (val <= 8) return { label: "Alto (Cuidado)", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" };
    return { label: "Severo / Esgotado", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };
  };

  const stressInfo = getStressInfo(stress);

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Check-in Diário de Recuperação & Estresse
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                IA Adaptativa
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              A IA recalibra as cargas, séries e metas de RPE do próximo treino com base no seu sono e estresse.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in shrink-0 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Check-in Salvo!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Left column: Inputs (Sleep & Stress) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Field 1: Qualidade do Sono */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Qualidade do Sono</span>
              </label>
              <span className="text-neutral-400 font-mono text-[11px]">
                Status: <strong className="text-white">{sleep}</strong>
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {SLEEP_OPTIONS.map((opt) => {
                const isSelected = sleep === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdate(opt.value, stress)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-neutral-800 border-emerald-500/80 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                        : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="text-base sm:text-lg">{opt.emoji}</span>
                    <span className={`text-[11px] font-bold ${isSelected ? "text-emerald-400" : "text-neutral-300"}`}>
                      {opt.label}
                    </span>
                    {!compact && (
                      <span className="text-[9px] text-neutral-500 line-clamp-1 hidden sm:block">
                        {opt.desc}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 2: Nível de Estresse (1-10) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>Nível de Estresse Diário (1 a 10)</span>
              </label>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${stressInfo.bg} ${stressInfo.color} ${stressInfo.border}`}>
                {stress} / 10 · {stressInfo.label}
              </span>
            </div>

            {/* Slider control */}
            <div className="space-y-2 bg-neutral-950/70 p-3 rounded-2xl border border-neutral-800/80">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={stress}
                onChange={(e) => handleUpdate(sleep, parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />

              {/* 1 to 10 chip buttons */}
              <div className="flex items-center justify-between gap-1 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isCur = stress === num;
                  let bg = "bg-neutral-900 border-neutral-800 text-neutral-400";
                  if (num <= 3 && isCur) bg = "bg-emerald-500 text-neutral-950 font-bold border-emerald-400";
                  else if (num <= 6 && isCur) bg = "bg-amber-500 text-neutral-950 font-bold border-amber-400";
                  else if (num <= 8 && isCur) bg = "bg-orange-500 text-neutral-950 font-bold border-orange-400";
                  else if (isCur) bg = "bg-rose-500 text-white font-bold border-rose-400";

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleUpdate(sleep, num)}
                      className={`flex-1 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${bg}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between text-[10px] text-neutral-500 font-mono px-1">
                <span>1 Relaxado / Calmo</span>
                <span>5 Moderado</span>
                <span>10 Esgotamento Máximo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: AI Recommendation & Adjusted Workout Intensity */}
        <div className="lg:col-span-5 bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calibração do Treino de Amanhã</span>
              </span>
              {isCalibrating && (
                <span className="text-[10px] font-mono text-emerald-400 animate-pulse">
                  Analisando com IA...
                </span>
              )}
            </div>

            {/* Score Ring / Pill */}
            <div className="flex items-center gap-3 bg-neutral-900/90 p-3 rounded-xl border border-neutral-850">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-base font-black text-emerald-400 font-mono leading-none">
                  {adjustment?.readinessScore ?? 85}
                </span>
                <span className="text-[8px] font-mono text-neutral-400">SCORE</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {adjustment?.statusBadge || "Prontidão Ideal"}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2">
                  <span>Alvo: <strong className="text-emerald-400">{adjustment?.rpeTarget || "RPE 8 - 8.5"}</strong></span>
                  <span>·</span>
                  <span>
                    Volume: <strong className="text-white">{adjustment?.volumeSetsAdjustment ? `${adjustment.volumeSetsAdjustment > 0 ? "+" : ""}${adjustment.volumeSetsAdjustment} série` : "Normal"}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Scientific AI Explanation */}
            <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-850">
              <p className="text-xs text-neutral-300 leading-relaxed">
                {adjustment?.recommendationMessage ||
                  "Aguardando cálculo fisiológico com base no sono e nível de estresse reportados..."}
              </p>
            </div>
          </div>

          {/* Quick Refresh Button */}
          <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs">
            <span className="text-[11px] text-neutral-500">
              Ajuste dinâmico ativado
            </span>
            <button
              type="button"
              disabled={isCalibrating}
              onClick={() => handleCalibrateIntensity(sleep, stress)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isCalibrating ? "Ajustando..." : "Recalibrar com IA"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

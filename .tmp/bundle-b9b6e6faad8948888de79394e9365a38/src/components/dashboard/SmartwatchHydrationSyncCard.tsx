import React, { useState, useEffect } from "react";
import {
  Watch,
  Droplets,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Zap,
  ArrowRight,
  Battery,
  Flame,
  Plus,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  DailyNutrition,
  CompletedWorkoutRecord,
  SmartwatchDevice,
  SmartwatchPlatform,
  AIHydrationAdjustment,
  SmartwatchSyncTelemetry,
} from "../../types";
import { smartwatchSyncService } from "../../services/smartwatchSyncService";

interface SmartwatchHydrationSyncCardProps {
  nutrition: DailyNutrition;
  recentWorkouts: CompletedWorkoutRecord[];
  onUpdateNutrition: (updated: DailyNutrition) => void;
  onOpenSyncModal?: () => void;
}

export const SmartwatchHydrationSyncCard: React.FC<SmartwatchHydrationSyncCardProps> = ({
  nutrition,
  recentWorkouts,
  onUpdateNutrition,
  onOpenSyncModal,
}) => {
  const [device, setDevice] = useState<SmartwatchDevice>(() =>
    smartwatchSyncService.getConnectedDevice()
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [hydrationAdjustment, setHydrationAdjustment] = useState<AIHydrationAdjustment | null>(null);
  const [justLoggedMl, setJustLoggedMl] = useState<number | null>(null);

  // Compute AI Hydration Adjustment whenever workouts or nutrition targets change
  useEffect(() => {
    const adj = smartwatchSyncService.calculateHydrationAdjustment(
      recentWorkouts,
      nutrition
    );
    setHydrationAdjustment(adj);
  }, [recentWorkouts, nutrition.waterGoalMl]);

  // Listen to device or sync events
  useEffect(() => {
    const handleDeviceChange = (e: Event) => {
      const custom = e as CustomEvent<SmartwatchDevice>;
      if (custom.detail) setDevice(custom.detail);
    };
    const handleSyncEvent = (e: Event) => {
      const custom = e as CustomEvent<SmartwatchSyncTelemetry>;
      if (custom.detail) {
        setDevice((prev) => ({
          ...prev,
          lastSyncedAt: custom.detail.lastSyncTimestamp,
        }));
      }
    };
    window.addEventListener("athlynx_smartwatch_device_change", handleDeviceChange);
    window.addEventListener("athlynx_smartwatch_sync", handleSyncEvent);
    return () => {
      window.removeEventListener("athlynx_smartwatch_device_change", handleDeviceChange);
      window.removeEventListener("athlynx_smartwatch_sync", handleSyncEvent);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const telemetry = await smartwatchSyncService.syncNutritionWithWatch(nutrition);
      setSyncFeedback(
        `Sincronizado com ${device.deviceName.split(" ")[0]}! Água: ${telemetry.waterSyncedMl}ml · Macros atualizados.`
      );
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch {
      setSyncFeedback("Erro na sincronização.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApplyAdjustment = async () => {
    if (!hydrationAdjustment) return;
    setIsSyncing(true);
    try {
      const { updatedNutrition } = await smartwatchSyncService.applyHydrationAdjustment(
        hydrationAdjustment,
        nutrition
      );
      onUpdateNutrition(updatedNutrition);
      setHydrationAdjustment((prev) => (prev ? { ...prev, applied: true } : null));
      setSyncFeedback(`Nova meta de ${hydrationAdjustment.adjustedGoalMl}ml sincronizada no seu relógio!`);
      setTimeout(() => setSyncFeedback(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRevertAdjustment = async () => {
    if (!hydrationAdjustment) return;
    setIsSyncing(true);
    try {
      const updatedNutrition = await smartwatchSyncService.revertHydrationGoal(
        hydrationAdjustment.baseGoalMl,
        nutrition
      );
      onUpdateNutrition(updatedNutrition);
      setHydrationAdjustment((prev) => (prev ? { ...prev, applied: false } : null));
      setSyncFeedback(`Meta restaurada para ${hydrationAdjustment.baseGoalMl}ml.`);
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQuickWatchLog = (ml: number) => {
    const updated = smartwatchSyncService.logWaterFromWatch(ml);
    onUpdateNutrition(updated);
    setJustLoggedMl(ml);
    setTimeout(() => setJustLoggedMl(null), 2000);
  };

  const handleSwitchPlatform = (platform: SmartwatchPlatform) => {
    const updated = smartwatchSyncService.switchPlatform(platform);
    setDevice(updated);
    setSyncFeedback(`Plataforma alterada para ${platform === "apple_watch" ? "Apple Watch" : "WearOS"}.`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const formattedLastSync = new Date(device.lastSyncedAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-3xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Smartwatch Connection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white tracking-tight">
                {device.deviceName}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CONECTADO
              </span>
            </div>
            <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5 font-mono">
              <span>Sincronizado às {formattedLastSync}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-neutral-300">
                <Battery className="w-3 h-3 text-emerald-400" />
                {device.batteryPercent}%
              </span>
              <span>·</span>
              <span className="text-amber-400 font-semibold">
                +{device.activeCaloriesBurnedToday} kcal ativas
              </span>
            </div>
          </div>
        </div>

        {/* Platform Switcher & Sync Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleSwitchPlatform("apple_watch")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                device.platform === "apple_watch"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Apple Watch
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPlatform("wearos")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                device.platform === "wearos"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              WearOS
            </button>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-200 transition-all cursor-pointer disabled:opacity-50"
            title="Sincronizar dados de nutrição e água com o relógio"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-3 rounded-2xl bg-sky-950/60 border border-sky-500/40 text-xs text-sky-200 font-mono flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* AI Hydration Adjustment Block */}
      {hydrationAdjustment && (
        <div className="rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 border border-sky-500/30 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-mono">
                  Ajuste de Hidratação Baseado no Treino (IA)
                </h4>
                <div className="text-[11px] text-neutral-400">
                  Calibração dinâmica de água & reposição osmótica pós-esforço
                </div>
              </div>
            </div>

            {hydrationAdjustment.applied ? (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Meta Ajustada Ativa</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center gap-1 self-start sm:self-auto">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Sugestão de Reposição</span>
              </span>
            )}
          </div>

          {/* Diagnostic Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                Treino Registrado
              </div>
              <div className="text-xs font-bold text-white mt-1 truncate">
                {hydrationAdjustment.workoutTitle}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                {hydrationAdjustment.workoutDurationMin} min · RPE {hydrationAdjustment.workoutRpe}/10
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                Sudorese Estimada
              </div>
              <div className="text-xs font-bold text-sky-400 mt-1 font-mono">
                ~{hydrationAdjustment.estimatedSweatLossMl} ml perdidos
              </div>
              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Termorregulação & contração
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                Meta de Hidratação
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-1 font-mono flex items-center gap-1.5">
                <span>{hydrationAdjustment.baseGoalMl} ml</span>
                <ArrowRight className="w-3 h-3 text-neutral-500" />
                <span className="text-white font-black">{hydrationAdjustment.adjustedGoalMl} ml</span>
              </div>
              <div className="text-[11px] text-sky-300 font-mono mt-0.5 font-bold">
                +{hydrationAdjustment.additionalWaterMl} ml sugeridos
              </div>
            </div>
          </div>

          {/* Electrolyte Recommendation Banner */}
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-white text-[11px] font-mono">
                Diretriz de Eletrólitos & Minerais:
              </div>
              <div className="text-neutral-400 leading-relaxed text-[11px]">
                {hydrationAdjustment.electrolyteRecommendation}
              </div>
            </div>
          </div>

          {/* Action Button: Apply or Revert */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-neutral-400 font-mono">
              {hydrationAdjustment.applied
                ? "A meta atual do relógio inteligente inclui a compensação hídrica do treino."
                : "Aplicar recalibra o objetivo do dia e atualiza as complicações do seu smartwatch."}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hydrationAdjustment.applied ? (
                <button
                  type="button"
                  onClick={handleRevertAdjustment}
                  disabled={isSyncing}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
                >
                  Restaurar Meta Padrão (2.500ml)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyAdjustment}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-neutral-950 font-black text-xs font-mono tracking-wide uppercase shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>Aplicar Ajuste de Hidratação (+{hydrationAdjustment.additionalWaterMl}ml)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Complication Simulation: Log from Watch */}
      <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Watch className="w-4 h-4 text-sky-400" />
          <div className="text-xs text-neutral-300">
            <span className="font-bold text-white">Simular Toque no Relógio:</span> Ingeriu água pelo smartwatch?
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { ml: 200, label: "+200ml" },
            { ml: 350, label: "+350ml" },
            { ml: 500, label: "+500ml" },
          ].map((item) => (
            <button
              key={item.ml}
              type="button"
              onClick={() => handleQuickWatchLog(item.ml)}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/40 text-[11px] font-mono text-sky-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          ))}

          {justLoggedMl && (
            <span className="text-[11px] font-mono text-emerald-400 animate-fade-in font-bold">
              +{justLoggedMl}ml sincronizados!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

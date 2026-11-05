import React, { useState, useEffect } from "react";
import {
  Moon,
  Activity,
  Zap,
  Watch,
  Smartphone,
  Flame,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Info,
  ShieldCheck,
  Sliders,
  Battery,
  Heart,
  Layers,
} from "lucide-react";
import {
  SleepStageMetrics,
  DeepSleepLoadAdjustment,
  ConnectedFitnessPlatform,
  UserProfile,
} from "../../types";
import { healthSleepService } from "../../services/healthSleepService";

interface SleepSmartwatchTabProps {
  profile: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const SleepSmartwatchTab: React.FC<SleepSmartwatchTabProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [sleepMetrics, setSleepMetrics] = useState<SleepStageMetrics>(() =>
    healthSleepService.getSleepMetrics()
  );
  const [platforms, setPlatforms] = useState<ConnectedFitnessPlatform[]>(() =>
    healthSleepService.getConnectedPlatforms()
  );
  const [loadAdjustment, setLoadAdjustment] = useState<DeepSleepLoadAdjustment>(() =>
    healthSleepService.calculateDeepSleepLoadAdjustment(healthSleepService.getSleepMetrics())
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [selectedSource, setSelectedSource] = useState<
    "apple_health" | "strava" | "zepp_os" | "wearos" | "garmin"
  >("apple_health");

  // Re-calculate adjustment whenever sleep metrics change
  useEffect(() => {
    const adj = healthSleepService.calculateDeepSleepLoadAdjustment(sleepMetrics);
    setLoadAdjustment(adj);
  }, [sleepMetrics]);

  if (!sleepMetrics.totalSleepMinutes) return <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-3"><h3 className="font-bold text-white">Nenhum registro de sono</h3><p className="text-sm text-neutral-400">Você ainda não tem medidas de sono ou relógios conectados. A integração real com dispositivos será disponibilizada após configuração.</p></section>;

  // Sync from selected device
  const handleImportSleepData = async (
    source: "apple_health" | "strava" | "zepp_os" | "wearos" | "garmin"
  ) => {
    setIsSyncing(true);
    setSelectedSource(source);
    try {
      const updated = await healthSleepService.importSleepDataFromDevice(source);
      setSleepMetrics(updated);
      const adj = healthSleepService.calculateDeepSleepLoadAdjustment(updated);
      setLoadAdjustment(adj);

      if (onProfileUpdated) {
        onProfileUpdated({
          ...profile,
          sleepStages: updated,
        });
      }

      const platformNames: Record<string, string> = {
        apple_health: "Apple Watch (HealthKit)",
        zepp_os: "Zepp OS (Amazfit & Helio Ring)",
        strava: "Strava Bridge",
        wearos: "WearOS Health Connect",
        garmin: "Garmin Connect",
      };

      setSyncFeedback(`Dados de ciclos de sono importados de ${platformNames[source]}!`);
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch {
      setSyncFeedback("A integração real com dispositivos ainda não está configurada. Nenhuma medida foi importada.");
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle platform connection
  const handleTogglePlatform = (id: string) => {
    setSyncFeedback("A conexão real com dispositivos será disponibilizada após configurar a integração.");
  };

  // Apply or Revert AI Load Adjustment
  const handleApplyAdjustment = () => {
    if (loadAdjustment.applied) {
      healthSleepService.revertDeepSleepLoad();
      setLoadAdjustment((prev) => ({
        ...prev,
        applied: false,
        appliedAt: undefined,
      }));
      setAppliedSuccess(false);
    } else {
      healthSleepService.applyDeepSleepLoadToPlan(loadAdjustment);
      setLoadAdjustment((prev) => ({
        ...prev,
        applied: true,
        appliedAt: new Date().toISOString(),
      }));
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3000);
    }
  };

  // Quick simulation presets for testing
  const handleSimulateScenario = (scenario: "high_deep" | "medium_deep" | "low_deep") => {
    let deep = 110;
    let rem = 115;
    let light = 215;
    let awake = 20;

    if (scenario === "medium_deep") {
      deep = 70;
      rem = 95;
      light = 240;
      awake = 25;
    } else if (scenario === "low_deep") {
      deep = 42;
      rem = 70;
      light = 270;
      awake = 45;
    }

    const total = deep + rem + light + awake;
    const eff = Math.round(((deep + rem + light) / total) * 100);

    const simulated: SleepStageMetrics = {
      ...sleepMetrics,
      deepSleepMinutes: deep,
      remSleepMinutes: rem,
      lightSleepMinutes: light,
      awakeMinutes: awake,
      totalSleepMinutes: total,
      sleepEfficiencyPercent: eff,
      restingHrvMs: scenario === "high_deep" ? 72 : scenario === "medium_deep" ? 56 : 38,
      sourcePlatform: selectedSource,
    };

    healthSleepService.saveSleepMetrics(simulated);
    setSleepMetrics(simulated);
  };

  const formatHoursMinutes = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m < 10 ? "0" : ""}${m}m`;
  };

  const deepPct = Math.round((sleepMetrics.deepSleepMinutes / sleepMetrics.totalSleepMinutes) * 100);
  const remPct = Math.round((sleepMetrics.remSleepMinutes / sleepMetrics.totalSleepMinutes) * 100);
  const lightPct = Math.round((sleepMetrics.lightSleepMinutes / sleepMetrics.totalSleepMinutes) * 100);
  const awakePct = Math.max(1, 100 - (deepPct + remPct + lightPct));

  return (
    <div className="space-y-5">
      {/* Feedback Toast */}
      {syncFeedback && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Sleep Stages Hypnogram Card */}
      <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-indigo-500/30 space-y-4 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Ciclos de Sono & Bio-Recuperação</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {formatHoursMinutes(sleepMetrics.totalSleepMinutes)} Total
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Monitorado via API de Saúde ({sleepMetrics.sourcePlatform.replace("_", " ").toUpperCase()}) · Eficiência:{" "}
                <strong className="text-emerald-400">{sleepMetrics.sleepEfficiencyPercent}%</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Selecionar dispositivo de saúde"
              value={selectedSource}
              onChange={(e) =>
                handleImportSleepData(
                  e.target.value as "apple_health" | "strava" | "zepp_os" | "wearos" | "garmin"
                )
              }
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="apple_health">Apple Watch</option>
              <option value="zepp_os">Zepp OS (Amazfit / Helio)</option>
              <option value="strava">Strava Bridge</option>
              <option value="wearos">WearOS (Galaxy / Pixel)</option>
              <option value="garmin">Garmin Connect</option>
            </select>

            <button
              onClick={() => handleImportSleepData(selectedSource)}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Importar métricas mais recentes do relógio inteligente"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Importando..." : "Sincronizar"}</span>
            </button>
          </div>
        </div>

        {/* Hypnogram Stage Proportion Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Hipnograma dos Estágios Noturnos</span>
            <span>{sleepMetrics.sleepEfficiencyPercent}% Eficiência</span>
          </div>

          <div className="h-4 w-full bg-neutral-900 rounded-lg overflow-hidden flex p-0.5 gap-0.5 border border-neutral-800">
            {/* Deep Sleep */}
            <div
              style={{ width: `${deepPct}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-sm relative group cursor-pointer transition-all hover:brightness-125"
              title={`Sono Profundo: ${formatHoursMinutes(sleepMetrics.deepSleepMinutes)} (${deepPct}%)`}
            />
            {/* REM */}
            <div
              style={{ width: `${remPct}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-sm relative group cursor-pointer transition-all hover:brightness-125"
              title={`Sono REM: ${formatHoursMinutes(sleepMetrics.remSleepMinutes)} (${remPct}%)`}
            />
            {/* Light */}
            <div
              style={{ width: `${lightPct}%` }}
              className="h-full bg-gradient-to-r from-sky-600 to-blue-500 rounded-sm relative group cursor-pointer transition-all hover:brightness-125"
              title={`Sono Leve: ${formatHoursMinutes(sleepMetrics.lightSleepMinutes)} (${lightPct}%)`}
            />
            {/* Awake */}
            <div
              style={{ width: `${awakePct}%` }}
              className="h-full bg-amber-500/70 rounded-sm relative group cursor-pointer transition-all hover:brightness-125"
              title={`Acordado: ${formatHoursMinutes(sleepMetrics.awakeMinutes)} (${awakePct}%)`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Sono Profundo ({deepPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> REM ({remPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Leve ({lightPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Acordado ({awakePct}%)
            </span>
          </div>
        </div>

        {/* 4 Stages Detailed Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Deep Sleep Card */}
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-cyan-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-300">Sono Profundo</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                {deepPct}%
              </span>
            </div>
            <div className="text-base font-extrabold text-white font-mono">
              {formatHoursMinutes(sleepMetrics.deepSleepMinutes)}
            </div>
            <div className="text-[10px] text-neutral-400 leading-tight">
              Ondas Delta · Reparação muscular & pico de Hormônio do Crescimento (GH).
            </div>
          </div>

          {/* REM Card */}
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-purple-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-300">Sono REM</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                {remPct}%
              </span>
            </div>
            <div className="text-base font-extrabold text-white font-mono">
              {formatHoursMinutes(sleepMetrics.remSleepMinutes)}
            </div>
            <div className="text-[10px] text-neutral-400 leading-tight">
              Movimento Rápido dos Olhos · Aprendizado motor & coordenação neuromuscular.
            </div>
          </div>

          {/* Light Sleep Card */}
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-300">Sono Leve</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
                {lightPct}%
              </span>
            </div>
            <div className="text-base font-extrabold text-white font-mono">
              {formatHoursMinutes(sleepMetrics.lightSleepMinutes)}
            </div>
            <div className="text-[10px] text-neutral-400 leading-tight">
              Fusos de sono · Queda térmica e desaceleração do metabolismo basal.
            </div>
          </div>

          {/* Awake Card */}
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300">Acordado</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                {awakePct}%
              </span>
            </div>
            <div className="text-base font-extrabold text-white font-mono">
              {formatHoursMinutes(sleepMetrics.awakeMinutes)}
            </div>
            <div className="text-[10px] text-neutral-400 leading-tight">
              Microdespertares normais durante transições de ciclos circadianos.
            </div>
          </div>
        </div>

        {/* Bio-Telemetry Pills (HRV & Resting HR) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-neutral-850">
          <div className="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-xs">
              <span className="text-neutral-400">FC Média em Repouso: </span>
              <span className="text-white font-bold font-mono">{sleepMetrics.averageHeartRateBpm} bpm</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="text-neutral-400">VFC (HRV Noturna): </span>
              <span className="text-white font-bold font-mono">{sleepMetrics.restingHrvMs} ms</span>{" "}
              <span className="text-[10px] text-emerald-400 font-medium">(Parassimpático Ativo)</span>
            </div>
          </div>
        </div>

        {/* Quick Scenario Simulator */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-850 text-xs text-neutral-400 flex-wrap gap-2">
          <span className="text-[11px] flex items-center gap-1 text-neutral-300">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simular resposta fisiológica:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSimulateScenario("high_deep")}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                sleepMetrics.deepSleepMinutes >= 90
                  ? "bg-cyan-500 text-neutral-950"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              }`}
            >
              Ótimo (105m)
            </button>
            <button
              onClick={() => handleSimulateScenario("medium_deep")}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                sleepMetrics.deepSleepMinutes >= 60 && sleepMetrics.deepSleepMinutes < 90
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              }`}
            >
              Médio (70m)
            </button>
            <button
              onClick={() => handleSimulateScenario("low_deep")}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                sleepMetrics.deepSleepMinutes < 60
                  ? "bg-rose-500 text-white"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              }`}
            >
              Curto (42m)
            </button>
          </div>
        </div>
      </div>

      {/* AI Deep Sleep Load Calibration Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-lg relative overflow-hidden transition-all ${
          loadAdjustment.status === "excelente"
            ? "bg-cyan-950/20 border-cyan-500/40 shadow-cyan-500/5"
            : loadAdjustment.status === "adequado"
            ? "bg-neutral-950 border-neutral-800"
            : "bg-rose-950/20 border-rose-500/40 shadow-rose-500/5"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                loadAdjustment.status === "excelente"
                  ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                  : loadAdjustment.status === "adequado"
                  ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Calibração de Carga por Sono Profundo (IA FORZON)</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Ajuste biomecânico prescrito com base no reparo miofibrilar noturno
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                loadAdjustment.status === "excelente"
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                  : loadAdjustment.status === "adequado"
                  ? "bg-neutral-800 border-neutral-700 text-neutral-300"
                  : "bg-rose-500/15 border-rose-500/40 text-rose-300"
              }`}
            >
              {loadAdjustment.status === "excelente"
                ? "+5% Carga (Modo PR)"
                : loadAdjustment.status === "adequado"
                ? "Manter Carga Padrão"
                : "-12% Carga (Deload SNC)"}
            </span>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
          {loadAdjustment.explanation}
        </p>

        {/* Action Button & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-neutral-400">Faixa de RPE: </span>
              <span className="text-white font-bold">{loadAdjustment.targetRpeRange}</span>
            </div>
            <span>·</span>
            <div>
              <span className="text-neutral-400">Volume: </span>
              <span className="text-emerald-400 font-bold">
                {loadAdjustment.volumeSetsAdjustment === 0
                  ? "Volume Completo"
                  : `${loadAdjustment.volumeSetsAdjustment} Série`}
              </span>
            </div>
          </div>

          <button
            onClick={handleApplyAdjustment}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              loadAdjustment.applied
                ? "bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300"
                : "bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black shadow-cyan-500/20"
            }`}
          >
            {loadAdjustment.applied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ajuste Aplicado ao Próximo Treino (Clique para Reverter)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Aplicar Calibração de Carga ao Próximo Treino</span>
              </>
            )}
          </button>
        </div>

        {appliedSuccess && (
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 animate-fade-in pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sobrecarga do treino de amanhã calibrada com sucesso no motor da periodização!</span>
          </div>
        )}
      </div>

      {/* Connected Fitness Platforms Grid */}
      <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Dispositivos & Apps Conectados</div>
              <div className="text-[11px] text-neutral-400">
                Sincronização contínua com Apple Watch, Strava, Zepp OS, WearOS e Garmin
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-mono">
              {platforms.filter((p) => p.connected).length} de {platforms.length} ativos
            </span>
          </div>
        </div>

        {/* Platforms List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {platforms.map((plat) => {
            return (
              <div
                key={plat.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  plat.connected
                    ? "bg-neutral-900/90 border-neutral-750 shadow-sm"
                    : "bg-neutral-900/40 border-neutral-850 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        plat.connected
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {plat.id === "apple_watch" && <Watch className="w-4 h-4" />}
                      {plat.id === "strava" && <Flame className="w-4 h-4 text-orange-400" />}
                      {plat.id === "zepp_os" && <Zap className="w-4 h-4 text-amber-400" />}
                      {plat.id === "wearos" && <Smartphone className="w-4 h-4 text-cyan-400" />}
                      {plat.id === "garmin" && <Activity className="w-4 h-4 text-blue-400" />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{plat.name}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {plat.displayName} {plat.batteryPercent ? `· ${plat.batteryPercent}% bat` : ""}
                      </div>
                    </div>
                  </div>

                  {/* Connect / Disconnect Toggle Button */}
                  <button
                    onClick={() => handleTogglePlatform(plat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                      plat.connected
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-300"
                        : "bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600"
                    }`}
                  >
                    {plat.connected ? "Conectado" : "Conectar"}
                  </button>
                </div>

                {/* Telemetry / Supported Data Tags */}
                <div className="flex flex-wrap gap-1">
                  {plat.supportedData.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-300 border border-neutral-750"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Last sync info */}
                {plat.connected && plat.lastSyncedAt && (
                  <div className="text-[9px] text-neutral-500 font-mono flex items-center justify-between border-t border-neutral-800/80 pt-1.5">
                    <span>Último sync: {new Date(plat.lastSyncedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-emerald-400 font-medium">Bridge Ativa</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

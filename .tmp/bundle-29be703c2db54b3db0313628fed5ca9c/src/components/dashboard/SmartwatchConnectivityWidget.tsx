import React, { useState, useEffect } from "react";
import {
  Watch,
  Activity,
  Heart,
  BatteryCharging,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Radio,
  Flame,
  Footprints,
  Compass,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Moon,
} from "lucide-react";
import {
  smartwatchConnectivity,
  SmartwatchConnectivityService,
} from "../../infrastructure/smartwatch/smartwatchConnectivityService";
import {
  SmartwatchConnectionInfo,
  SmartwatchPlatformId,
} from "../../infrastructure/smartwatch/types";

interface SmartwatchConnectivityWidgetProps {
  onOpenDetailsModal?: () => void;
}

export const SmartwatchConnectivityWidget: React.FC<SmartwatchConnectivityWidgetProps> = ({
  onOpenDetailsModal,
}) => {
  const [connections, setConnections] = useState<SmartwatchConnectionInfo[]>(() =>
    smartwatchConnectivity.getAllConnections()
  );
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingPlatformId, setSyncingPlatformId] = useState<SmartwatchPlatformId | null>(null);
  const [lastSyncBanner, setLastSyncBanner] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = smartwatchConnectivity.subscribe((updated) => {
      setConnections([...updated]);
    });
    return () => unsubscribe();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const res = await smartwatchConnectivity.syncAll();
      setLastSyncBanner(
        `Sincronização Unificada: ${res.syncedPlatforms} ecossistemas atualizados (${res.totalActivities} novas atividades).`
      );
      setTimeout(() => setLastSyncBanner(null), 5000);
    } catch {
      setLastSyncBanner("Erro na sincronização dos smartwatches.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleSyncSingle = async (platformId: SmartwatchPlatformId) => {
    setSyncingPlatformId(platformId);
    try {
      const res = await smartwatchConnectivity.syncPlatform(platformId);
      setLastSyncBanner(
        `Dispositivo ${platformId.toUpperCase()} sincronizado com sucesso (${res.activitiesCount} atividades).`
      );
      setTimeout(() => setLastSyncBanner(null), 4000);
    } catch {
      setLastSyncBanner(`Falha ao sincronizar ${platformId}.`);
    } finally {
      setSyncingPlatformId(null);
    }
  };

  const handleToggleConnection = async (platformId: SmartwatchPlatformId, currentStatus: string) => {
    if (currentStatus === "connected") {
      await smartwatchConnectivity.disconnectPlatform(platformId);
    } else {
      await smartwatchConnectivity.connectPlatform(platformId);
    }
  };

  const connectedCount = connections.filter((c) => c.status === "connected").length;

  return (
    <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>INFRAESTRUTURA SMARTWATCH UNIFICADA</span>
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {connectedCount} de {connections.length} ativos
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Watch className="w-5 h-5 text-cyan-400" />
            <span>Conectividade Wearables: Strava, Zepp OS & HealthKit</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            title="Sincronizar telemetria e treinos de todos os relógios conectados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin text-cyan-400" : ""}`} />
            <span>{isSyncingAll ? "Sincronizando..." : "Sincronizar Todos"}</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {lastSyncBanner && (
        <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{lastSyncBanner}</span>
        </div>
      )}

      {/* Grid of Integrated Adapters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {connections.map((conn) => {
          const isConnected = conn.status === "connected";
          const isSyncing = conn.status === "syncing" || syncingPlatformId === conn.platformId;

          // Theme colors
          const brandStyle =
            conn.platformId === "strava"
              ? { border: "border-orange-500/30", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", glow: "text-orange-400" }
              : conn.platformId === "zepp_os"
              ? { border: "border-emerald-500/30", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", glow: "text-emerald-400" }
              : { border: "border-cyan-500/30", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", glow: "text-cyan-400" };

          return (
            <div
              key={conn.platformId}
              className={`rounded-2xl p-4 bg-neutral-950 border transition-all ${
                isConnected ? brandStyle.border : "border-neutral-800 opacity-80"
              } space-y-3.5 flex flex-col justify-between`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${brandStyle.badge}`}>
                    {conn.platformId === "strava" ? "Strava V3" : conn.platformId === "zepp_os" ? "Zepp OS" : "Apple HealthKit"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-neutral-500">Desconectado</span>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="font-bold text-white text-sm">{conn.name}</h3>
                  <p className="text-[11px] text-neutral-400 font-mono truncate">{conn.telemetry.deviceName}</p>
                </div>
              </div>

              {/* Live Telemetry Pill Board */}
              {isConnected && (
                <div className="grid grid-cols-2 gap-2 bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800/80 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <div>
                      <div className="text-[10px] text-neutral-500 leading-tight">Cardíaco</div>
                      <div className="font-bold text-white">{conn.telemetry.heartRateBpm} bpm</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-neutral-500 leading-tight">HRV (VFC)</div>
                      <div className="font-bold text-white">{conn.telemetry.hrvMs} ms</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <div className="text-[10px] text-neutral-500 leading-tight">Passos</div>
                      <div className="font-bold text-white">{conn.telemetry.stepCount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-neutral-500 leading-tight">Bateria</div>
                      <div className="font-bold text-white">{conn.telemetry.batteryLevelPct}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 border-t border-neutral-800/60 pt-3 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleConnection(conn.platformId, conn.status)}
                  className={`text-[11px] font-semibold transition-colors cursor-pointer ${
                    isConnected ? "text-neutral-400 hover:text-rose-400" : "text-cyan-400 hover:text-cyan-300"
                  }`}
                >
                  {isConnected ? "Desconectar" : "Conectar API"}
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={() => handleSyncSingle(conn.platformId)}
                    disabled={isSyncing}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
                    <span>{isSyncing ? "Sync..." : "Sincronizar"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Protocol footnote & capability badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400 pt-1 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sincronização bidirecional: Hidratação WearOS, Ciclos de Sono Zepp OS e Segmentos Strava.</span>
        </div>
        <div className="text-neutral-500">
          Infraestrutura: Mock & Real API Handshake Layer v2.1
        </div>
      </div>
    </div>
  );
};

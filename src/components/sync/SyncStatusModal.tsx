import React, { useState, useEffect } from "react";
import {
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock,
  Dumbbell,
  Database,
  ArrowRight,
} from "lucide-react";
import { storage } from "../../services/storage";
import { OfflineSyncQueueItem, SyncState } from "../../types";

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({ isOpen, onClose }) => {
  const [syncState, setSyncState] = useState<SyncState>(() => storage.getSyncState());
  const [queue, setQueue] = useState<OfflineSyncQueueItem[]>(() => storage.getOfflineQueue());
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() =>
    storage.isSimulatedOffline()
  );
  const [manualSyncLoading, setManualSyncLoading] = useState(false);
  const [syncFeedbackMessage, setSyncFeedbackMessage] = useState<string | null>(null);

  const refreshData = () => {
    setSyncState(storage.getSyncState());
    setQueue(storage.getOfflineQueue());
    setIsSimulatedOffline(storage.isSimulatedOffline());
  };

  useEffect(() => {
    if (!isOpen) return;

    refreshData();

    const handleSyncStatus = (e: Event) => {
      const custom = e as CustomEvent<SyncState>;
      if (custom.detail) {
        setSyncState(custom.detail);
        setQueue(storage.getOfflineQueue());
        setIsSimulatedOffline(storage.isSimulatedOffline());
      }
    };

    const handleDataChange = () => {
      refreshData();
    };

    window.addEventListener("athlynx_sync_status", handleSyncStatus);
    window.addEventListener("athlynx_data_change", handleDataChange);

    return () => {
      window.removeEventListener("athlynx_sync_status", handleSyncStatus);
      window.removeEventListener("athlynx_data_change", handleDataChange);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSimulatedOffline = () => {
    const next = !isSimulatedOffline;
    setIsSimulatedOffline(next);
    storage.setSimulatedOffline(next);
    setSyncFeedbackMessage(
      next
        ? "Modo Offline simulado ativado. Novos treinos serão salvos no cache local."
        : "Conexão restabelecida! Sincronizando dados em cache com o servidor..."
    );
    setTimeout(() => setSyncFeedbackMessage(null), 4000);
  };

  const handleManualSync = async () => {
    setManualSyncLoading(true);
    setSyncFeedbackMessage(null);
    try {
      const result = await storage.syncPendingWorkouts();
      if (result.success) {
        setSyncFeedbackMessage(
          result.syncedCount > 0
            ? `Sucesso: ${result.syncedCount} treino(s) sincronizado(s) com a nuvem!`
            : "Todos os treinos já estão 100% atualizados na nuvem."
        );
      } else {
        setSyncFeedbackMessage(`Aviso: ${result.error || "Não foi possível conectar ao servidor."}`);
      }
    } catch (err: any) {
      setSyncFeedbackMessage(`Erro ao sincronizar: ${err?.message || "Erro de rede"}`);
    } finally {
      setManualSyncLoading(false);
      refreshData();
      setTimeout(() => setSyncFeedbackMessage(null), 5000);
    }
  };

  const isOnline = syncState.isOnline;
  const pendingCount = queue.filter((item) => item.syncStatus !== "synced").length;
  const syncedCount = queue.filter((item) => item.syncStatus === "synced").length;

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-2xl animate-scale-up my-auto max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                !isOnline
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {!isOnline ? <CloudOff className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Camada de Cache & Sincronização
              </h2>
              <div className="text-xs text-neutral-400 font-mono">
                Resiliência Offline & Integridade de Treinos
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connectivity Status Card */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  !isOnline ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
              />
              <div>
                <div className="text-xs font-bold text-white">
                  {!isOnline ? "Modo Offline (Sem Conexão)" : "Online — Conectado ao Servidor"}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {!isOnline
                    ? "Treinos são retidos com segurança no cache local."
                    : "Sincronização bidirecional em tempo real ativa."}
                </div>
              </div>
            </div>

            {/* Offline Simulation Switch */}
            <button
              onClick={handleToggleSimulatedOffline}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSimulatedOffline
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
              }`}
              title="Permite testar o comportamento de registro e auto-sincronização offline"
            >
              {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isSimulatedOffline ? "Simulação Offline Ativa" : "Simular Offline"}</span>
            </button>
          </div>

          {/* Sync Pill Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-900 text-center">
            <div className="bg-neutral-900/60 p-2 rounded-xl">
              <div className="text-[10px] text-neutral-500 uppercase">Em Buffer Cache</div>
              <div
                className={`text-sm font-bold font-mono ${
                  pendingCount > 0 ? "text-amber-400" : "text-white"
                }`}
              >
                {pendingCount} treinos
              </div>
            </div>
            <div className="bg-neutral-900/60 p-2 rounded-xl">
              <div className="text-[10px] text-neutral-500 uppercase">Sincronizados</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">{syncedCount}</div>
            </div>
            <div className="bg-neutral-900/60 p-2 rounded-xl">
              <div className="text-[10px] text-neutral-500 uppercase">Último Sync</div>
              <div className="text-[11px] font-bold text-neutral-300 font-mono truncate">
                {syncState.lastSyncedAt
                  ? new Date(syncState.lastSyncedAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "Recentemente"}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {syncFeedbackMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{syncFeedbackMessage}</span>
          </div>
        )}

        {/* Integrity Guarantee Banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-[11px] shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-neutral-300 leading-relaxed">
            <span className="font-semibold text-white">Garantia de Integridade de Dados: </span>
            Cada treino finalizado recebe uma assinatura criptográfica de integridade (*checksum*) antes de entrar no cache, prevenindo perdas ou corrupção de dados caso o navegador feche ou ocorram quedas de sinal.
          </div>
        </div>

        {/* Queue Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px]">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium px-1">
            <span>Fila de Treinos & Cache Local ({queue.length})</span>
            {pendingCount > 0 && (
              <span className="text-amber-400 text-[11px] font-mono">
                {pendingCount} aguardando envio
              </span>
            )}
          </div>

          {queue.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-950 rounded-2xl border border-neutral-800/60 space-y-1">
              <Database className="w-6 h-6 mx-auto text-neutral-600 mb-2" />
              <div className="text-neutral-400 font-medium">Nenhum treino na fila de cache</div>
              <div>Quando você completar um treino offline, ele aparecerá aqui com garantia de integridade.</div>
            </div>
          ) : (
            queue.map((item) => {
              const dateFormatted = new Date(item.queuedAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const isItemSynced = item.syncStatus === "synced";

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isItemSynced
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white tracking-tight truncate max-w-[190px] sm:max-w-[260px]">
                        {item.record.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                        <span>{item.record.totalVolumeKg.toLocaleString()} kg</span>
                        <span>·</span>
                        <span>{item.record.totalSets} séries</span>
                        <span>·</span>
                        <span className="font-mono text-[10px] text-neutral-500">
                          {item.checksum}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        isItemSynced
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.syncStatus === "syncing"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {isItemSynced ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sincronizado</span>
                        </>
                      ) : item.syncStatus === "syncing" ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Sincronizando...</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Em Cache</span>
                        </>
                      )}
                    </span>
                    <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                      {dateFormatted}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-neutral-800 pt-3 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => storage.clearOfflineQueue()}
            disabled={queue.length === 0}
            className="text-xs text-neutral-500 hover:text-neutral-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Limpar Histórico de Sync
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={manualSyncLoading || syncState.isSyncing || !isOnline}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${manualSyncLoading || syncState.isSyncing ? "animate-spin" : ""}`}
              />
              <span>
                {manualSyncLoading || syncState.isSyncing
                  ? "Sincronizando..."
                  : "Sincronizar Agora"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

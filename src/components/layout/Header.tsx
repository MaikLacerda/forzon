import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Settings,
  Dumbbell,
  User,
  Bell,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  WifiOff,
  RefreshCw,
  Palette,
  Crown,
  Download,
  Bot,
} from "lucide-react";
import { UserProfile, ThemeMode, SyncState, AccentColor } from "../../types";
import { themeService, AVAILABLE_ACCENTS } from "../../services/themeService";
import { storage } from "../../services/storage";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLiveWorkout: () => void;
  onOpenCoach: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onOpenReminderModal?: () => void;
  onOpenSyncModal?: () => void;
  onOpenUpgradeModal?: () => void;
  onOpenDownloadModal?: () => void;
  onOpenAIIntake?: () => void;
  profile: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLiveWorkout,
  onOpenCoach,
  onOpenSettings,
  onOpenOnboarding,
  onOpenAuth,
  onOpenProfile,
  onOpenReminderModal,
  onOpenSyncModal,
  onOpenUpgradeModal,
  onOpenDownloadModal,
  onOpenAIIntake,
  profile,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => themeService.getTheme());
  const [accent, setAccent] = useState<AccentColor>(() => themeService.getAccent());
  const [syncState, setSyncState] = useState<SyncState>(() => storage.getSyncState());

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ theme: ThemeMode }>;
      if (custom.detail?.theme) {
        setCurrentTheme(custom.detail.theme);
      }
    };

    const accentHandler = (e: Event) => {
      const custom = e as CustomEvent<{ accent: AccentColor }>;
      if (custom.detail?.accent) {
        setAccent(custom.detail.accent);
      }
    };

    const syncHandler = (e: Event) => {
      const custom = e as CustomEvent<SyncState>;
      if (custom.detail) {
        setSyncState(custom.detail);
      } else {
        setSyncState(storage.getSyncState());
      }
    };

    const dataHandler = () => {
      setSyncState(storage.getSyncState());
    };

    window.addEventListener("athlynx_theme_change", handler);
    window.addEventListener("athlynx_accent_change", accentHandler);
    window.addEventListener("athlynx_sync_status", syncHandler);
    window.addEventListener("athlynx_data_change", dataHandler);

    return () => {
      window.removeEventListener("athlynx_theme_change", handler);
      window.removeEventListener("athlynx_accent_change", accentHandler);
      window.removeEventListener("athlynx_sync_status", syncHandler);
      window.removeEventListener("athlynx_data_change", dataHandler);
    };
  }, []);

  const handleToggleTheme = () => {
    const next = themeService.toggleTheme();
    setCurrentTheme(next);
  };

  const handleCycleAccent = () => {
    const accents: AccentColor[] = ["neon-blue", "cobalt-blue", "ultra-violet", "hyper-orange", "neon-green"];
    const currentIndex = accents.indexOf(accent);
    const next = accents[(currentIndex + 1) % accents.length];
    themeService.setAccent(next);
  };

  return (
    <header className="app-header sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-14 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Zone 1: Brand Wordmark (FORZON) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("hoje")}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-400/50 shadow-md shadow-cyan-500/25 bg-neutral-950 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/forzon-logo.jpg"
                alt="FORZON Logo"
                className="w-full h-full object-cover scale-125"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider text-white whitespace-nowrap shrink-0 flex items-center leading-none">
                FOR<span className="text-cyan-400">Z</span>ON<span className="text-cyan-400">.</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase mt-0.5">
                FITNESS COMMUNITY
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop Clean Nav Links */}
        <nav aria-label="Navegação principal" className="order-last hidden w-full min-w-0 md:flex flex-wrap items-center gap-x-5 gap-y-2 py-2 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab("hoje")}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "hoje" ? "text-cyan-400 font-semibold" : "hover:text-white"
            }`}
          >
            Painel Geral
          </button>
          <button
            onClick={() => setActiveTab("treinos")}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "treinos" ? "text-cyan-400 font-semibold" : "hover:text-white"
            }`}
          >
            Treinos & Cargas
          </button>
          <button
            onClick={() => setActiveTab("nutricao")}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "nutricao" ? "text-cyan-400 font-semibold" : "hover:text-white"
            }`}
          >
            Nutrição & Macros
          </button>
          <button
            onClick={() => setActiveTab("gps")}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "gps" ? "text-cyan-400 font-semibold" : "hover:text-white"
            }`}
          >
            GPS Outdoor
          </button>
          <button
            onClick={() => setActiveTab("comunidade")}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "comunidade" ? "text-cyan-400 font-semibold" : "hover:text-white"
            }`}
          >
            Comunidade & Desafios
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Utility Shortcuts */}
        <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5 sm:ml-auto sm:w-auto sm:flex-1 sm:justify-end">
          {/* Subscription Tier & Paywall Pill */}
          {onOpenUpgradeModal && (
            profile.isPremium ? (
              <button
                onClick={() => onOpenUpgradeModal()}
                aria-label="Gerenciar plano FORZON Pro"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/10"
                title="Plano FORZON Pro Ativo (100% Livre de Anúncios) · Gerenciar Assinatura"
              >
                <Crown className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                <span className="hidden md:inline text-[11px]">FORZON PRO</span>
                <span className="md:hidden text-[10px]">PRO</span>
                <span className="hidden md:inline text-[10px] text-cyan-400 font-mono">★</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenUpgradeModal()}
                aria-label="Seja Pro"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-amber-500/10"
                title="Plano Free com Anúncios ativo · Clique para assinar o FORZON Pro e desbloquear tudo sem anúncios"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">FREE (COM ANÚNCIOS)</span>
                <span className="px-1 py-0.5 rounded bg-amber-400 text-neutral-950 text-[9px] font-black font-mono">SEJA PRO</span>
              </button>
            )
          )}

          {onOpenAIIntake && (
            <button
              onClick={onOpenAIIntake}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/10"
              title="Entrevista com IA para montar Treino e Dieta sob medida"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Montar Treino & Dieta</span>
              <span className="sm:hidden text-[10px]">IA</span>
            </button>
          )}

          <button
            onClick={onOpenCoach}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-200 hover:border-cyan-500/50 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Abrir Assistente de IA FORZON"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Coach IA</span>
          </button>

          <button
            onClick={onOpenLiveWorkout}
            className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs tracking-wide transition-all shadow-sm shadow-cyan-500/20 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Iniciar Treino</span><span className="sm:hidden">Treinar</span>
          </button>

          {/* Offline Cache & Sync Status Pill */}
          {onOpenSyncModal && (
            <button
              onClick={onOpenSyncModal}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                !syncState.isOnline
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                  : syncState.isSyncing
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : syncState.pendingCount > 0
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "text-neutral-400 hover:text-emerald-400 hover:bg-neutral-900 border-transparent"
              }`}
              title={
                !syncState.isOnline
                  ? `Modo Offline (${syncState.pendingCount} treinos em cache)`
                  : syncState.isSyncing
                  ? "Sincronizando treinos com o servidor..."
                  : syncState.pendingCount > 0
                  ? `${syncState.pendingCount} treinos aguardando sincronização`
                  : "Nuvem Sincronizada (Cache Ativo)"
              }
              aria-label="Status de sincronização e cache offline"
            >
              {syncState.isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              ) : !syncState.isOnline ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  {syncState.pendingCount > 0 && (
                    <span className="text-[10px] font-bold font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                      {syncState.pendingCount}
                    </span>
                  )}
                </>
              ) : syncState.pendingCount > 0 ? (
                <>
                  <CloudOff className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-bold font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                    {syncState.pendingCount}
                  </span>
                </>
              ) : (
                <Cloud className="w-4 h-4 text-cyan-400 hover:text-cyan-300" />
              )}
            </button>
          )}

          {onOpenReminderModal && (
            <button
              onClick={onOpenReminderModal}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-400 hover:bg-neutral-900 transition-colors cursor-pointer"
              title="Lembretes de Treino & Notificações Push"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleToggleTheme}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title={
              currentTheme === "dark"
                ? "Mudar para Tema Claro (Alto Contraste)"
                : "Mudar para Tema Escuro (Padrão)"
            }
            aria-label="Alternar tema visual"
          >
            {currentTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-500 hover:text-cyan-600" />
            )}
          </button>

          <button
            onClick={handleCycleAccent}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer group relative"
            title={`Alternar Cor Neon / Paleta de Impacto (Atual: ${AVAILABLE_ACCENTS.find(a => a.id === accent)?.label || 'Azul Neon'})`}
            aria-label="Alternar cor neon de destaque"
          >
            <Palette className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </button>

          {onOpenDownloadModal && (
            <button
              onClick={onOpenDownloadModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shadow-cyan-500/10"
              title="Baixar Arquivos para Substituir nas Pastas / Google Play Store"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline text-[11px] font-mono">BAIXAR ARQUIVOS</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Configurações e Privacidade LGPD"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenProfile || onOpenAuth}
            className="w-7 h-7 rounded-full overflow-hidden border border-neutral-800 hover:border-cyan-500 transition-colors flex items-center justify-center bg-neutral-900 cursor-pointer relative"
            title={`Perfil do Atleta & Conquistas — ${profile.name}`}
          >
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // styled fallback container
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

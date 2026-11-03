import React, { useState, useEffect } from "react";
import { X, Shield, Download, Trash2, RotateCcw, Lock, CheckCircle2, Bell, Clock, Send, Volume2, Sun, Moon, Contrast, Check, Palette, Smartphone } from "lucide-react";
import { UserProfile, NotificationSettings, ThemeMode, AccentColor } from "../../types";
import { storage } from "../../services/storage";
import { notificationService } from "../../services/notificationService";
import { themeService, AVAILABLE_ACCENTS } from "../../services/themeService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}


export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => themeService.getTheme());
  const [accent, setAccentState] = useState<AccentColor>(() => themeService.getAccent());
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() =>
    notificationService.getSettings()
  );
  const [testSent, setTestSent] = useState(false);

  // Sync theme and accent with custom events if altered externally
  React.useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<{ theme: ThemeMode }>;
      if (custom.detail?.theme) {
        setThemeState(custom.detail.theme);
      }
    };
    const handleAccentChange = (e: Event) => {
      const custom = e as CustomEvent<{ accent: AccentColor }>;
      if (custom.detail?.accent) {
        setAccentState(custom.detail.accent);
      }
    };
    window.addEventListener("athlynx_theme_change", handleThemeChange);
    window.addEventListener("athlynx_accent_change", handleAccentChange);
    return () => {
      window.removeEventListener("athlynx_theme_change", handleThemeChange);
      window.removeEventListener("athlynx_accent_change", handleAccentChange);
    };
  }, []);

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    themeService.setTheme(newTheme);
  };

  const handleSelectAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    themeService.setAccent(newAccent);
  };

  const handleDownloadData = () => {
    const jsonStr = storage.exportUserDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `athlynx-export-${profile.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTogglePrivacy = () => {
    const updated = { ...profile, gpsPrivacyCloaking: !profile.gpsPrivacyCloaking };
    onUpdateProfile(updated);
  };

  const handleToggleNotif = () => {
    const updated = { ...notifSettings, enabled: !notifSettings.enabled };
    setNotifSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...notifSettings, reminderTime: time };
    setNotifSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleSendTest = () => {
    notificationService.sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Privacidade & Configurações</h2>
              <div className="text-xs text-neutral-400 font-mono">Conformidade LGPD FORZON</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Section: Aparência & Tema (Dark vs Claro Alto Contraste) */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <Contrast className="w-4 h-4 text-emerald-400" />
                <span>Aparência & Tema da Interface</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700/60 text-neutral-400">
                Salvo no Navegador
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Alterne entre o tema escuro padrão para imersão e menor cansaço visual ou o tema claro de alto contraste (WCAG AAA) com fundo branco puro e contraste ampliado para luz solar intensa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Option: Dark Theme */}
              <button
                type="button"
                onClick={() => handleSelectTheme("dark")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                  theme === "dark"
                    ? "bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md"
                    : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <Moon className="w-4 h-4 text-emerald-400" />
                    <span>Tema Escuro</span>
                  </div>
                  {theme === "dark" ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-950">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-neutral-700" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Design escuro original FORZON. Baixo brilho e alto foco para academia e ambientes controlados.
                </p>
                <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-800/80">
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-950 border border-neutral-700 inline-block" title="Fundo #09090b" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700 inline-block" title="Superfície #171717" />
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block" title="Acento #10b981" />
                  <span className="text-[10px] text-neutral-500 font-mono ml-auto">Padrão</span>
                </div>
              </button>

              {/* Option: Light High Contrast Theme */}
              <button
                type="button"
                onClick={() => handleSelectTheme("light-hc")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                  theme === "light-hc"
                    ? "bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md"
                    : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Claro Alto Contraste</span>
                  </div>
                  {theme === "light-hc" ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-neutral-700" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Fundo branco puro, bordas nítidas e textos pretos com máxima distinção sob o sol e acessibilidade.
                </p>
                <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-800/80">
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-neutral-400 inline-block" title="Fundo #ffffff" />
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-900 inline-block" title="Texto #020617" />
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 inline-block" title="Acento #047857" />
                  <span className="text-[10px] text-emerald-400 font-mono font-bold ml-auto">WCAG AAA</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section: Seletor de Temas (Theme Switcher) */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>Seletor de Temas (Theme Switcher)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700/60 text-emerald-400 font-semibold">
                  data-accent="{accent}"
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700/60 text-neutral-400">
                  localStorage
                </span>
              </div>
            </div>
            <p className="text-neutral-400 leading-relaxed text-xs">
              Alterne dinamicamente entre as paletas de cores definidas no <code className="text-neutral-200 bg-neutral-900 px-1 py-0.5 rounded font-mono text-[11px]">index.css</code>. O seletor atualiza o atributo <code className="text-emerald-400 font-mono text-[11px]">data-accent</code> no elemento <code className="text-neutral-200 font-mono text-[11px]">&lt;html&gt;</code> e salva sua preferência no <code className="text-neutral-200 font-mono text-[11px]">localStorage</code>.
            </p>

            {/* Live Preview Bar */}
            <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-neutral-400">Prévia Ativa:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                    style={{
                      backgroundColor: AVAILABLE_ACCENTS.find((a) => a.id === accent)?.hex,
                      boxShadow: `0 0 8px ${AVAILABLE_ACCENTS.find((a) => a.id === accent)?.glow}`,
                    }}
                  />
                  {AVAILABLE_ACCENTS.find((a) => a.id === accent)?.label}
                </span>
                <span className="font-mono text-neutral-500 text-[10px]">
                  ({AVAILABLE_ACCENTS.find((a) => a.id === accent)?.hex})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-neutral-950">
                  Botão de Ação
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  100%
                </span>
              </div>
            </div>

            {/* Grid of 5 Color Palettes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {AVAILABLE_ACCENTS.map((opt) => {
                const isSelected = accent === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectAccent(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md"
                        : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                        style={{
                          backgroundColor: opt.hex,
                          boxShadow: isSelected ? `0 0 10px ${opt.glow}` : "none",
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="truncate">{opt.label}</span>
                          {opt.id === "neon-blue" && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                              Padrão
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {opt.tagline}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-950 shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Push Notifications & Workout Reminders */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Lembretes de Treino (Push Web)</span>
              </div>
              <button
                onClick={handleToggleNotif}
                className={`px-3 py-1 rounded-lg font-bold font-mono transition-colors cursor-pointer ${
                  notifSettings.enabled
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {notifSettings.enabled ? "ATIVADO" : "DESATIVADO"}
              </button>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Agende notificações automáticas no navegador para manter a sequência do plano e nunca perder o horário do treino.
            </p>
            {notifSettings.enabled && (
              <div className="space-y-2.5 pt-1 border-t border-neutral-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Horário Diário:</span>
                  </div>
                  <input
                    type="time"
                    value={notifSettings.reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-white font-mono text-xs px-2.5 py-1 rounded-md focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Sinal Sonoro de Treino:</span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = { ...notifSettings, soundEnabled: !notifSettings.soundEnabled };
                      setNotifSettings(updated);
                      notificationService.saveSettings(updated);
                    }}
                    className="text-neutral-400 hover:text-white font-mono text-[11px]"
                  >
                    {notifSettings.soundEnabled ? "Ativado" : "Desativado"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSendTest}
                  className="w-full py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3 text-emerald-400" />
                  <span>{testSent ? "Disparado com Sucesso!" : "Disparar Lembrete de Teste"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: GPS and Location Privacy */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Proteção de Localização e Rotas (Geofence)</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Oculta automaticamente um raio de 500 metros em torno do seu ponto de partida e chegada para preservar a privacidade residencial em compartilhamentos públicos.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-neutral-300 font-medium">Camada de Anonimização GPS:</span>
              <button
                onClick={handleTogglePrivacy}
                className={`px-3 py-1.5 rounded-lg font-bold font-mono transition-colors cursor-pointer ${
                  profile.gpsPrivacyCloaking
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {profile.gpsPrivacyCloaking ? "ATIVADA" : "DESATIVADA"}
              </button>
            </div>
          </div>

          {/* Section: LGPD Data Portability */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Exportar Dados Pessoais (Portabilidade)</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Baixe um arquivo JSON com todo o seu histórico: treinos, séries registradas, fotos, medidas corporais, plano nutricional e rotas outdoor.
            </p>
            <button
              onClick={handleDownloadData}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Baixar Arquivo Completo (JSON)</span>
            </button>
          </div>

          {/* Section: Google Play Store & TWA PWA Architecture */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="font-bold text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Google Play Store · Trusted Web Activity (TWA)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Play Store Ready
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              O código da aplicação FORZON está 100% formatado e validado segundo as diretrizes de publicação do Google Play Console:
            </p>
            <div className="space-y-1.5 text-[11px] font-mono bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Package Name:</span>
                <span className="text-cyan-400 font-bold">com.forzon.fitness.app</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Digital Asset Links:</span>
                <span className="text-emerald-400">/.well-known/assetlinks.json</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Web App Manifest:</span>
                <span className="text-emerald-400">/manifest.webmanifest</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Modo de Exibição:</span>
                <span className="text-cyan-300">standalone (sem barra de URL)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Ícones Android:</span>
                <span className="text-emerald-400">192x192, 512x512 maskable</span>
              </div>
            </div>
          </div>

          {/* Reset App Data */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Restaurar Dados de Fábrica / Demonstração</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Recarrega os treinos, posts da comunidade e estatísticas iniciais da plataforma FORZON.
            </p>
            <button
              onClick={() => {
                if (confirm("Deseja restaurar os dados iniciais do FORZON?")) {
                  storage.resetAll();
                  window.location.reload();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium border border-neutral-800 transition-colors cursor-pointer"
            >
              Restaurar Demonstração
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-[11px] text-neutral-500 font-mono">
          FORZON v1.0.0 · More Than Fitness. A Way of Life.
        </div>
      </div>
    </div>
  );
};

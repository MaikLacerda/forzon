import React, { useState } from "react";
import { Dumbbell, Apple, Users, Download, Smartphone, ShieldCheck } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

interface ForzonBrandBannerProps {
  onNavigateTab: (tab: string) => void;
}

export const ForzonBrandBanner: React.FC<ForzonBrandBannerProps> = ({ onNavigateTab }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);
  const [, setInstallSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      setShowPlayStoreModal(true);
    }
  };

  return (
    <div className="w-full">
      {/* Brand Positioning Card — FORZON Design System */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900/95 via-neutral-950 to-neutral-950 border border-cyan-500/30 shadow-2xl shadow-cyan-950/30 backdrop-blur-md">
        {/* Ambient Cyan / Neon Blue Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* Header Row: Logo & Brand Wordmark + Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* FORZON Official App Icon Image */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/25 bg-neutral-950 shrink-0 group">
                <img
                  src="/forzon-logo.jpg"
                  alt="FORZON Logo"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-cyan-400/30 rounded-2xl pointer-events-none" />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black tracking-wider text-white font-sans flex items-center">
                    FOR<span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">Z</span>ON
                  </span>
                  <span className="hidden sm:inline-block h-4 w-px bg-neutral-800" />
                  <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-400">
                    ATHLETIC INTELLIGENCE
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Official Fitness Platform · Google Play Package: <span className="text-cyan-400">com.forzon.fitness.app</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-wider text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
                FITNESS COMMUNITY
              </span>
            </div>
          </div>

          {/* Slogan & Value Proposition (User specified) */}
          <div className="space-y-1 sm:space-y-1.5 mb-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase leading-none">
              MORE THAN FITNESS.
            </h2>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-cyan-400 uppercase leading-none drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]">
              A WAY OF LIFE.
            </h2>
          </div>

          {/* Sub-slogan */}
          <p className="text-sm sm:text-base text-neutral-300 font-medium max-w-2xl mb-6">
            Train together. Fuel your body. Share your progress.
          </p>

          {/* Divider with gradient */}
          <div className="h-px w-full bg-gradient-to-r from-cyan-500/30 via-neutral-800 to-transparent mb-6" />

          {/* Four Interactive Brand Pillars & Google Play Install Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-1">
            {/* Pillar 1: TRAIN */}
            <button
              onClick={() => onNavigateTab("treinos")}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group text-left shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all shadow-inner">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono tracking-wider font-bold text-cyan-400 uppercase block">
                  TRAIN
                </span>
                <span className="text-xs text-neutral-300 font-medium">Treinos & Cargas</span>
              </div>
            </button>

            {/* Pillar 2: NUTRITION */}
            <button
              onClick={() => onNavigateTab("nutricao")}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group text-left shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all shadow-inner">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono tracking-wider font-bold text-cyan-400 uppercase block">
                  NUTRITION
                </span>
                <span className="text-xs text-neutral-300 font-medium">Nutrição & Macros</span>
              </div>
            </button>

            {/* Pillar 3: COMMUNITY */}
            <button
              onClick={() => onNavigateTab("comunidade")}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group text-left shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono tracking-wider font-bold text-cyan-400 uppercase block">
                  COMMUNITY
                </span>
                <span className="text-xs text-neutral-300 font-medium">Comunidade & Desafios</span>
              </div>
            </button>

            {/* Google Play Store / PWA Install Button */}
            <button
              onClick={handleInstallClick}
              className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/70 hover:from-cyan-900/90 hover:to-blue-900/80 border border-cyan-500/50 hover:border-cyan-400 transition-all cursor-pointer group text-left shadow-lg shadow-cyan-950/30"
              title="Formato Google Play Store & Instalação Standalone PWA"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-cyan-500 text-neutral-950 font-black flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-cyan-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-cyan-300 font-bold uppercase">
                    <span>Google Play</span>
                    <span className="text-white">·</span>
                    <span className="text-emerald-400">TWA Ready</span>
                  </div>
                  <div className="text-xs font-bold text-white whitespace-nowrap">
                    {isInstalled ? "App Instalado" : isInstallable ? "Instalar App" : "Ver Formato Play"}
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Play Store TWA / AAB Information & Verification Modal */}
      {showPlayStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/40 bg-neutral-950 shrink-0">
                  <img src="/forzon-logo.jpg" alt="FORZON" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    FORZON · Google Play Store
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      TWA / AAB
                    </span>
                  </h3>
                  <p className="text-xs text-cyan-400 font-mono">Package ID: com.forzon.fitness.app</p>
                </div>
              </div>
              <button
                onClick={() => setShowPlayStoreModal(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-5 text-sm text-neutral-300">
              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Arquitetura Google Play Store 100% Configurada
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  O projeto <strong>FORZON</strong> está rigorosamente formatado para submissão no Google Play Console através do padrão <strong>Trusted Web Activity (TWA)</strong> e geração de pacote <strong>Android App Bundle (.aab)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
                  <span className="text-neutral-500 block">Manifest Webmanifest:</span>
                  <span className="text-emerald-400 font-bold">✓ /manifest.webmanifest</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">id: com.forzon.fitness.app</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
                  <span className="text-neutral-500 block">Digital Asset Links:</span>
                  <span className="text-emerald-400 font-bold">✓ /.well-known/assetlinks.json</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">SHA-256 fingerprint vinculado</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
                  <span className="text-neutral-500 block">Service Worker & PWA:</span>
                  <span className="text-emerald-400 font-bold">✓ /sw.js Ativo</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Offline caching e fast startup</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
                  <span className="text-neutral-500 block">Identidade Visual:</span>
                  <span className="text-cyan-400 font-bold">✓ Azul Neon / Cyan</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Logo FORZON + Barra com F</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/80 border border-cyan-500/20 text-xs">
                <span className="font-bold text-white block mb-1">Passos para Subir na Play Store via Bubblewrap CLI:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-[11px] font-mono">
                  <li>Instale a ferramenta oficial do Google: <code className="text-cyan-400">npm i -g @bubblewrap/cli</code></li>
                  <li>Inicie o empacotamento: <code className="text-cyan-400">bubblewrap init --manifest=https://seu-dominio.com/manifest.webmanifest</code></li>
                  <li>Compile o arquivo final: <code className="text-cyan-400">bubblewrap build</code></li>
                  <li>Faça upload do arquivo <code className="text-emerald-400">app-release-bundle.aab</code> gerado no Google Play Console!</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowPlayStoreModal(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

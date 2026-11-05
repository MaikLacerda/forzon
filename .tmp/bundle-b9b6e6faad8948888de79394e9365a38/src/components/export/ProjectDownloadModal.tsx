import React, { useState } from "react";
import { Download, Copy, Check, FileCode, Archive, ExternalLink, X, ShieldCheck } from "lucide-react";

interface ProjectDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDownloadModal: React.FC<ProjectDownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [selectedFileTab, setSelectedFileTab] = useState<string>("manifest");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async (type: "alterados" | "projeto-completo") => {
    setDownloadingType(type);
    try {
      const filename = type === "alterados" ? "forzon-arquivos-alterados.zip" : "forzon-projeto-completo.zip";
      const res = await fetch(`/api/download/${type}`);
      if (!res.ok) throw new Error("Falha na resposta do servidor");
      const blob = await res.blob();
      
      // Create download trigger
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 1000);

      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error("Erro no download via blob:", err);
      // Fallback: direct window location
      window.location.href = `/api/download/${type}`;
    } finally {
      setDownloadingType(null);
    }
  };

  const codeFiles: Record<string, { title: string; path: string; language: string; content: string }> = {
    manifest: {
      title: "Manifest Play Store (PWA)",
      path: "public/manifest.webmanifest",
      language: "json",
      content: `{
  "id": "com.forzon.fitness.app",
  "name": "FORZON — More Than Fitness. A Way of Life.",
  "short_name": "FORZON",
  "description": "FORZON — More Than Fitness. A Way of Life. Treinos de força, periodização inteligente, nutrição guiada e comunidade esportiva.",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "display_override": [
    "window-controls-overlay",
    "standalone",
    "minimal-ui"
  ],
  "orientation": "portrait-primary",
  "theme_color": "#090d16",
  "background_color": "#090d16",
  "lang": "pt-BR",
  "dir": "ltr",
  "categories": [
    "health",
    "fitness",
    "lifestyle",
    "sports"
  ],
  "icons": [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/pwa-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "/forzon-logo.jpg",
      "sizes": "2752x1536",
      "type": "image/jpeg",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "Treinos & Cargas",
      "short_name": "Treinar",
      "description": "Abrir periodização e registrar cargas",
      "url": "/?tab=treinos",
      "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Nutrição & Macros",
      "short_name": "Nutrição",
      "description": "Diário de calorias, água e macronutrientes",
      "url": "/?tab=nutricao",
      "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Comunidade FORZON",
      "short_name": "Comunidade",
      "description": "Feed da comunidade e desafios em grupo",
      "url": "/?tab=comunidade",
      "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Treino ao Vivo",
      "short_name": "Ao Vivo",
      "description": "Iniciar cronômetro de descanso e execução",
      "url": "/?action=live_workout",
      "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
    }
  ],
  "related_applications": [
    {
      "platform": "play",
      "id": "com.forzon.fitness.app"
    }
  ],
  "prefer_related_applications": false
}`,
    },
    assetlinks: {
      title: "Digital Asset Links (Google Play TWA)",
      path: "public/.well-known/assetlinks.json",
      language: "json",
      content: `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.forzon.fitness.app",
      "sha256_cert_fingerprints": [
        "14:6D:E9:7D:6F:04:8D:7E:24:D7:93:47:EC:E5:41:A5:68:55:1A:1D:64:CA:0E:0E:64:D2:C7:E3:6C:53:71:6C"
      ]
    }
  }
]`,
    },
    sw: {
      title: "Service Worker (Cache Offline)",
      path: "public/sw.js",
      language: "javascript",
      content: `const CACHE_NAME = 'forzon-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/favicon.svg',
  '/forzon-logo.jpg',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});`,
    },
    gitcommands: {
      title: "Comandos Git & GitHub",
      path: "Terminal / Bash",
      language: "bash",
      content: `# 1. Inicializar o repositório local (se ainda não tiver feito):
git init
git branch -M main

# 2. Conectar com o seu repositório no GitHub:
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 3. Adicionar todos os arquivos e commitar:
git add .
git commit -m "feat: complete FORZON brand migration and Play Store setup"

# 4. Enviar para o GitHub:
git push -u origin main`,
    },
    playcommands: {
      title: "Comandos Gerar AAB (Google Play)",
      path: "Terminal / Bash",
      language: "bash",
      content: `# 1. Instalar o utilitário oficial do Google:
npm install -g @bubblewrap/cli

# 2. Inicializar a criação do pacote Android:
bubblewrap init --manifest=https://SEU-DOMINIO.com/manifest.webmanifest

# 3. Gerar o pacote .AAB pronto para a Google Play:
bubblewrap build

# O arquivo 'app-release-bundle.aab' gerado deve ser enviado no Google Play Console!`,
    },
  };

  const handleCopyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-md shadow-cyan-500/20 bg-neutral-950 shrink-0">
              <img src="/forzon-logo.jpg" alt="FORZON" className="w-full h-full object-cover scale-125" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Central de Download & Arquivos FORZON
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Pronto para Baixar
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Baixe os arquivos compactados em ZIP ou copie o código diretamente abaixo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 text-xs font-semibold animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Download iniciado: <strong>{downloadSuccess}</strong>. Verifique sua pasta de Downloads!</span>
            </div>
          )}

          {/* Download Buttons Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Option 1: Alterados */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-cyan-500/30 flex flex-col justify-between gap-3 shadow-lg shadow-cyan-950/20">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-cyan-400" />
                    Pacote de Alterações (.zip)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    4.3 MB
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Contém somente os arquivos alterados e criados da nova marca FORZON, logos, manifesto Play Store e guias.
                </p>
              </div>

              <button
                onClick={() => handleDownload("alterados")}
                disabled={downloadingType === "alterados"}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-cyan-500/25 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingType === "alterados" ? "Baixando..." : "Baixar Arquivos Alterados"}</span>
              </button>
            </div>

            {/* Option 2: Projeto Completo */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between gap-3 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    Projeto FORZON Completo (.zip)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    6.7 MB
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Repositório inteiro formatado e limpo (sem node_modules), pronto para subir no GitHub ou compilar para Android.
                </p>
              </div>

              <button
                onClick={() => handleDownload("projeto-completo")}
                disabled={downloadingType === "projeto-completo"}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 border border-neutral-700"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{downloadingType === "projeto-completo" ? "Baixando..." : "Baixar Projeto Completo"}</span>
              </button>
            </div>
          </div>

          {/* Quick Fallback Note if browser blocks automatic downloads */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between gap-3 flex-wrap">
            <span>Se o seu navegador bloquear o download automático, use os links diretos:</span>
            <div className="flex items-center gap-2">
              <a
                href="/api/download/alterados"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline font-mono text-[11px] flex items-center gap-1"
              >
                Link 1 (.zip) <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <a
                href="/api/download/projeto-completo"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-mono text-[11px] flex items-center gap-1"
              >
                Link 2 (Completo) <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Code Viewer & 1-Click Copy Tab */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Visualizar & Copiar Código dos Arquivos Principais
              </h3>
              <span className="text-[10px] text-neutral-500 font-mono">1 clique para copiar</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {Object.entries(codeFiles).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFileTab(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition cursor-pointer ${
                    selectedFileTab === key
                      ? "bg-cyan-500 text-neutral-950 font-bold shadow-sm shadow-cyan-500/20"
                      : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/80 border-b border-neutral-800 text-xs">
                <span className="font-mono text-neutral-400 text-[11px]">
                  Caminho: <strong className="text-cyan-400">{codeFiles[selectedFileTab].path}</strong>
                </span>
                <button
                  onClick={() => handleCopyCode(selectedFileTab, codeFiles[selectedFileTab].content)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold transition cursor-pointer"
                >
                  {copiedFile === selectedFileTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-72 leading-relaxed">
                <code>{codeFiles[selectedFileTab].content}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Todos os arquivos estão formatados para Google Play Store & GitHub</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

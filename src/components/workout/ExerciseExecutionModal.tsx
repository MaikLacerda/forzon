import React, { useState } from "react";
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Repeat,
  ExternalLink,
  Video,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { Exercise } from "../../types";
import { getExerciseVideoInfo } from "../../services/exerciseVideoService";
import { Exercise3DMannequin, Exercise3DErrorBoundary } from "./Exercise3DMannequin";

interface ExerciseExecutionModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onOpenCoachWithPrompt?: (prompt: string) => void;
  onSwapExercise?: (newExerciseName: string) => void;
}

// Estimated electromyography (EMG) muscle activation distribution
function getMuscleRecruitment(ex: Exercise) {
  const primary = ex.primaryMuscle;
  const secondaries = ex.secondaryMuscles || [];

  return [
    { muscle: primary, percentage: 70, isPrimary: true },
    ...secondaries.slice(0, 3).map((m, idx) => ({
      muscle: m,
      percentage: idx === 0 ? 20 : 10,
      isPrimary: false,
    })),
  ];
}

export const ExerciseExecutionModal: React.FC<ExerciseExecutionModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onOpenCoachWithPrompt,
  onSwapExercise,
}) => {
  // Mode selection: 3D Mannequin vs Video
  const [viewMode, setViewMode] = useState<"boneco3d" | "video_externo">("boneco3d");
  const [activeTab, setActiveTab] = useState<
    "passo_a_passo" | "biomecanica" | "erros" | "cues" | "substituicoes"
  >("passo_a_passo");

  if (!isOpen) return null;

  const videoInfo = getExerciseVideoInfo(exercise.name, exercise.primaryMuscle);
  const recruitment = getMuscleRecruitment(exercise);

  const searchVideoQuery = encodeURIComponent(
    `execução perfeita ${exercise.name} musculação biomecânica`
  );
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchVideoQuery}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-neutral-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 14 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-start justify-between gap-4 bg-neutral-950/90">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {exercise.primaryMuscle}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
                {exercise.equipment}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {exercise.difficulty}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-400 hidden sm:inline">
                Cadência: 3-0-1-0
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
              {exercise.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={videoInfo.directWatchUrl || youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 border border-neutral-700 transition-colors"
              title="Abrir no YouTube oficial"
            >
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
              <span>YouTube</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Main Visual Demonstration Card */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 p-3 sm:p-5 shadow-inner">
            {/* Top View Selector: Boneco 3D vs Vídeo YouTube */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setViewMode("boneco3d")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    viewMode === "boneco3d"
                      ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Boneco 3D Biomecânico</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("video_externo")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    viewMode === "video_externo"
                      ? "bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Vídeo Explicativo HD</span>
                </button>
              </div>

              {viewMode === "boneco3d" ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Nativo do Sistema AthLynx</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <a
                    href={videoInfo.directWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 border border-neutral-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                    <span>Abrir no YouTube</span>
                  </a>
                </div>
              )}
            </div>

            {/* TAB 1: BONECO 3D INTERATIVO NATIVO */}
            {viewMode === "boneco3d" ? (
              <div className="space-y-4">
                <Exercise3DErrorBoundary>
                  <Exercise3DMannequin exercise={exercise} height={370} />
                </Exercise3DErrorBoundary>

                {/* Key Execution Cues */}
                <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-3 sm:p-4 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pontos de Atenção na Execução:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {videoInfo.keyInstructions.map((inst, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800"
                      >
                        <span className="text-emerald-400 font-bold font-mono">0{i + 1}.</span>
                        <span className="text-neutral-300">{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: VÍDEO EXPLICATIVO HD */
              <div className="space-y-4">
                {/* 16:9 HD Embedded Player */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
                  <iframe
                    src={videoInfo.embedUrl}
                    title={`Vídeo Explicativo: ${exercise.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                {/* Direct fallback action if channel blocks iframe */}
                <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="font-bold text-white text-sm">{videoInfo.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-mono">
                      <span>Canal: {videoInfo.channel}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">Técnica Aprovada</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={videoInfo.directWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                      title="Assistir no app do YouTube caso o vídeo esteja restrito no navegador"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Abrir no App YouTube</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setViewMode("boneco3d")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Ver Boneco 3D</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtabs: Passo a Passo / Biomecânica / Erros / Cues / Alternativas */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("passo_a_passo")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "passo_a_passo"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Passo a Passo
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("biomecanica")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "biomecanica"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Músculos & Ativação EMG
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("erros")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "erros"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Erros Comuns ({exercise.commonMistakes?.length || 2})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cues")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "cues"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Cues Mentais ({exercise.cues?.length || 3})
            </button>

            {exercise.alternatives && exercise.alternatives.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("substituicoes")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "substituicoes"
                    ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                    : "bg-neutral-900 text-neutral-400 hover:text-white"
                }`}
              >
                Substituições Imediatas
              </button>
            )}
          </div>

          {/* Subtab Contents */}
          {activeTab === "passo_a_passo" && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sequência de Execução Biomecânica</span>
              </div>

              <div className="space-y-2.5">
                {(
                  exercise.instructions || [
                    "Posicionamento inicial: estabilize pés, core e curvatura neutra da coluna.",
                    "Fase Excêntrica: desça o peso de forma controlada por 2 a 3 segundos.",
                    "Pico de Contração: estenda ou puxe com aceleração constante sem trancos.",
                  ]
                ).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 flex items-start gap-3 text-xs"
                  >
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-neutral-200 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>

              {/* Cadência Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-950 to-neutral-900 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    Cadência de Tempo (3-0-1-0)
                  </div>
                  <div className="text-neutral-300 mt-1">
                    3s descendo (excêntrico) · 0s pausa · 1s subindo rápido · 0s no topo sem descanso passivo.
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    Padrão Respiratório
                  </div>
                  <div className="text-neutral-300 mt-1">
                    Inspire ao descer a carga abrindo a caixa torácica e expire ao empurrar ou puxar com força.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "biomecanica" && (
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Grau de Recrutamento Muscular Estimado</span>
              </div>

              <div className="space-y-3">
                {recruitment.map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            item.isPrimary ? "bg-emerald-400" : "bg-cyan-400"
                          }`}
                        />
                        <span className="font-bold text-white">{item.muscle}</span>
                        {item.isPrimary && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            MOTOR PRIMÁRIO
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-neutral-300">
                        ~{item.percentage}% Ativação
                      </span>
                    </div>

                    <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item.isPrimary ? "bg-emerald-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "erros" && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Erros Críticos a Evitar</span>
              </div>

              <div className="space-y-2.5">
                {(
                  exercise.commonMistakes || [
                    "Usar impulso do corpo para movimentar a carga ao invés do músculo alvo.",
                    "Encurtar a amplitude de movimento para conseguir colocar mais peso.",
                  ]
                ).map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3 text-xs"
                  >
                    <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                    <div className="space-y-1">
                      <div className="font-bold text-rose-200">{mistake}</div>
                      <div className="text-neutral-400 text-[11px]">
                        <strong>Correção:</strong> Reduza 10% do peso e foque em 3 segundos de descida mantendo as escápulas estáveis.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "cues" && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cues Mentais de Ativação</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  exercise.cues || [
                    "Conexão mente-músculo profunda",
                    "Retraia e deprima as escápulas",
                    "Controle total na descida",
                  ]
                ).map((cue, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5"
                  >
                    <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                      Cue #{idx + 1}
                    </div>
                    <div className="text-xs font-bold text-white">"{cue}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "substituicoes" && exercise.alternatives && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aparelho Ocupado? Variações Equivalentes</span>
              </div>

              <div className="space-y-2">
                {exercise.alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-400 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white">{alt}</span>
                    </div>

                    {onSwapExercise && (
                      <button
                        type="button"
                        onClick={() => {
                          onSwapExercise(alt);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                      >
                        Substituir no Treino
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {onOpenCoachWithPrompt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCoachWithPrompt(
                    `Como calibrar a pegada e amplitude perfeita em "${exercise.name}" para evitar dores articulares e maximizar a hipertrofia?`
                  );
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Perguntar ao Coach IA</span>
              </button>
            )}

            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-mono"
            >
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
              <span>YouTube</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black font-mono transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
          >
            Entendido, Continuar Treino
          </button>
        </div>
      </motion.div>
    </div>
  );
};

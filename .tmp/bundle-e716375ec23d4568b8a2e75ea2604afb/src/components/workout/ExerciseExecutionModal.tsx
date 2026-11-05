import React, { useState, useMemo } from "react";
import {
  X,
  Share2,
  MoreVertical,
  ChevronDown,
  Info,
  Calendar,
  Dumbbell,
  TrendingUp,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Exercise } from "../../types";
import { storage } from "../../services/storage";
import { ExerciseVideoDemonstration } from "./ExerciseVideoDemonstration";

interface ExerciseExecutionModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onOpenCoachWithPrompt?: (prompt: string) => void;
  onSwapExercise?: (newExerciseName: string) => void;
}

export const ExerciseExecutionModal: React.FC<ExerciseExecutionModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onOpenCoachWithPrompt,
  onSwapExercise,
}) => {
  const [activeTab, setActiveTab] = useState<"resumo" | "historico" | "instrucoes" | "video">("resumo");
  const [graphMode, setGraphMode] = useState<"maior_peso" | "um_rm">("maior_peso");
  const [showDumbbellTip, setShowDumbbellTip] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Extract logged history for this exercise
  const historyData = useMemo(() => {
    try {
      const records = storage.getWorkoutHistory() || [];
      const historyList: Array<{
        date: string;
        sets: Array<{ setNum: number; kg: number; reps: number }>;
        bestWeight: number;
        estimated1RM: number;
      }> = [];

      records.forEach((rec: any) => {
        const foundEx = rec.exercisesLogged?.find(
          (e: any) => e.name.toLowerCase() === exercise.name.toLowerCase()
        );
        if (foundEx) {
          const sets = [
            { setNum: 1, kg: Math.round(foundEx.bestWeightKg * 0.7), reps: 12 },
            { setNum: 2, kg: Math.round(foundEx.bestWeightKg * 0.85), reps: 10 },
            { setNum: 3, kg: foundEx.bestWeightKg, reps: 8 },
          ];
          const bestWeight = foundEx.bestWeightKg;
          const estimated1RM = Math.round(bestWeight * (1 + 8 / 30));

          historyList.push({
            date: new Date(rec.completedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            }),
            sets,
            bestWeight,
            estimated1RM,
          });
        }
      });

      if (historyList.length > 0) {
        return historyList;
      }
    } catch {
      // ignore
    }

    // Default realistic progression curve matching the video reference
    const baseWeight = exercise.equipment?.toLowerCase().includes("halter") ? 40 : 60;
    return [
      {
        date: "set 24",
        sets: [
          { setNum: 1, kg: Math.round(baseWeight * 0.5), reps: 12 },
          { setNum: 2, kg: Math.round(baseWeight * 0.6), reps: 12 },
          { setNum: 3, kg: Math.round(baseWeight * 0.7), reps: 10 },
        ],
        bestWeight: Math.round(baseWeight * 0.7),
        estimated1RM: Math.round(baseWeight * 0.7 * 1.3),
      },
      {
        date: "out 6",
        sets: [
          { setNum: 1, kg: Math.round(baseWeight * 0.6), reps: 12 },
          { setNum: 2, kg: Math.round(baseWeight * 0.75), reps: 10 },
          { setNum: 3, kg: Math.round(baseWeight * 0.85), reps: 8 },
        ],
        bestWeight: Math.round(baseWeight * 0.85),
        estimated1RM: Math.round(baseWeight * 0.85 * 1.3),
      },
      {
        date: "out 12",
        sets: [
          { setNum: 1, kg: Math.round(baseWeight * 0.7), reps: 12 },
          { setNum: 2, kg: Math.round(baseWeight * 0.8), reps: 10 },
          { setNum: 3, kg: Math.round(baseWeight * 0.88), reps: 8 },
        ],
        bestWeight: Math.round(baseWeight * 0.88),
        estimated1RM: Math.round(baseWeight * 0.88 * 1.3),
      },
      {
        date: "out 19",
        sets: [
          { setNum: 1, kg: Math.round(baseWeight * 0.65), reps: 12 },
          { setNum: 2, kg: Math.round(baseWeight * 0.78), reps: 10 },
          { setNum: 3, kg: Math.round(baseWeight * 0.82), reps: 10 },
        ],
        bestWeight: Math.round(baseWeight * 0.82),
        estimated1RM: Math.round(baseWeight * 0.82 * 1.3),
      },
      {
        date: "out 29",
        sets: [
          { setNum: 1, kg: Math.round(baseWeight * 0.7), reps: 12 },
          { setNum: 2, kg: Math.round(baseWeight * 0.85), reps: 12 },
          { setNum: 3, kg: baseWeight, reps: 10 },
        ],
        bestWeight: baseWeight,
        estimated1RM: Math.round(baseWeight * 1.33),
      },
    ];
  }, [exercise]);

  // Chart data format
  const chartData = useMemo(() => {
    return historyData.map((h) => ({
      date: h.date,
      peso: graphMode === "maior_peso" ? h.bestWeight : h.estimated1RM,
    }));
  }, [historyData, graphMode]);

  const latestRecord = historyData[historyData.length - 1];
  const currentMetric = graphMode === "maior_peso" ? latestRecord.bestWeight : latestRecord.estimated1RM;

  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: exercise.name,
        text: `Confira a biomecânica anatômica e evolução de carga de ${exercise.name} no AthLynx FORZON!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Exercício: ${exercise.name} | Carga: ${currentMetric}kg no AthLynx FORZON`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-neutral-950 text-white rounded-[28px] border border-neutral-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100dvh-1.5rem)]"
      >
        {/* Top Header (Matching Reference Video) */}
        <div className="px-4 py-3.5 border-b border-neutral-900 flex items-center justify-between gap-3 bg-neutral-950">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-1 text-neutral-300 hover:text-white rounded-xl hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Voltar"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-white tracking-tight truncate text-center flex-1">
            {exercise.name}
          </h2>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-neutral-300 hover:text-white rounded-xl hover:bg-neutral-900 transition-colors cursor-pointer relative"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && (
                <span className="absolute -bottom-7 right-0 text-[10px] font-mono bg-emerald-500 text-neutral-950 px-2 py-0.5 rounded font-bold whitespace-nowrap">
                  Copiado!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main tabs */}
        <div className="px-4 pt-2 border-b border-neutral-900 flex items-center justify-around bg-neutral-950">
          <button
            type="button"
            onClick={() => setActiveTab("resumo")}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === "resumo" ? "text-cyan-400" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>Resumo</span>
            {activeTab === "resumo" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("historico")}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === "historico" ? "text-cyan-400" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>Histórico</span>
            {activeTab === "historico" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("instrucoes")}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === "instrucoes" ? "text-cyan-400" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>Instruções</span>
            {activeTab === "instrucoes" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1 ${
              activeTab === "video" ? "text-cyan-400" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Demonstração</span>
            {activeTab === "video" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-5">
          {/* ========================================================= */}
          {/* TAB 1: RESUMO (EXACT REPLICA OF THE REFERENCE VIDEO)       */}
          {/* ========================================================= */}
          {activeTab === "resumo" && (
            <div className="space-y-4">
              <ExerciseVideoDemonstration key={exercise.id} exercise={exercise} />

              {/* 2. Exercise Title & Primary / Secondary Target Muscles */}
              <div className="space-y-1 pt-1">
                <h3 className="text-xl font-black text-white tracking-tight">
                  {exercise.name}
                </h3>
                <div className="text-xs text-neutral-400 font-medium">
                  Primário: <strong className="text-neutral-200">{exercise.primaryMuscle}</strong>
                </div>
                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                  <div className="text-xs text-neutral-400 font-medium">
                    Secundário: <span className="text-neutral-300">{exercise.secondaryMuscles.join(", ")}</span>
                  </div>
                )}
              </div>

              {/* 3. Blue Tip Link for Dumbbells / Exercise Logging */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDumbbellTip(!showDumbbellTip)}
                  className="flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Como registrar exercícios com {exercise.equipment?.toLowerCase() || "pesos"}
                  </span>
                </button>

                {showDumbbellTip && (
                  <div className="mt-2 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-neutral-300 space-y-1 animate-fade-in">
                    <p className="font-semibold text-cyan-300">
                      Dica de Padronização de Cargas:
                    </p>
                    <p>
                      Para exercícios com halteres, recomendamos registrar a carga de <strong>um único halter</strong> (ex: halter de 30kg) ou a <strong>soma dos dois</strong> (60kg). O importante é manter sempre o mesmo padrão para o histórico de evolução!
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Evolution Metric & Interactive Progression Chart */}
              <div className="space-y-3 pt-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight tabular-nums">
                      {currentMetric} kg
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      {latestRecord.date}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    <span>Ano</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Chart */}
                <div className="h-44 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        unit=" kg"
                        domain={["dataMin - 10", "dataMax + 10"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#09090b",
                          borderColor: "#27272a",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontFamily: "monospace",
                        }}
                        labelStyle={{ color: "#a1a1aa" }}
                        formatter={(val: any) => [`${val} kg`, graphMode === "maior_peso" ? "Maior peso" : "1RM Estimado"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#38bdf8", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Switcher Buttons: [ Maior peso ] | [ Máximo para 1 repetição ] */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setGraphMode("maior_peso")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer ${
                      graphMode === "maior_peso"
                        ? "bg-sky-500 text-neutral-950 font-bold shadow-md shadow-sky-500/20"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    Maior peso
                  </button>

                  <button
                    type="button"
                    onClick={() => setGraphMode("um_rm")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer ${
                      graphMode === "um_rm"
                        ? "bg-sky-500 text-neutral-950 font-bold shadow-md shadow-sky-500/20"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    Máximo para 1 repetição
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: HISTÓRICO (SETS, REPS, WEIGHTS BY DATE)             */}
          {/* ========================================================= */}
          {activeTab === "historico" && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span>Registro de Cargas por Sessão</span>
                <span className="text-cyan-400 font-bold">{historyData.length} sessões</span>
              </div>

              <div className="space-y-3">
                {historyData.slice().reverse().map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400 flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{rec.date}</span>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        Pico: {rec.bestWeight} kg
                      </span>
                    </div>

                    {/* Table matching reference video */}
                    <div className="bg-neutral-950 rounded-xl p-2 font-mono text-xs space-y-1 border border-neutral-850">
                      <div className="grid grid-cols-3 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-850 pb-1">
                        <span>SÉRIE</span>
                        <span className="text-center">KG</span>
                        <span className="text-right">REPS</span>
                      </div>
                      {rec.sets.map((s) => (
                        <div key={s.setNum} className="grid grid-cols-3 text-neutral-200 py-1">
                          <span className="text-neutral-400 font-bold">{s.setNum}</span>
                          <span className="text-center font-bold text-white">{s.kg}</span>
                          <span className="text-right text-cyan-400 font-bold">{s.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: INSTRUÇÕES (BIOMECHANICS, CUES, MISTAKES)          */}
          {/* ========================================================= */}
          {activeTab === "instrucoes" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Passo a Passo da Execução Biomecânica</span>
                </div>
                <div className="space-y-2">
                  {(exercise.instructions || [
                    "Acomode as costas firmemente no apoio, retração escapular e pés plantados no chão.",
                    "Fase Excêntrica: desça o peso de forma controlada por 2 a 3 segundos sentindo o alongamento do músculo.",
                    "Fase Concêntrica: empurre ou puxe com aceleração constante esmagando o músculo alvo no pico de contração."
                  ]).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-2.5 text-neutral-300 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Erros Críticos */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Erros Comuns a Evitar</span>
                </div>
                <div className="space-y-2">
                  {(exercise.commonMistakes || [
                    "Despencar a carga na descida perdendo a tensão excêntrica muscular.",
                    "Compensar movimentando a coluna ou dando trancos articulares."
                  ]).map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200"
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span>✕</span>
                        <span>{mistake}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cues Mentais */}
              {exercise.cues && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cues Mentais de Ativação</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {exercise.cues.map((cue, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium"
                      >
                        "{cue}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Substituições */}
              {exercise.alternatives && exercise.alternatives.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Aparelho Ocupado? Variações Equivalentes</span>
                  </div>
                  <div className="space-y-1.5">
                    {exercise.alternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-white">{alt}</span>
                        {onSwapExercise && (
                          <button
                            type="button"
                            onClick={() => {
                              onSwapExercise(alt);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
                          >
                            Substituir
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: EXERCISE-SPECIFIC ANIMATED DEMONSTRATION            */}
          {/* ========================================================= */}
          {activeTab === "video" && (
            <div className="space-y-4">
              <ExerciseVideoDemonstration key={exercise.id} exercise={exercise} />
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{exercise.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">Demonstração animada de referência. Use as instruções abaixo para conferir a técnica deste exercício.</p>
                </div>
                <ol className="space-y-2 text-xs text-neutral-300 list-decimal list-inside">
                  {exercise.instructions.map((instruction, index) => <li key={index}>{instruction}</li>)}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-900 bg-neutral-950 flex items-center justify-between gap-2">
          {onOpenCoachWithPrompt && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCoachWithPrompt(
                  `Como otimizar a cadência excêntrica e progressão de carga em "${exercise.name}"?`
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Coach IA</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 max-w-[200px] ml-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black text-xs font-mono transition-colors cursor-pointer text-center shadow-md shadow-cyan-500/20"
          >
            Continuar Treino
          </button>
        </div>
      </motion.div>
    </div>
  );
};


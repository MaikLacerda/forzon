import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Minimize2,
  Video,
  Flame,
  Award,
  Clock,
  Sparkles,
  Camera,
  Send,
  HelpCircle,
  Eye
} from 'lucide-react';

export interface ExerciseSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExerciseItem {
  id: number;
  name: string;
  targetMuscle: string;
  cue: string;
  videoUrl?: string;
  sets: ExerciseSet[];
}

interface LiveWorkoutRunnerModalProps {
  workoutTitle: string;
  splitName: string;
  exercises: WorkoutExerciseItem[];
  elapsedSeconds: number;
  onClose: () => void;
  onMinimize: () => void;
  onFinishWorkout: (summary: { totalVolumeKg: number; durationSeconds: number }) => void;
}

export const LiveWorkoutRunnerModal: React.FC<LiveWorkoutRunnerModalProps> = ({
  workoutTitle,
  splitName,
  exercises: initialExercises,
  elapsedSeconds,
  onClose,
  onMinimize,
  onFinishWorkout,
}) => {
  // Estado local com clonagem profunda para permitir edição de cargas decimais e reps
  const [exercises, setExercises] = useState<WorkoutExerciseItem[]>(() =>
    initialExercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s }))
    }))
  );

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const currentExercise = exercises[currentExerciseIndex] || exercises[0];

  // Identificar a primeira série pendente
  const firstIncompleteSetIndex = currentExercise.sets.findIndex((s) => !s.completed);
  const currentSetIndex = firstIncompleteSetIndex !== -1 ? firstIncompleteSetIndex : currentExercise.sets.length - 1;

  // Timer de Descanso ATP-CP
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);

  // Modal de Vídeo / Demonstração Biomecânica
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Modal de Conclusão / Selfie / Resumo de Tonelagem
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);

  // Contagem regressiva do timer de descanso
  useEffect(() => {
    let interval: any = null;
    if (isRestActive && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRestActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestActive, restTimerSeconds]);

  // Formatar MM:SS
  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Botões de incremento funcional de tempo ATP-CP
  const addRestTime = (additionalSecs: number) => {
    setRestTimerSeconds((prev) => prev + additionalSecs);
    setIsRestActive(true);
  };

  // Atualizar Carga com Ponto Flutuante (Float / Decimais reais)
  const handleWeightChange = (setIdx: number, valStr: string) => {
    const parsedVal = valStr === '' ? 0 : parseFloat(valStr);
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== currentExerciseIndex) return ex;
        const updatedSets = [...ex.sets];
        updatedSets[setIdx] = {
          ...updatedSets[setIdx],
          weightKg: isNaN(parsedVal) ? 0 : parsedVal
        };
        return { ...ex, sets: updatedSets };
      })
    );
  };

  // Atualizar Repetições
  const handleRepsChange = (setIdx: number, valStr: string) => {
    const parsedVal = parseInt(valStr, 10);
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== currentExerciseIndex) return ex;
        const updatedSets = [...ex.sets];
        updatedSets[setIdx] = {
          ...updatedSets[setIdx],
          reps: isNaN(parsedVal) ? 0 : parsedVal
        };
        return { ...ex, sets: updatedSets };
      })
    );
  };

  // Concluir ou Desmarcar Série
  const handleToggleCompleteSet = (setIdx: number) => {
    const isNowCompleted = !currentExercise.sets[setIdx].completed;

    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== currentExerciseIndex) return ex;
        const updatedSets = [...ex.sets];
        updatedSets[setIdx] = {
          ...updatedSets[setIdx],
          completed: isNowCompleted
        };
        return { ...ex, sets: updatedSets };
      })
    );

    // Se marcou como concluída, inicia o timer ATP-CP (90 segundos de padrão)
    if (isNowCompleted) {
      setRestTimerSeconds(90);
      setIsRestActive(true);
    }
  };

  // Cálculo do Volume Total de Tonelagem (kg)
  const totalVolumeCalculated = exercises.reduce((accEx, ex) => {
    return (
      accEx +
      ex.sets.reduce((accSet, s) => {
        return accSet + (s.completed ? s.weightKg * s.reps : 0);
      }, 0)
    );
  }, 0);

  // Mapeamento dinâmico de vídeo demonstrativo próprio por slug do exercício
  const getExerciseVideoUrl = (name: string) => {
    const slugMap: Record<string, string> = {
      'Supino Inclinado com Halteres': '/assets/exercise-videos/bench-press.mp4',
      'Supino Reto com Barra Olímpica': '/assets/exercise-videos/bench-press.mp4',
      'Rosca Direta com Barra W': '/assets/exercise-videos/barbell-curl.mp4',
      'Rosca Martelo com Halteres': '/assets/exercise-videos/hammer-curl.mp4',
      'Rosca Alternada com Halteres': '/assets/exercise-videos/alternating-curl.mp4',
      'Puxada Frontal na Polia Alta': '/assets/exercise-videos/pull-ups.mp4',
    };
    return slugMap[name] || '/assets/exercise-videos/bench-press.mp4';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col justify-between p-4 overflow-y-auto animate-in fade-in select-none">
      
      {/* ================= BARRA SUPERIOR DO TREINO ================= */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-[10px] font-extrabold text-[#00d2ff] uppercase tracking-wider block">
              {splitName} • TREINO AO VIVO
            </span>
            <h2 className="text-sm font-black text-white truncate max-w-[210px]">{workoutTitle}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-[#00d2ff]">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
          <button
            onClick={onMinimize}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Minimizar treino e navegar pelas abas"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= CORPO CENTRAL DO TREINO ================= */}
      <div className="space-y-4 max-w-md mx-auto w-full my-auto py-2">

        {/* TIMER DE DESCANSO BIOENERGÉTICO ATP-CP */}
        <div className="p-4 rounded-3xl bg-[#0f131c] border border-cyan-500/40 text-center space-y-2 shadow-[0_0_25px_rgba(0,210,255,0.12)]">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Série {currentSetIndex + 1} de {currentExercise.sets.length}</span>
            <span className="text-[#00d2ff] font-mono">Descanso ATP-CP</span>
            <span>{isRestActive ? 'Recuperando SNC' : 'Pausa / Pronto'}</span>
          </div>

          <div className="text-5xl font-mono font-black text-[#00d2ff] tracking-tight">
            {formatTimer(restTimerSeconds)}
          </div>

          {/* Botões Funcionais de Incremento de Descanso */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => addRestTime(15)}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono font-bold text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer"
            >
              +15s
            </button>
            <button
              onClick={() => addRestTime(30)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono font-bold text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer"
            >
              +30s
            </button>
            <button
              onClick={() => addRestTime(60)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono font-bold text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer"
            >
              +60s
            </button>
            {restTimerSeconds > 0 && (
              <button
                onClick={() => {
                  setRestTimerSeconds(0);
                  setIsRestActive(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-400 hover:text-white"
              >
                Pular
              </button>
            )}
          </div>
        </div>

        {/* CARTÃO DO EXERCÍCIO ATUAL + BOTÃO DO VÍDEO 3D */}
        <div className="p-4 rounded-3xl bg-[#0f131c] border border-slate-800 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-[#00d2ff] uppercase tracking-wider block">
                EXERCÍCIO {currentExerciseIndex + 1} DE {exercises.length} • {currentExercise.targetMuscle}
              </span>
              <h3 className="text-base font-black text-white mt-0.5">{currentExercise.name}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{currentExercise.cue}</p>
            </div>

            <button
              onClick={() => {
                setVideoError(false);
                setShowVideoModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00d2ff] text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-900 shadow-[0_0_12px_rgba(0,210,255,0.25)] transition-all cursor-pointer shrink-0"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Vídeo 3D</span>
            </button>
          </div>

          {/* TABELA DE SÉRIES COM SUPORTE A CARGA FLOAT (DECIMAIS) */}
          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-12 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2">
              <span className="col-span-2">Série</span>
              <span className="col-span-5 text-center">Carga (kg)</span>
              <span className="col-span-3 text-center">Reps</span>
              <span className="col-span-2 text-right">Feito</span>
            </div>

            {currentExercise.sets.map((set, sIdx) => (
              <div
                key={set.setNumber}
                className={`grid grid-cols-12 items-center p-2 rounded-xl border transition-all ${
                  set.completed
                    ? 'bg-cyan-950/40 border-[#00d2ff]/40'
                    : sIdx === currentSetIndex
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-[#07090e] border-slate-800/80 opacity-70'
                }`}
              >
                <span className="col-span-2 font-mono font-bold text-xs text-slate-300">
                  #{set.setNumber}
                </span>

                {/* Input de Carga Float com step any */}
                <div className="col-span-5 flex items-center justify-center gap-1">
                  <input
                    type="number"
                    step="any"
                    value={set.weightKg === 0 ? '' : set.weightKg}
                    onChange={(e) => handleWeightChange(sIdx, e.target.value)}
                    placeholder="0"
                    className="w-16 bg-[#07090e] border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-white text-xs outline-none focus:border-[#00d2ff]"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">kg</span>
                </div>

                {/* Input de Repetições */}
                <div className="col-span-3 flex items-center justify-center gap-1">
                  <input
                    type="number"
                    value={set.reps === 0 ? '' : set.reps}
                    onChange={(e) => handleRepsChange(sIdx, e.target.value)}
                    placeholder="0"
                    className="w-12 bg-[#07090e] border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-white text-xs outline-none focus:border-[#00d2ff]"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">reps</span>
                </div>

                {/* Botão de Conclusão da Série */}
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => handleToggleCompleteSet(sIdx)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                      set.completed
                        ? 'bg-[#00d2ff] border-[#00d2ff] text-neutral-950 shadow-[0_0_8px_#00d2ff]'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navegação entre Exercícios */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => setCurrentExerciseIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentExerciseIndex === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <span className="text-xs font-mono font-bold text-slate-400">
              {currentExerciseIndex + 1} de {exercises.length}
            </span>

            <button
              onClick={() => setCurrentExerciseIndex((prev) => Math.min(exercises.length - 1, prev + 1))}
              disabled={currentExerciseIndex === exercises.length - 1}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] disabled:opacity-30 flex items-center gap-1"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= RODAPÉ: BOTÃO DE FINALIZAR TREINO ================= */}
      <footer className="pt-2 max-w-md mx-auto w-full shrink-0">
        <button
          onClick={() => setShowFinishModal(true)}
          className="w-full py-4 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
        >
          <Award className="w-4 h-4 fill-neutral-950" />
          Finalizar Sessão de Treino
        </button>
      </footer>

      {/* ================= MODAL DO VÍDEO DO EXERCÍCIO (COM FALLBACK ANATÔMICO) ================= */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-[0_0_35px_rgba(0,210,255,0.2)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#00d2ff]" />
                <h3 className="text-xs font-bold text-white truncate max-w-[220px]">
                  {currentExercise.name}
                </h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PLAYER RESILIENTE: Se o vídeo falhar, exibe o visual anatômico sem tela preta */}
            <div className="w-full h-56 rounded-2xl bg-[#07090e] border border-cyan-500/30 overflow-hidden relative flex items-center justify-center shadow-inner">
              {!videoError ? (
                <video
                  src={getExerciseVideoUrl(currentExercise.name)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* FALLBACK ANATÔMICO EM CSS/CANVAS QUANDO O VÍDEO NÃO ESTIVER LOCAL */
                <div className="text-center p-4 space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#00d2ff] font-bold uppercase block">
                      Guia Biomecânico Ativo
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{currentExercise.name}</h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Foco primário: <strong className="text-[#00d2ff]">{currentExercise.targetMuscle}</strong>.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{currentExercise.cue}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#0f131c] border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <strong className="text-white block">Ponto Biomecânico de Execução:</strong>
              <p className="text-slate-400 leading-relaxed">{currentExercise.cue}</p>
            </div>

            <button
              onClick={() => setShowVideoModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900"
            >
              Entendido, Continuar Séries
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL DE RESUMO DE TONELAGEM & SELFIE PÓS-TREINO ================= */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 text-center shadow-[0_0_40px_rgba(0,210,255,0.2)]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.3)]">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-widest block">
                SESSÃO CONCLUÍDA
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">Treino Finalizado com Honra!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Duração total: <strong className="text-white font-mono">{formatTimer(elapsedSeconds)}</strong>
              </p>
            </div>

            {/* Tonelagem Total Levantada */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Volume Total de Cargas</span>
              <div className="text-3xl font-mono font-black text-[#00d2ff]">
                {totalVolumeCalculated.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg
              </div>
              <p className="text-[10px] text-slate-400">Tonelagem acumulada em todos os exercícios.</p>
            </div>

            {/* Selfie Opcional */}
            <div className="space-y-2">
              {selfiePhoto ? (
                <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-cyan-500/40">
                  <img src={selfiePhoto} alt="Selfie" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setSelfiePhoto(null)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/40">
                  <Camera className="w-4 h-4 text-[#00d2ff]" />
                  <span>Anexar Foto de Selfie Pós-Treino</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelfiePhoto(URL.createObjectURL(file));
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              onClick={() => {
                setShowFinishModal(false);
                onFinishWorkout({
                  totalVolumeKg: totalVolumeCalculated,
                  durationSeconds: elapsedSeconds
                });
              }}
              className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 fill-neutral-950" />
              Salvar e Postar no Feed da Comunidade
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

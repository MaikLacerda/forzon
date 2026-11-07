import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  X,
  Camera,
  Share2,
  Video,
  ChevronRight,
  Flame,
  Clock,
  Dumbbell
} from 'lucide-react';

interface SetRecord {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

interface ExerciseItem {
  id: number;
  name: string;
  targetMuscle: string;
  cue: string;
  videoUrl?: string;
  sets: SetRecord[];
}

interface LiveWorkoutRunnerModalProps {
  workoutTitle: string;
  splitName: string;
  exercises: ExerciseItem[];
  elapsedSeconds: number;
  onClose: () => void;
  onMinimize: () => void;
  onFinishWorkout: (summary: { totalVolumeKg: number; durationSeconds: number; selfiePhoto?: string }) => void;
}

export const LiveWorkoutRunnerModal: React.FC<LiveWorkoutRunnerModalProps> = ({
  workoutTitle,
  splitName,
  exercises: initialExercises,
  elapsedSeconds: initialElapsed,
  onClose,
  onMinimize,
  onFinishWorkout,
}) => {
  const [exercisesList, setExercisesList] = useState<ExerciseItem[]>(initialExercises);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0); // Inicia rigorosamente na Série 1 (index 0)
  
  // Timer de Descanso ATP-CP
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [restActive, setRestActive] = useState(false);
  
  // Modal de Vídeo Anatômico do Exercício
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Tela de Conclusão / Selfie
  const [isFinishing, setIsFinishing] = useState(false);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);

  const currentExercise = exercisesList[currentExIdx] || exercisesList[0];

  // Contagem regressiva do descanso
  useEffect(() => {
    let interval: any = null;
    if (restActive && restSecondsRemaining !== null && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restSecondsRemaining === 0) {
      setRestActive(false);
    }
    return () => clearInterval(interval);
  }, [restActive, restSecondsRemaining]);

  // Formatar tempo MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Funções de timer (+15s, +30s, +60s)
  const addRestTime = (seconds: number) => {
    setRestSecondsRemaining((prev) => (prev ?? 0) + seconds);
    setRestActive(true);
  };

  // Alteração de peso ou reps com suporte a decimais
  const handleUpdateSet = (setIdx: number, field: 'weightKg' | 'reps', value: number) => {
    setExercisesList((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== currentExIdx) return ex;
        const newSets = [...ex.sets];
        newSets[setIdx] = { ...newSets[setIdx], [field]: Math.max(0, value) };
        return { ...ex, sets: newSets };
      })
    );
  };

  // Concluir a série atual
  const handleCompleteCurrentSet = (setIdx: number) => {
    setExercisesList((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== currentExIdx) return ex;
        const newSets = [...ex.sets];
        newSets[setIdx] = { ...newSets[setIdx], completed: !newSets[setIdx].completed };
        return { ...ex, sets: newSets };
      })
    );

    // Dispara descanso ATP-CP se marcou como concluído
    setRestSecondsRemaining(60);
    setRestActive(true);

    // Avança para a próxima série se houver
    if (setIdx + 1 < currentExercise.sets.length) {
      setActiveSetIndex(setIdx + 1);
    }
  };

  // Cálculo da tonelagem total levantada (kg)
  const calculateTotalVolumeKg = () => {
    return exercisesList.reduce((accEx, ex) => {
      const exVolume = ex.sets.reduce((accSet, s) => {
        return s.completed ? accSet + s.weightKg * s.reps : accSet;
      }, 0);
      return accEx + exVolume;
    }, 0);
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfiePhoto(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col justify-between overflow-hidden">
      {/* Top Bar da Sessão Ao Vivo */}
      <header className="p-4 bg-[#0a0e17] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400">TREINO AO VIVO</span>
              <span className="text-[10px] text-slate-400 font-mono">({splitName})</span>
            </div>
            <h2 className="text-xs font-bold text-slate-200 line-clamp-1">{workoutTitle}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMinimize}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-400 hover:text-cyan-300"
          >
            Minimizar
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Conteúdo Central */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full">
        {!isFinishing ? (
          <>
            {/* Bloco do Timer de Descanso ATP-CP */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-cyan-500/40 text-center space-y-2 shadow-[0_0_20px_rgba(0,210,255,0.1)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                SÉRIE {activeSetIndex + 1} DE {currentExercise.sets.length} • DESCANSO ATP-CP
              </span>

              <div className="text-5xl font-mono font-black text-[#00d2ff] tracking-tight">
                {restSecondsRemaining !== null && restSecondsRemaining > 0
                  ? formatTime(restSecondsRemaining)
                  : '00:00'}
              </div>

              {/* Botões incrementais funcionais */}
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={() => addRestTime(15)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900"
                >
                  +15s
                </button>
                <button
                  onClick={() => addRestTime(30)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900"
                >
                  +30s
                </button>
                <button
                  onClick={() => addRestTime(60)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900"
                >
                  +60s
                </button>
                {restActive && (
                  <button
                    onClick={() => setRestSecondsRemaining(0)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300"
                  >
                    Pular
                  </button>
                )}
              </div>
            </div>

            {/* Cabeçalho do Exercício Atual + Botão de Vídeo */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                    EXERCÍCIO {currentExIdx + 1} DE {exercisesList.length}
                  </span>
                  <h3 className="text-base font-black text-white">{currentExercise.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{currentExercise.cue}</p>
                </div>

                {/* Botão de Ver Vídeo Anatômico */}
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[#00d2ff] text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-900 transition-all shrink-0"
                >
                  <Video className="w-4 h-4" />
                  <span>Vídeo 3D</span>
                </button>
              </div>

              {/* Lista de Séries com Inputs Reais de Carga (kg) e Repetições */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase text-center px-1">
                  <span className="col-span-2 text-left">Série</span>
                  <span className="col-span-4">Carga (kg)</span>
                  <span className="col-span-4">Reps</span>
                  <span className="col-span-2">Status</span>
                </div>

                {currentExercise.sets.map((set, sIdx) => (
                  <div
                    key={set.setNumber}
                    onClick={() => setActiveSetIndex(sIdx)}
                    className={`grid grid-cols-12 items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      set.completed
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : activeSetIndex === sIdx
                        ? 'bg-cyan-950/40 border-[#00d2ff] text-white shadow-[0_0_10px_rgba(0,210,255,0.15)]'
                        : 'bg-[#07090e] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="col-span-2 text-xs font-bold font-mono pl-1">#{set.setNumber}</span>

                    {/* Input de Carga com Ponto Flutuante */}
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={set.weightKg}
                        onChange={(e) => handleUpdateSet(sIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                        className="w-16 py-1 px-1.5 text-center text-xs font-mono font-bold bg-[#0f131c] border border-slate-700 rounded-lg text-white focus:border-[#00d2ff] outline-none"
                      />
                      <span className="text-[10px] text-slate-400">kg</span>
                    </div>

                    {/* Input de Repetições */}
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleUpdateSet(sIdx, 'reps', parseInt(e.target.value) || 0)}
                        className="w-14 py-1 px-1.5 text-center text-xs font-mono font-bold bg-[#0f131c] border border-slate-700 rounded-lg text-white focus:border-[#00d2ff] outline-none"
                      />
                      <span className="text-[10px] text-slate-400">reps</span>
                    </div>

                    {/* Botão de Check da Série */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteCurrentSet(sIdx);
                        }}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          set.completed
                            ? 'bg-emerald-500 border-emerald-400 text-neutral-950'
                            : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-cyan-400'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navegação entre exercícios */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  disabled={currentExIdx === 0}
                  onClick={() => {
                    setCurrentExIdx((prev) => Math.max(0, prev - 1));
                    setActiveSetIndex(0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40"
                >
                  Anterior
                </button>

                <div className="text-[11px] font-mono font-bold text-slate-400">
                  {currentExIdx + 1} de {exercisesList.length}
                </div>

                <button
                  disabled={currentExIdx + 1 >= exercisesList.length}
                  onClick={() => {
                    setCurrentExIdx((prev) => Math.min(exercisesList.length - 1, prev + 1));
                    setActiveSetIndex(0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] disabled:opacity-40"
                >
                  Próximo Exercício
                </button>
              </div>
            </div>

            {/* Resumo da Tonelagem Acumulada em Tempo Real */}
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#00d2ff]" />
                <span className="text-slate-300 font-bold">Volume Total Levantado:</span>
              </div>
              <span className="font-mono font-black text-[#00d2ff] text-sm">
                {calculateTotalVolumeKg().toLocaleString()} kg
              </span>
            </div>
          </>
        ) : (
          /* ================= TELA DE FINALIZAÇÃO & FOTO SELFIE ================= */
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Treino Concluído com Sucesso!</h2>
              <p className="text-xs text-slate-400">Sua sobrecarga progressiva foi registrada no histórico.</p>
            </div>

            {/* Card de Volume e Tempo */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 grid grid-cols-2 text-center">
              <div className="border-r border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Tonelagem Total</span>
                <p className="text-lg font-mono font-black text-[#00d2ff] mt-0.5">
                  {calculateTotalVolumeKg().toLocaleString()} kg
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Duração Total</span>
                <p className="text-lg font-mono font-black text-white mt-0.5">
                  {formatTime(initialElapsed)}
                </p>
              </div>
            </div>

            {/* Selfie do Pós-Treino */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 block">Selfie Pós-Treino (Opcional):</span>
              
              {selfiePhoto ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-cyan-500/40">
                  <img src={selfiePhoto} alt="Selfie" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setSelfiePhoto(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="w-full h-32 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-[#07090e]">
                  <Camera className="w-6 h-6 text-[#00d2ff]" />
                  <span className="text-xs font-bold text-slate-400">Tirar Foto ou Anexar Imagem</span>
                  <input type="file" accept="image/*" onChange={handleSelfieUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botão de Rodapé */}
      <footer className="p-4 bg-[#0a0e17] border-t border-slate-800 max-w-md mx-auto w-full">
        {!isFinishing ? (
          <button
            onClick={() => setIsFinishing(true)}
            className="w-full py-4 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 fill-neutral-950" />
            Finalizar Sessão de Treino
          </button>
        ) : (
          <button
            onClick={() => {
              onFinishWorkout({
                totalVolumeKg: calculateTotalVolumeKg(),
                durationSeconds: initialElapsed,
                selfiePhoto: selfiePhoto || undefined,
              });
            }}
            className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5 fill-neutral-950" />
            Salvar e Postar no Feed da Comunidade
          </button>
        )}
      </footer>

      {/* Modal de Exibição do Vídeo do Exercício */}
      {showVideoModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#00d2ff]" />
                <h3 className="text-xs font-bold text-white">{currentExercise.name}</h3>
              </div>
              <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-video rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
              <video
                src={currentExercise.videoUrl || '/assets/exercise-videos/bench-press.mp4'}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-white">Ponto Biomecânico:</strong> {currentExercise.cue}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

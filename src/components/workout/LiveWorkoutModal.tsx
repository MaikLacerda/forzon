import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, Flame, Clock, Plus, Minus } from 'lucide-react';
interface LiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutTitle?: string;
  onOpenSwap?: () => void;
}

export const LiveWorkoutModal: React.FC<LiveWorkoutModalProps> = ({
  isOpen,
  onClose,
  workoutTitle = "Treino A — Peitoral, Ombros & Tríceps",
  onOpenSwap,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [restSeconds, setRestSeconds] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const [weight, setWeight] = useState(24);
  const [reps, setReps] = useState(10);
  const [completedSets, setCompletedSets] = useState<number[]>([1, 2]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    let restInterval: any = null;
    if (isResting && restSeconds > 0) {
      restInterval = setInterval(() => setRestSeconds((s) => s - 1), 1000);
    } else if (restSeconds === 0) {
      setIsResting(false);
    }
    return () => clearInterval(restInterval);
  }, [isResting, restSeconds]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const completeCurrentSet = () => {
    setCompletedSets([...completedSets, completedSets.length + 1]);
    setRestSeconds(60);
    setIsResting(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0a0e17] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header do Treino */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0f131c]">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-[#00d2ff] tracking-wider uppercase">Sessão em Andamento</span>
            </div>
            <h3 className="text-sm font-extrabold text-white truncate max-w-[240px] mt-0.5">{workoutTitle}</h3>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {formatTime(elapsedSeconds)}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Exercício Atual */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/20 shadow-[0_4px_20px_rgba(0,210,255,0.05)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Exercício 1 de 6</span>
              <button
                onClick={onOpenSwap}
                className="text-[11px] font-semibold text-[#00d2ff] hover:underline flex items-center gap-1 bg-cyan-950/40 px-2 py-1 rounded-md border border-cyan-500/20"
              >
                <RefreshCw className="w-3 h-3" />
                Trocar Aparelho Ocupado
              </button>
            </div>
            <h4 className="text-base font-bold text-white">Supino Reto com Halteres</h4>
            <p className="text-xs text-slate-400 mt-0.5">Cadência 3s excêntricos • Foco em Peitoral Maior</p>
          </div>

          {/* Timer Bioenergético ATP-CP */}
          {isResting && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-center animate-pulse">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400">
                <Flame className="w-4 h-4 fill-cyan-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Recuperação de ATP-CP</span>
              </div>
              <p className="text-3xl font-extrabold text-white font-mono mt-1">{formatTime(restSeconds)}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => setRestSeconds((s) => s + 15)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700"
                >
                  +15s
                </button>
                <button
                  onClick={() => setRestSeconds((s) => s + 30)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700"
                >
                  +30s
                </button>
                <button
                  onClick={() => setIsResting(false)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-[11px] font-bold border border-cyan-500/40"
                >
                  Pular Descanso
                </button>
              </div>
            </div>
          )}

          {/* Ajuste de Carga e Reps */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400">Carga por Halter</span>
              <div className="flex items-center justify-between mt-1.5">
                <button
                  onClick={() => setWeight((w) => Math.max(0, w - 2))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-lg font-extrabold text-white">{weight} <span className="text-xs text-slate-400 font-normal">kg</span></span>
                <button
                  onClick={() => setWeight((w) => w + 2)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="w-full h-52 rounded-2xl bg-[#07090e] border border-cyan-500/40 overflow-hidden relative flex items-center justify-center shadow-inner">
              {!videoError ? (
                <video
                  src="/assets/exercise-videos/bench-press.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover"
                />
             ) : (
              <div className="text-center p-4 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                  <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#00d2ff] font-bold uppercase block">
                  Guia Biomecânico em Loop
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{currentExercise.name}</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Grupamento ativo: <strong className="text-[#00d2ff]">{currentExercise.targetMuscle}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{currentExercise.cue}</p>
              </div>
              </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400">Repetições Alvo</span>
              <div className="flex items-center justify-between mt-1.5">
                <button
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-lg font-extrabold text-white">{reps} <span className="text-xs text-slate-400 font-normal">reps</span></span>
                <button
                  onClick={() => setReps((r) => r + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Concluir Série */}
        <div className="p-4 border-t border-slate-800 bg-[#0f131c]">
          <button
            onClick={completeCurrentSet}
            className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-transform active:scale-[0.98]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Concluir Série {completedSets.length + 1} de 4
          </button>
        </div>
      </div>
    </div>
  );
};

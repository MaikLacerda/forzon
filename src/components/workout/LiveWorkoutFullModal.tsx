import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, Flame, Clock, Plus, Minus, ChevronRight, ChevronLeft, Dumbbell, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

interface ExerciseItem {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  suggestedWeight: number;
}

interface LiveWorkoutFullProps {
  isOpen: boolean;
  onClose: () => void;
  workoutTitle?: string;
  exercises?: ExerciseItem[];
  onOpenSwap?: (exerciseName: string) => void;
  onFinishWorkout?: (volumeKg: number) => void;
}

export const LiveWorkoutFullModal: React.FC<LiveWorkoutFullProps> = ({
  isOpen,
  onClose,
  workoutTitle = "Treino A — Peitoral, Ombros & Tríceps",
  exercises = [
    { id: '1', name: 'Supino Inclinado com Halteres', targetMuscle: 'Peitoral Superior', sets: 4, reps: '8-10', suggestedWeight: 32 },
    { id: '2', name: 'Crucifixo no Cabo (Crossover)', targetMuscle: 'Peitoral Maior', sets: 4, reps: '12', suggestedWeight: 17.5 },
    { id: '3', name: 'Elevação Lateral Escapular', targetMuscle: 'Deltóides', sets: 4, reps: '12-15', suggestedWeight: 14 },
    { id: '4', name: 'Tríceps Francês Unilateral', targetMuscle: 'Tríceps Cabeça Longa', sets: 4, reps: '10', suggestedWeight: 12.5 },
    { id: '5', name: 'Tríceps Corda na Polia Alta', targetMuscle: 'Tríceps Lateral', sets: 3, reps: '12', suggestedWeight: 25 },
    { id: '6', name: 'Crunch na Polia Alta (Abdominal Dinâmico)', targetMuscle: 'Abdômen & Core', sets: 3, reps: '15', suggestedWeight: 35 },
    { id: '7', name: 'Cardio Pós-Treino: Simulador de Escadas', targetMuscle: 'Cardio Zona 2', sets: 1, reps: '20 min', suggestedWeight: 0 },
  ],
  onOpenSwap,
  onFinishWorkout,
}) => {
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(60);
  const [isResting, setIsResting] = useState(false);
  
  // Dados da Série
  const [weight, setWeight] = useState(32);
  const [reps, setReps] = useState(10);
  const [completedSets, setCompletedSets] = useState<{ [exIdx: number]: number[] }>({ 0: [1] });
  const [totalVolume, setTotalVolume] = useState(640);
  const [numpadActive, setNumpadActive] = useState<'weight' | 'reps' | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isOpen) {
      interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

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

  const currentExercise = exercises[currentExIdx] || exercises[0];
  const finishedSetsForCurrent = completedSets[currentExIdx] || [];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    const newSets = [...finishedSetsForCurrent, finishedSetsForCurrent.length + 1];
    setCompletedSets({ ...completedSets, [currentExIdx]: newSets });
    setTotalVolume((prev) => prev + weight * reps);
    setRestSeconds(60);
    setIsResting(true);
  };

  const handleFinish = () => {
    if (onFinishWorkout) onFinishWorkout(totalVolume);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070a11] flex flex-col animate-in fade-in duration-200">
      
      {/* Top Header Persistente da Sessão */}
      <div className="p-4 border-b border-slate-800 bg-[#0a0e17] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">Treino ao Vivo • FORZON</span>
            <h3 className="text-sm font-extrabold text-white truncate max-w-[200px]">{workoutTitle}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> {formatTime(elapsedSeconds)}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Barra de Progresso e Métricas Acumuladas */}
      <div className="px-4 py-2 bg-[#0c1018] border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Exercício <strong className="text-white">{currentExIdx + 1}</strong> de {exercises.length}
        </span>
        <span className="text-cyan-400 font-mono font-bold">
          Volume: {totalVolume.toLocaleString('pt-BR')} kg
        </span>
      </div>

      {/* Conteúdo Central do Exercício Atual */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        
        {/* Card do Exercício */}
        <div className="p-4 rounded-2xl bg-[#0f131c] border border-cyan-500/25 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentExercise.targetMuscle}</span>
            {onOpenSwap && (
              <button
                onClick={() => onOpenSwap(currentExercise.name)}
                className="text-[11px] font-bold text-[#00d2ff] hover:underline flex items-center gap-1 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-500/20"
              >
                <RefreshCw className="w-3 h-3" /> Substituir Aparelho
              </button>
            )}
          </div>
          <h2 className="text-base font-black text-white">{currentExercise.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentExercise.sets} séries planejadas • {currentExercise.reps} reps</p>
        </div>

        {/* Timer de Recuperação ATP-CP */}
        {isResting && (
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-center animate-pulse">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400">
              <Flame className="w-4 h-4 fill-cyan-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Recuperação de ATP-CP</span>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono mt-1">{formatTime(restSeconds)}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button onClick={() => setRestSeconds((s) => s + 15)} className="px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-200 border border-slate-700">+15s</button>
              <button onClick={() => setRestSeconds((s) => s + 30)} className="px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-200 border border-slate-700">+30s</button>
              <button onClick={() => setIsResting(false)} className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-[11px] font-bold border border-cyan-500/40">Pular</button>
            </div>
          </div>
        )}

        {/* Ajuste Rápido de Carga (kg) e Repetições */}
        <div className="grid grid-cols-2 gap-3">
          <div 
            onClick={() => setNumpadActive('weight')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              numpadActive === 'weight' ? 'bg-cyan-950/20 border-cyan-500' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase">Carga (kg)</span>
            <div className="flex items-center justify-between mt-2">
              <button onClick={(e) => { e.stopPropagation(); setWeight((w) => Math.max(0, w - 2)); }} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xl font-extrabold text-white">{weight} <span className="text-xs text-slate-400 font-normal">kg</span></span>
              <button onClick={(e) => { e.stopPropagation(); setWeight((w) => w + 2); }} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div 
            onClick={() => setNumpadActive('reps')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              numpadActive === 'reps' ? 'bg-cyan-950/20 border-cyan-500' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase">Repetições</span>
            <div className="flex items-center justify-between mt-2">
              <button onClick={(e) => { e.stopPropagation(); setReps((r) => Math.max(1, r - 1)); }} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xl font-extrabold text-white">{reps} <span className="text-xs text-slate-400 font-normal">reps</span></span>
              <button onClick={(e) => { e.stopPropagation(); setReps((r) => r + 1); }} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Numpad Virtual Tátil */}
        {numpadActive && (
          <div className="p-3 rounded-2xl bg-[#0c1018] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
              <span className="text-cyan-400 font-bold">Digite {numpadActive === 'weight' ? 'a Carga (kg)' : 'as Repetições'}:</span>
              <button onClick={() => setNumpadActive(null)} className="text-slate-400 hover:text-white font-bold">OK</button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-sm font-bold">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') {
                      if (numpadActive === 'weight') setWeight(0);
                      else setReps(0);
                    } else if (key === '.') {
                      // ignore decimal for simplicity
                    } else {
                      if (numpadActive === 'weight') setWeight((prev) => Number(`${prev === 0 ? '' : prev}${key}`));
                      else setReps((prev) => Number(`${prev === 0 ? '' : prev}${key}`));
                    }
                  }}
                  className="py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:bg-cyan-500/20"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Barra Inferior de Ações de Treino */}
      <div className="p-4 border-t border-slate-800 bg-[#0a0e17] space-y-2">
        <button
          onClick={handleCompleteSet}
          className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] active:scale-[0.98]"
        >
          <Check className="w-4 h-4 stroke-[3]" /> Concluir Série {finishedSetsForCurrent.length + 1} de {currentExercise.sets}
        </button>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setCurrentExIdx((idx) => Math.max(0, idx - 1))}
            disabled={currentExIdx === 0}
            className="py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </button>

          {currentExIdx < exercises.length - 1 ? (
            <button
              onClick={() => setCurrentExIdx((idx) => idx + 1)}
              className="py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1"
            >
              Próximo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="py-2 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5" /> Finalizar Treino
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

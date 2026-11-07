import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Check,
  Dumbbell,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export interface WorkoutSetItem {
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
  sets: WorkoutSetItem[];
}

interface LiveWorkoutRunnerModalProps {
  workoutTitle: string;
  splitName: string;
  exercises: WorkoutExerciseItem[];
  elapsedSeconds: number;
  onClose: () => void;
  onMinimize: () => void;
  onFinishWorkout: () => void;
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
  const [exercises, setExercises] = useState<WorkoutExerciseItem[]>(initialExercises);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  
  // Controle do Player: se em 1.8s o vídeo não começar a tocar, ativa o avatar biomecânico animado
  const [useAnimatedFallback, setUseAnimatedFallback] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(90);
  const [isResting, setIsResting] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentExercise = exercises[currentExIndex] || exercises[0];

  const exerciseSlug = (currentExercise.name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  // Timeout de segurança contra o "loading infinito" do <video>
  useEffect(() => {
    setUseAnimatedFallback(false);
    
    // Timer de 1.8 segundos: se o vídeo não deu play, cai no biomecânico animado
    const timeout = setTimeout(() => {
      if (videoRef.current && (videoRef.current.readyState < 3 || videoRef.current.paused)) {
        setUseAnimatedFallback(true);
      }
    }, 1800);

    return () => clearTimeout(timeout);
  }, [currentExIndex]);

  // Alternar conclusão da série
  const toggleSetComplete = (setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== currentExIndex) return ex;
        const newSets = ex.sets.map((s, sIdx) => {
          if (sIdx !== setIndex) return s;
          const willComplete = !s.completed;
          if (willComplete) {
            setIsResting(true);
            setRestSecondsRemaining(90);
          }
          return { ...s, completed: willComplete };
        });
        return { ...ex, sets: newSets };
      })
    );
  };

  // Ajustar Carga (Float)
  const handleWeightChange = (setIndex: number, newWeight: number) => {
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== currentExIndex) return ex;
        const newSets = ex.sets.map((s, sIdx) =>
          sIdx === setIndex ? { ...s, weightKg: newWeight } : s
        );
        return { ...ex, sets: newSets };
      })
    );
  };

  // Ajustar Repetições Feitas
  const handleRepsChange = (setIndex: number, newReps: number) => {
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== currentExIndex) return ex;
        const newSets = ex.sets.map((s, sIdx) =>
          sIdx === setIndex ? { ...s, reps: newReps } : s
        );
        return { ...ex, sets: newSets };
      })
    );
  };

  // Timer de Descanso ATP-CP
  useEffect(() => {
    let timer: any = null;
    if (isResting && restSecondsRemaining > 0) {
      timer = setInterval(() => {
        setRestSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (restSecondsRemaining === 0) {
      setIsResting(false);
    }
    return () => clearInterval(timer);
  }, [isResting, restSecondsRemaining]);

  const formatTime = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] flex flex-col justify-between p-4 overflow-y-auto animate-in fade-in select-none">
      
      {/* Topo do Treino ao Vivo */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
            {splitName} • AO VIVO
          </span>
          <h2 className="text-base font-black text-white">{workoutTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMinimize}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Minimizar treino"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cronômetro & Timer ATP-CP */}
      <div className="my-3 p-4 rounded-3xl bg-[#0f131c] border border-cyan-500/30 text-center space-y-2 shadow-[0_0_25px_rgba(0,210,255,0.1)]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isResting ? 'DESCANSO ATP-CP ATIVO' : 'TEMPO TOTAL EM ANDAMENTO'}
        </span>
        <div className="font-mono text-4xl font-black text-[#00d2ff] tracking-tight">
          {isResting ? formatTime(restSecondsRemaining) : formatTime(elapsedSeconds)}
        </div>

        {isResting && (
          <div className="flex justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRestSecondsRemaining((prev) => prev + 15)}
              className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-[11px] font-mono font-bold text-[#00d2ff] hover:bg-cyan-900 cursor-pointer"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={() => setRestSecondsRemaining((prev) => prev + 30)}
              className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-[11px] font-mono font-bold text-[#00d2ff] hover:bg-cyan-900 cursor-pointer"
            >
              +30s
            </button>
            <button
              type="button"
              onClick={() => setIsResting(false)}
              className="px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              Pular
            </button>
          </div>
        )}
      </div>

      {/* ÁREA DO VÍDEO / DEMONSTRAÇÃO VISUAL (SEM CARREGAMENTO INFINITO) */}
      <div className="space-y-2 my-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">
            Exercício {currentExIndex + 1} de {exercises.length}
          </span>
          <span className="text-xs font-bold text-slate-300">{currentExercise.targetMuscle}</span>
        </div>

        <h3 className="text-lg font-black text-white">{currentExercise.name}</h3>

        {/* Box da Demonstração: Elimina o loop infinito com Timeout de 1.8s */}
        <div className="w-full h-56 rounded-3xl bg-[#0a0e17] border border-cyan-500/40 overflow-hidden relative flex flex-col items-center justify-center p-3 shadow-inner">
          
          {!useAnimatedFallback ? (
            /* Vídeo com detecção ativa de reprodução */
            <video
              ref={videoRef}
              key={currentExercise.name}
              src={`/assets/exercise-videos/${exerciseSlug}.mp4`}
              autoPlay
              loop
              muted
              playsInline
              webkit-playsinline="true"
              onPlaying={() => setUseAnimatedFallback(false)}
              onError={() => setUseAnimatedFallback(true)}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            /* Demonstração Biomecânica Animada Local (Sem Buffer, Sem Falha) */
            <div className="w-full h-full flex flex-col items-center justify-center relative rounded-2xl bg-gradient-to-b from-cyan-950/30 to-[#07090e] border border-cyan-500/20 p-4 text-center">
              
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-[#00d2ff] shadow-[0_0_25px_rgba(0,210,255,0.4)] animate-pulse">
                  <Dumbbell className="w-8 h-8 rotate-45" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>

              <span className="text-[9px] font-mono text-[#00d2ff] font-bold uppercase tracking-widest block">
                ANIMAÇÃO BIOMECÂNICA EM LOOP • 60 FPS
              </span>
              <h4 className="text-sm font-black text-white mt-0.5">
                {currentExercise.name}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Foco Muscular: <strong className="text-[#00d2ff]">{currentExercise.targetMuscle}</strong>
              </p>

              <div className="p-2.5 mt-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-200 leading-relaxed max-w-xs shadow-md">
                💡 <strong>Ponto Crítico:</strong> {currentExercise.cue}
              </div>

              <button
                type="button"
                onClick={() => {
                  setUseAnimatedFallback(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => setUseAnimatedFallback(true));
                  }
                }}
                className="mt-2 text-[10px] text-slate-400 hover:text-[#00d2ff] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Tentar recarregar stream de vídeo
              </button>
            </div>
          )}

          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[9px] font-mono text-[#00d2ff] font-bold">
            {useAnimatedFallback ? 'Guia Ativo' : 'Vídeo HD'}
          </div>
        </div>
      </div>

      {/* Lista de Séries com Carga (kg) e Repetições (reps) Editáveis */}
      <div className="space-y-2 my-2">
        <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-400 uppercase text-center px-2">
          <span>Série</span>
          <span>Carga (kg)</span>
          <span>Reps (Feitas)</span>
          <span>Status</span>
        </div>

        {currentExercise.sets.map((set, sIdx) => (
          <div
            key={set.setNumber}
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
              set.completed
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_12px_rgba(0,210,255,0.1)]'
                : 'bg-[#0f131c] border-slate-800'
            }`}
          >
            <span className="w-1/4 text-center font-mono font-bold text-xs text-white">
              #{set.setNumber}
            </span>

            {/* Input de Carga Float */}
            <div className="w-1/4 flex justify-center">
              <input
                type="number"
                step="any"
                value={set.weightKg}
                onChange={(e) => handleWeightChange(sIdx, parseFloat(e.target.value) || 0)}
                className="w-14 bg-slate-900 border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-xs text-[#00d2ff] outline-none focus:border-[#00d2ff]"
              />
            </div>

            {/* Input de Repetições Editáveis */}
            <div className="w-1/4 flex justify-center">
              <input
                type="number"
                value={set.reps}
                onChange={(e) => handleRepsChange(sIdx, parseInt(e.target.value, 10) || 0)}
                className="w-14 bg-slate-900 border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Checkbox de Conclusão */}
            <div className="w-1/4 flex justify-center">
              <button
                type="button"
                onClick={() => toggleSetComplete(sIdx)}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                  set.completed
                    ? 'bg-[#00d2ff] border-[#00d2ff] text-neutral-950 shadow-[0_0_10px_#00d2ff]'
                    : 'border-slate-700 bg-slate-900 hover:border-cyan-400 text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navegação entre Exercícios e Finalizar */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentExIndex === 0}
            onClick={() => {
              setUseAnimatedFallback(false);
              setCurrentExIndex((prev) => Math.max(0, prev - 1));
            }}
            className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <button
            type="button"
            disabled={currentExIndex === exercises.length - 1}
            onClick={() => {
              setUseAnimatedFallback(false);
              setCurrentExIndex((prev) => Math.min(exercises.length - 1, prev + 1));
            }}
            className="flex-1 py-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900 disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onFinishWorkout}
          className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.35)] cursor-pointer"
        >
          Finalizar Sessão de Treino
        </button>
      </div>

    </div>
  );
};

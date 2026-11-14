import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';

export interface WorkoutSetItem {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExerciseItem {
  id?: string | number;
  name: string;
  targetMuscle: string;
  cue?: string;
  sets: WorkoutSetItem[];
  equipment?: string;
  videoUrl?: string;
  posterUrl?: string;
  animationUrl?: string;
  imageUrl?: string;
}

interface LiveWorkoutRunnerModalProps {
  workoutTitle: string;
  splitName: string;
  exercises: WorkoutExerciseItem[];
  elapsedSeconds: number;
  onClose: () => void;
  onMinimize: () => void;
  onFinishWorkout: (exercises?: WorkoutExerciseItem[]) => void;
  onUpdateExercises?: (exercises: WorkoutExerciseItem[]) => void;
}

// Mapeador universal à prova de falhas: prioriza correspondências específicas de costas, tríceps e pernas ANTES de palavras genéricas como "polia"
function resolvePhysicalVideoPath(
  exerciseId?: string | number,
  exerciseName?: string,
  explicitVideoUrl?: string,
  explicitPosterUrl?: string
): { videoUrl: string; posterUrl: string } {
  // Se o próprio exercício já possuir URL definida
  if (explicitVideoUrl) {
    return {
      videoUrl: explicitVideoUrl,
      posterUrl: explicitPosterUrl || explicitVideoUrl.replace(/\.mp4$/i, '.png'),
    };
  }

  const rawId = String(exerciseId || '').toLowerCase().trim();
  const rawName = String(exerciseName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Se o id já começar com ex- e for um ID de arquivo físico real
  if (rawId.startsWith('ex-') && rawId.length > 5 && !rawId.includes('norm') && !rawId.includes('sess')) {
    return {
      videoUrl: `/assets/exercise-videos/${rawId}.mp4`,
      posterUrl: `/assets/exercise-videos/${rawId}.png`,
    };
  }

  let fileSlug = 'ex-supino-reto-barra';

  // 1. DORSAL / COSTAS (PRIORIDADE ABSOLUTA - ANTES DE QUALQUER CHECAGEM DE "POLIA")
  if (rawName.includes('puxada') && (rawName.includes('triangulo') || rawName.includes('fechada'))) {
    fileSlug = 'ex-puxada-triangulo';
  } else if (rawName.includes('puxada')) {
    fileSlug = 'ex-puxada-frontal-polia';
  } else if (rawName.includes('pulldown')) {
    fileSlug = 'ex-pulldown-polia-alta';
  } else if (rawName.includes('barra fixa') && rawName.includes('supinad')) {
    fileSlug = 'ex-barra-fixa-supinada';
  } else if (rawName.includes('barra fixa') || rawName.includes('pull-up')) {
    fileSlug = 'ex-barra-fixa-pronada';
  } else if (rawName.includes('remada') && rawName.includes('curvada')) {
    fileSlug = 'ex-remada-curvada-barra';
  } else if (rawName.includes('remada') && (rawName.includes('serrote') || rawName.includes('unilateral'))) {
    fileSlug = 'ex-remada-unilateral-serrote';
  } else if (rawName.includes('remada') && (rawName.includes('cavalinho') || rawName.includes('t-bar') || rawName.includes('tbar'))) {
    fileSlug = 'ex-remada-cavalinho-tbar';
  } else if (rawName.includes('remada') && rawName.includes('baixa')) {
    fileSlug = 'ex-remada-baixa-triangulo';
  } else if (rawName.includes('remada') && rawName.includes('articulada')) {
    fileSlug = 'ex-remada-articulada-maquina';
  } else if (rawName.includes('remada') && rawName.includes('alta')) {
    fileSlug = 'ex-remada-alta-barra-w';
  } else if (rawName.includes('levantamento terra') || rawName.includes('terra')) {
    fileSlug = 'ex-levantamento-terra-convencional';

  // 2. DELTÓIDES / OMBROS & TRAPÉZIO
  } else if (rawName.includes('face pull')) {
    fileSlug = 'ex-face-pull-corda';
  } else if (rawName.includes('crucifixo') && (rawName.includes('invertido') || rawName.includes('posterior'))) {
    fileSlug = rawName.includes('peck') ? 'ex-crucifixo-invertido-peck-deck' : 'ex-crucifixo-invertido-halteres';
  } else if (rawName.includes('elevacao lateral') && rawName.includes('polia')) {
    fileSlug = 'ex-elevacao-lateral-polia';
  } else if (rawName.includes('elevacao lateral') && rawName.includes('inclinad')) {
    fileSlug = 'ex-elevacao-lateral-inclinada';
  } else if (rawName.includes('elevacao lateral')) {
    fileSlug = 'ex-elevacao-lateral-halteres';
  } else if (rawName.includes('elevacao frontal') && rawName.includes('corda')) {
    fileSlug = 'ex-elevacao-frontal-corda';
  } else if (rawName.includes('elevacao frontal')) {
    fileSlug = 'ex-elevacao-frontal-halteres';
  } else if (rawName.includes('desenvolvimento') && rawName.includes('arnold')) {
    fileSlug = 'ex-desenvolvimento-arnold';
  } else if (rawName.includes('desenvolvimento') && rawName.includes('militar')) {
    fileSlug = 'ex-desenvolvimento-militar-barra';
  } else if (rawName.includes('desenvolvimento') && rawName.includes('maquina')) {
    fileSlug = 'ex-desenvolvimento-maquina';
  } else if (rawName.includes('desenvolvimento')) {
    fileSlug = 'ex-desenvolvimento-halteres';
  } else if (rawName.includes('encolhimento') && rawName.includes('barra')) {
    fileSlug = 'ex-encolhimento-barra';
  } else if (rawName.includes('encolhimento')) {
    fileSlug = 'ex-encolhimento-halteres';

  // 3. BRAÇOS: TRÍCEPS
  } else if (rawName.includes('triceps') && rawName.includes('corda')) {
    fileSlug = 'ex-triceps-corda-polia';
  } else if (rawName.includes('triceps') && rawName.includes('barra v')) {
    fileSlug = 'ex-triceps-pulley-barra-v';
  } else if (rawName.includes('triceps') && (rawName.includes('pulley') || rawName.includes('barra reta'))) {
    fileSlug = 'ex-triceps-pulley-barra-reta';
  } else if (rawName.includes('testa') && (rawName.includes('halter') || rawName.includes('halteres'))) {
    fileSlug = 'ex-triceps-testa-halteres';
  } else if (rawName.includes('testa') || rawName.includes('triceps testa')) {
    fileSlug = 'ex-triceps-testa-barra-w';
  } else if (rawName.includes('frances') && rawName.includes('polia')) {
    fileSlug = 'ex-triceps-frances-polia-corda';
  } else if (rawName.includes('frances') || rawName.includes('triceps frances')) {
    fileSlug = 'ex-triceps-frances-unilateral';
  } else if (rawName.includes('coice')) {
    fileSlug = 'ex-triceps-coice-polia';

  // 4. BRAÇOS: BÍCEPS & ANTEBRAÇO
  } else if (rawName.includes('rosca direta') && rawName.includes('barra w')) {
    fileSlug = 'ex-rosca-direta-barra-w';
  } else if (rawName.includes('rosca direta')) {
    fileSlug = 'ex-rosca-direta-barra-reta';
  } else if (rawName.includes('martelo') && rawName.includes('corda')) {
    fileSlug = 'ex-rosca-martelo-corda';
  } else if (rawName.includes('martelo')) {
    fileSlug = 'ex-rosca-martelo-halteres';
  } else if (rawName.includes('alternada')) {
    fileSlug = 'ex-rosca-alternada-halteres';
  } else if (rawName.includes('scott')) {
    fileSlug = 'ex-rosca-scott-barra-w';
  } else if (rawName.includes('concentrada')) {
    fileSlug = 'ex-rosca-concentrada-halter';
  } else if (rawName.includes('aranha') || rawName.includes('spider')) {
    fileSlug = 'ex-rosca-aranha-spider-curl';

  // 5. PEITORAIS & CROSSOVER
  } else if (rawName.includes('crossover') && rawName.includes('alta')) {
    fileSlug = 'ex-crossover-polia-alta';
  } else if (rawName.includes('crossover') && rawName.includes('baixa')) {
    fileSlug = 'ex-crossover-polia-baixa';
  } else if (rawName.includes('crossover')) {
    fileSlug = 'ex-crossover-polia-media';
  } else if (rawName.includes('inclinado') && (rawName.includes('halter') || rawName.includes('halteres'))) {
    fileSlug = 'ex-supino-inclinado-halteres';
  } else if (rawName.includes('inclinado') && rawName.includes('barra')) {
    fileSlug = 'ex-supino-inclinado-barra';
  } else if (rawName.includes('declinado') && (rawName.includes('halter') || rawName.includes('halteres'))) {
    fileSlug = 'ex-supino-declinado-halteres';
  } else if (rawName.includes('declinado') || rawName.includes('canadense')) {
    fileSlug = 'ex-supino-declinado-barra';
  } else if (rawName.includes('supino') && (rawName.includes('halter') || rawName.includes('halteres'))) {
    fileSlug = 'ex-supino-reto-halteres';
  } else if (rawName.includes('supino') && rawName.includes('maquina')) {
    fileSlug = 'ex-supino-maquina-articulada';
  } else if (rawName.includes('supino') && rawName.includes('fechad')) {
    fileSlug = 'ex-supino-fechado-barra';
  } else if (rawName.includes('supino')) {
    fileSlug = 'ex-supino-reto-barra';
  } else if (rawName.includes('crucifixo') && rawName.includes('inclinado')) {
    fileSlug = 'ex-crucifixo-inclinado-halteres';
  } else if (rawName.includes('crucifixo')) {
    fileSlug = 'ex-crucifixo-reto-halteres';
  } else if (rawName.includes('peck') || rawName.includes('voador')) {
    fileSlug = 'ex-peck-deck-voador';
  } else if (rawName.includes('mergulho') || rawName.includes('paralela')) {
    fileSlug = 'ex-mergulho-paralelas-peito';
  } else if (rawName.includes('pullover')) {
    fileSlug = 'ex-pullover-halter';

  // 6. PERNAS & PANTURRILHAS
  } else if (rawName.includes('agachamento') && rawName.includes('frontal')) {
    fileSlug = 'ex-agachamento-frontal-barra';
  } else if (rawName.includes('agachamento') && rawName.includes('smith')) {
    fileSlug = 'ex-agachamento-smith';
  } else if (rawName.includes('agachamento') && rawName.includes('sumo')) {
    fileSlug = 'ex-agachamento-sumo-halter';
  } else if (rawName.includes('agachamento') && rawName.includes('bulgaro')) {
    fileSlug = 'ex-agachamento-bulgaro-halteres';
  } else if (rawName.includes('agachamento') && rawName.includes('hack')) {
    fileSlug = 'ex-hack-squat-maquina';
  } else if (rawName.includes('agachamento')) {
    fileSlug = 'ex-agachamento-livre-barra';
  } else if (rawName.includes('leg press')) {
    fileSlug = 'ex-leg-press-45';
  } else if (rawName.includes('extensora')) {
    fileSlug = 'ex-cadeira-extensora';
  } else if (rawName.includes('flexora') && rawName.includes('mesa')) {
    fileSlug = 'ex-mesa-flexora';
  } else if (rawName.includes('flexora')) {
    fileSlug = 'ex-cadeira-flexora';
  } else if (rawName.includes('stiff') && (rawName.includes('halter') || rawName.includes('halteres'))) {
    fileSlug = 'ex-stiff-halteres';
  } else if (rawName.includes('stiff')) {
    fileSlug = 'ex-stiff-barra';
  } else if (rawName.includes('passada') || rawName.includes('avanco')) {
    fileSlug = 'ex-afundo-passada-halteres';
  } else if (rawName.includes('pelvica') && rawName.includes('maquina')) {
    fileSlug = 'ex-elevacao-pelvica-maquina';
  } else if (rawName.includes('pelvica') || rawName.includes('hip thrust')) {
    fileSlug = 'ex-elevacao-pelvica-barra';
  } else if (rawName.includes('abdutora')) {
    fileSlug = 'ex-cadeira-abdutora';
  } else if (rawName.includes('panturrilha') && rawName.includes('sentado')) {
    fileSlug = 'ex-panturrilha-sentado-soleo';
  } else if (rawName.includes('panturrilha') && rawName.includes('leg')) {
    fileSlug = 'ex-panturrilha-leg-press-45';
  } else if (rawName.includes('panturrilha') && rawName.includes('unilateral')) {
    fileSlug = 'ex-panturrilha-unilateral-degrau';
  } else if (rawName.includes('panturrilha')) {
    fileSlug = 'ex-panturrilha-em-pe-maquina';

  // 7. ABDÔMEN
  } else if (rawName.includes('cable crunch') || (rawName.includes('abdominal') && (rawName.includes('polia') || rawName.includes('cabo')))) {
    fileSlug = 'ex-abdominal-polia-cable-crunch';
  } else if (rawName.includes('infra') || (rawName.includes('abdominal') && rawName.includes('paralela'))) {
    fileSlug = 'ex-abdominal-infra-paralela';
  } else if (rawName.includes('roda') || rawName.includes('wheel')) {
    fileSlug = 'ex-roda-abdominal-abwheel';
  } else if (rawName.includes('vacuum')) {
    fileSlug = 'ex-abdominal-vacuum';
  } else if (rawName.includes('russian')) {
    fileSlug = 'ex-russian-twist-anilha';
  } else if (rawName.includes('abdominal') || rawName.includes('crunch')) {
    fileSlug = 'ex-abdominal-supra-solo';
  }

  return {
    videoUrl: `/assets/exercise-videos/${fileSlug}.mp4`,
    posterUrl: `/assets/exercise-videos/${fileSlug}.png`,
  };
}

export const LiveWorkoutRunnerModal: React.FC<LiveWorkoutRunnerModalProps> = ({
  workoutTitle,
  splitName,
  exercises: initialExercises,
  elapsedSeconds,
  onClose,
  onMinimize,
  onFinishWorkout,
  onUpdateExercises,
}) => {
  const [exercises, setExercises] = useState<WorkoutExerciseItem[]>(initialExercises);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(90);
  const [isResting, setIsResting] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sincroniza se a lista mudar externamente
  useEffect(() => {
    setExercises(initialExercises);
  }, [initialExercises]);

  const currentExercise = exercises[currentExIndex] || exercises[0];
  const { videoUrl, posterUrl } = resolvePhysicalVideoPath(
    currentExercise.id,
    currentExercise.name,
    currentExercise.videoUrl || currentExercise.animationUrl,
    currentExercise.posterUrl || currentExercise.imageUrl
  );

  // Forçar autoplay no início e ao trocar de exercício
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [currentExIndex, videoUrl]);

  // Alternar conclusão da série com disparo do descanso ATP-CP e persistência
  const toggleSetComplete = (setIndex: number) => {
    setExercises((prev) => {
      const updated = prev.map((ex, eIdx) => {
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
      });
      if (onUpdateExercises) onUpdateExercises(updated);
      return updated;
    });
  };

  // Ajustar Carga Float permitindo campo vazio durante a digitação
  const handleWeightChange = (setIndex: number, rawVal: string) => {
    setExercises((prev) => {
      const updated = prev.map((ex, eIdx) => {
        if (eIdx !== currentExIndex) return ex;
        const newSets = ex.sets.map((s, sIdx) => {
          if (sIdx !== setIndex) return s;
          if (rawVal === '') {
            return { ...s, weightKg: '' as any };
          }
          const parsed = parseFloat(rawVal);
          return { ...s, weightKg: isNaN(parsed) ? ('' as any) : parsed };
        });
        return { ...ex, sets: newSets };
      });
      if (onUpdateExercises) onUpdateExercises(updated);
      return updated;
    });
  };

  // Ajustar Repetições Feitas permitindo campo vazio durante a digitação
  const handleRepsChange = (setIndex: number, rawVal: string) => {
    setExercises((prev) => {
      const updated = prev.map((ex, eIdx) => {
        if (eIdx !== currentExIndex) return ex;
        const newSets = ex.sets.map((s, sIdx) => {
          if (sIdx !== setIndex) return s;
          if (rawVal === '') {
            return { ...s, reps: '' as any };
          }
          const parsed = parseInt(rawVal, 10);
          return { ...s, reps: isNaN(parsed) ? ('' as any) : parsed };
        });
        return { ...ex, sets: newSets };
      });
      if (onUpdateExercises) onUpdateExercises(updated);
      return updated;
    });
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
    <div className="fixed inset-0 z-50 bg-[#07090e] flex flex-col justify-between p-4 overflow-y-auto select-none">
      
      {/* Topo do Treino ao Vivo com Botão de Finalizar Visível o tempo todo */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
            {splitName} • AO VIVO
          </span>
          <h2 className="text-base font-black text-white">{workoutTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* BOTÃO FINALIZAR DIRETO NO TOPO */}
          <button
            type="button"
            onClick={() => onFinishWorkout(exercises)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Finalizar</span>
          </button>

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

      {/* PLAYER DE VÍDEO MP4 REAL RESOLVIDO */}
      <div className="space-y-2 my-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">
            Exercício {currentExIndex + 1} de {exercises.length}
          </span>
          <span className="text-xs font-bold text-slate-300">{currentExercise.targetMuscle}</span>
        </div>

        <h3 className="text-lg font-black text-white">{currentExercise.name}</h3>

        {/* Box do Vídeo */}
        <div className="w-full aspect-[16/10] max-h-[250px] rounded-3xl bg-[#0a0e17] border border-cyan-500/40 overflow-hidden relative shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            poster={posterUrl}
            autoPlay
            loop
            muted
            playsInline
            controls
            webkit-playsinline="true"
            preload="auto"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/40 text-[9px] font-mono text-[#00d2ff] font-bold pointer-events-none flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-ping" />
            Demonstração 3D Loop
          </div>
        </div>

        {/* Ponto Crítico de Execução */}
        <div className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 text-[11px] text-slate-300">
          💡 <strong className="text-white">Ponto Crítico:</strong> {currentExercise.cue || 'Cadência excêntrica de 3s mantendo escápulas aduzidas e retração ativa.'}
        </div>
      </div>

      {/* Lista de Séries com Carga (kg) e Repetições (reps) Editáveis & Auto-Select ao Tocar */}
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

            {/* Input de Carga Float com Auto-Select e Limpeza ao Tocar */}
            <div className="w-1/4 flex justify-center">
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={set.weightKg === 0 ? '' : set.weightKg}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleWeightChange(sIdx, e.target.value)}
                onBlur={(e) => {
                  if (e.target.value === '') handleWeightChange(sIdx, '0');
                }}
                className="w-14 bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-center font-mono font-bold text-xs text-[#00d2ff] outline-none focus:border-[#00d2ff] focus:bg-slate-950 focus:ring-1 focus:ring-[#00d2ff]"
              />
            </div>

            {/* Input de Repetições Editáveis com Auto-Select e Limpeza ao Tocar */}
            <div className="w-1/4 flex justify-center">
              <input
                type="number"
                inputMode="numeric"
                value={set.reps === 0 ? '' : set.reps}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleRepsChange(sIdx, e.target.value)}
                onBlur={(e) => {
                  if (e.target.value === '') handleRepsChange(sIdx, '0');
                }}
                className="w-14 bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-center font-mono font-bold text-xs text-white outline-none focus:border-cyan-400 focus:bg-slate-950 focus:ring-1 focus:ring-cyan-400"
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

      {/* Navegação entre Exercícios e Botão de Finalizar */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentExIndex === 0}
            onClick={() => setCurrentExIndex((prev) => Math.max(0, prev - 1))}
            className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <button
            type="button"
            disabled={currentExIndex === exercises.length - 1}
            onClick={() => setCurrentExIndex((prev) => Math.min(exercises.length - 1, prev + 1))}
            className="flex-1 py-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900 disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onFinishWorkout(exercises)}
          className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.35)] cursor-pointer"
        >
          Finalizar Sessão de Treino
        </button>
      </div>

    </div>
  );
};



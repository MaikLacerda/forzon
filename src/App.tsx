import React, { useState, useRef, useEffect } from 'react';
import {
  Dumbbell,
  Utensils,
  Activity,
  Users,
  User,
  Flame,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Plus,
  Moon,
  Zap,
  Heart,
  TrendingUp,
  Watch,
  Share2,
  X,
  Compass,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Check,
  Camera,
  Edit2,
  Maximize2
} from 'lucide-react';

// Import dos 3 blocos modulares criados nas Partes 1, 2 e 3
import { LiveWorkoutRunnerModal } from './components/workout/LiveWorkoutRunnerModal';
import { CommunityFeedView } from './components/social/CommunityFeedView';
import { GPSOutdoorModal } from './components/gps/GPSOutdoorModal';
import { ComprehensiveMedicalIntakeModal, MedicalIntakeData } from './components/intake/ComprehensiveMedicalIntakeModal';

type TabType = 'workout' | 'nutrition' | 'bio' | 'community' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('workout');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Perfil do Atleta (Editável livremente pelo usuário)
  const [userName, setUserName] = useState('Maikon Lacerda');
  const [userHandle, setUserHandle] = useState('@maiklacerda');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Dispositivos e Sensores
  const [devices, setDevices] = useState({
    appleWatch: true,
    strava: true,
    zeppOs: false,
    garmin: false
  });

  // Modais de Controle
  const [showMedicalIntake, setShowMedicalIntake] = useState(false);
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Estado do Treino ao Vivo & Floating Bar Persistente
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isWorkoutMinimized, setIsWorkoutMinimized] = useState(false);
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);

  // Cronômetro persistente mesmo ao navegar pelas abas
  useEffect(() => {
    let timer: any = null;
    if (isWorkoutActive) {
      timer = setInterval(() => {
        setWorkoutElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWorkoutActive]);

  // Formatar tempo MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Parâmetros Médicos e Biométricos
  const [intakeData, setIntakeData] = useState<MedicalIntakeData>({
    heightCm: 178.5,
    weightKg: 78.4,
    waterLiters: 3.2,
    diagnoses: ['Nenhuma condição diagnosticada'],
    medications: '',
    trainingHistory: '1 a 3 anos contínuos',
    sustainableDays: 4,
    exactSessionMinutes: 60,
    splitPreference: 'ABCD Clássico',
    focusMuscles: ['Peitoral', 'Deltoides (Lateral)', 'Braços'],
    strongMuscles: ['Costas / Dorsais'],
    mealsPerDay: '4 refeições estruturadas',
    forbiddenFoods: '',
    essentialFoods: 'Ovos, aveia, banana, café, pasta de amendoim',
    cookingHabit: 'Cozinha em casa diariamente',
    gutHealth: 'Regular (sem estufamento ou refluxo)',
    alcoholSodaHabit: 'Esporádico / Raro (0 a 1x semana)',
    goal90Days: 'Hipertrofia com foco estético e densidade muscular',
    pastFailures: 'Dietas muito restritivas',
    absoluteSuccessDefinition: 'Ganhar 3kg de massa magra mantendo o abdômen definido'
  });

  // Banco de Treinos Completo com Exercícios Reais e Distintos
  const workoutPlans: Record<string, Record<string, {
    title: string;
    focus: string;
    duration: string;
    cardio: { machine: string; duration: string; rationale: string; kcal: string };
    exercises: Array<{ id: number; name: string; targetMuscle: string; cue: string; sets: Array<{ setNumber: number; weightKg: number; reps: number; completed: boolean }> }>;
  }>> = {
    'ABCD Clássico': {
      'Treino A': {
        title: 'Treino A — Peitorais, Deltóide Anterior & Tríceps',
        focus: 'Empurrar Horizontal & Cadeia Superior Anterior',
        duration: '~52 min',
        cardio: { machine: 'Simulador de Escadas (Stairmaster)', duration: '20 min pós-treino', rationale: 'Zona 2 contínua sem estresse em braços', kcal: '~200 kcal' },
        exercises: [
          { id: 101, name: 'Supino Inclinado com Halteres', targetMuscle: 'Peitoral Clavicular', cue: 'Pegada neutra a 30° com rotação escapular', sets: [{ setNumber: 1, weightKg: 32, reps: 10, completed: true }, { setNumber: 2, weightKg: 34, reps: 8, completed: false }, { setNumber: 3, weightKg: 34, reps: 8, completed: false }, { setNumber: 4, weightKg: 36, reps: 6, completed: false }] },
          { id: 102, name: 'Supino Reto com Barra Olímpica', targetMuscle: 'Peitoral Médio', cue: 'Pausa de 1 segundo na transição excêntrica', sets: [{ setNumber: 1, weightKg: 80, reps: 8, completed: false }, { setNumber: 2, weightKg: 84, reps: 8, completed: false }, { setNumber: 3, weightKg: 84, reps: 8, completed: false }, { setNumber: 4, weightKg: 88, reps: 6, completed: false }] },
          { id: 103, name: 'Crucifixo no Crossover (Polia Média)', targetMuscle: 'Peitoral Esternal', cue: 'Pico de contração de 2s', sets: [{ setNumber: 1, weightKg: 15, reps: 12, completed: false }, { setNumber: 2, weightKg: 17.5, reps: 12, completed: false }, { setNumber: 3, weightKg: 17.5, reps: 10, completed: false }] },
          { id: 104, name: 'Desenvolvimento com Halteres', targetMuscle: 'Deltoides', cue: 'Plano escapular firme', sets: [{ setNumber: 1, weightKg: 20, reps: 10, completed: false }, { setNumber: 2, weightKg: 22, reps: 10, completed: false }, { setNumber: 3, weightKg: 24, reps: 8, completed: false }] },
          { id: 105, name: 'Tríceps Corda na Polia Alta', targetMuscle: 'Tríceps Lateral', cue: 'Abertura das pontas na extensão', sets: [{ setNumber: 1, weightKg: 22.5, reps: 12, completed: false }, { setNumber: 2, weightKg: 25, reps: 12, completed: false }, { setNumber: 3, weightKg: 27.5, reps: 10, completed: false }] },
          { id: 106, name: 'Abdominal Crunch na Polia Alta', targetMuscle: 'Reto Abdominal', cue: 'Dinâmico com sobrecarga progressiva', sets: [{ setNumber: 1, weightKg: 30, reps: 15, completed: false }, { setNumber: 2, weightKg: 35, reps: 15, completed: false }, { setNumber: 3, weightKg: 40, reps: 12, completed: false }] }
        ]
      },
      'Treino B': {
        title: 'Treino B — Costas, Deltóide Posterior & Bíceps',
        focus: 'Puxar Vertical/Horizontal & Flexores de Cotovelo',
        duration: '~55 min',
        cardio: { machine: 'Esteira Inclinada (12% Incline Walk)', duration: '20 min pós-treino', rationale: 'Sem impacto articular pós-dorsais', kcal: '~190 kcal' },
        exercises: [
          { id: 201, name: 'Puxada Frontal na Polia Alta', targetMuscle: 'Latíssimo do Dorso', cue: 'Depressão escapular e cotovelos aos quadris', sets: [{ setNumber: 1, weightKg: 60, reps: 10, completed: false }, { setNumber: 2, weightKg: 65, reps: 8, completed: false }, { setNumber: 3, weightKg: 70, reps: 8, completed: false }, { setNumber: 4, weightKg: 75, reps: 6, completed: false }] },
          { id: 202, name: 'Remada Curvada com Barra', targetMuscle: 'Dorsal Médio', cue: 'Coluna neutra estabilizada a 45°', sets: [{ setNumber: 1, weightKg: 60, reps: 10, completed: false }, { setNumber: 2, weightKg: 70, reps: 8, completed: false }, { setNumber: 3, weightKg: 70, reps: 8, completed: false }, { setNumber: 4, weightKg: 75, reps: 6, completed: false }] },
          { id: 203, name: 'Crucifixo Invertido com Halteres', targetMuscle: 'Deltóide Posterior', cue: 'Ativação seletiva de rombóides', sets: [{ setNumber: 1, weightKg: 10, reps: 12, completed: false }, { setNumber: 2, weightKg: 12, reps: 12, completed: false }, { setNumber: 3, weightKg: 14, reps: 10, completed: false }] },
          { id: 204, name: 'Rosca Direta com Barra W', targetMuscle: 'Bíceps Braquial', cue: 'Cotovelos travados ao lado do tronco', sets: [{ setNumber: 1, weightKg: 26, reps: 10, completed: false }, { setNumber: 2, weightKg: 30, reps: 8, completed: false }, { setNumber: 3, weightKg: 30, reps: 8, completed: false }] },
          { id: 205, name: 'Rosca Martelo com Halteres', targetMuscle: 'Braquial', cue: 'Pegada neutra', sets: [{ setNumber: 1, weightKg: 14, reps: 12, completed: false }, { setNumber: 2, weightKg: 16, reps: 10, completed: false }, { setNumber: 3, weightKg: 18, reps: 8, completed: false }] }
        ]
      },
      'Treino C': {
        title: 'Treino C — Pernas Completas & Panturrilhas',
        focus: 'Membros Inferiores: Quadríceps, Isquiotibiais & Glúteos',
        duration: '~58 min',
        cardio: { machine: 'Bicicleta Ergométrica', duration: '20 min pós-treino', rationale: 'Recuperação ativa e remoção de ácido lático', kcal: '~160 kcal' },
        exercises: [
          { id: 301, name: 'Agachamento Livre com Barra', targetMuscle: 'Quadríceps', cue: 'Profundidade paralela com pressão no calcanhar', sets: [{ setNumber: 1, weightKg: 80, reps: 10, completed: false }, { setNumber: 2, weightKg: 90, reps: 8, completed: false }, { setNumber: 3, weightKg: 100, reps: 8, completed: false }, { setNumber: 4, weightKg: 105, reps: 6, completed: false }] },
          { id: 302, name: 'Leg Press 45°', targetMuscle: 'Membros Inferiores', cue: 'Descida controlada sem bloquear joelhos', sets: [{ setNumber: 1, weightKg: 180, reps: 12, completed: false }, { setNumber: 2, weightKg: 220, reps: 10, completed: false }, { setNumber: 3, weightKg: 240, reps: 10, completed: false }] },
          { id: 303, name: 'Mesa Flexora Deitada', targetMuscle: 'Isquiotibiais', cue: 'Quadril colado ao banco', sets: [{ setNumber: 1, weightKg: 40, reps: 12, completed: false }, { setNumber: 2, weightKg: 45, reps: 10, completed: false }, { setNumber: 3, weightKg: 50, reps: 8, completed: false }] },
          { id: 304, name: 'Panturrilha no Leg Press 45°', targetMuscle: 'Gastrocnêmio', cue: 'Alongamento fascial profundo de 2s', sets: [{ setNumber: 1, weightKg: 120, reps: 15, completed: false }, { setNumber: 2, weightKg: 140, reps: 15, completed: false }, { setNumber: 3, weightKg: 150, reps: 12, completed: false }] }
        ]
      },
      'Treino D': {
        title: 'Treino D — Ombros, Braços Completos & Core',
        focus: 'Hipertrofia de Deltóide Lateral, Tríceps & Bíceps',
        duration: '~50 min',
        cardio: { machine: 'Simulador de Escadas (Intervalado)', duration: '20 min pós-treino', rationale: 'Efeito EPOC em degraus nível 7 a 9', kcal: '~210 kcal' },
        exercises: [
          { id: 401, name: 'Elevação Lateral Escapular com Halteres', targetMuscle: 'Deltóide Lateral', cue: 'Drop-set na última série', sets: [{ setNumber: 1, weightKg: 12, reps: 15, completed: false }, { setNumber: 2, weightKg: 14, reps: 12, completed: false }, { setNumber: 3, weightKg: 14, reps: 12, completed: false }, { setNumber: 4, weightKg: 16, reps: 10, completed: false }] },
          { id: 402, name: 'Tríceps Testa com Barra W', targetMuscle: 'Tríceps Cabeça Longa', cue: 'Barra descendo até a linha da testa', sets: [{ setNumber: 1, weightKg: 24, reps: 10, completed: false }, { setNumber: 2, weightKg: 28, reps: 10, completed: false }, { setNumber: 3, weightKg: 30, reps: 8, completed: false }] },
          { id: 403, name: 'Rosca Scott no Banco', targetMuscle: 'Bíceps', cue: 'Pico excêntrico controlado', sets: [{ setNumber: 1, weightKg: 22, reps: 10, completed: false }, { setNumber: 2, weightKg: 26, reps: 10, completed: false }, { setNumber: 3, weightKg: 28, reps: 8, completed: false }] },
          { id: 404, name: 'Rolamento com Roda Abdominal', targetMuscle: 'Transverso do Abdômen', cue: 'Dinâmico mantendo o core blindado', sets: [{ setNumber: 1, weightKg: 0, reps: 10, completed: false }, { setNumber: 2, weightKg: 0, reps: 10, completed: false }, { setNumber: 3, weightKg: 0, reps: 10, completed: false }] }
        ]
      }
    }
  };

  const activePlan = workoutPlans[intakeData.splitPreference] || workoutPlans['ABCD Clássico'];
  const dayKeys = Object.keys(activePlan);
  const [selectedDayKey, setSelectedDayKey] = useState(dayKeys[0] || 'Treino A');
  const currentWorkout = activePlan[selectedDayKey] || activePlan[dayKeys[0]];

  // Nutrição
  const [waterCurrent, setWaterCurrent] = useState(2400);
  const waterTarget = Math.round(intakeData.waterLiters * 1000);
  const [meals, setMeals] = useState([
    { id: 1, title: 'Café da Manhã Anabólico', desc: '4 ovos mexidos, aveia e banana prata', kcal: 550, checked: true },
    { id: 2, title: 'Almoço — Frango Grelhado com Arroz', desc: '180g peito de frango, 200g arroz branco e legumes', kcal: 680, checked: true },
    { id: 3, title: 'Lanche Pré-Treino', desc: 'Whey protein, creatina 5g e pasta de amendoim', kcal: 320, checked: false },
    { id: 4, title: 'Jantar — Salmão Grelhado com Mandioca', desc: '160g de salmão com 150g mandioca cozida', kcal: 590, checked: false }
  ]);

  // Upload Real de Foto de Perfil
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserAvatar(URL.createObjectURL(file));
    }
  };

  const handleToggleDevice = (devKey: keyof typeof devices) => {
    setDevices(prev => ({ ...prev, [devKey]: !prev[devKey] }));
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-28 selection:bg-[#00d2ff] selection:text-black">
      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />

      {/* ==================== HEADER OFICIAL FORZON ==================== */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/forzon-logo.jpg"
              alt="FORZON"
              className="w-9 h-9 rounded-xl object-cover border border-cyan-500/30 shadow-[0_0_12px_rgba(0,210,255,0.25)]"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">
                  FOR<span className="text-[#00d2ff]">Z</span>ON
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-tight -mt-0.5">MORE THAN FITNESS</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>12d</span>
            </div>
            
            <div
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center text-xs font-bold text-[#00d2ff] cursor-pointer hover:border-[#00d2ff] transition-all"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                userName.substring(0, 2).toUpperCase()
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== CONTEÚDO PRINCIPAL (5 ABAS) ==================== */}
      <main className="max-w-md mx-auto px-4 pt-4">

        {/* ABA 1: TREINO */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-cyan-500/30 flex items-center justify-between shadow-[0_0_20px_rgba(0,210,255,0.08)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex flex-col items-center justify-center text-[#00d2ff]">
                  <span className="text-base font-black font-mono leading-none">88</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">%</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white">Prontidão Neuromuscular</h3>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      MODO PR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">SNC pronto para sobrecarga (+5%).</p>
                </div>
              </div>
              <button
                onClick={() => setShowMedicalIntake(true)}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[#00d2ff] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Anamnese IA
              </button>
            </div>

            {/* Alternância Dinâmica de Treino A, B, C, D */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {dayKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedDayKey(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black tracking-wide shrink-0 border transition-all ${
                    selectedDayKey === key
                      ? 'bg-cyan-950/90 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                      : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Card Principal da Sessão */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                <span className="text-[#00d2ff] uppercase tracking-wider">{intakeData.splitPreference} • {selectedDayKey}</span>
                <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> {currentWorkout.duration}</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">{currentWorkout.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{currentWorkout.focus}</p>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">{intakeData.trainingHistory}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">Diagnóstico: {intakeData.diagnoses[0] || 'Livre'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">Abdômen Dinâmico</span>
              </div>

              <button
                onClick={() => {
                  setIsWorkoutActive(true);
                  setIsWorkoutMinimized(false);
                }}
                className="w-full mt-4 py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                {isWorkoutActive ? 'Continuar Treino em Andamento' : 'Iniciar Treino ao Vivo'}
              </button>
            </div>

            {/* Lista dos Exercícios */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">
                  SEQUÊNCIA PRINCIPAL ({currentWorkout.exercises.length} EXERCÍCIOS)
                </span>
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="text-[11px] font-bold text-[#00d2ff] hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Trocar Exercício
                </button>
              </div>

              {currentWorkout.exercises.map((ex, idx) => (
                <div key={ex.id} className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800/90 flex items-center justify-between hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-400 font-mono">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ex.sets.length} séries • <span className="text-[#00d2ff]">{ex.cue}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-white">{ex.sets[0]?.weightKg || 30} kg</span>
                </div>
              ))}
            </div>

            {/* Bloco de Cardio Híbrido */}
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{currentWorkout.cardio.machine}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{currentWorkout.cardio.rationale} ({currentWorkout.cardio.duration})</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black text-[#00d2ff] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                {currentWorkout.cardio.kcal}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setShowMedicalIntake(true)}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[#00d2ff] text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Reavaliar Periodização
                </div>
                <p className="text-[10px] text-slate-400">Ajustar peso ({intakeData.weightKg}kg), altura e metas.</p>
              </button>

              <button
                onClick={() => setShowGPSModal(true)}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                  <Compass className="w-3.5 h-3.5" /> GPS Outdoor
                </div>
                <p className="text-[10px] text-slate-400">Corrida, Bike e Trilha por satélite.</p>
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: NUTRIÇÃO */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">NUTRIÇÃO & MACROS</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Diário Nutricional</h1>
              <p className="text-xs text-slate-400">Calibrado para {intakeData.weightKg}kg • {intakeData.mealsPerDay}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Balanço Calórico</span>
                <span className="font-mono font-black text-white">1.840 / <span className="text-[#00d2ff]">2.500 kcal</span></span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-[#00d2ff] rounded-full shadow-[0_0_10px_#00d2ff]" style={{ width: '73.6%' }} />
              </div>
              <div className="grid grid-cols-3 text-center pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400">Proteínas</span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">142g <span className="text-slate-500 text-[10px]">/ 170g</span></p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Carboidratos</span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">210g <span className="text-slate-500 text-[10px]">/ 290g</span></p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Gorduras</span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">52g <span className="text-slate-500 text-[10px]">/ 70g</span></p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meta Hídrica Diária</span>
                <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                  <span className="text-base font-black text-[#00d2ff]">{waterCurrent} mL</span>
                  <span className="text-xs text-slate-400">/ {waterTarget} mL</span>
                </div>
              </div>
              <button
                onClick={() => setWaterCurrent(prev => Math.min(waterTarget, prev + 250))}
                className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[#00d2ff] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> +250 ml
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-white uppercase tracking-wider px-1">REFEIÇÕES DE HOJE</span>
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, checked: !m.checked } : m))}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    meal.checked ? 'bg-[#0f131c]/60 border-slate-800/60 opacity-90' : 'bg-[#0f131c] border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      meal.checked ? 'bg-[#00d2ff] border-[#00d2ff] text-neutral-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {meal.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${meal.checked ? 'text-slate-300 line-through' : 'text-white'}`}>{meal.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{meal.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#00d2ff]">{meal.kcal} kcal</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRecoveryModal(true)}
              className="w-full py-3.5 rounded-xl bg-[#0f131c] hover:bg-slate-900 border border-cyan-500/40 text-[#00d2ff] font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5" />
              Sugerir Refeição Pós-Treino ({selectedDayKey})
            </button>
          </div>
        )}

        {/* ABA 3: BIO (DESEMPENHO & EXPLICATIVO DE CALIBRAÇÃO) */}
        {activeTab === 'bio' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">BIOFEEDBACK & FISIOLOGIA</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Desempenho & Prontidão</h1>
              <p className="text-xs text-slate-400">Como funciona: Calibração de sono, HRV e estresse diário.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f131c] border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/70 border-2 border-cyan-500/40 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.25)]">
                  <span className="text-2xl font-black text-[#00d2ff] font-mono leading-none">88</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">/100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">Prontidão Neuromuscular</h3>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      MODO PR
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">SNC recuperado para sobrecarga progressiva</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">VFC elevada (72ms) • Repouso: 54 bpm</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#07090e] border border-slate-800 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Origem dos Dados da Bio:</strong> Calculado via telemetria do relógio (ou calibração manual matinal) somada ao volume dos últimos 3 treinos registrados.
                </p>
              </div>

              <button
                onClick={() => alert('Novo check-in matinal concluído! Score mantido em 88/100 para hoje.')}
                className="w-full py-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer"
              >
                Fazer Novo Check-in Matinal
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Sono & REM</span>
                  <h4 className="text-sm font-mono font-black text-white">8h 12m</h4>
                  <span className="text-[10px] text-indigo-300 font-semibold">Boa Eficiência</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Estresse Basal</span>
                  <h4 className="text-sm font-mono font-black text-white">2/10</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">Baixo Cortisol</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">VFC (HRV)</span>
                  <h4 className="text-sm font-mono font-black text-white">72 ms</h4>
                  <span className="text-[10px] text-cyan-300 font-semibold">+8ms na média</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Ratio ACWR</span>
                  <h4 className="text-sm font-mono font-black text-white">1.08</h4>
                  <span className="text-[10px] text-amber-300 font-semibold">Zona Ótima</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGPSModal(true)}
              className="w-full py-3.5 rounded-xl bg-[#0f131c] border border-cyan-500/30 text-white text-xs font-bold flex items-center justify-center gap-2 hover:border-cyan-400 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#00d2ff]" />
              Abrir GPS Outdoor (Corrida / Bike / Trilha)
            </button>
          </div>
        )}

        {/* ABA 4: COMUNIDADE (COMPONENTE MODULAR PARTE 2) */}
        {activeTab === 'community' && (
          <CommunityFeedView
            currentUser={{ name: userName, username: userHandle, avatar: userAvatar || undefined }}
            onCreateChallengeClick={() => alert('Desafio de Comunidade criado com sucesso!')}
          />
        )}

        {/* ABA 5: PERFIL (NOME E @USER EDITÁVEIS LIVREMENTE) */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">CONFIGURAÇÕES</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Perfil do Atleta</h1>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-500/50 overflow-hidden flex items-center justify-center text-lg font-black text-[#00d2ff]">
                    {userAvatar ? <img src={userAvatar} alt="Perfil" className="w-full h-full object-cover" /> : userName.substring(0, 2).toUpperCase()}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 flex items-center justify-center cursor-pointer shadow-[0_0_8px_#00d2ff]"
                    title="Trocar Foto"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1">
                  {!isEditingProfile ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-white">{userName}</h3>
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="p-1 text-slate-400 hover:text-cyan-400 cursor-pointer"
                          title="Editar Perfil"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-[#00d2ff] font-mono">{userHandle}</p>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Firebase Autenticado
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Seu Nome Completo"
                        className="w-full py-1 px-2 rounded-lg bg-[#07090e] border border-slate-700 text-xs font-bold text-white outline-none focus:border-[#00d2ff]"
                      />
                      <input
                        type="text"
                        value={userHandle}
                        onChange={(e) => setUserHandle(e.target.value)}
                        placeholder="@username"
                        className="w-full py-1 px-2 rounded-lg bg-[#07090e] border border-slate-700 text-xs font-mono text-cyan-400 outline-none focus:border-[#00d2ff]"
                      />
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1 rounded-lg bg-[#00d2ff] text-neutral-950 text-xs font-bold"
                      >
                        Salvar Nome
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">DISPOSITIVOS & SENSORES</span>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Watch className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-white font-medium block">Apple Watch / Wear OS</span>
                    <span className="text-[10px] text-slate-400">FC ao Vivo e telemetria contínua</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleDevice('appleWatch')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    devices.appleWatch ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {devices.appleWatch ? 'Conectado (68 bpm)' : 'Desconectado'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-white font-medium block">Strava Sync</span>
                    <span className="text-[10px] text-slate-400">Exportação automática de treinos</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleDevice('strava')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    devices.strava ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {devices.strava ? 'Sincronizado' : 'Conectar'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-white font-medium block">Zepp OS & Garmin</span>
                    <span className="text-[10px] text-slate-400">Sincronização de sono e HRV</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleDevice('zeppOs')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    devices.zeppOs ? 'bg-purple-950/70 border-purple-500/50 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {devices.zeppOs ? 'Ativo' : 'Conectar'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider block mb-1">PREFERÊNCIAS DO APP</span>
              <div className="flex justify-between py-1 border-b border-slate-800/80 text-slate-300">
                <span>Cache Offline de Vídeos 3D</span>
                <span className="text-white font-bold">104 / 104 Prontos</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80 text-slate-300">
                <span>Package TWA Play Store</span>
                <span className="text-[#00d2ff] font-mono text-[11px]">com.forzon.fitness.app</span>
              </div>
              <div className="flex justify-between py-1 text-slate-300">
                <span>Versão do Sistema</span>
                <span className="text-slate-400 font-mono">1.0.0 (Kinetic Obsidian)</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================== FLOATING MINI-PLAYER PERSISTENTE DE TREINO ==================== */}
      {/* Fica flutuando acima da barra inferior se o treino estiver minimizado */}
      {isWorkoutActive && isWorkoutMinimized && (
        <div className="fixed bottom-18 left-0 right-0 z-40 px-3 animate-in slide-in-from-bottom-2">
          <div className="max-w-md mx-auto p-3 rounded-2xl bg-[#0a0e17]/95 backdrop-blur-xl border border-cyan-500/50 shadow-[0_0_20px_rgba(0,210,255,0.25)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{currentWorkout.title.split('—')[0].trim()}</span>
                  <span className="text-xs font-mono font-black text-[#00d2ff]">{formatTime(workoutElapsedSeconds)}</span>
                </div>
                <p className="text-[10px] text-slate-400">Treino rodando em segundo plano...</p>
              </div>
            </div>

            <button
              onClick={() => setIsWorkoutMinimized(false)}
              className="px-3 py-1.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 text-xs font-black flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Reabrir
            </button>
          </div>
        </div>
      )}

      {/* ==================== BOTTOM NAVIGATION (5 ABAS) ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#07090e]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {[
            { id: 'workout' as TabType, label: 'Treino', icon: Dumbbell },
            { id: 'nutrition' as TabType, label: 'Nutrição', icon: Utensils },
            { id: 'bio' as TabType, label: 'Bio', icon: Activity, badge: '88' },
            { id: 'community' as TabType, label: 'Comunidade', icon: Users },
            { id: 'profile' as TabType, label: 'Perfil', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive ? 'text-[#00d2ff]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-3 px-1 py-0.2 text-[9px] font-bold bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 rounded-full leading-none">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-[#00d2ff]' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[#00d2ff] mt-0.5 shadow-[0_0_6px_#00d2ff]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ==================== MODAL DE TREINO AO VIVO (PARTE 1) ==================== */}
      {isWorkoutActive && !isWorkoutMinimized && (
        <LiveWorkoutRunnerModal
          workoutTitle={currentWorkout.title}
          splitName={intakeData.splitPreference}
          exercises={currentWorkout.exercises}
          elapsedSeconds={workoutElapsedSeconds}
          onClose={() => setIsWorkoutActive(false)}
          onMinimize={() => setIsWorkoutMinimized(true)}
          onFinishWorkout={(summary) => {
            setIsWorkoutActive(false);
            setIsWorkoutMinimized(false);
            setWorkoutElapsedSeconds(0);
            setShowRecoveryModal(true);
          }}
        />
      )}

      {/* ==================== MODAL DE ANAMNESE MÉDICA CIENTÍFICA (PARTE 3) ==================== */}
      {showMedicalIntake && (
        <ComprehensiveMedicalIntakeModal
          onClose={() => setShowMedicalIntake(false)}
          onApplyIntake={(data) => {
            setIntakeData(data);
            setSelectedDayKey(Object.keys(workoutPlans[data.splitPreference] || workoutPlans['ABCD Clássico'])[0] || 'Treino A');
            alert(`Periodização gerada e aplicada com sucesso para ${data.weightKg}kg / ${data.heightCm}cm com suporte a ${data.waterLiters}L de água!`);
          }}
        />
      )}

      {/* ==================== MODAL DE GPS OUTDOOR (PARTE 2) ==================== */}
      {showGPSModal && (
        <GPSOutdoorModal
          onClose={() => setShowGPSModal(false)}
          onSaveActivity={(act) => {
            alert(`Atividade de ${act.modality} (${act.distanceKm} km em ${formatTime(act.durationSeconds)}) sincronizada com o Strava com sucesso!`);
          }}
        />
      )}

      {/* ==================== MODAL DE SUBSTITUIÇÃO BIOMECÂNICA ==================== */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/30 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-[0_0_35px_rgba(0,210,255,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">APARELHO OCUPADO</span>
                  <h3 className="text-sm font-black text-white">Substituição Biomecânica</h3>
                </div>
              </div>
              <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Selecione uma alternativa com ativação muscular e curva de torque equivalente:
            </p>

            <div className="space-y-2">
              <div
                onClick={() => setShowSwapModal(false)}
                className="p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/40 hover:bg-cyan-950/40 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Variação na Máquina Articulada</span>
                  <span className="text-[10px] font-mono text-[#00d2ff] font-bold">Equivalente</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Trajetória convergente sem impacto nos estabilizadores.</p>
              </div>

              <div
                onClick={() => setShowSwapModal(false)}
                className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Variação com Halteres Livres</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">Livre</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Amplitude completa e conforto articular adaptado.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE REFEIÇÃO PÓS-TREINO ==================== */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/30 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-[0_0_35px_rgba(0,210,255,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">RECUPERAÇÃO PÓS-TREINO</span>
                  <h3 className="text-sm font-black text-white">Refeição Anabólica</h3>
                </div>
              </div>
              <button onClick={() => setShowRecoveryModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">Bowl de Açaí Turbo com Whey e Banana</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reposição rápida de glicogênio miofibrilar para {intakeData.weightKg}kg de peso corporal.
              </p>
              <div className="grid grid-cols-3 text-center pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Calorias</span>
                  <p className="font-mono font-bold text-[#00d2ff]">580 kcal</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Proteínas</span>
                  <p className="font-mono font-bold text-white">42g (Leucina)</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Carboidratos</span>
                  <p className="font-mono font-bold text-white">74g</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowRecoveryModal(false);
                setActiveTab('nutrition');
              }}
              className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Registrar Refeição no Diário
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
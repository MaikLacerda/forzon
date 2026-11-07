import React, { useState, useRef } from 'react';
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
  MessageSquare,
  ThumbsUp,
  UserPlus,
  Search,
  Trophy,
  Copy,
  Send,
  Image as ImageIcon
} from 'lucide-react';

type TabType = 'workout' | 'nutrition' | 'bio' | 'community' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('workout');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modais
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showLiveWorkout, setShowLiveWorkout] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);

  // Avatar e Perfil do Atleta
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [username] = useState('@maiklacerda');
  const [copiedUser, setCopiedUser] = useState(false);

  // Dispositivos Conectados com Toggle Real
  const [devices, setDevices] = useState({
    appleWatch: true,
    strava: true,
    zeppOs: false,
    garmin: false
  });

  // Questionário de Intake Completo
  const [intakeHeight, setIntakeHeight] = useState('178');
  const [intakeWeight, setIntakeWeight] = useState('78');
  const [intakeLevel, setIntakeLevel] = useState('Intermediário');
  const [intakeSplit, setIntakeSplit] = useState('ABCD Clássico');
  const [intakeFrequency, setIntakeFrequency] = useState('4 dias/sem');
  const [intakeTime, setIntakeTime] = useState('45-60 min');
  const [intakeHealthIssues, setIntakeHealthIssues] = useState('Nenhuma restrição');
  const [intakeCardioMode, setIntakeCardioMode] = useState('Híbrido Inteligente (1 máquina por dia)');
  const [intakeDiet, setIntakeDiet] = useState('Hiperproteica');
  const [intakeCombatSport, setIntakeCombatSport] = useState('Jiu-Jitsu / Lutas (2x)');

  // Banco de Treinos Completo: Cada treino tem exercícios REAIS e DIFERENTES
  const workoutPlans: Record<string, Record<string, {
    title: string;
    focus: string;
    duration: string;
    cardio: { machine: string; duration: string; rationale: string; kcal: string };
    exercises: Array<{ id: number; num: string; name: string; sets: string; cue: string; weight: string }>;
  }>> = {
    'ABCD Clássico': {
      'Treino A': {
        title: 'Treino A — Peitorais, Deltóide Anterior & Tríceps',
        focus: 'Empurrar Horizontal & Cadeia Superior Anterior',
        duration: '~52 min',
        cardio: { machine: 'Simulador de Escadas (Stairmaster)', duration: '20 min pós-treino', rationale: 'Zona 2 contínua sem estresse em braços', kcal: '~200 kcal' },
        exercises: [
          { id: 101, num: '01', name: 'Supino Inclinado com Halteres', sets: '4 séries x 8–10 reps', cue: 'Pegada neutra a 30° com rotação de escápula', weight: '32 kg' },
          { id: 102, num: '02', name: 'Supino Reto com Barra Olímpica', sets: '4 séries x 8 reps', cue: 'Pausa de 1 segundo no peitoral (RPE 8.5)', weight: '84 kg' },
          { id: 103, num: '03', name: 'Crucifixo no Crossover (Polia Média)', sets: '3 séries x 12 reps', cue: 'Pico de contração isométrica de 2s', weight: '17.5 kg' },
          { id: 104, num: '04', name: 'Desenvolvimento com Halteres Sentado', sets: '3 séries x 10 reps', cue: 'Alinhamento no plano escapular', weight: '22 kg' },
          { id: 105, num: '05', name: 'Tríceps Corda na Polia Alta', sets: '3 séries x 12 reps', cue: 'Abertura das pontas ao final da extensão', weight: '25 kg' },
          { id: 106, num: '06', name: 'Tríceps Francês Unilateral', sets: '3 séries x 10 reps', cue: 'Cadência excêntrica de 3s (cabeça longa)', weight: '12.5 kg' },
          { id: 107, num: '07', name: 'Abdominal Crunch na Polia Alta', sets: '3 séries x 15 reps', cue: 'Dinâmico com flexão torácica sem prancha estática', weight: '35 kg' }
        ]
      },
      'Treino B': {
        title: 'Treino B — Costas, Deltóide Posterior & Bíceps',
        focus: 'Puxar Vertical/Horizontal & Flexores de Cotovelo',
        duration: '~55 min',
        cardio: { machine: 'Esteira Inclinada (12% Incline Walk)', duration: '20 min pós-treino', rationale: 'Velocidade 5.4 km/h sem impacto lombar', kcal: '~190 kcal' },
        exercises: [
          { id: 201, num: '01', name: 'Puxada Frontal na Polia Alta (Pegada Aberta)', sets: '4 séries x 8–10 reps', cue: 'Depressão escapular e cotovelos aos quadris', weight: '65 kg' },
          { id: 202, num: '02', name: 'Remada Curvada com Barra', sets: '4 séries x 8 reps', cue: 'Tronco estabilizado a 45° sem balanço lombar', weight: '70 kg' },
          { id: 203, num: '03', name: 'Remada Baixa com Triângulo', sets: '3 séries x 10–12 reps', cue: 'Alongamento dorsal completo na fase excêntrica', weight: '60 kg' },
          { id: 204, num: '04', name: 'Crucifixo Invertido com Halteres', sets: '3 séries x 12–15 reps', cue: 'Ativação seletiva de deltóide posterior e rombóides', weight: '12 kg' },
          { id: 205, num: '05', name: 'Rosca Direta com Barra W', sets: '3 séries x 8–10 reps', cue: 'Cotovelos fixos ao lado das costelas', weight: '30 kg' },
          { id: 206, num: '06', name: 'Rosca Martelo com Halteres', sets: '3 séries x 10–12 reps', cue: 'Foco no braquial e braquiorradial (pegada neutra)', weight: '16 kg' },
          { id: 207, num: '07', name: 'Elevação de Pernas na Torre Abdominal', sets: '3 séries x 12 reps', cue: 'Dinâmico com retroversão de bacia', weight: '0 kg' }
        ]
      },
      'Treino C': {
        title: 'Treino C — Pernas Completas & Panturrilhas',
        focus: 'Membros Inferiores: Quadríceps, Isquiotibiais & Glúteos',
        duration: '~58 min',
        cardio: { machine: 'Bicicleta Ergométrica (Giro Leve Regenerativo)', duration: '20 min pós-treino', rationale: 'Cadência 85 RPM para remoção de ácido lático pós-pernas', kcal: '~160 kcal' },
        exercises: [
          { id: 301, num: '01', name: 'Agachamento Livre com Barra Olímpica', sets: '4 séries x 8–10 reps', cue: 'Profundidade paralela com pressão no calcanhar', weight: '90 kg' },
          { id: 302, num: '02', name: 'Leg Press 45°', sets: '4 séries x 10–12 reps', cue: 'Pés na largura dos ombros sem bloquear joelhos', weight: '220 kg' },
          { id: 303, num: '03', name: 'Cadeira Extensora', sets: '3 séries x 12 reps', cue: 'Pico de contração de 1.5s no topo', weight: '55 kg' },
          { id: 304, num: '04', name: 'Mesa Flexora Deitada', sets: '4 séries x 10–12 reps', cue: 'Quadril colado ao banco durante a flexão', weight: '45 kg' },
          { id: 305, num: '05', name: 'Stiff com Halteres (RDL)', sets: '3 séries x 10 reps', cue: 'Coluna neutra e quadril projetado para trás', weight: '24 kg' },
          { id: 306, num: '06', name: 'Panturrilha no Leg Press 45°', sets: '4 séries x 15 reps', cue: 'Alongamento fascial profundo na descida de 2s', weight: '140 kg' }
        ]
      },
      'Treino D': {
        title: 'Treino D — Ombros, Braços Completos & Core',
        focus: 'Hipertrofia de Deltóide Lateral, Tríceps & Bíceps',
        duration: '~50 min',
        cardio: { machine: 'Simulador de Escadas (Stairmaster Intervalado)', duration: '20 min pós-treino', rationale: 'Alternância de ritmo nível 7 a 9 para efeito EPOC', kcal: '~210 kcal' },
        exercises: [
          { id: 401, num: '01', name: 'Elevação Lateral Escapular com Halteres', sets: '4 séries x 12–15 reps', cue: 'Drop-set na última série com foco deltóide lateral', weight: '14 kg' },
          { id: 402, num: '02', name: 'Desenvolvimento Arnold com Halteres', sets: '3 séries x 10 reps', cue: 'Rotação controlada de 180° sem hiperextensão', weight: '20 kg' },
          { id: 403, num: '03', name: 'Face Pull na Polia Alta com Corda', sets: '3 séries x 15 reps', cue: 'Saúde articular dos rotadores e manguito', weight: '22.5 kg' },
          { id: 404, num: '04', name: 'Tríceps Testa com Barra W', sets: '3 séries x 10 reps', cue: 'Barra descendo até a linha da testa sem abrir cotovelos', weight: '28 kg' },
          { id: 405, num: '05', name: 'Rosca Scott no Banco com Barra W', sets: '3 séries x 10 reps', cue: 'Pico excêntrico controlado sem estalar cotovelos', weight: '26 kg' },
          { id: 406, num: '06', name: 'Rolamento com Roda Abdominal (Ab Wheel)', sets: '3 séries x 10 reps', cue: 'Dinâmico mantendo o transverso do abdômen ativo', weight: '0 kg' }
        ]
      }
    },
    'ABC Padrão': {
      'Treino A': {
        title: 'Treino A — Peitorais, Deltóide & Tríceps',
        focus: 'Membros Superiores: Cadeia de Empurrar',
        duration: '~50 min',
        cardio: { machine: 'Simulador de Escadas (Stairmaster)', duration: '20 min pós-treino', rationale: 'Intensidade em Zona 2 pós-peitorais', kcal: '~200 kcal' },
        exercises: [
          { id: 501, num: '01', name: 'Supino Inclinado com Halteres', sets: '4 séries x 8–10 reps', cue: 'Pegada neutra e banco 30°', weight: '32 kg' },
          { id: 502, num: '02', name: 'Crucifixo no Crossover', sets: '4 séries x 12 reps', cue: 'Pico de contração de 2s', weight: '17.5 kg' },
          { id: 503, num: '03', name: 'Elevação Lateral Escapular', sets: '4 séries x 12–15 reps', cue: 'Drop-set na última', weight: '14 kg' },
          { id: 504, num: '04', name: 'Tríceps Francês Unilateral', sets: '4 séries x 10 reps', cue: 'Cadência excêntrica de 3s', weight: '12.5 kg' },
          { id: 505, num: '05', name: 'Abdominal Crunch na Polia', sets: '3 séries x 15 reps', cue: 'Dinâmico com carga progressiva', weight: '35 kg' }
        ]
      },
      'Treino B': {
        title: 'Treino B — Costas, Deltóide Posterior & Bíceps',
        focus: 'Membros Superiores: Cadeia de Puxar',
        duration: '~50 min',
        cardio: { machine: 'Esteira Inclinada (12%)', duration: '20 min pós-treino', rationale: 'Caminhada rápida em subida sem impacto articular', kcal: '~190 kcal' },
        exercises: [
          { id: 601, num: '01', name: 'Puxada Frontal na Polia', sets: '4 séries x 8–10 reps', cue: 'Cotovelos aos quadris', weight: '65 kg' },
          { id: 602, num: '02', name: 'Remada Curvada com Barra', sets: '4 séries x 8 reps', cue: 'Coluna neutra a 45°', weight: '70 kg' },
          { id: 603, num: '03', name: 'Rosca Direta com Barra W', sets: '3 séries x 10 reps', cue: 'Variação 1 de Bíceps', weight: '30 kg' },
          { id: 604, num: '04', name: 'Rosca Martelo com Halteres', sets: '3 séries x 12 reps', cue: 'Variação 2 de Bíceps (braquial)', weight: '16 kg' }
        ]
      },
      'Treino C': {
        title: 'Treino C — Pernas Completas & Abdômen',
        focus: 'Membros Inferiores & Panturrilhas',
        duration: '~55 min',
        cardio: { machine: 'Bicicleta Ergométrica', duration: '20 min pós-treino', rationale: 'Flush de lactato pós-treino de pernas', kcal: '~150 kcal' },
        exercises: [
          { id: 701, num: '01', name: 'Agachamento Livre com Barra', sets: '4 séries x 8–10 reps', cue: 'Profundidade paralela', weight: '90 kg' },
          { id: 702, num: '02', name: 'Leg Press 45°', sets: '4 séries x 10–12 reps', cue: 'Descida controlada', weight: '220 kg' },
          { id: 703, num: '03', name: 'Mesa Flexora', sets: '4 séries x 10 reps', cue: 'Isquiotibiais isolados', weight: '45 kg' },
          { id: 704, num: '04', name: 'Panturrilha Sentado', sets: '4 séries x 15 reps', cue: 'Sóleo e gastrocnêmio', weight: '50 kg' }
        ]
      }
    }
  };

  // Resolução dinâmica do treino clicado (muda a tela DE VERDADE ao clicar)
  const activePlan = workoutPlans[intakeSplit] || workoutPlans['ABCD Clássico'];
  const dayKeys = Object.keys(activePlan);
  const [selectedDayKey, setSelectedDayKey] = useState(dayKeys[0] || 'Treino A');
  const currentWorkout = activePlan[selectedDayKey] || activePlan[dayKeys[0]];

  // Nutrição
  const [waterCurrent, setWaterCurrent] = useState(2400);
  const waterTarget = 3200;
  const [meals, setMeals] = useState([
    { id: 1, title: 'Café da Manhã Anabólico', desc: '4 ovos mexidos, aveia e banana prata', kcal: 550, checked: true },
    { id: 2, title: 'Almoço — Frango Grelhado com Arroz', desc: '180g peito de frango, 200g arroz branco e brócolis', kcal: 680, checked: true },
    { id: 3, title: 'Lanche Pré-Treino', desc: 'Whey protein, creatina 5g e 30g de pasta de amendoim', kcal: 320, checked: false },
    { id: 4, title: 'Jantar — Salmão Grelhado e Mandioca', desc: '160g de salmão, 150g mandioca cozida e azeite', kcal: 590, checked: false }
  ]);

  // Comunidade Social & Feed Interativo
  const [newPostText, setNewPostText] = useState('');
  const [searchFriend, setSearchFriend] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Rodrigo Ferraz',
      username: '@rodrigoferraz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      time: 'Há 25 min',
      content: 'Bati PR no Supino Inclinado com 36kg hoje! O biofeedback em 88% deu sinal verde e rendeu demais.',
      workoutTag: 'Rotina Hipertrofia A • Peito & Tríceps',
      likes: 24,
      liked: false,
      comments: 6
    },
    {
      id: 2,
      author: 'Camila Santos',
      username: '@camilafit',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      time: 'Há 1 hora',
      content: '20 min de Simulador de Escadas após o treino de pernas. Suor no máximo e 210 kcal pagas no Strava!',
      workoutTag: 'Stairmaster Pós-Treino • Zona 2',
      likes: 42,
      liked: true,
      comments: 11
    }
  ]);

  // Funções de Interação Real
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserAvatar(imageUrl);
    }
  };

  const handleCopyUsername = () => {
    navigator.clipboard?.writeText(username);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 2000);
  };

  const handleLikePost = (postId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    const newPost = {
      id: Date.now(),
      author: 'Maikon Lacerda',
      username: '@maiklacerda',
      avatar: userAvatar || '',
      time: 'Agora mesmo',
      content: newPostText,
      workoutTag: `${currentWorkout.title} (${intakeSplit})`,
      likes: 1,
      liked: true,
      comments: 0
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleToggleDevice = (devKey: keyof typeof devices) => {
    setDevices(prev => ({ ...prev, [devKey]: !prev[devKey] }));
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-24 selection:bg-[#00d2ff] selection:text-black">
      {/* Input nativo de arquivo oculto para upload de foto real */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

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
            
            {/* Avatar Clicável que reflete a foto subida pelo usuário */}
            <div
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center text-xs font-bold text-[#00d2ff] cursor-pointer hover:border-[#00d2ff] transition-all"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                'ML'
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== CONTEÚDO PRINCIPAL (5 ABAS) ==================== */}
      <main className="max-w-md mx-auto px-4 pt-4">

        {/* ================= ABA 1: TREINO ================= */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Card Superior de Prontidão */}
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
                  <p className="text-[11px] text-slate-400 mt-0.5">SNC recuperado para sobrecarga progressiva (+5%).</p>
                </div>
              </div>
              <button
                onClick={() => setShowCoachModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[#00d2ff] text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3" /> Intake IA
              </button>
            </div>

            {/* Seletor Dinâmico de Treinos (Treino A, B, C, D) — MUDA A TELA DE VERDADE */}
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

            {/* Card da Sessão Ativa */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                <span className="text-[#00d2ff] uppercase tracking-wider">{intakeSplit} • {selectedDayKey}</span>
                <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> {currentWorkout.duration}</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">{currentWorkout.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{currentWorkout.focus}</p>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">{intakeLevel}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">Proteção: {intakeHealthIssues}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">Abdômen Dinâmico</span>
              </div>

              <button
                onClick={() => setShowLiveWorkout(true)}
                className="w-full mt-4 py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                Iniciar Treino ao Vivo
              </button>
            </div>

            {/* Exercícios Reais que mudam ao clicar em Treino A, B, C ou D */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">
                  SEQUÊNCIA PRINCIPAL ({currentWorkout.exercises.length} EXERCÍCIOS)
                </span>
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="text-[11px] font-bold text-[#00d2ff] hover:text-cyan-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Trocar Exercício
                </button>
              </div>

              {currentWorkout.exercises.map((ex) => (
                <div key={ex.id} className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800/90 flex items-center justify-between hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-400 font-mono">
                      {ex.num}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ex.sets} • <span className="text-[#00d2ff]">{ex.cue}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-white">{ex.weight}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cardio Híbrido Específico do Treino */}
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">Cardio Híbrido: {currentWorkout.cardio.machine}</h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">Hoje</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{currentWorkout.cardio.rationale} ({currentWorkout.cardio.duration})</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black text-[#00d2ff] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                {currentWorkout.cardio.kcal}
              </span>
            </div>

            {/* Atalhos */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setShowCoachModal(true)}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-[#00d2ff] text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Reavaliar Periodização
                </div>
                <p className="text-[10px] text-slate-400">Mudar peso, altura, restrições ou divisões.</p>
              </button>

              <button
                onClick={() => setActiveTab('bio')}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                  <Compass className="w-3.5 h-3.5" /> GPS Outdoor
                </div>
                <p className="text-[10px] text-slate-400">Rastreamento de corrida por satélite.</p>
              </button>
            </div>
          </div>
        )}

        {/* ================= ABA 2: NUTRIÇÃO ================= */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">NUTRIÇÃO & MACROS</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Diário Nutricional</h1>
              <p className="text-xs text-slate-400">Calibrado para {intakeWeight}kg • {intakeDiet}</p>
            </div>

            {/* Balanço Calórico */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Balanço Calórico</span>
                <span className="font-mono font-black text-white">
                  1.840 / <span className="text-[#00d2ff]">2.500 kcal</span>
                </span>
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

            {/* Meta Hídrica */}
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
                className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[#00d2ff] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,210,255,0.15)]"
              >
                <Plus className="w-3.5 h-3.5" /> +250 ml
              </button>
            </div>

            {/* Refeições de Hoje com Checkbox Interativo */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-white uppercase tracking-wider px-1">
                REFEIÇÕES DE HOJE
              </span>
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, checked: !m.checked } : m))}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    meal.checked
                      ? 'bg-[#0f131c]/60 border-slate-800/60 opacity-90'
                      : 'bg-[#0f131c] border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      meal.checked ? 'bg-[#00d2ff] border-[#00d2ff] text-neutral-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {meal.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${meal.checked ? 'text-slate-300 line-through' : 'text-white'}`}>
                        {meal.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{meal.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#00d2ff]">{meal.kcal} kcal</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRecoveryModal(true)}
              className="w-full py-3.5 rounded-xl bg-[#0f131c] hover:bg-slate-900 border border-cyan-500/40 text-[#00d2ff] font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.1)] transition-all cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5" />
              Sugerir Refeição Pós-Treino ({currentWorkout.title.split('—')[0].trim()})
            </button>
          </div>
        )}

        {/* ================= ABA 3: BIO (DESEMPENHO & BIOFEEDBACK) ================= */}
        {activeTab === 'bio' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">BIOFEEDBACK & FISIOLOGIA</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Desempenho & Prontidão</h1>
              <p className="text-xs text-slate-400">Equilíbrio parassimpático e prontidão do Sistema Nervoso Central (SNC).</p>
            </div>

            {/* Card Principal */}
            <div className="p-5 rounded-2xl bg-[#0f131c] border border-cyan-500/30 relative overflow-hidden shadow-[0_0_25px_rgba(0,210,255,0.1)]">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/70 border-2 border-cyan-500/40 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.25)]">
                  <span className="text-2xl font-black text-[#00d2ff] font-mono leading-none">88</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">/100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">Prontidão Neuromuscular</h3>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      MODO PR
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">SNC plenamente recuperado para sobrecarga (+5%)</p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <Activity className="w-3 h-3 text-[#00d2ff]" /> VFC elevada (72ms) • Freq. Repouso: 54 bpm
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-[#07090e] border border-slate-800 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-slate-200">Recomendação Biomecânica de Hoje:</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Com sono consistente (8h 12m) e baixo estresse fisiológico (2/10), você tem luz verde para buscar progressão dupla de carga no {selectedDayKey}.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de Métricas */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sono & REM</span>
                  <h4 className="text-sm font-mono font-black text-white">8h 12m</h4>
                  <span className="text-[10px] text-indigo-300 font-semibold">Boa • 85% Eficiência</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estresse Basal</span>
                  <h4 className="text-sm font-mono font-black text-white">2/10</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">Baixo Cortisol</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VFC (HRV)</span>
                  <h4 className="text-sm font-mono font-black text-white">72 ms</h4>
                  <span className="text-[10px] text-cyan-300 font-semibold">+8ms acima da média</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ratio ACWR</span>
                  <h4 className="text-sm font-mono font-black text-white">1.08</h4>
                  <span className="text-[10px] text-amber-300 font-semibold">Zona Ótima</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 4: COMUNIDADE & FEED SOCIAL (COMPLETO) ================= */}
        {activeTab === 'community' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">COMUNIDADE & SOCIAL</span>
                <h1 className="text-2xl font-black text-white tracking-tight">Feed dos Atletas</h1>
              </div>
              <button
                onClick={() => setShowCreateChallengeModal(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00d2ff] text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-900 transition-all"
              >
                <Trophy className="w-3.5 h-3.5" /> Criar Desafio
              </button>
            </div>

            {/* Caixa de Criação de Post */}
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center text-xs font-bold text-[#00d2ff]">
                  {userAvatar ? <img src={userAvatar} alt="Eu" className="w-full h-full object-cover" /> : 'ML'}
                </div>
                <input
                  type="text"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Compartilhe seu treino, carga ou conquista..."
                  className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-cyan-400" /> Adicionar Foto
                </button>
                <button
                  onClick={handleCreatePost}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Publicar
                </button>
              </div>
            </div>

            {/* Buscar e Adicionar Amigos */}
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encontrar Atletas & Amigos</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchFriend}
                    onChange={(e) => setSearchFriend(e.target.value)}
                    placeholder="Buscar por @username ou nome..."
                    className="w-full bg-[#07090e] border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (searchFriend) alert(`Solicitação enviada para ${searchFriend}!`);
                  }}
                  className="px-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00d2ff] text-xs font-bold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Feed de Posts da Comunidade */}
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center text-xs font-bold text-[#00d2ff]">
                        {post.avatar ? <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" /> : post.author.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{post.author}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{post.username} • {post.time}</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {post.workoutTag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${post.liked ? 'text-[#00d2ff] font-bold' : 'hover:text-white'}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${post.liked ? 'fill-[#00d2ff]' : ''}`} />
                      <span>{post.likes} Curtidas</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments} Comentários</span>
                    </button>
                    <button
                      onClick={() => alert(`Link do post copiado para compartilhar no Instagram e WhatsApp!`)}
                      className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Compartilhar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ABA 5: PERFIL (COM FOTO REAL & DISPOSITIVOS) ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">CONFIGURAÇÕES</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Perfil do Atleta</h1>
            </div>

            {/* Identificação do Atleta com Upload Real de Foto */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3.5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-500/50 overflow-hidden flex items-center justify-center text-lg font-black text-[#00d2ff]">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Maikon Lacerda" className="w-full h-full object-cover" />
                  ) : (
                    'ML'
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 flex items-center justify-center shadow-[0_0_10px_#00d2ff] transition-all cursor-pointer"
                  title="Trocar Foto de Perfil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">Maikon Lacerda</h3>
                  <button
                    onClick={handleCopyUsername}
                    className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-500/30"
                  >
                    {copiedUser ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {username}
                  </button>
                </div>
                <p className="text-xs text-[#00d2ff] font-medium">Plano FORZON PRO Ativo</p>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Firebase Autenticado
                </span>
              </div>
            </div>

            {/* Dispositivos & Sensores com Toggle Funcional */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">
                DISPOSITIVOS & SENSORES
              </span>

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
                    devices.appleWatch
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
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
                    devices.strava
                      ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {devices.strava ? 'Sincronizado' : 'Conectar'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-white font-medium block">Zepp OS & Garmin Connect</span>
                    <span className="text-[10px] text-slate-400">Sincronização de sono e HRV</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleDevice('zeppOs')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    devices.zeppOs
                      ? 'bg-purple-950/70 border-purple-500/50 text-purple-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {devices.zeppOs ? 'Ativo' : 'Conectar'}
                </button>
              </div>
            </div>

            {/* Preferências do App */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider block mb-1">
                PREFERÊNCIAS DO APP
              </span>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span>Cache Offline de Vídeos 3D</span>
                <span className="text-white font-bold">104 / 104 Prontos</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span>Package TWA Play Store</span>
                <span className="text-[#00d2ff] font-mono text-[11px]">com.forzon.fitness.app</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Versão do Sistema</span>
                <span className="text-slate-400 font-mono">1.0.0 (Kinetic Obsidian)</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================== BOTTOM NAVIGATION (5 ABAS) ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#07090e]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2">
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

      {/* ==================== MODAL 1: QUESTIONÁRIO COMPLETO COM ALTURA, PESO, SAÚDE, LUTAS E CARDIO HÍBRIDO ==================== */}
      {showCoachModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-[0_0_35px_rgba(0,210,255,0.2)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">ANAMNESE & PRESCRIÇÃO</span>
                  <h3 className="text-sm font-black text-white">Avaliação de Intake Completa</h3>
                </div>
              </div>
              <button onClick={() => setShowCoachModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Altura e Peso */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Altura (cm)</label>
                <input
                  type="number"
                  value={intakeHeight}
                  onChange={(e) => setIntakeHeight(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-[#0f131c] border border-slate-800 text-xs font-bold text-white focus:border-[#00d2ff] outline-none"
                  placeholder="Ex: 178"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Peso Atual (kg)</label>
                <input
                  type="number"
                  value={intakeWeight}
                  onChange={(e) => setIntakeWeight(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-[#0f131c] border border-slate-800 text-xs font-bold text-white focus:border-[#00d2ff] outline-none"
                  placeholder="Ex: 78"
                />
              </div>
            </div>

            {/* 1. Nível de Experiência */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">1. Nível de Experiência do Atleta</label>
              <div className="grid grid-cols-2 gap-2">
                {['Iniciante', 'Intermediário', 'Avançado', 'Atleta Competidor'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setIntakeLevel(lvl)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      intakeLevel === lvl
                        ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Divisão de Treino */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">2. Divisão de Treino Desejada</label>
                <span className="text-[10px] text-cyan-400 font-mono">5 Opções Científicas</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {['ABC Padrão', 'ABCD Clássico', 'ABCDE Avançado', 'Upper / Lower', 'Full Body'].map((split) => (
                  <button
                    key={split}
                    onClick={() => setIntakeSplit(split)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                      intakeSplit === split
                        ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {split}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Frequência e Duração */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">3. Frequência</label>
                <select
                  value={intakeFrequency}
                  onChange={(e) => setIntakeFrequency(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-[#0f131c] border border-slate-800 text-xs font-bold text-slate-300 focus:border-[#00d2ff] outline-none"
                >
                  <option>3 dias/sem</option>
                  <option>4 dias/sem</option>
                  <option>5 dias/sem</option>
                  <option>6 dias/sem</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">4. Tempo por Sessão</label>
                <select
                  value={intakeTime}
                  onChange={(e) => setIntakeTime(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-[#0f131c] border border-slate-800 text-xs font-bold text-slate-300 focus:border-[#00d2ff] outline-none"
                >
                  <option>30-45 min</option>
                  <option>45-60 min</option>
                  <option>60-75 min</option>
                  <option>90+ min</option>
                </select>
              </div>
            </div>

            {/* 5. Restrições Articulares com opção "Nenhuma" */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                5. Restrições Articulares ou Problemas de Saúde
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['Nenhuma restrição', 'Ombro (leve desconforto)', 'Lombar sensível', 'Joelho (sem impacto)'].map((lim) => (
                  <button
                    key={lim}
                    onClick={() => setIntakeHealthIssues(lim)}
                    className={`py-2 px-2 text-left rounded-xl text-[11px] font-bold border transition-all ${
                      intakeHealthIssues === lim
                        ? lim === 'Nenhuma restrição' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lim}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Lutas e Esportes Concorrentes com opção "Nenhum" */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">6. Lutas & Esportes Concorrentes</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['Nenhum esporte extra', 'Jiu-Jitsu / Lutas (2x)', 'Boxe / Muay Thai', 'Corrida de Rua (1x)'].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setIntakeCombatSport(sp)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border text-left transition-all ${
                      intakeCombatSport === sp
                        ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Cardio Híbrido Inteligente */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">7. Prescrição de Cardio Integrado (20 min pós-treino)</label>
              <div className="space-y-1.5">
                {[
                  'Híbrido Inteligente (1 máquina por dia)',
                  'Simulador de Escada Fixo (Stairmaster)',
                  'Esteira Inclinada 12% Fixa',
                  'Nenhum cardio'
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setIntakeCardioMode(c)}
                    className={`w-full py-2 px-3 text-left rounded-xl text-[11px] font-bold border transition-all ${
                      intakeCardioMode === c
                        ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 8. Preferência Alimentar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">8. Preferência Nutricional</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Hiperproteica', 'Equilibrada', 'Low Carb'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setIntakeDiet(d)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                      intakeDiet === d
                        ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Diretrizes Científicas */}
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/20 text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> Diretrizes Científicas Invioláveis:
              </div>
              <p className="text-[11px] leading-relaxed pl-5">
                • Abdominais dinâmicos inclusos (sem pranchas estáticas).<br />
                • Cargas iniciam zeradas para calibração técnica real.<br />
                • Cardio adaptado coerente com o grupo muscular do dia.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCoachModal(false);
                alert(`Periodização gerada e aplicada com sucesso para ${intakeWeight}kg / ${intakeHeight}cm! Divisão: ${intakeSplit}.`);
              }}
              className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-neutral-950" />
              Gerar Periodização com Coach IA
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: CRIAR DESAFIO COM AMIGOS ==================== */}
      {showCreateChallengeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/30 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-[0_0_35px_rgba(0,210,255,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">GAMIFICAÇÃO FORZON</span>
                  <h3 className="text-sm font-black text-white">Criar Desafio com Amigos</h3>
                </div>
              </div>
              <button onClick={() => setShowCreateChallengeModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Nome do Desafio</label>
              <input
                type="text"
                placeholder="Ex: Desafio 30 Toneladas do Mês"
                className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Convidar Amigos (@username)</label>
              <input
                type="text"
                placeholder="@rodrigoferraz, @camilafit..."
                className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
              />
            </div>

            <button
              onClick={() => {
                setShowCreateChallengeModal(false);
                alert('Desafio criado e convite enviado aos amigos com sucesso!');
              }}
              className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 fill-neutral-950" />
              Lançar Desafio na Comunidade
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: SUBSTITUIÇÃO BIOMECÂNICA ==================== */}
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
              Selecione uma alternativa com curva de torque e ativação muscular equivalente:
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
                <p className="text-[11px] text-slate-400 mt-1">Trajetória convergente guiada sem risco para as articulações.</p>
              </div>

              <div
                onClick={() => setShowSwapModal(false)}
                className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Variação com Halteres Livres</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">Livre</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Conforto biomecânico e ativação bilateral compensada.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: TREINO AO VIVO ==================== */}
      {showLiveWorkout && (
        <div className="fixed inset-0 z-50 bg-[#07090e] p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400">TREINO AO VIVO EM ANDAMENTO</span>
              </div>
              <button
                onClick={() => setShowLiveWorkout(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300"
              >
                Minimizar
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-cyan-500/40 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SÉRIE 2 DE 4 • DESCANSO ATP-CP</span>
              <div className="text-5xl font-mono font-black text-[#00d2ff] tracking-tight">00:54</div>
              <div className="flex justify-center gap-2 pt-2">
                <button className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-xs font-bold text-[#00d2ff]">+15s</button>
                <button className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-xs font-bold text-[#00d2ff]">+30s</button>
                <button className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-xs font-bold text-[#00d2ff]">+60s</button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-bold">{currentWorkout.exercises[0]?.name || 'Exercício'}</span>
                <span className="text-[#00d2ff] font-mono font-bold">Carga: {currentWorkout.exercises[0]?.weight || '32 kg'}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {['Série 1', 'Série 2', 'Série 3', 'Série 4'].map((s, idx) => (
                  <div key={idx} className={`p-2 rounded-xl border ${idx === 0 ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : idx === 1 ? 'bg-cyan-950/80 border-[#00d2ff] text-[#00d2ff]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <span className="text-[10px] block font-bold">{s}</span>
                    <span className="font-mono text-[11px] font-bold">{idx === 0 ? 'Feito ✓' : idx === 1 ? 'Atual' : 'Pendente'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <button
              onClick={() => {
                setShowLiveWorkout(false);
                setShowRecoveryModal(true);
              }}
              className="w-full py-4 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 fill-neutral-950" />
              Finalizar Treino & Registrar Cargas
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODAL 5: REFEIÇÃO PÓS-TREINO ==================== */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/30 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-[0_0_35px_rgba(0,210,255,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">PÓS-TREINO INTELIGENTE</span>
                  <h3 className="text-sm font-black text-white">Refeição de Recuperação</h3>
                </div>
              </div>
              <button onClick={() => setShowRecoveryModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">Bowl de Açaí Turbo com Whey e Banana</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reposição rápida de glicogênio miofibrilar e reversão do catabolismo muscular para {intakeWeight}kg.
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
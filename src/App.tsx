import React, { useState } from 'react';
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
  Info,
  Watch,
  Share2,
  X,
  Compass,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Check,
  Camera
} from 'lucide-react';

type TabType = 'workout' | 'nutrition' | 'bio' | 'community' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('workout');

  // Modais
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showLiveWorkout, setShowLiveWorkout] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Questionário de Intake Completo
  const [intakeLevel, setIntakeLevel] = useState('Intermediário');
  const [intakeSplit, setIntakeSplit] = useState('ABC Padrão');
  const [intakeFrequency, setIntakeFrequency] = useState('4 dias/sem');
  const [intakeTime, setIntakeTime] = useState('45-60 min');
  const [intakeLimitation, setIntakeLimitation] = useState('Ombro (leve desconforto)');
  const [intakeCardio, setIntakeCardio] = useState('Escada (Stairmaster)');
  const [intakeDiet, setIntakeDiet] = useState('Hiperproteica');
  const [intakeSport, setIntakeSport] = useState('Corrida de Rua (1x)');

  // Estados Nutricionais
  const [waterCurrent, setWaterCurrent] = useState(2400);
  const waterTarget = 3200;
  const [meals, setMeals] = useState([
    { id: 1, title: 'Café da Manhã Anabólico', desc: '4 ovos mexidos, aveia e banana prata', kcal: 550, checked: true },
    { id: 2, title: 'Almoço — Frango Grelhado com Arroz', desc: '180g peito de frango, 200g arroz branco e brócolis', kcal: 680, checked: true },
    { id: 3, title: 'Lanche Pré-Treino', desc: 'Whey protein, creatina 5g e 30g de pasta de amendoim', kcal: 320, checked: false },
    { id: 4, title: 'Jantar — Salmão Grelhado e Mandioca', desc: '160g de salmão, 150g mandioca cozida e azeite', kcal: 590, checked: false }
  ]);

  // Sequência de Treino Conforme a Divisão Selecionada
  const [selectedDay, setSelectedDay] = useState('Treino A');
  const [exercises, setExercises] = useState([
    { id: 1, num: '01', name: 'Supino Inclinado com Halteres', sets: '4 séries x 8–10 reps', cue: 'Pegada neutra 30° (Proteção Ombro)', weight: '32 kg' },
    { id: 2, num: '02', name: 'Crucifixo no Cabo (Crossover)', sets: '4 séries x 12 reps', cue: 'Pico de contração 2s', weight: '17.5 kg' },
    { id: 3, num: '03', name: 'Elevação Lateral Escapular', sets: '4 séries x 12–15 reps', cue: 'Drop-set na última série', weight: '14 kg' },
    { id: 4, num: '04', name: 'Tríceps Francês Unilateral', sets: '4 séries x 10 reps', cue: 'Cadência excêntrica de 3s', weight: '12.5 kg' },
    { id: 5, num: '05', name: 'Abdominal Crunch na Polia Alta', sets: '3 séries x 15 reps', cue: 'Dinâmico com carga progressiva', weight: '35 kg' }
  ]);

  const handleAddWater = () => {
    setWaterCurrent(prev => Math.min(waterTarget, prev + 250));
  };

  const toggleMeal = (id: number) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-24 selection:bg-[#00d2ff] selection:text-black">
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
              className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-[#00d2ff] cursor-pointer hover:border-[#00d2ff] transition-colors"
            >
              ML
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
                  <p className="text-[11px] text-slate-400 mt-0.5">SNC recuperado. Carga progressiva destravada.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCoachModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[#00d2ff] text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3" /> Intake IA
              </button>
            </div>

            {/* Rotina Atual */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                <span className="text-[#00d2ff] uppercase tracking-wider">DIVISÃO ATIVA: {intakeSplit} • {selectedDay}</span>
                <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> ~52 min</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">Treino A — Peitorais, Deltóide & Tríceps</h1>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">4 Séries / ex</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">Proteção Articular ({intakeLimitation.split(' ')[0]})</span>
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

            {/* Seletor Rápido de Dias da Divisão */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(intakeSplit === 'ABC Padrão' ? ['Treino A', 'Treino B', 'Treino C'] :
                intakeSplit === 'ABCD Clássico' ? ['Treino A', 'Treino B', 'Treino C', 'Treino D'] :
                intakeSplit === 'ABCDE Avançado' ? ['Treino A', 'Treino B', 'Treino C', 'Treino D', 'Treino E'] :
                intakeSplit === 'Upper / Lower' ? ['Upper 1', 'Lower 1', 'Upper 2', 'Lower 2'] :
                ['Full Body A', 'Full Body B', 'Full Body C']
              ).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                    selectedDay === day
                      ? 'bg-cyan-950/80 border-[#00d2ff] text-[#00d2ff]'
                      : 'bg-[#0f131c] border-slate-800 text-slate-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Sequência Principal de Exercícios */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">
                  SEQUÊNCIA PRINCIPAL ({exercises.length} EXERCÍCIOS)
                </span>
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="text-[11px] font-bold text-[#00d2ff] hover:text-cyan-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Trocar Exercício
                </button>
              </div>

              {exercises.map((ex) => (
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

            {/* Bloco de Cardio Integrado Prescrito */}
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cardio Pós-Treino: {intakeCardio}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">20 min contínuos • Zona 2 • Queima lipídica</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                ~200 kcal
              </span>
            </div>

            {/* Cards Rápidos de Atalho */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setShowCoachModal(true)}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-[#00d2ff] text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Reavaliar Divisões
                </div>
                <p className="text-[10px] text-slate-400">Alterar para ABCD, ABCDE ou Upper/Lower.</p>
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
            </div>

            {/* Balanço Calórico */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Balanço Calórico ({intakeDiet})</span>
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
                onClick={handleAddWater}
                className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[#00d2ff] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,210,255,0.15)]"
              >
                <Plus className="w-3.5 h-3.5" /> +250 ml
              </button>
            </div>

            {/* Refeições de Hoje */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-white uppercase tracking-wider px-1">
                REFEIÇÕES DE HOJE
              </span>
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
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

            {/* Botão de Sugestão Pós-Treino por Volume */}
            <button
              onClick={() => setShowRecoveryModal(true)}
              className="w-full py-3.5 rounded-xl bg-[#0f131c] hover:bg-slate-900 border border-cyan-500/40 text-[#00d2ff] font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.1)] transition-all cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5" />
              Sugerir Refeição Pós-Treino (48.250 kg)
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
                    Com sono consistente (8h 12m) e baixo estresse fisiológico (2/10), você tem luz verde para buscar progressão dupla de carga e repetições nos exercícios de peito e ombros.
                  </p>
                </div>
                <button
                  onClick={() => setShowCoachModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[#00d2ff] text-[10px] font-bold shrink-0 self-center"
                >
                  Coach IA
                </button>
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

            <div className="p-3.5 rounded-xl bg-[#0f131c]/60 border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>O biofeedback recalibra automaticamente os pesos sugeridos e o descanso ATP-CP no Treino ao Vivo.</span>
            </div>
          </div>
        )}

        {/* ================= ABA 4: COMUNIDADE & DESAFIOS ================= */}
        {activeTab === 'community' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">GAMIFICAÇÃO & RANKING</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Desafios & Conquistas</h1>
              <p className="text-xs text-slate-400">Desbloqueie medalhas e suba no ranking da comunidade.</p>
            </div>

            {/* Card de Ranking Pessoal */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400 font-bold">Ranking de Volume Semanal</span>
                <span className="text-[#00d2ff] font-extrabold text-[11px]">Top 5%</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-black text-amber-400">#1</span>
                  <span className="text-xs font-bold text-white">Maikon Lacerda (Você)</span>
                </div>
                <span className="font-mono font-black text-white text-xs">48.250 kg</span>
              </div>
            </div>

            {/* Lista de Desafios Ativos */}
            <div className="space-y-2.5">
              <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Desafio 50 Toneladas</h4>
                      <p className="text-[11px] text-slate-400">Acumule 50.000 kg em exercícios compostos.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    +500 pts
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                    <span>Progresso</span>
                    <span className="text-white font-bold">48.250 / 50.000 kg</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-[#00d2ff] rounded-full" style={{ width: '96.5%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Streak Implacável de 14 Dias</h4>
                      <p className="text-[11px] text-slate-400">Registre treinos ou cardio contínuo sem falhar.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    +350 pts
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                    <span>Progresso</span>
                    <span className="text-white font-bold">12 / 14 dias</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '85.7%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Expedição Outdoor 25km</h4>
                      <p className="text-[11px] text-slate-400">Complete 25km de corrida com GPS em Zona 2.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    +400 pts
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                    <span>Progresso</span>
                    <span className="text-white font-bold">18 / 25 km</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-[#00d2ff] rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 5: PERFIL ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">CONFIGURAÇÕES</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Perfil do Atleta</h1>
            </div>

            {/* Identificação do Atleta */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950 border-2 border-cyan-500/50 flex items-center justify-center text-lg font-black text-[#00d2ff]">
                  ML
                </div>
                <button className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00d2ff] text-neutral-950 flex items-center justify-center">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-white">Maikon Lacerda</h3>
                <p className="text-xs text-[#00d2ff] font-medium">Plano FORZON PRO Ativo</p>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Firebase Autenticado
                </span>
              </div>
            </div>

            {/* Dispositivos e Sensores */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">
                DISPOSITIVOS & SENSORES
              </span>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Watch className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-medium">Apple Watch / Wear OS</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Conectado (FC 68 bpm)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-medium">Strava Sync</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">Sincronizado</span>
              </div>
            </div>

            {/* Configurações Adicionais */}
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

      {/* ==================== MODAL 1: QUESTIONÁRIO COMPLETO COACH IA (TODAS AS PERGUNTAS & DIVISÕES) ==================== */}
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

            {/* Pergunta 1: Nível de Treinamento */}
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

            {/* Pergunta 2: Divisão de Treino (ABC, ABCD, ABCDE, Upper/Lower, Full Body) */}
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

            {/* Pergunta 3: Frequência e Duração por Sessão */}
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

            {/* Pergunta 5: Limitações & Restrições Articulares */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                5. Restrições Articulares & Ajustes Biomecânicos
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['Ombro (leve desconforto)', 'Lombar sensível', 'Joelho (sem impacto)', 'Nenhuma restrição'].map((lim) => (
                  <button
                    key={lim}
                    onClick={() => setIntakeLimitation(lim)}
                    className={`py-2 px-2 text-left rounded-xl text-[11px] font-bold border transition-all ${
                      intakeLimitation === lim
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lim}
                  </button>
                ))}
              </div>
            </div>

            {/* Pergunta 6: Modalidades Extras Praticadas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">6. Esportes Concorrentes na Semana</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Corrida de Rua (1x)', 'Jiu-Jitsu / Lutas', 'Natação / Ciclismo'].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setIntakeSport(sp)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                      intakeSport === sp
                        ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Pergunta 7: Cardio Integrado (20 min) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">7. Máquina de Cardio Integrado (20 min pós-treino)</label>
              <div className="grid grid-cols-3 gap-2">
                {['Escada (Stairmaster)', 'Esteira 12% Incline', 'Bicicleta'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setIntakeCardio(c)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      intakeCardio === c
                        ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Pergunta 8: Preferência Alimentar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">8. Preferência da Nutricionista IA</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Hiperproteica', 'Equilibrada', 'Low Carb'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setIntakeDiet(d)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
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

            {/* Diretrizes Invioláveis */}
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/20 text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> Diretrizes Científicas Invioláveis:
              </div>
              <p className="text-[11px] leading-relaxed pl-5">
                • Abdominais dinâmicos inclusos (sem pranchas estáticas).<br />
                • Cargas iniciam zeradas para calibração técnica real.<br />
                • Variações com halteres e convergência ativadas para {intakeLimitation.split(' ')[0]}.
              </p>
            </div>

            {/* Botão de Ação */}
            <button
              onClick={() => {
                setShowCoachModal(false);
                alert(`Periodização gerada com sucesso! Divisão: ${intakeSplit} com foco em ${intakeLevel} e proteção para ${intakeLimitation}.`);
              }}
              className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-neutral-950" />
              Gerar Periodização com Coach IA
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: REFEIÇÃO DE RECUPERAÇÃO ==================== */}
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

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Volume Total Levantado:</span>
              <span className="font-mono font-black text-white px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-[#00d2ff]">
                48.250 kg
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">Bowl de Açaí Turbo com Whey e Banana</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reposição rápida de glicogênio miofibrilar e reversão do catabolismo muscular.
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
                setMeals(prev => [
                  ...prev,
                  { id: Date.now(), title: 'Bowl de Açaí Turbo com Whey', desc: '40g Whey, 200g açaí puro, banana e mel', kcal: 580, checked: true }
                ]);
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
                onClick={() => {
                  setExercises(prev => prev.map(e => e.id === 1 ? { ...e, name: 'Supino Inclinado na Máquina Articulada', cue: 'Carga guiada sem estresse no manguito' } : e));
                  setShowSwapModal(false);
                }}
                className="p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/40 hover:bg-cyan-950/40 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Supino Inclinado na Máquina Articulada</span>
                  <span className="text-[10px] font-mono text-[#00d2ff] font-bold">Equivalente</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Trajetória convergente sem risco para o manguito rotador.</p>
              </div>

              <div
                onClick={() => {
                  setExercises(prev => prev.map(e => e.id === 1 ? { ...e, name: 'Crucifixo Inclinado com Halteres', cue: 'Alongamento fascial 3s' } : e));
                  setShowSwapModal(false);
                }}
                className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Crucifixo Inclinado com Halteres</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">Isolador</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Foco no feixe clavicular do peitoral maior.</p>
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
                <span className="text-white font-bold">Supino Inclinado com Halteres</span>
                <span className="text-[#00d2ff] font-mono font-bold">32 kg x 10 reps</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {['Série 1 (32kg)', 'Série 2 (32kg)', 'Série 3 (34kg)', 'Série 4 (34kg)'].map((s, idx) => (
                  <div key={idx} className={`p-2 rounded-xl border ${idx === 0 ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : idx === 1 ? 'bg-cyan-950/80 border-[#00d2ff] text-[#00d2ff]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <span className="text-[10px] block font-bold">{idx + 1}ª Série</span>
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

    </div>
  );
}
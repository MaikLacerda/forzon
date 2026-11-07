import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';

// Componentes das Abas e Modais Centrais
import { ChallengesView } from './components/gamification/ChallengesView';
import { GPSOutdoorModal } from './components/gps/GPSOutdoorModal';
import { AICoachDrawer } from './components/ai/AICoachDrawer';
import { LiveWorkoutModal } from './components/workout/LiveWorkoutModal';
import { ExerciseSwapModal } from './components/workout/ExerciseSwapModal';
import { RecoveryMealModal } from './components/nutrition/RecoveryMealModal';
import { AIWorkoutNutritionIntakeModal } from './components/ai/AIWorkoutNutritionIntakeModal';
import { BiofeedbackReadinessCard } from './components/biofeedback/BiofeedbackReadinessCard';

// Ícones
import { 
  Play, 
  Sparkles, 
  Repeat, 
  Utensils, 
  Compass,
  CheckCircle2,
  Plus
} from 'lucide-react';

export const App: React.FC = () => {
  // Navegação entre as 5 Abas Oficiais
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'bio' | 'community' | 'profile'>('workout');

  // Controle de Modais Globais
  const [isLiveWorkoutOpen, setIsLiveWorkoutOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isRecoveryMealOpen, setIsRecoveryMealOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isGpsOpen, setIsGpsOpen] = useState(false);

  // Estados Globais de Treino e Métricas
  const [totalVolumeKg, setTotalVolumeKg] = useState(48250);
  const [streakDays, setStreakDays] = useState(12);
  const [waterMl, setWaterMl] = useState(2400);
  const [currentWeight, setCurrentWeight] = useState(32);

  // Finalização de treino ao vivo
  const handleFinishWorkout = (volumeSession: number) => {
    setTotalVolumeKg((prev) => prev + volumeSession);
    setIsLiveWorkoutOpen(false);
    setIsRecoveryMealOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans pb-24">
      {/* 1. Header Oficial FORZON com Logo e Streak */}
      <Header 
        streakDays={streakDays}
        userName="Maikon Lacerda"
        onOpenCoach={() => setIsCoachOpen(true)}
      />

      {/* 2. Conteúdo Dinâmico das 5 Abas */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        
        {/* ================= ABA 1: TREINO ================= */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Card de Prontidão Compacto no Topo */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0f131c] to-[#0f131c] border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-[#00d2ff]">88</span>
                  <span className="text-[8px] font-bold text-slate-400 -mt-1">%</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Prontidão Neuromuscular</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 font-extrabold rounded">MODO PR</span>
                  </div>
                  <p className="text-[10px] text-slate-400">SNC recuperado. Carga progressiva destravada.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCoachOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00d2ff] text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Coach
              </button>
            </div>

            {/* Banner da Sessão do Dia */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#00d2ff] tracking-wider text-[10px]">ROTINA HIPERTROFIA A • SESSÃO #42</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300">⏱️ ~52 min</span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">Treino A — Peitorais, Deltóide & Tríceps</h2>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">4 Séries / ex</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">Proteção Articular Ativa</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">Abdômen Dinâmico</span>
              </div>

              {/* Botão de Iniciar Treino ao Vivo */}
              <button
                onClick={() => setIsLiveWorkoutOpen(true)}
                className="mt-4 w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.35)] transition-all active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Iniciar Treino ao Vivo
              </button>
            </div>

            {/* Lista dos Exercícios da Rotina */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">Sequência Principal (4 Exercícios)</span>
                <button 
                  onClick={() => setIsSwapModalOpen(true)}
                  className="text-[11px] text-[#00d2ff] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Repeat className="w-3 h-3" /> Trocar Exercício
                </button>
              </div>

              {[
                { name: 'Supino Inclinado com Halteres', sets: '4 séries x 8-10 reps', load: currentWeight + ' kg', note: '+2kg sugerido hoje' },
                { name: 'Crucifixo no Cabo (Crossover)', sets: '4 séries x 12 reps', load: '17.5 kg', note: 'Pico de contração 2s' },
                { name: 'Elevação Lateral Escapular', sets: '4 séries x 12-15 reps', load: '14 kg', note: 'Drop-set na última série' },
                { name: 'Tríceps Francês Unilateral', sets: '4 séries x 10 reps', load: '12.5 kg', note: 'Cadência excêntrica de 3s' },
              ].map((ex, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center font-mono font-bold text-xs border border-slate-800">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      <p className="text-[10px] text-slate-400">{ex.sets} • <span className="text-cyan-400">{ex.note}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-white">{ex.load}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ações Rápidas: Avaliação do Coach & Outdoor GPS */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="p-3 rounded-xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-[#00d2ff] mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold">Avaliação IA</span>
                </div>
                <p className="text-[10px] text-slate-400">Ajustar cotas, divisões e tempo por sessão.</p>
              </button>

              <button
                onClick={() => setIsGpsOpen(true)}
                className="p-3 rounded-xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Compass className="w-4 h-4" />
                  <span className="text-xs font-bold">GPS Outdoor</span>
                </div>
                <p className="text-[10px] text-slate-400">Corrida com rastreamento por satélite.</p>
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
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Balanço Calórico</span>
                <span className="font-mono font-bold text-white">1.840 / <span className="text-[#00d2ff]">2.500 kcal</span></span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-[#00d2ff] rounded-full" style={{ width: '73%' }} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div>
                  <span className="text-[10px] text-slate-400">Proteínas</span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">142g <span className="text-slate-500">/ 170g</span></p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Carboidratos</span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">210g <span className="text-slate-500">/ 290g</span></p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Gorduras</span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">52g <span className="text-slate-500">/ 70g</span></p>
                </div>
              </div>
            </div>

            {/* Controle Hídrico */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Meta Hídrica Diária</span>
                <p className="text-sm font-mono font-black text-[#00d2ff] mt-0.5">{waterMl} ml <span className="text-slate-500 text-xs font-normal">/ 3.200 ml</span></p>
              </div>
              <button 
                onClick={() => setWaterMl((m) => Math.min(3200, m + 250))}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-[#00d2ff] font-bold text-xs flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> +250 ml
              </button>
            </div>

            {/* Refeições Registradas */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Refeições de Hoje</span>
              
              <div className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Café da Manhã Anabólico</h4>
                  <p className="text-[10px] text-slate-400">4 ovos mexidos, aveia e banana</p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">550 kcal</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Almoço — Frango Grelhado com Arroz</h4>
                  <p className="text-[10px] text-slate-400">180g peito de frango, 200g arroz branco e legumes</p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">680 kcal</span>
              </div>
            </div>

            {/* Botão Refeição Pós-Treino */}
            <button
              onClick={() => setIsRecoveryMealOpen(true)}
              className="w-full py-3 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-500 text-[#00d2ff] font-bold text-xs flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" /> Sugerir Refeição Pós-Treino ({totalVolumeKg.toLocaleString()} kg)
            </button>
          </div>
        )}

        {/* ================= ABA 3: BIO (DESEMPENHO) ================= */}
        {activeTab === 'bio' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <BiofeedbackReadinessCard onOpenCoach={() => setIsCoachOpen(true)} />
          </div>
        )}

        {/* ================= ABA 4: COMUNIDADE & DESAFIOS ================= */}
        {activeTab === 'community' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <ChallengesView />
          </div>
        )}

        {/* ================= ABA 5: PERFIL ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">CONFIGURAÇÕES</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Perfil do Atleta</h1>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff] font-bold text-lg">
                ML
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Maikon Lacerda</h3>
                <p className="text-xs text-slate-400">Plano FORZON PRO Ativo</p>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Firebase Autenticado
                </span>
              </div>
            </div>

            {/* Conectividade Wearables */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">Dispositivos & Sensores</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Apple Watch / Wear OS</span>
                  <span className="text-[10px] font-bold text-emerald-400">Conectado (FC 68 bpm)</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Strava Sync</span>
                  <span className="text-[10px] font-bold text-emerald-400">Sincronizado</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Barra Inferior de Navegação Fixa (5 Abas) */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 4. Modais Globais Conectados */}
      <LiveWorkoutModal
        isOpen={isLiveWorkoutOpen}
        onClose={() => setIsLiveWorkoutOpen(false)}
        onFinishWorkout={handleFinishWorkout}
      />

      <ExerciseSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onConfirmSwap={() => {
          setIsSwapModalOpen(false);
          setIsLiveWorkoutOpen(true);
        }}
      />

      <RecoveryMealModal
        isOpen={isRecoveryMealOpen}
        onClose={() => setIsRecoveryMealOpen(false)}
        volumeKg={totalVolumeKg}
      />

      <AIWorkoutNutritionIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
      />

      <AICoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        userName="Maikon"
      />

      <GPSOutdoorModal
        isOpen={isGpsOpen}
        onClose={() => setIsGpsOpen(false)}
      />
    </div>
  );
};

export default App;

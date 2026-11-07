import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { LiveWorkoutFullModal } from './components/workout/LiveWorkoutFullModal';
import { ExerciseSwapModal } from './components/workout/ExerciseSwapModal';
import { ExerciseLibraryModal } from './components/workout/ExerciseLibraryModal';
import { RecoveryMealModal } from './components/nutrition/RecoveryMealModal';
import { AIWorkoutNutritionIntakeModal } from './components/ai/AIWorkoutNutritionIntakeModal';
import { AICoachDrawer } from './components/ai/AICoachDrawer';
import { GPSOutdoorModal } from './components/gps/GPSOutdoorModal';
import { ChallengesView } from './components/gamification/ChallengesView';
import { 
  Play, Activity, Moon, Zap, Compass, CheckCircle2, Sparkles, 
  Utensils, RefreshCw, Flame, ChevronRight, Dumbbell, ShieldCheck, 
  Heart, Calendar, TrendingUp, Trophy, Video, MessageSquare, Watch
} from 'lucide-react';
export const App = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'bio' | 'community' | 'profile'>('workout');
  
  // Controle de Modais
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isGPSOpen, setIsGPSOpen] = useState(false);
  const [selectedExerciseForSwap, setSelectedExerciseForSwap] = useState('Supino Inclinado com Halteres');
  const [totalVolumeKg, setTotalVolumeKg] = useState(6301);

  return (
    <div className="min-h-screen bg-[#070a11] text-white flex flex-col font-sans selection:bg-[#00d2ff] selection:text-[#070a11] pb-24">
      {/* 1. Header Oficial FORZON PRO */}
      <Header userName="Maikon" streakDays={12} />

      {/* 2. Área de Conteúdo */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        
        {/* ========================================== */}
        {/* ABA 1: TREINO COMPLETO */}
        {/* ========================================== */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Biofeedback Superior */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-cyan-500/25 shadow-[0_4px_24px_rgba(0,210,255,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00d2ff]" /> Biofeedback Diário
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Modo PR / Sobrecarga +5%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-cyan-500/40 bg-cyan-950/30 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(0,210,255,0.2)]">
                    <span className="text-lg font-black text-white leading-none">88</span>
                    <span className="text-[9px] font-bold text-cyan-400">%</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Prontidão Neuromuscular</h4>
                    <p className="text-[11px] text-slate-400">SNC recuperado em nível ótimo</p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-300 justify-end">
                    <Moon className="w-3 h-3 text-indigo-400" /> Sono 8h 12m
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold justify-end">
                    <Zap className="w-3 h-3 text-amber-400" /> Estresse 2/10 (Baixo)
                  </div>
                </div>
              </div>

              <div className="mt-3.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong className="text-white">Veredito do Coach:</strong> VFC alta (72ms). Hoje é dia de buscar progressão dupla no supino inclinado. Carga livre destravada.
                </p>
              </div>
            </div>

            {/* Hero Card da Sessão */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0c101a] border border-cyan-500/30 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-[#00d2ff] tracking-wider uppercase">
                  ROTINA HIPERTROFIA A • SESSÃO #42
                </span>
                <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                  ⏱️ 52 min
                </span>
              </div>

              <h2 className="text-xl font-black text-white tracking-tight">Treino A — Peitorais, Deltóide & Tríceps</h2>

              <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-slate-300">
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-cyan-400" /> 4 Séries por exercício
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Proteção Articular
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Abdominais Dinâmicos
                </span>
              </div>

              <button
                onClick={() => setIsLiveOpen(true)}
                className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,210,255,0.35)] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Iniciar Treino ao Vivo
              </button>
            </div>

            {/* Atalhos Rápidos: Biblioteca, Coach IA e GPS */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <Video className="w-4 h-4 text-[#00d2ff] mb-1.5" />
                <p className="text-[11px] font-bold text-white">104 Vídeos</p>
                <p className="text-[9px] text-slate-400">Biblioteca</p>
              </button>

              <button
                onClick={() => setIsCoachOpen(true)}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <MessageSquare className="w-4 h-4 text-[#00d2ff] mb-1.5" />
                <p className="text-[11px] font-bold text-white">Coach IA</p>
                <p className="text-[9px] text-slate-400">Conversar</p>
              </button>

              <button
                onClick={() => setIsGPSOpen(true)}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <Compass className="w-4 h-4 text-[#00d2ff] mb-1.5" />
                <p className="text-[11px] font-bold text-white">GPS Run</p>
                <p className="text-[9px] text-slate-400">Outdoor</p>
              </button>
            </div>

            {/* Cardio Pós-Treino Prescrito */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#00d2ff]" /> Cardio Pós-Treino Prescrito
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  Zona 2
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Simulador de Escadas (Stairmaster)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Cadência contínua sem apoiar os braços nas laterais</p>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
                <div><p className="text-[10px] text-slate-400">Duração</p><p className="text-xs font-bold text-white">20 min</p></div>
                <div><p className="text-[10px] text-slate-400">Velocidade</p><p className="text-xs font-bold text-white">Nível 7 (65 SPM)</p></div>
                <div><p className="text-[10px] text-slate-400">Estimativa</p><p className="text-xs font-bold text-cyan-400">~200 kcal</p></div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: NUTRIÇÃO */}
        {/* ========================================== */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">NUTRIÇÃO & MACROS</span>
                <h1 className="text-2xl font-black text-white tracking-tight">Diário Nutricional</h1>
              </div>
              <button
                onClick={() => setIsRecoveryOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900/50 flex items-center gap-1.5"
              >
                <Utensils className="w-3 h-3" /> Pós-Treino
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-semibold">Balanço Calórico</span>
                <span className="text-xs text-cyan-400 font-bold font-mono">1.840 / 2.500 kcal</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-[#00d2ff] rounded-full" style={{ width: '73%' }} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                <div><p className="text-[10px] text-slate-400">Proteínas</p><p className="text-xs font-bold text-white">142g <span className="text-[10px] text-slate-500">/ 170g</span></p></div>
                <div><p className="text-[10px] text-slate-400">Carboidratos</p><p className="text-xs font-bold text-white">210g <span className="text-[10px] text-slate-500">/ 290g</span></p></div>
                <div><p className="text-[10px] text-slate-400">Gorduras</p><p className="text-xs font-bold text-white">52g <span className="text-[10px] text-slate-500">/ 70g</span></p></div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: BIOFEEDBACK */}
        {/* ========================================== */}
        {activeTab === 'bio' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">BIOFEEDBACK DIÁRIO</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Prontidão & Desempenho</h1>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-cyan-500/25">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00d2ff]" /> Score de Prontidão Diária
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Prontidão Alta
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-white">84</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-300">
                Seu SNC e variabilidade de frequência cardíaca (HRV) estão favoráveis. Luz verde para progressão.
              </p>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: COMUNIDADE & DESAFIOS */}
        {/* ========================================== */}
        {activeTab === 'community' && (
          <ChallengesView />
        )}

        {/* ========================================== */}
        {/* ABA 5: PERFIL DO ATLETA & WEARABLES */}
        {/* ========================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">CONFIGURAÇÕES</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Perfil do Atleta</h1>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Maikon"
                className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/40"
              />
              <div>
                <h3 className="font-bold text-sm text-white">Maikon Lacerda</h3>
                <p className="text-xs text-slate-400">Plano FORZON PRO Ativo</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Firebase Autenticado
                </span>
              </div>
            </div>

            {/* Dispositivos Conectados */}
            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Watch className="w-3.5 h-3.5 text-cyan-400" /> Wearables & Sincronização
              </h4>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span>Wear OS / Smartwatch</span>
                <span className="text-emerald-400 font-bold text-[10px]">Conectado</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span>Strava GPS</span>
                <span className="text-cyan-400 font-bold text-[10px]">Sincronizado</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================== */}
      {/* 3. TODOS OS MODAIS INTEGRADOS */}
      {/* ========================================== */}
      <LiveWorkoutFullModal
        isOpen={isLiveOpen}
        onClose={() => setIsLiveOpen(false)}
        workoutTitle="Treino A — Peitorais, Deltóide & Tríceps"
        onOpenSwap={(exName) => {
          setSelectedExerciseForSwap(exName);
          setIsSwapOpen(true);
        }}
        onFinishWorkout={(vol) => {
          setTotalVolumeKg((prev) => prev + vol);
          setIsRecoveryOpen(true);
        }}
      />

      <ExerciseSwapModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        originalExercise={selectedExerciseForSwap}
        targetMuscle="Peitoral Maior"
      />

      <ExerciseLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <RecoveryMealModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
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
        isOpen={isGPSOpen}
        onClose={() => setIsGPSOpen(false)}
      />

      {/* 4. Barra Inferior Persistente (5 Abas) */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;

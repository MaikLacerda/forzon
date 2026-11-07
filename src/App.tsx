import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { LiveWorkoutModal } from './components/workout/LiveWorkoutModal';
import { ExerciseSwapModal } from './components/workout/ExerciseSwapModal';
import { RecoveryMealModal } from './components/nutrition/RecoveryMealModal';
import { AIWorkoutNutritionIntakeModal } from './components/ai/AIWorkoutNutritionIntakeModal';
import { Play, Activity, Moon, Zap, Compass, CheckCircle2, Sparkles, Utensils, RefreshCw } from 'lucide-react';
export const App = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'bio' | 'community' | 'profile'>('workout');
  
  // Modais
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#00d2ff] selection:text-[#090d16] pb-24">
      {/* 1. Header Oficial com Emblema FORZON PRO */}
      <Header userName="Maikon" streakDays={12} />

      {/* 2. Área Dinâmica de Conteúdo por Aba */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        
        {/* ABA 1: TREINO */}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">SEU PAINEL</span>
                <h1 className="text-2xl font-black text-white tracking-tight">Olá, Maikon.</h1>
                <p className="text-xs text-slate-400">Cada sessão conta. Acompanhe seus registros.</p>
              </div>
              <button 
                onClick={() => setIsIntakeOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900/50 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Avaliação IA
              </button>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800/80">
                <span className="text-xs text-slate-400">Treinos</span>
                <p className="text-2xl font-bold text-white mt-1">1</p>
                <span className="text-[10px] text-slate-500">Concluídos</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800/80">
                <span className="text-xs text-slate-400">Sequência</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">0</p>
                <span className="text-[10px] text-slate-500">Dias seguidos</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800/80">
                <span className="text-xs text-slate-400">Volume</span>
                <p className="text-xl font-bold text-white mt-1">6.301 kg</p>
                <span className="text-[10px] text-slate-500">Registrado</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800/80">
                <span className="text-xs text-slate-400">Distância</span>
                <p className="text-2xl font-bold text-cyan-400 mt-1">0 km</p>
                <span className="text-[10px] text-slate-500">Outdoor GPS</span>
              </div>
            </div>

            {/* Lista de Treinos */}
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-bold text-white tracking-wide">Seus treinos</h2>
              
              <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">Treino A — Peitoral, Ombros, Tríceps, Abdômen & Core</h3>
                    <p className="text-xs text-slate-400 mt-1">8 exercícios • 69 min estimados</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button 
                    onClick={() => setIsLiveOpen(true)}
                    className="py-2 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00d2ff] border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#00d2ff]" /> Iniciar treino
                  </button>
                  <button
                    onClick={() => setIsSwapOpen(true)}
                    className="py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" /> Troca
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
                <div>
                  <h3 className="font-bold text-sm text-white">Treino B — Costas, Ombros, Bíceps</h3>
                  <p className="text-xs text-slate-400 mt-1">8 exercícios • 68 min estimados</p>
                </div>
                <button 
                  onClick={() => setIsLiveOpen(true)}
                  className="mt-3 py-2 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00d2ff] border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-[#00d2ff]" /> Iniciar treino
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: NUTRIÇÃO */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
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
                <div>
                  <p className="text-[10px] text-slate-400">Proteínas</p>
                  <p className="text-xs font-bold text-white mt-0.5">142g <span className="text-[10px] text-slate-500">/ 170g</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Carboidratos</p>
                  <p className="text-xs font-bold text-white mt-0.5">210g <span className="text-[10px] text-slate-500">/ 290g</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Gorduras</p>
                  <p className="text-xs font-bold text-white mt-0.5">52g <span className="text-[10px] text-slate-500">/ 70g</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: BIOFEEDBACK */}
        {activeTab === 'bio' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">BIOFEEDBACK DIÁRIO</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Prontidão & Desempenho</h1>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-cyan-500/20 shadow-[0_4px_24px_rgba(0,210,255,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00d2ff]" />
                  <h3 className="font-bold text-sm text-white">Score de Prontidão Diária</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Prontidão Alta
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">84</span>
                <span className="text-xs text-slate-400 font-medium">/ 100</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seu SNC e variabilidade de frequência cardíaca (HRV) estão favoráveis. Luz verde para cargas progressivas no treino de hoje.
              </p>
            </div>
          </div>
        )}

        {/* ABA 4: COMUNIDADE */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">COMUNIDADE FORZON</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Feed dos Atletas</h1>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Ranking de Volume Semanal</span>
                <span className="text-[10px] text-cyan-400 font-bold">Top 5%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-amber-400">#1</span>
                  <span className="text-xs font-semibold text-white">Maikon Lacerda (Você)</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">48.250 kg</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: PERFIL */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">CONFIGURAÇÕES</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Perfil do Atleta</h1>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 flex items-center gap-4">
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
          </div>
        )}
      </main>

      {/* 3. MODAIS CONECTADOS */}
      <LiveWorkoutModal
        isOpen={isLiveOpen}
        onClose={() => setIsLiveOpen(false)}
        workoutTitle="Treino A — Peitoral, Ombros & Tríceps"
        onOpenSwap={() => setIsSwapOpen(true)}
      />

      <ExerciseSwapModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        originalExercise="Supino Reto com Barra"
        targetMuscle="Peitoral Maior"
      />

      <RecoveryMealModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        volumeKg={6301}
      />

      <AIWorkoutNutritionIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
      />

      {/* 4. Barra Inferior com as 5 Abas */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;

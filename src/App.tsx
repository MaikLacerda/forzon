import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { Dumbbell, Utensils, Activity, Users, User, Play, Flame, Moon, Zap, Compass, CheckCircle2 } from 'lucide-react';

export const App = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'bio' | 'community' | 'profile'>('workout');

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#00d2ff] selection:text-[#090d16] pb-24">
      {/* 1. Top Header com Emblema Oficial FORZON */}
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
                onClick={() => setActiveTab('profile')} 
                className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 hover:border-cyan-500/30 transition-colors"
              >
                Meu perfil
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
                <button className="mt-3 py-2 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00d2ff] border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                  <Play className="w-3.5 h-3.5 fill-[#00d2ff]" /> Iniciar treino
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
                <div>
                  <h3 className="font-bold text-sm text-white">Treino B — Costas, Ombros, Bíceps</h3>
                  <p className="text-xs text-slate-400 mt-1">8 exercícios • 68 min estimados</p>
                </div>
                <button className="mt-3 py-2 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00d2ff] border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                  <Play className="w-3.5 h-3.5 fill-[#00d2ff]" /> Iniciar treino
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
                <div>
                  <h3 className="font-bold text-sm text-white">Treino C — Pernas (Quadríceps e Posterior), Glúteos & Panturrilhas</h3>
                  <p className="text-xs text-slate-400 mt-1">8 exercícios • 71 min estimados</p>
                </div>
                <button className="mt-3 py-2 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00d2ff] border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                  <Play className="w-3.5 h-3.5 fill-[#00d2ff]" /> Iniciar treino
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: NUTRIÇÃO */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">NUTRIÇÃO & MACROS</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Diário Nutricional</h1>
              <p className="text-xs text-slate-400">Metas diárias ajustadas ao seu gasto metabólico.</p>
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

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Refeições de Hoje</h3>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Café da Manhã Anabólico</p>
                  <p className="text-[11px] text-slate-400">4 ovos mexidos, aveia e café preto</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">550 kcal</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Almoço — Frango Grelhado com Arroz</p>
                  <p className="text-[11px] text-slate-400">180g peito de frango, 200g arroz branco e brócolis</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">680 kcal</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: BIOFEEDBACK & DESEMPENHO */}
        {activeTab === 'bio' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">BIOFEEDBACK DIÁRIO</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Prontidão & Desempenho</h1>
              <p className="text-xs text-slate-400">Monitoramento neuromuscular e variabilidade cardíaca (HRV).</p>
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
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-[10px] text-slate-400">Sono Registrado</p>
                    <p className="text-xs font-semibold text-white">7h 45m • Ótimo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-[10px] text-slate-400">Nível de Estresse</p>
                    <p className="text-xs font-semibold text-white">3/10 (Baixo)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Rastreamento Outdoor & GPS</h4>
                  <p className="text-[11px] text-slate-400">Corrida, ciclismo e telemetria de pace</p>
                </div>
              </div>
              <button className="py-1.5 px-3 rounded-lg bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 text-xs font-bold transition-transform active:scale-95">
                Iniciar
              </button>
            </div>
          </div>
        )}

        {/* ABA 4: COMUNIDADE */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">COMUNIDADE FORZON</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Feed dos Atletas</h1>
              <p className="text-xs text-slate-400">Compartilhe conquistas e suba no ranking da semana.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Ranking de Volume Semanal</span>
                <span className="text-[10px] text-cyan-400 font-bold">Top 5%</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-400">#1</span>
                    <span className="text-xs font-semibold text-white">Maikon Lacerda (Você)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">48.250 kg</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-400">#2</span>
                    <span className="text-xs text-slate-300">Lucas Silva</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">44.100 kg</span>
                </div>
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
              <p className="text-xs text-slate-400">Gerencie sua assinatura, conexões e biometria.</p>
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

            <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Conexões & Wearables</h4>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-xs text-slate-300">Strava Outdoor GPS</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Conectado</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-xs text-slate-300">Smartwatch (Wear OS / Zepp / Apple)</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Pareado</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-slate-300">Modo Offline (104 Vídeos em Cache)</span>
                <span className="text-xs font-bold text-cyan-400">Ativo</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. A BARRA INFERIOR FIXA COM AS 5 ABAS */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;

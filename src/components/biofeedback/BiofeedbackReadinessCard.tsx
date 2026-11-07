import React, { useState } from 'react';
import { Activity, Moon, Zap, Heart, Sparkles, TrendingUp, Info } from 'lucide-react';

interface BiofeedbackReadinessCardProps {
  onOpenCoach?: () => void;
}

export const BiofeedbackReadinessCard: React.FC<BiofeedbackReadinessCardProps> = ({ onOpenCoach }) => {
  const [readinessScore] = useState(88);
  const [sleepQuality] = useState('Boa');
  const [sleepHours] = useState('8h 12m');
  const [stressLevel] = useState(2);
  const [hrvMs] = useState(72);
  const [restingHr] = useState(54);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Cabecalho da Aba */}
      <div>
        <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">
          BIOFEEDBACK & FISIOLOGIA
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight">Desempenho & Prontidao</h1>
        <p className="text-xs text-slate-400">
          Equilibrio parassimpatico e prontidao do Sistema Nervoso Central (SNC).
        </p>
      </div>

      {/* Card Principal: Score de Prontidao Diaria */}
      <div className="p-5 rounded-2xl bg-[#0f131c] border border-cyan-500/30 relative overflow-hidden shadow-[0_0_25px_rgba(0,210,255,0.1)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/70 border-2 border-cyan-500/40 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.25)]">
              <span className="text-2xl font-black text-[#00d2ff] font-mono leading-none">
                {readinessScore}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                /100
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">Prontidao Neuromuscular</h3>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  MODO PR
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                SNC plenamente recuperado para sobrecarga (+5%)
              </p>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#00d2ff]" /> VFC elevada ({hrvMs}ms) • Freq. Repouso: {restingHr} bpm
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[#0a0e17] border border-slate-800 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-slate-200">Recomendacao Biomecanica de Hoje:</span>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Com sono consistente ({sleepHours}) e baixo estresse fisiologico ({stressLevel}/10), voce tem luz verde para buscar progressao dupla de carga e repeticoes nos exercicios de peito e ombros.
            </p>
          </div>
          {onOpenCoach && (
            <button
              onClick={onOpenCoach}
              className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[#00d2ff] text-[10px] font-bold shrink-0 self-center"
            >
              Coach IA
            </button>
          )}
        </div>
      </div>

      {/* Grid de Metricas */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sono & REM</span>
            <h4 className="text-sm font-mono font-black text-white">{sleepHours}</h4>
            <span className="text-[10px] text-indigo-300 font-semibold">{sleepQuality} • 85% Eficiencia</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estresse Basal</span>
            <h4 className="text-sm font-mono font-black text-white">{stressLevel}/10</h4>
            <span className="text-[10px] text-emerald-400 font-semibold">Baixo Cortisol</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VFC (HRV)</span>
            <h4 className="text-sm font-mono font-black text-white">{hrvMs} ms</h4>
            <span className="text-[10px] text-cyan-300 font-semibold">+8ms acima da media</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ratio ACWR</span>
            <h4 className="text-sm font-mono font-black text-white">1.08</h4>
            <span className="text-[10px] text-amber-300 font-semibold">Zona Otima</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          O biofeedback recalibra automaticamente os pesos sugeridos e o tempo de descanso ATP-CP no seu Treino ao Vivo.
        </span>
      </div>
    </div>
  );
};

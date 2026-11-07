import React, { useState } from 'react';
import {
  Sparkles,
  Moon,
  Zap,
  Heart,
  TrendingUp,
  Info,
  Activity
} from 'lucide-react';

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
    <div className="space-y-4 animate-in fade-in select-none">
      
      {/* Cabeçalho Oficial */}
      <div>
        <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
          BIOFEEDBACK & FISIOLOGIA
        </span>
        <h2 className="text-xl font-black text-white">Desempenho & Prontidão</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Equilíbrio parassimpático e prontidão do Sistema Nervoso Central (SNC).
        </p>
      </div>

      {/* Card Principal: Score de Prontidão Diária */}
      <div className="p-5 rounded-3xl bg-[#0f131c] border border-cyan-500/40 relative overflow-hidden shadow-[0_0_30px_rgba(0,210,255,0.12)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex flex-col items-center justify-center text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.25)]">
              <span className="font-mono text-2xl font-black">{readinessScore}</span>
              <span className="text-[9px] text-slate-400 -mt-1 font-mono">/100</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Prontidão Neuromuscular</h3>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  MODO PR
                </span>
              </div>
              <p className="text-xs text-[#00d2ff] font-bold mt-0.5">
                SNC plenamente recuperado para sobrecarga (+5%)
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Activity className="w-3 h-3" /> VFC elevada ({hrvMs}ms)
                </span>
                <span>•</span>
                <span>Freq. Repouso: {restingHr} bpm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recomendação Biomecânica da IA */}
        <div className="mt-4 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start justify-between gap-3">
          <div className="flex gap-2.5">
            <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="text-white block font-bold">Recomendação Biomecânica de Hoje:</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Com sono consistente ({sleepHours}) e baixo estresse fisiológico ({stressLevel}/10), você tem luz verde para buscar progressão dupla de carga e repetições nos exercícios de peito e ombros.
              </p>
            </div>
          </div>

          {onOpenCoach && (
            <button
              type="button"
              onClick={onOpenCoach}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-900/80 border border-cyan-500/40 text-[10px] font-bold text-[#00d2ff] hover:bg-cyan-800 transition-all shrink-0 cursor-pointer"
            >
              Coach IA
            </button>
          )}
        </div>
      </div>

      {/* Grid com os 4 Cards Fisiológicos que tinham sumido */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* 1. Sono & REM */}
        <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00d2ff]">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SONO & REM
            </span>
            <div className="font-mono text-base font-black text-white">{sleepHours}</div>
            <span className="text-[10px] text-emerald-400 font-bold">{sleepQuality} • 85% Eficiência</span>
          </div>
        </div>

        {/* 2. Estresse Basal */}
        <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ESTRESSE BASAL
            </span>
            <div className="font-mono text-base font-black text-white">{stressLevel}/10</div>
            <span className="text-[10px] text-emerald-400 font-bold">Baixo Cortisol</span>
          </div>
        </div>

        {/* 3. VFC (HRV) */}
        <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              VFC (HRV)
            </span>
            <div className="font-mono text-base font-black text-white">{hrvMs} ms</div>
            <span className="text-[10px] text-[#00d2ff] font-bold">+8ms acima da média</span>
          </div>
        </div>

        {/* 4. Ratio ACWR */}
        <div className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              RATIO ACWR
            </span>
            <div className="font-mono text-base font-black text-white">1.08</div>
            <span className="text-[10px] text-amber-400 font-bold">Zona Ótima</span>
          </div>
        </div>

      </div>

      {/* Nota de Rodapé Informativa */}
      <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-[#00d2ff] shrink-0" />
        <span>
          O biofeedback recalibra automaticamente os pesos sugeridos e o tempo de descanso ATP-CP no seu Treino ao Vivo.
        </span>
      </div>

    </div>
  );
};

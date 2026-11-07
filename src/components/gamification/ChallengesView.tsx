import React from "react";
import { Trophy, Flame, Dumbbell, Zap } from "lucide-react";

export const ChallengesView: React.FC = () => {
  const challenges = [
    { id: "1", title: "Desafio 50 Toneladas", desc: "Acumule 50.000 kg em exercícios compostos.", progress: "48.250 / 50.000 kg", percent: 96, reward: "500 pts", icon: Dumbbell },
    { id: "2", title: "Streak Implacável de 14 Dias", desc: "Registre treinos ou cardio contínuo sem falhar.", progress: "12 / 14 dias", percent: 85, reward: "350 pts", icon: Flame },
    { id: "3", title: "Expedição Outdoor 25km", desc: "Complete 25km de corrida com GPS em Zona 2.", progress: "18 / 25 km", percent: 72, reward: "400 pts", icon: Zap },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">GAMIFICAÇÃO & RANKING</span>
        <h1 className="text-2xl font-black text-white tracking-tight">Desafios & Conquistas</h1>
        <p className="text-xs text-slate-400">Desbloqueie medalhas e suba no ranking da comunidade.</p>
      </div>
      <div className="space-y-3">
        {challenges.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.id} className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{c.title}</h3>
                    <p className="text-[11px] text-slate-400">{c.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  +{c.reward}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                  <span>Progresso</span>
                  <span className="text-white font-bold">{c.progress}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-[#00d2ff] rounded-full" style={{ width: c.percent + "%" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

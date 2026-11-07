import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, Dumbbell, ShieldCheck } from 'lucide-react';
interface ExerciseSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalExercise?: string;
  targetMuscle?: string;
  onConfirmSwap?: (alternativeName: string) => void;
}

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  isOpen,
  onClose,
  originalExercise = "Supino Reto com Barra",
  targetMuscle = "Peitoral Maior",
  onConfirmSwap,
}) => {
  const [selectedAlt, setSelectedAlt] = useState<string>("Supino Reto com Halteres");

  if (!isOpen) return null;

  const alternatives = [
    {
      id: "alt-1",
      name: "Supino Reto com Halteres",
      equipment: "Halteres + Banco Plano",
      benefits: "Maior amplitude articular e correção de assimetrias.",
      badge: "Recomendação IA",
    },
    {
      id: "alt-2",
      name: "Crucifixo no Crossover (Polia Média)",
      equipment: "Crossover com Cabos",
      benefits: "Tensão mecânica contínua inclusive no pico de contração.",
      badge: "Isolamento Contínuo",
    },
    {
      id: "alt-3",
      name: "Supino Reto na Máquina Articulada",
      equipment: "Máquina Hammer / Articulada",
      benefits: "Trajetória guiada e alta segurança para cargas pesadas.",
      badge: "Mais Seguro",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0a0e17] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0f131c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Substituição de Aparelho</h3>
              <p className="text-[11px] text-slate-400">Biomecânica equivalente para {targetMuscle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exercício Ocupado */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Aparelho Ocupado:</span>
            <p className="font-bold text-white text-sm mt-0.5">{originalExercise}</p>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alternativas Disponíveis:</span>
            {alternatives.map((alt) => {
              const isSelected = selectedAlt === alt.name;
              return (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlt(alt.name)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.1)]'
                      : 'bg-[#0f131c] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{alt.name}</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                          {alt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-slate-500" /> {alt.equipment}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1">{alt.benefits}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00d2ff] shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botão de Confirmação */}
        <div className="p-4 border-t border-slate-800 bg-[#0f131c]">
          <button
            onClick={() => {
              if (onConfirmSwap) onConfirmSwap(selectedAlt);
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.25)] transition-transform active:scale-[0.98]"
          >
            Confirmar Troca para {selectedAlt.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

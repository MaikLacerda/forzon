import React from 'react';
import { X, Utensils, Zap, Flame, Check, Sparkles } from 'lucide-react';
interface RecoveryMealProps {
  isOpen: boolean;
  onClose: () => void;
  volumeKg?: number;
  workoutName?: string;
  onApplyMeal?: () => void;
}

export const RecoveryMealModal: React.FC<RecoveryMealProps> = ({
  isOpen,
  onClose,
  volumeKg = 6301,
  workoutName = "Treino A — Peitoral & Tríceps",
  onApplyMeal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0a0e17] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0f131c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">Pós-Treino Inteligente</span>
              <h3 className="text-sm font-extrabold text-white">Refeição de Recuperação</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Nutricional */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Card de Volume */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Volume Total Levantado:</span>
              <p className="font-extrabold text-white text-sm">{volumeKg.toLocaleString('pt-BR')} kg</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Janela de Janela Anabólica
            </span>
          </div>

          {/* Nome da Refeição */}
          <div className="p-4 rounded-2xl bg-[#0f131c] border border-cyan-500/20">
            <h4 className="text-base font-bold text-white">Bowl de Açaí Turbo com Whey e Banana</h4>
            <p className="text-xs text-slate-400 mt-1">Reposição rápida de glicogênio miofibrilar e reversão do catabolismo.</p>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
              <div>
                <p className="text-[10px] text-slate-400">Calorias</p>
                <p className="text-xs font-bold text-cyan-400">580 kcal</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Proteínas</p>
                <p className="text-xs font-bold text-white">42g (Leucina)</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Carboidratos</p>
                <p className="text-xs font-bold text-white">74g</p>
              </div>
            </div>
          </div>

          {/* Ingredientes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingredientes Selecionados:</span>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>• 40g Whey Protein Isolado/Concentrado</span>
                <span className="text-slate-400">32g prot</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• 200g Polpa de Açaí Puro (sem xarope)</span>
                <span className="text-slate-400">130 kcal</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• 2 Bananas Prata fatiadas</span>
                <span className="text-slate-400">36g carb</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• 1 Colher de Mel Silvestre Puro</span>
                <span className="text-slate-400">Eletrólitos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Registro */}
        <div className="p-4 border-t border-slate-800 bg-[#0f131c]">
          <button
            onClick={() => {
              if (onApplyMeal) onApplyMeal();
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-transform active:scale-[0.98]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Registrar Refeição no Diário
          </button>
        </div>
      </div>
    </div>
  );
};

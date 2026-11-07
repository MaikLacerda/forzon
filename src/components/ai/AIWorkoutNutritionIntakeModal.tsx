import React, { useState } from 'react';
import { X, Sparkles, Check, ChevronRight, Dumbbell, Flame } from 'lucide-react';
interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteIntake?: (data: any) => void;
}

export const AIWorkoutNutritionIntakeModal: React.FC<IntakeModalProps> = ({
  isOpen,
  onClose,
  onCompleteIntake,
}) => {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado' | 'Atleta'>('Intermediário');
  const [split, setSplit] = useState<'ABC' | 'UpperLower' | 'FullBody'>('ABC');
  const [cardio, setCardio] = useState<'Escada' | 'Esteira' | 'Bicicleta'>('Escada');

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
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">Coach IA & Nutrição</span>
              <h3 className="text-sm font-extrabold text-white">Avaliação de Intake do Atleta</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo do Formulário */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Nível de Experiência */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white">1. Nível de Treinamento</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Iniciante', 'Intermediário', 'Avançado', 'Atleta'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    level === lvl
                      ? 'bg-cyan-500/15 border-[#00d2ff] text-[#00d2ff]'
                      : 'bg-[#0f131c] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Divisão Semanal */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white">2. Divisão de Treino Preferida</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ABC' as const, label: 'ABC Padrão' },
                { id: 'UpperLower' as const, label: 'Upper / Lower' },
                { id: 'FullBody' as const, label: 'Full Body' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSplit(s.id)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                    split === s.id
                      ? 'bg-cyan-500/15 border-[#00d2ff] text-[#00d2ff]'
                      : 'bg-[#0f131c] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cardio Pós-Treino */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white">3. Máquina de Cardio Integrado (20 min)</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Escada', 'Esteira', 'Bicicleta'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCardio(c)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                    cardio === c
                      ? 'bg-cyan-500/15 border-[#00d2ff] text-[#00d2ff]'
                      : 'bg-[#0f131c] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Diretriz Fixa de Prescrição */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-white flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-cyan-400" /> Diretrizes Científicas Invioláveis:
            </p>
            <p>• Abdominais dinâmicos incluídos (sem pranchas estáticas).</p>
            <p>• Cargas iniciam zeradas para progressão técnica real.</p>
          </div>
        </div>

        {/* Conclusão */}
        <div className="p-4 border-t border-slate-800 bg-[#0f131c]">
          <button
            onClick={() => {
              if (onCompleteIntake) onCompleteIntake({ level, split, cardio });
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-transform active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            Gerar Periodização com Coach IA
          </button>
        </div>
      </div>
    </div>
  );
};

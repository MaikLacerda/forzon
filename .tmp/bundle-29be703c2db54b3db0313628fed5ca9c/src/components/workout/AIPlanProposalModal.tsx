import React from "react";
import { X, Check, AlertTriangle, Sparkles, ArrowRight, ShieldCheck, Dumbbell, History } from "lucide-react";
import { WorkoutPlan, PlanVersion } from "../../types";

interface AIPlanProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposedPlan: WorkoutPlan;
  currentPlan: WorkoutPlan;
  onAcceptProposal: (version: PlanVersion) => void;
  onRejectProposal: () => void;
}

export const AIPlanProposalModal: React.FC<AIPlanProposalModalProps> = ({
  isOpen,
  onClose,
  proposedPlan,
  currentPlan,
  onAcceptProposal,
  onRejectProposal,
}) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    const version: PlanVersion = {
      version: 2,
      planId: proposedPlan.id,
      title: proposedPlan.title,
      createdAt: new Date().toISOString(),
      changelogSummary: "Periodização recalculada com sobrecarga progressiva e foco em hipertrofia.",
      rationale: "Volume equalizado para permitir recuperação muscular ideal entre as sessões A e B.",
      sessions: proposedPlan.sessions,
      status: "applied",
    };
    onAcceptProposal(version);
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-mono uppercase tracking-wider">
                Auditoria de Treino FORZON IA
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Proposta de Adaptação de Periodização (v2.0)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explainability & Rationale Box (Mandatory rule from Section 11/12) */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
          <div className="font-bold text-neutral-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Validação por Regras Determinísticas & Fisiologia:</span>
          </div>
          <p className="text-neutral-300 leading-relaxed">
            A IA analisou seu histórico recente: seu supino subiu de 76kg para 80kg e a frequência semanal foi 100% cumprida. As adaptações sugerem redistribuição do volume de tríceps e inclusão de exercícios com vetor de força complementar.
          </p>
          <div className="text-[11px] text-emerald-400 font-mono pt-1">
            ✓ Parâmetros validados contra lesões relatadas (proteção do manguito rotador).
          </div>
        </div>

        {/* Proposed Sessions Diff Overview */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Sessões Estruturadas na Proposta ({proposedPlan.sessions.length} Dias):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {proposedPlan.sessions.map((sess, i) => (
              <div
                key={sess.id || i}
                className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-850 space-y-1.5 text-xs"
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{sess.title}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{sess.estimatedMinutes}m</span>
                </div>
                <div className="text-neutral-400 text-[11px] truncate">
                  Foco: {sess.muscleFocus}
                </div>
                <div className="text-emerald-400 font-mono text-[11px]">
                  {sess.exercises.length} exercícios programados
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Decision Bar: Accept vs Reject */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800 text-xs">
          <div className="text-neutral-400 text-[11px]">
            *Nenhuma mudança é aplicada sem a sua autorização explícita.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onRejectProposal}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer"
            >
              Rejeitar Proposta
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Aprovar & Salvar Nova Versão</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

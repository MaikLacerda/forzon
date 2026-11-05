import React, { useState } from "react";
import { X, Bell, Clock, Dumbbell, Calendar as CalendarIcon, Check, Trash2, Sparkles, Volume2 } from "lucide-react";
import { WorkoutPlan, DateWorkoutReminder } from "../../types";
import { notificationService } from "../../services/notificationService";

interface DateReminderModalProps {
  isOpen: boolean;
  dateStr: string; // "YYYY-MM-DD"
  plan: WorkoutPlan;
  existingReminder?: DateWorkoutReminder | null;
  onClose: () => void;
  onSaved: (reminder: DateWorkoutReminder) => void;
  onDeleted: (id: string) => void;
}

export const DateReminderModal: React.FC<DateReminderModalProps> = ({
  isOpen,
  dateStr,
  plan,
  existingReminder,
  onClose,
  onSaved,
  onDeleted,
}) => {
  const [time, setTime] = useState<string>(existingReminder?.time || "07:30");
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    existingReminder?.sessionId || plan.sessions[0]?.id || ""
  );
  const [customNote, setCustomNote] = useState<string>(
    existingReminder?.customNote || "Horário de foco total no treino! Hidrate-se antes de iniciar."
  );
  const [enabled, setEnabled] = useState<boolean>(existingReminder ? existingReminder.enabled : true);

  if (!isOpen) return null;

  // Format date for display in Portuguese
  const formatDisplayDate = (dStr: string) => {
    try {
      const parts = dStr.split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dStr;
    }
  };

  const selectedSession = plan.sessions.find((s) => s.id === selectedSessionId) || plan.sessions[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const reminder: DateWorkoutReminder = {
      id: existingReminder?.id || `date-rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dateStr,
      time,
      sessionId: selectedSession?.id,
      sessionName: selectedSession?.title || "Treino Programado",
      customNote,
      enabled,
      createdAt: existingReminder?.createdAt || new Date().toISOString(),
    };

    notificationService.saveDateReminder(reminder);
    notificationService.playChime();
    onSaved(reminder);
    onClose();
  };

  const handleDelete = () => {
    if (existingReminder) {
      notificationService.deleteDateReminder(existingReminder.id);
      onDeleted(existingReminder.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {existingReminder ? "Editar Lembrete de Treino" : "Agendar Lembrete de Treino"}
              </h2>
              <div className="text-xs text-emerald-400 capitalize flex items-center gap-1.5 font-medium">
                <CalendarIcon className="w-3 h-3" />
                <span>{formatDisplayDate(dateStr)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Horário */}
          <div className="space-y-1.5">
            <label className="text-neutral-300 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Horário do Alerta:</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="flex gap-1 shrink-0">
                {["06:30", "08:00", "18:00", "19:30"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTime(preset)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                      time === preset
                        ? "bg-emerald-500 text-neutral-950 font-bold border-emerald-400"
                        : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Treino Alvo */}
          <div className="space-y-1.5">
            <label className="text-neutral-300 font-semibold flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sessão de Treino Programada:</span>
            </label>
            <div className="space-y-2">
              {plan.sessions.map((sess) => {
                const isSelected = selectedSessionId === sess.id;
                return (
                  <button
                    key={sess.id}
                    type="button"
                    onClick={() => setSelectedSessionId(sess.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-neutral-950 border-emerald-500 ring-1 ring-emerald-500/50"
                        : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{sess.title}</div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {sess.muscleFocus} ({sess.exercises.length} exercícios)
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-950 shrink-0 ml-2">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nota personalizada / Motivação */}
          <div className="space-y-1.5">
            <label className="text-neutral-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mensagem de Motivação & Foco:</span>
            </label>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={2}
              placeholder="Ex: Treino pesado de pernas! Preparar shake e pré-treino 30 min antes."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none transition-colors"
            />
          </div>

          {/* Toggle de Ativação */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-bold text-white text-xs">Notificação Ativa</div>
                <div className="text-[10px] text-neutral-400">Envia push web e aviso sonoro no FORZON</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative cursor-pointer ${
                enabled ? "bg-emerald-500" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
            {existingReminder && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Excluir este lembrete"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold tracking-wide transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{existingReminder ? "Atualizar" : "Salvar Lembrete"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from "react";
import { Bell, Flame, Play, X, Clock } from "lucide-react";
import { WorkoutReminderEventDetail } from "../../types";

interface WorkoutReminderToastProps {
  reminder: WorkoutReminderEventDetail | null;
  onClose: () => void;
  onStartWorkout: (workoutId: string) => void;
  onSnooze: (minutes: number) => void;
}

export const WorkoutReminderToast: React.FC<WorkoutReminderToastProps> = ({
  reminder,
  onClose,
  onStartWorkout,
  onSnooze,
}) => {
  if (!reminder) return null;

  return (
    <aside
      aria-label="Lembrete de Treino"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-neutral-900/95 border-2 border-emerald-500/50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 text-white space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                <span>Lembrete de Treino</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="text-sm font-bold text-white line-clamp-1">{reminder.workoutTitle}</h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Fechar lembrete"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          {reminder.message}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
          <Flame className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
          <span>Mantenha sua sequência de {reminder.streakDays} dias consecutivos ativa!</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              onStartWorkout(reminder.workoutId);
              onClose();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-neutral-950" />
            <span>INICIAR TREINO</span>
          </button>

          <button
            onClick={() => onSnooze(15)}
            className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Lembrar em 15 minutos"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>+15m</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

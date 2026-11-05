import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Dumbbell,
  Bell,
  Sparkles,
  Plus,
  Flame,
  TrendingUp,
  AlertCircle,
  Filter,
} from "lucide-react";
import { WorkoutPlan, CompletedWorkoutRecord, DateWorkoutReminder } from "../../types";
import { notificationService } from "../../services/notificationService";
import { DateReminderModal } from "./DateReminderModal";

interface MonthlyWorkoutCalendarProps {
  plan: WorkoutPlan;
  recentWorkouts: CompletedWorkoutRecord[];
  onStartWorkout: (sessionId: string) => void;
  onOpenCoachWithPrompt?: (prompt: string) => void;
}

export const MonthlyWorkoutCalendar: React.FC<MonthlyWorkoutCalendarProps> = ({
  plan,
  recentWorkouts,
  onStartWorkout,
  onOpenCoachWithPrompt,
}) => {
  // Active calendar view month (default: current date)
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed

  // Filter state
  const [filterMode, setFilterMode] = useState<"all" | "completed" | "scheduled" | "reminders">("all");

  // Date reminders list
  const [dateReminders, setDateReminders] = useState<DateWorkoutReminder[]>(() =>
    notificationService.getDateReminders()
  );

  // Selected date modal state
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Sync reminders with custom events
  useEffect(() => {
    const handleRemindersChange = (e: Event) => {
      const custom = e as CustomEvent<DateWorkoutReminder[]>;
      if (custom.detail) {
        setDateReminders(custom.detail);
      } else {
        setDateReminders(notificationService.getDateReminders());
      }
    };
    window.addEventListener("athlynx_date_reminders_change", handleRemindersChange);
    return () => window.removeEventListener("athlynx_date_reminders_change", handleRemindersChange);
  }, []);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 3000);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Month metadata
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo

  // Days list calculation
  const calendarDays = useMemo(() => {
    const days: Array<{
      dayNumber: number;
      dateStr: string; // "YYYY-MM-DD"
      isPast: boolean;
      isToday: boolean;
      isFuture: boolean;
      completedWorkouts: CompletedWorkoutRecord[];
      scheduledSession: typeof plan.sessions[0] | null;
      reminder: DateWorkoutReminder | null;
    }> = [];

    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const thisDate = new Date(currentYear, currentMonth, day);
      const isToday = dateStr === todayDateStr;
      const isPast = thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isFuture = thisDate > new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Match completed workouts on this day
      const completed = recentWorkouts.filter((w) => {
        if (!w.completedAt) return false;
        const wDate = new Date(w.completedAt);
        const wDateStr = `${wDate.getFullYear()}-${String(wDate.getMonth() + 1).padStart(2, "0")}-${String(
          wDate.getDate()
        ).padStart(2, "0")}`;
        return wDateStr === dateStr;
      });

      // Match scheduled session from workout split cycle
      // Rotates session through weekdays (Mon-Fri) or cyclical day index
      const dayOfWeek = thisDate.getDay();
      let scheduledSession: typeof plan.sessions[0] | null = null;
      if (plan.sessions.length > 0) {
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Mon-Fri map to session modulo
          const sessionIdx = (day - 1) % plan.sessions.length;
          scheduledSession = plan.sessions[sessionIdx];
        } else if (dayOfWeek === 6 && plan.sessions.length > 3) {
          scheduledSession = plan.sessions[plan.sessions.length - 1];
        }
      }

      // Match reminder for this date
      const reminder = dateReminders.find((r) => r.dateStr === dateStr && r.enabled) || null;

      days.push({
        dayNumber: day,
        dateStr,
        isPast,
        isToday,
        isFuture,
        completedWorkouts: completed,
        scheduledSession,
        reminder,
      });
    }

    return days;
  }, [currentYear, currentMonth, daysInMonth, today, recentWorkouts, plan.sessions, dateReminders]);

  // Monthly stats
  const monthlyCompletedCount = useMemo(() => {
    return calendarDays.reduce((acc, d) => acc + d.completedWorkouts.length, 0);
  }, [calendarDays]);

  const monthlyTotalVolume = useMemo(() => {
    return calendarDays.reduce(
      (acc, d) => acc + d.completedWorkouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0),
      0
    );
  }, [calendarDays]);

  const monthlyFutureScheduledCount = useMemo(() => {
    return calendarDays.filter((d) => d.isFuture && d.scheduledSession).length;
  }, [calendarDays]);

  const monthlyRemindersCount = useMemo(() => {
    return calendarDays.filter((d) => d.reminder).length;
  }, [calendarDays]);

  // Click on date cell
  const handleDateClick = (dateStr: string, isFuture: boolean, isToday: boolean) => {
    // Both future days and today can have reminders configured or updated
    setSelectedDateForModal(dateStr);
  };

  const existingReminderForSelected = useMemo(() => {
    if (!selectedDateForModal) return null;
    return dateReminders.find((r) => r.dateStr === selectedDateForModal) || null;
  }, [selectedDateForModal, dateReminders]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-emerald-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{activeToast}</span>
        </div>
      )}

      {/* Top Banner: Monthly Telemetry & Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
            <span>Treinos Concluídos</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {monthlyCompletedCount} <span className="text-xs text-neutral-400 font-normal">sessões</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium mt-1">Neste mês corrente</div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
            <span>Volume Acumulado</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {(monthlyTotalVolume / 1000).toFixed(1)}k <span className="text-xs text-neutral-400 font-normal">kg</span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-1">{monthlyTotalVolume.toLocaleString()} kg total</div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
            <span>Treinos Programados</span>
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {monthlyFutureScheduledCount} <span className="text-xs text-neutral-400 font-normal">dias</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Divisão {plan.title.split("-")[0] || "A/B/C"}</div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
            <span>Lembretes Ativos</span>
            <Bell className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {monthlyRemindersCount} <span className="text-xs text-neutral-400 font-normal">agendados</span>
          </div>
          <div className="text-[10px] text-amber-400/90 font-medium mt-1">Clique para agendar</div>
        </div>
      </div>

      {/* Calendar Header Navigation & Filters */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white capitalize">{monthName}</h2>
              <div className="text-xs text-neutral-400 flex items-center gap-2">
                <span>Clique em datas futuras para programar lembretes</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">Sincronizado</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToToday}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Mês Atual
            </button>

            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend and Filter Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-3 text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Treino Concluído</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/30" />
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              <span>Programado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-amber-400" />
              <span>Lembrete Configurado</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px]">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-neutral-800 text-white font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterMode("completed")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Concluídos
            </button>
            <button
              onClick={() => setFilterMode("reminders")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === "reminders"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Com Lembrete
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-neutral-400">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((weekday, i) => (
            <div key={weekday} className={`py-1.5 ${i === 0 || i === 6 ? "text-neutral-400" : "text-neutral-300"}`}>
              {weekday}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Leading Empty Cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[90px] sm:min-h-[115px] rounded-2xl bg-neutral-950/30 border border-neutral-850/30 opacity-20 pointer-events-none"
            />
          ))}

          {/* Actual Month Days */}
          {calendarDays.map((day) => {
            const hasCompleted = day.completedWorkouts.length > 0;
            const hasReminder = Boolean(day.reminder);
            const isFuture = day.isFuture;
            const isToday = day.isToday;

            // Apply active filter mode
            if (filterMode === "completed" && !hasCompleted) {
              return (
                <div
                  key={day.dateStr}
                  className="min-h-[90px] sm:min-h-[115px] rounded-2xl bg-neutral-950/20 border border-neutral-850/40 p-2 opacity-30 flex flex-col justify-between"
                >
                  <span className="text-xs text-neutral-400">{day.dayNumber}</span>
                </div>
              );
            }

            if (filterMode === "reminders" && !hasReminder) {
              return (
                <div
                  key={day.dateStr}
                  className="min-h-[90px] sm:min-h-[115px] rounded-2xl bg-neutral-950/20 border border-neutral-850/40 p-2 opacity-30 flex flex-col justify-between"
                >
                  <span className="text-xs text-neutral-400">{day.dayNumber}</span>
                </div>
              );
            }

            return (
              <div
                key={day.dateStr}
                onClick={() => handleDateClick(day.dateStr, isFuture, isToday)}
                className={`min-h-[90px] sm:min-h-[115px] rounded-2xl p-2 sm:p-2.5 transition-all flex flex-col justify-between relative group cursor-pointer ${
                  isToday
                    ? "bg-neutral-950 border-2 border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg shadow-emerald-500/10"
                    : hasCompleted
                    ? "bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/60"
                    : isFuture
                    ? "bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60"
                    : "bg-neutral-950/40 border border-neutral-850 text-neutral-400 hover:border-neutral-800"
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isToday
                        ? "text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md"
                        : hasCompleted
                        ? "text-emerald-300"
                        : "text-neutral-400 group-hover:text-white"
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Reminder Badge */}
                  {hasReminder && (
                    <span
                      className="p-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1 text-[10px] font-mono shrink-0 shadow-sm"
                      title={`Lembrete: ${day.reminder?.time} — ${day.reminder?.sessionName}`}
                    >
                      <Bell className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span className="hidden sm:inline font-bold">{day.reminder?.time}</span>
                    </span>
                  )}
                </div>

                {/* Day Body Content */}
                <div className="space-y-1 my-1">
                  {hasCompleted ? (
                    // Completed workout summary
                    day.completedWorkouts.map((w, idx) => (
                      <div
                        key={w.id || idx}
                        className="bg-emerald-500/15 border border-emerald-500/30 rounded-lg p-1.5 text-left"
                      >
                        <div className="text-[10px] sm:text-xs font-bold text-emerald-300 truncate flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{w.title || "Treino"}</span>
                        </div>
                        <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                          {w.totalVolumeKg ? `${w.totalVolumeKg.toLocaleString()} kg` : "Concluído"}
                        </div>
                      </div>
                    ))
                  ) : isToday ? (
                    // Today scheduled session
                    <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-lg p-1.5 text-left">
                      <div className="text-[10px] sm:text-xs font-bold text-emerald-300 truncate flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{plan.sessions[0]?.title || "Treino de Hoje"}</span>
                      </div>
                      <div className="text-[9px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                        <span>Iniciar Hoje</span>
                      </div>
                    </div>
                  ) : isFuture && day.scheduledSession ? (
                    // Future scheduled session
                    <div className="bg-neutral-900 border border-neutral-800/80 rounded-lg p-1.5 text-left group-hover:border-neutral-700 transition-colors">
                      <div className="text-[10px] sm:text-xs font-medium text-neutral-300 truncate">
                        {day.scheduledSession.title}
                      </div>
                      <div className="text-[9px] text-neutral-400 truncate">
                        {day.scheduledSession.muscleFocus}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-neutral-400 italic">Descanso</div>
                  )}
                </div>

                {/* Day Footer Action */}
                <div className="pt-1 border-t border-neutral-800/50 flex items-center justify-between text-[10px]">
                  {isToday ? (
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Hoje</span>
                  ) : isFuture ? (
                    <span className="text-neutral-400 group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
                      <Plus className="w-2.5 h-2.5" />
                      <span className="hidden sm:inline">Lembrete</span>
                    </span>
                  ) : (
                    <span className="text-neutral-400 font-mono text-[9px]">{hasCompleted ? "Concluído" : "Livre"}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date-specific reminder modal */}
      {selectedDateForModal && (
        <DateReminderModal
          isOpen={Boolean(selectedDateForModal)}
          dateStr={selectedDateForModal}
          plan={plan}
          existingReminder={existingReminderForSelected}
          onClose={() => setSelectedDateForModal(null)}
          onSaved={(rem) => {
            showToast(`Lembrete de treino agendado para ${rem.dateStr} às ${rem.time}!`);
          }}
          onDeleted={() => {
            showToast("Lembrete de treino removido.");
          }}
        />
      )}
    </div>
  );
};

import { NotificationSettings, WorkoutReminderEventDetail, DateWorkoutReminder } from "../types";

const STORAGE_KEY = "athlynx_notification_settings";
const DATE_REMINDERS_STORAGE_KEY = "athlynx_date_reminders";

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderTime: "08:00",
  daysOfWeek: [1, 2, 3, 4, 5], // Segunda a Sexta
  soundEnabled: true,
  advanceMinutes: 0,
};

class NotificationService {
  private schedulerIntervalId: number | null = null;
  private audioCtx: AudioContext | null = null;

  /**
   * Check if the browser supports the Web Notification API
   */
  public isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  /**
   * Get current browser permission state ('granted', 'denied', 'default', or 'unsupported')
   */
  public getPermissionStatus(): NotificationPermission | "unsupported" {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission;
  }

  /**
   * Request browser notification permission
   */
  public async requestPermission(): Promise<NotificationPermission | "unsupported"> {
    if (!this.isSupported()) return "unsupported";
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn("Failed to request notification permission:", e);
      return Notification.permission;
    }
  }

  /**
   * Get persisted settings
   */
  public getSettings(): NotificationSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings and trigger update event
   */
  public saveSettings(settings: NotificationSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent("athlynx_notification_settings_change", { detail: settings })
    );
  }

  /**
   * Get all date-specific reminders
   */
  public getDateReminders(): DateWorkoutReminder[] {
    try {
      const raw = localStorage.getItem(DATE_REMINDERS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Save or update a date-specific reminder
   */
  public saveDateReminder(reminder: DateWorkoutReminder): void {
    const list = this.getDateReminders();
    const existingIdx = list.findIndex((r) => r.id === reminder.id);
    let updated: DateWorkoutReminder[];
    if (existingIdx >= 0) {
      updated = [...list];
      updated[existingIdx] = reminder;
    } else {
      updated = [reminder, ...list];
    }
    localStorage.setItem(DATE_REMINDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("athlynx_date_reminders_change", { detail: updated })
    );
  }

  /**
   * Delete a date-specific reminder
   */
  public deleteDateReminder(id: string): void {
    const list = this.getDateReminders();
    const updated = list.filter((r) => r.id !== id);
    localStorage.setItem(DATE_REMINDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("athlynx_date_reminders_change", { detail: updated })
    );
  }

  /**
   * Get reminders for a specific date (YYYY-MM-DD)
   */
  public getDateRemindersForDate(dateStr: string): DateWorkoutReminder[] {
    return this.getDateReminders().filter((r) => r.dateStr === dateStr && r.enabled);
  }

  /**
   * Play a pleasant athlete motivation chime using Web Audio API
   */
  public playChime(): void {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx || this.audioCtx.state === "closed") {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      // Arpeggio chime: 587.33Hz (D5) up to 880Hz (A5)
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (err) {
      // Audio playback is best-effort
      console.debug("Audio chime skipped:", err);
    }
  }

  /**
   * Dispatch workout reminder notification (both OS push and in-app event)
   */
  public dispatchWorkoutReminder(detail: WorkoutReminderEventDetail): boolean {
    const settings = this.getSettings();

    if (settings.soundEnabled) {
      this.playChime();
    }

    // Always dispatch custom in-app event (for in-app banner/toast, ensures preview & iframe work 100%)
    window.dispatchEvent(
      new CustomEvent("athlynx_workout_reminder", { detail })
    );

    // If browser supports and permits native push notifications, send native push
    if (this.isSupported() && Notification.permission === "granted") {
      try {
        const title = `FORZON — Hora do Treino! 🏋️`;
        const body = `${detail.workoutTitle}\nFoco: ${detail.muscleFocus}\nMantenha sua sequência de ${detail.streakDays} dias!`;

        const notification = new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "athlynx-workout-reminder",
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          window.dispatchEvent(
            new CustomEvent("athlynx_open_workout", { detail: { sessionId: detail.workoutId } })
          );
          notification.close();
        };

        return true;
      } catch (e) {
        console.warn("Failed to create native Notification instance:", e);
      }
    }

    return false;
  }

  /**
   * Send test reminder immediately
   */
  public sendTestNotification(
    workoutTitle = "Treino A — Peito, Ombros & Tríceps",
    muscleFocus = "Peitorais e Tríceps",
    streakDays = 7
  ): boolean {
    const detail: WorkoutReminderEventDetail = {
      workoutTitle,
      workoutId: "session-0",
      muscleFocus,
      streakDays,
      message: `Lembrete agendado: sua sessão "${workoutTitle}" está pronta. Recuperação em nível ótimo para treinar!`,
    };

    return this.dispatchWorkoutReminder(detail);
  }

  /**
   * Start scheduling loop that monitors current time against reminder settings
   */
  public startScheduler(
    getCurrentWorkout: () => { title: string; id: string; muscleFocus: string; streakDays: number }
  ): () => void {
    if (this.schedulerIntervalId) {
      clearInterval(this.schedulerIntervalId);
    }

    const checkAndTrigger = () => {
      const settings = this.getSettings();
      if (!settings.enabled) return;

      const now = new Date();
      const currentDay = now.getDay(); // 0 = Dom, 1 = Seg...

      // Check if day of week is configured
      if (!settings.daysOfWeek.includes(currentDay)) return;

      // Format current HH:mm
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // Check today's date formatted as YYYY-MM-DD
      const todayDateStr = now.toISOString().split("T")[0];

      // Check if currentTimeStr equals target reminderTime for recurring routine
      if (currentTimeStr === settings.reminderTime && settings.lastNotifiedDate !== todayDateStr) {
        const workout = getCurrentWorkout();
        this.dispatchWorkoutReminder({
          workoutTitle: workout.title,
          workoutId: workout.id,
          muscleFocus: workout.muscleFocus,
          streakDays: workout.streakDays,
          message: `Horário de treino alcançado (${settings.reminderTime}). Mantenha sua consistência no FORZON!`,
        });

        // Mark today as notified for recurring routine
        this.saveSettings({
          ...settings,
          lastNotifiedDate: todayDateStr,
        });
      }

      // Check date-specific reminders for today
      const dateReminders = this.getDateRemindersForDate(todayDateStr);
      for (const dr of dateReminders) {
        if (dr.time === currentTimeStr) {
          this.dispatchWorkoutReminder({
            workoutTitle: dr.sessionName || "Treino Agendado",
            workoutId: dr.sessionId || "custom",
            muscleFocus: "Treino Personalizado no Calendário",
            streakDays: 0,
            message:
              dr.customNote ||
              `Lembrete de treino programado para hoje (${dr.time}) no seu calendário FORZON!`,
          });
        }
      }
    };

    // Check immediately and then every 20 seconds
    checkAndTrigger();
    this.schedulerIntervalId = window.setInterval(checkAndTrigger, 20000);

    return () => {
      if (this.schedulerIntervalId) {
        clearInterval(this.schedulerIntervalId);
        this.schedulerIntervalId = null;
      }
    };
  }
}

export const notificationService = new NotificationService();

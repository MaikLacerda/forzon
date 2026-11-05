import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Send,
  ShieldCheck,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { NotificationSettings } from "../../types";

interface WorkoutReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextWorkoutTitle: string;
  muscleFocus: string;
  streakDays: number;
}

const DAYS_OF_WEEK = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
  { id: 0, label: "Dom" },
];

export const WorkoutReminderModal: React.FC<WorkoutReminderModalProps> = ({
  isOpen,
  onClose,
  nextWorkoutTitle,
  muscleFocus,
  streakDays,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    notificationService.getSettings()
  );
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    () => notificationService.getPermissionStatus()
  );
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setPermission(notificationService.getPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
  };

  const handleToggleEnabled = () => {
    const next = { ...settings, enabled: !settings.enabled };
    setSettings(next);
    notificationService.saveSettings(next);
  };

  const handleTimeChange = (time: string) => {
    const next = { ...settings, reminderTime: time };
    setSettings(next);
    notificationService.saveSettings(next);
  };

  const handleToggleDay = (dayId: number) => {
    const days = settings.daysOfWeek.includes(dayId)
      ? settings.daysOfWeek.filter((d) => d !== dayId)
      : [...settings.daysOfWeek, dayId];
    const next = { ...settings, daysOfWeek: days };
    setSettings(next);
    notificationService.saveSettings(next);
  };

  const handleToggleSound = () => {
    const next = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(next);
    notificationService.saveSettings(next);
  };

  const handleSendTest = () => {
    notificationService.sendTestNotification(nextWorkoutTitle, muscleFocus, streakDays);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md min-w-0 w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Lembretes de Treino</h2>
              <div className="text-xs text-neutral-400 font-mono">Agendamento & Consistência</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          {/* Permission Status Box */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 font-medium">Permissão no Navegador:</span>
              <span
                className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold ${
                  permission === "granted"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : permission === "denied"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {permission === "granted"
                  ? "AUTORIZADA"
                  : permission === "denied"
                  ? "BLOQUEADA"
                  : "PENDENTE"}
              </span>
            </div>

            {permission !== "granted" && (
              <div className="pt-1">
                <p className="text-[11px] text-neutral-400 mb-2">
                  {permission === "denied"
                    ? "As notificações foram bloqueadas nas opções do navegador. Mesmo assim, exibiremos alertas visuais dentro do FORZON."
                    : "Clique abaixo para permitir que o FORZON envie alertas nativos na barra do sistema."}
                </p>
                {permission !== "denied" && (
                  <button
                    onClick={handleRequestPermission}
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Autorizar Notificações Push</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Master Toggle */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Ativar Lembretes Diários</div>
              <div className="text-[11px] text-neutral-400">
                Notificar sobre o próximo treino agendado
              </div>
            </div>
            <button
              onClick={handleToggleEnabled}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.enabled ? "bg-emerald-500" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.enabled ? "translate-x-6.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {settings.enabled && (
            <div className="space-y-4">
              {/* Reminder Time Picker */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Horário do Lembrete</span>
                  </div>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-white font-mono text-sm px-3 py-1 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  O lembrete será disparado neste horário nos dias selecionados abaixo.
                </p>
              </div>

              {/* Days of week selector */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Dias da Semana</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 pt-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = settings.daysOfWeek.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleToggleDay(day.id)}
                        className={`py-2 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500 text-neutral-950"
                            : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound Option */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-neutral-500" />
                  )}
                  <div>
                    <div className="font-bold text-white">Sinal Sonoro de Treino</div>
                    <div className="text-[11px] text-neutral-400">Toque sintetizado de foco</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                    settings.soundEnabled
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                  }`}
                >
                  {settings.soundEnabled ? "ATIVADO" : "MUDO"}
                </button>
              </div>
            </div>
          )}

          {/* Test Button */}
          <button
            onClick={handleSendTest}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {testSent ? "Lembrete de Teste Enviado!" : "Testar Notificação Agora"}
            </span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-1 text-center text-[11px] text-neutral-500 font-mono">
          FORZON Push Engine · Garante sua consistência sem esquecer nenhum treino
        </div>
      </div>
    </div>
  );
};

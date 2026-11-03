import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Flame,
  Dumbbell,
  Trophy,
  Scale,
  Calendar,
  Sparkles,
  Shield,
  Award,
  Download,
  Settings,
  Edit3,
  FileText,
  CheckCircle2,
  Moon,
  Activity,
  Brain,
  Bluetooth,
  Droplets,
  Zap,
  Crown,
  Watch,
} from "lucide-react";
import { UserProfile, CompletedWorkoutRecord, GPSActivity } from "../../types";
import { badgeService } from "../../services/badgeService";
import { BadgesList } from "./BadgesList";
import { storage } from "../../services/storage";
import { pdfExportService } from "../../services/pdfExportService";
import { DailyRecoveryCard } from "../dashboard/DailyRecoveryCard";
import { BluetoothBioimpedanceModal } from "./BluetoothBioimpedanceModal";
import { SleepSmartwatchTab } from "./SleepSmartwatchTab";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  history: CompletedWorkoutRecord[];
  gpsActivities?: GPSActivity[];
  streakDays?: number;
  onOpenSettings?: () => void;
  onOpenOnboarding?: () => void;
  onOpenUpgradeModal?: () => void;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  history,
  gpsActivities = [],
  streakDays = 7,
  onOpenSettings,
  onOpenOnboarding,
  onOpenUpgradeModal,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<
    "badges" | "recovery" | "sleep_smartwatch" | "stats" | "info"
  >("sleep_smartwatch");
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(profile);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportSuccess, setPdfExportSuccess] = useState(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);

  useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  if (!isOpen) return null;

  const totalVolumeKg = history.reduce((sum, item) => sum + (item.totalVolumeKg || 0), 0);
  const workoutsCount = history.length;
  const badges = badgeService.calculateBadges(history, streakDays, gpsActivities);
  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      pdfExportService.generateAthleteReportPDF({
        profile,
        history,
        gpsActivities,
        streakDays,
      });
      setPdfExportSuccess(true);
      setTimeout(() => setPdfExportSuccess(false), 3500);
    } catch (err) {
      console.error("Erro ao gerar relatório PDF:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadData = () => {
    const jsonStr = storage.exportUserDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `athlynx-perfil-${profile.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="Perfil do atleta" className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-3xl min-w-0 w-full p-4 sm:p-7 space-y-6 shadow-2xl animate-scale-up my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-neutral-900 border-b border-neutral-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Perfil do Atleta & Conquistas
              </h2>
              <div className="text-xs text-neutral-400 font-mono">
                Identidade Esportiva FORZON
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Configurações & LGPD"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Fechar perfil"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Athlete Overview Card */}
        <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  referrerPolicy="no-referrer"
                />
                <div
                  className={`absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow ${
                    profile.isPremium
                      ? "bg-emerald-500 text-neutral-950"
                      : "bg-neutral-900 text-amber-400 border border-amber-500/50"
                  }`}
                >
                  {profile.isPremium ? "PRO" : "FREE"}
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{currentProfile.name}</h3>
                  <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {currentProfile.experienceLevel}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-mono flex items-center gap-2 flex-wrap">
                  <span>{currentProfile.handle}</span>
                  <span>·</span>
                  <span className="text-indigo-400 font-medium">
                    Sono: <strong>{currentProfile.sleepQuality || "Boa"}</strong> | Estresse: <strong>{currentProfile.stressLevel ?? 3}/10</strong>
                  </span>
                  <span>·</span>
                  <span className="text-cyan-400 font-medium">
                    Gordura: <strong>{currentProfile.bodyComposition?.bodyFatPercentage ?? 14.8}%</strong> | Músculo: <strong>{currentProfile.bodyComposition?.muscleMassKg ?? 38.6}kg</strong>
                  </span>
                </div>
                <p className="text-xs text-neutral-300 pt-1">
                  Objetivo: <span className="font-semibold text-white">{currentProfile.mainGoal}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              {onOpenUpgradeModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpgradeModal();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                    profile.isPremium
                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                      : "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 border border-amber-500/40 text-amber-300"
                  }`}
                  title="Gerenciar assinatura e planos"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{profile.isPremium ? "Assinatura Pro" : "Seja Pro (Sem Anúncios)"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsBluetoothModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-400 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Conectar Balança de Bioimpedância via Bluetooth"
              >
                <Bluetooth className="w-3.5 h-3.5" />
                <span>Balança BLE</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                title="Exportar histórico de treinos e métricas de GPS em formato PDF"
              >
                {pdfExportSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950" />
                    <span>PDF Baixado!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isExportingPdf ? "Gerando..." : "Exportar PDF"}</span>
                  </>
                )}
              </button>

              {onOpenOnboarding && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenOnboarding();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ajustar Metas</span>
                </button>
              )}
              <button
                onClick={handleDownloadData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Exportar dados completos (LGPD)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Key Metric Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-neutral-850">
            <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Streak Ativo</div>
                <div className="text-base font-bold text-white font-mono">{streakDays} Dias</div>
              </div>
            </div>

            <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Treinos Feitos</div>
                <div className="text-base font-bold text-white font-mono">{workoutsCount}</div>
              </div>
            </div>

            <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Volume Total</div>
                <div className="text-base font-bold text-amber-400 font-mono">
                  {(totalVolumeKg / 1000).toFixed(1)}k kg
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Emblemas</div>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {unlockedBadgesCount} / {badges.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab("sleep_smartwatch")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sleep_smartwatch"
                ? "bg-neutral-800 text-cyan-400 border border-cyan-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Watch className="w-3.5 h-3.5" />
            <span>Ciclos de Sono & Smartwatches</span>
          </button>
          <button
            onClick={() => setActiveTab("recovery")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "recovery"
                ? "bg-neutral-800 text-indigo-400 border border-indigo-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Check-in Diário</span>
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "badges"
                ? "bg-neutral-800 text-emerald-400 border border-emerald-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Conquistas ({unlockedBadgesCount}/{badges.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "stats"
                ? "bg-neutral-800 text-emerald-400 border border-emerald-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Métricas Corporais</span>
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "info"
                ? "bg-neutral-800 text-emerald-400 border border-emerald-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>LGPD & Permissões</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable Area) */}
        <div className="min-w-0 pr-1 space-y-4">
          {activeTab === "sleep_smartwatch" && (
            <SleepSmartwatchTab
              profile={currentProfile}
              onProfileUpdated={(up) => {
                setCurrentProfile(up);
                if (onUpdateProfile) onUpdateProfile(up);
              }}
            />
          )}

          {activeTab === "recovery" && (
            <div className="space-y-4">
              <DailyRecoveryCard
                profile={currentProfile}
                onProfileUpdated={(up) => {
                  setCurrentProfile(up);
                  if (onUpdateProfile) onUpdateProfile(up);
                }}
              />
            </div>
          )}

          {activeTab === "badges" && (
            <BadgesList
              badges={badges}
              workoutsCount={workoutsCount}
              streakDays={streakDays}
              totalVolumeKg={totalVolumeKg}
            />
          )}

          {activeTab === "stats" && (
            <div className="space-y-4 text-xs">
              {/* Daily Sleep & Stress quick summary card */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-neutral-400 font-medium flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Qualidade do Sono & Estresse Diário</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("recovery")}
                    className="text-[11px] text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Ajustar no Check-in →
                  </button>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  Sono: <span className="text-indigo-400">{currentProfile.sleepQuality || "Boa"}</span> · Estresse: <span className="text-amber-400">{currentProfile.stressLevel ?? 3}/10</span>
                </div>
                <div className="text-neutral-400 text-[11px]">
                  Calibração dinâmica de carga e RPE ativada com IA para as próximas sessões.
                </div>
              </div>

              {/* Bioimpedance & Body Composition Bluetooth Card */}
              <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Bluetooth className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Composição Corporal (Bioimpedância Bluetooth)</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          {currentProfile.bodyComposition?.deviceName || "BLE Sincronizado"}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {currentProfile.bodyComposition
                          ? `Última pesagem: ${new Date(currentProfile.bodyComposition.measuredAt).toLocaleDateString("pt-BR")}`
                          : "Nenhuma balança sincronizada ainda"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBluetoothModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Bluetooth className="w-3.5 h-3.5" />
                    <span>Conectar Balança Bluetooth</span>
                  </button>
                </div>

                {/* Primary Metrics: Body Fat % & Muscle Mass */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-rose-500/30">
                    <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Gordura Corporal</span>
                    </div>
                    <div className="text-xl font-black text-rose-400 font-mono mt-0.5">
                      {currentProfile.bodyComposition?.bodyFatPercentage ?? 14.8}%
                    </div>
                    <div className="text-[10px] text-neutral-400">Faixa Atlética</div>
                  </div>

                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-emerald-500/30">
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Massa Muscular</span>
                    </div>
                    <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                      {currentProfile.bodyComposition?.muscleMassKg ?? 38.6} kg
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {currentProfile.bodyComposition?.muscleMassPercentage ?? 49.2}% do corpo
                    </div>
                  </div>

                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <div className="text-[11px] text-sky-400 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Água Corporal</span>
                    </div>
                    <div className="text-xl font-bold text-white font-mono mt-0.5">
                      {currentProfile.bodyComposition?.bodyWaterPercentage ?? 58.5}%
                    </div>
                    <div className="text-[10px] text-neutral-400">Hidratação Ótima</div>
                  </div>

                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <div className="text-[11px] text-neutral-400">Taxa Metabólica Basal</div>
                    <div className="text-xl font-bold text-white font-mono mt-0.5">
                      {currentProfile.bodyComposition?.basalMetabolicRateKcal ?? 1795} kcal
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Idade Met: {currentProfile.bodyComposition?.metabolicAge ?? 23} anos
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="text-neutral-400 font-medium">Peso Corporal & Altura</div>
                  <div className="text-xl font-bold text-white font-mono">
                    {currentProfile.weightKg} kg · {currentProfile.heightCm} cm
                  </div>
                  <div className="text-neutral-400">
                    IMC Estimado:{" "}
                    <span className="text-emerald-400 font-bold font-mono">
                      {(profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)} kg/m²
                    </span>{" "}
                    (Faixa Atlética Saudável)
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="text-neutral-400 font-medium">Rotina de Treinamento</div>
                  <div className="text-xl font-bold text-white font-mono">
                    {profile.trainingDaysPerWeek} dias / semana
                  </div>
                  <div className="text-neutral-400">
                    Tempo médio por sessão:{" "}
                    <span className="text-white font-bold font-mono">{profile.timePerSessionMin} min</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="font-bold text-white text-sm">Metas Nutricionais & Hidratação</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Calorias Diárias</div>
                    <div className="text-base font-bold text-white font-mono">{profile.dailyCalorieGoal} kcal</div>
                  </div>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Meta de Água</div>
                    <div className="text-base font-bold text-cyan-400 font-mono">
                      {(profile.dailyWaterGoalMl / 1000).toFixed(1)} L/dia
                    </div>
                  </div>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 col-span-2 sm:col-span-1">
                    <div className="text-neutral-400 text-[11px]">Preferência Dietética</div>
                    <div className="text-base font-bold text-emerald-400">{profile.dietaryPreference}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "info" && (
            <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Privacidade LGPD & Consentimentos</h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Todos os dados de saúde, coordenadas de satélite e histórico de levantamento de peso são salvos exclusivamente no seu dispositivo e nunca comercializados com corretores de dados.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <div>
                    <div className="font-semibold text-white">Coleta de Dados de Treino & Saúde</div>
                    <div className="text-[11px] text-neutral-400">Consentimento LGPD ativo</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">Aceito</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <div>
                    <div className="font-semibold text-white">Camuflagem de Raio GPS (Privacidade)</div>
                    <div className="text-[11px] text-neutral-400">
                      Oculta os primeiros e últimos 500m de rota perto da sua residência
                    </div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">
                    {profile.gpsPrivacyCloaking ? "Ativado" : "Desativado"}
                  </span>
                </div>
              </div>

              {/* Data Portability & PDF Export Section */}
              <div className="mt-4 p-4 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Portabilidade & Relatório Oficial em PDF</div>
                      <div className="text-[11px] text-neutral-400">
                        Exportação de desempenho completa para arquivamento ou envio ao treinador
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  O documento em PDF gerado reúne seu resumo biométrico, todo o histórico de sessões ({history.length} treinos com tonelagem em kg e séries) e as métricas de rotas GPS ({gpsActivities.length} atividades ao ar livre com pace e altimetria).
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPdf}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {pdfExportSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                        <span>Relatório PDF Baixado!</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>{isExportingPdf ? "Gerando Relatório..." : "Baixar Relatório Completo (PDF)"}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadData}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup Completo (.JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bluetooth Bioimpedance Scale Pairing & Measurement Modal */}
      <BluetoothBioimpedanceModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        profile={currentProfile}
        onImportComplete={(updated) => {
          setCurrentProfile(updated);
          if (onUpdateProfile) onUpdateProfile(updated);
        }}
      />
    </div>
  );
};

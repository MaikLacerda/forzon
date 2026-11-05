import React, { useState } from "react";
import {
  Trophy,
  Flame,
  Dumbbell,
  Medal,
  Zap,
  Award,
  Crown,
  Compass,
  Lock,
  CheckCircle2,
  Sparkles,
  Filter,
  PartyPopper,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicBadge } from "../../services/badgeService";
import { MotionConfetti } from "../common/MotionConfetti";

interface BadgesListProps {
  badges: DynamicBadge[];
  workoutsCount: number;
  streakDays: number;
  totalVolumeKg: number;
  onBadgeUnlocked?: (badge: DynamicBadge) => void;
}

export const BadgesList: React.FC<BadgesListProps> = ({
  badges,
  workoutsCount,
  streakDays,
  totalVolumeKg,
  onBadgeUnlocked,
}) => {
  const [filter, setFilter] = useState<"all" | "unlocked" | "treinos" | "streak">("all");
  const [confettiActive, setConfettiActive] = useState(false);
  const [celebratingBadge, setCelebratingBadge] = useState<DynamicBadge | null>(null);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const completionPercentage = Math.round((unlockedCount / badges.length) * 100) || 0;

  const triggerCelebration = (badge: DynamicBadge) => {
    setCelebratingBadge(badge);
    setConfettiActive(true);
    if (onBadgeUnlocked) onBadgeUnlocked(badge);
  };

  const handleTestConfetti = () => {
    const firstUnlocked = badges.find((b) => b.unlocked) || badges[0];
    triggerCelebration(firstUnlocked);
  };

  const filteredBadges = badges.filter((b) => {
    if (filter === "unlocked") return b.unlocked;
    if (filter === "treinos") return b.category === "treinos";
    if (filter === "streak") return b.category === "streak";
    return true;
  });

  const renderIcon = (iconName: DynamicBadge["icon"], unlocked: boolean) => {
    const className = `w-6 h-6 ${
      unlocked ? "text-amber-400 group-hover:scale-110 transition-transform" : "text-neutral-500"
    }`;
    switch (iconName) {
      case "Flame":
        return <Flame className={className} />;
      case "Trophy":
        return <Trophy className={className} />;
      case "Medal":
        return <Medal className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Crown":
        return <Crown className={className} />;
      case "Compass":
        return <Compass className={className} />;
      case "Dumbbell":
      default:
        return <Dumbbell className={className} />;
    }
  };

  const getMetricFormat = (badge: DynamicBadge) => {
    if (badge.requirementType === "workouts_count") {
      return `${badge.currentValue} / ${badge.targetValue} treinos`;
    }
    if (badge.requirementType === "streak_days") {
      return `${badge.currentValue} / ${badge.targetValue} dias de streak`;
    }
    if (badge.requirementType === "total_volume_kg") {
      return `${badge.currentValue.toLocaleString()} / ${badge.targetValue.toLocaleString()} kg`;
    }
    return `${badge.currentValue} / ${badge.targetValue} atividades`;
  };

  return (
    <div className="space-y-5 relative">
      {/* Framer Motion Confetti explosion component */}
      <MotionConfetti
        active={confettiActive}
        onComplete={() => setConfettiActive(false)}
        durationMs={3000}
        particleCount={70}
      />

      {/* Overview Stat Card with Test Celebration trigger */}
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Galeria de Conquistas & Emblemas
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Conquistas desbloqueadas automaticamente através do seu histórico de treinos e consistência diária.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleTestConfetti}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Disparar animação de confete framer-motion"
          >
            <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
            <span>Celebrar Conquista 🎉</span>
          </button>

          <div className="flex items-center gap-3 bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-800 shrink-0">
            <div className="text-right font-mono">
              <div className="text-sm font-bold text-emerald-400">
                {unlockedCount} / {badges.length}
              </div>
              <div className="text-[10px] text-neutral-400">Desbloqueadas</div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center font-bold font-mono text-xs text-emerald-400">
              {completionPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filter === "all"
              ? "bg-neutral-800 text-emerald-400 font-semibold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Todos ({badges.length})
        </button>
        <button
          onClick={() => setFilter("unlocked")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filter === "unlocked"
              ? "bg-neutral-800 text-emerald-400 font-semibold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Desbloqueados ({unlockedCount})
        </button>
        <button
          onClick={() => setFilter("treinos")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filter === "treinos"
              ? "bg-neutral-800 text-emerald-400 font-semibold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Por Treinos</span>
        </button>
        <button
          onClick={() => setFilter("streak")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filter === "streak"
              ? "bg-neutral-800 text-emerald-400 font-semibold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Por Streak</span>
        </button>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (badge.unlocked) {
                  triggerCelebration(badge);
                }
              }}
              className={`group relative rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                badge.unlocked
                  ? "bg-neutral-900/90 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm hover:shadow-emerald-500/10"
                  : "bg-neutral-950/70 border-neutral-850 hover:border-neutral-800 opacity-75"
              }`}
            >
              {/* Top row: Icon + Category + Unlocked Indicator */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 ${
                    badge.unlocked
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:scale-110"
                      : "bg-neutral-900 border-neutral-800 text-neutral-500"
                  }`}
                >
                  {renderIcon(badge.icon, badge.unlocked)}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    {badge.category}
                  </span>
                  {badge.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Conquistado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
                      <Lock className="w-3 h-3" />
                      <span>Bloqueado</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4
                  className={`text-sm font-bold tracking-tight ${
                    badge.unlocked ? "text-white" : "text-neutral-400"
                  }`}
                >
                  {badge.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Progress and Requirement Info */}
              <div className="pt-2 border-t border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Progresso</span>
                  <span
                    className={`font-semibold ${
                      badge.unlocked ? "text-emerald-400" : "text-neutral-300"
                    }`}
                  >
                    {getMetricFormat(badge)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-neutral-850 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.unlocked ? "bg-emerald-500" : "bg-neutral-600"
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>

                {badge.unlocked && badge.unlockedAt && (
                  <div className="text-[10px] text-neutral-400 font-mono text-right pt-0.5">
                    Desbloqueado em {new Date(badge.unlockedAt).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Celebrating Badge Detail Modal */}
      <AnimatePresence>
        {celebratingBadge && (
          <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-neutral-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-400" />

              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 text-amber-400">
                {renderIcon(celebratingBadge.icon, true)}
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Conquista Desbloqueada!
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  {celebratingBadge.title}
                </h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {celebratingBadge.description}
                </p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center justify-between">
                <span className="text-neutral-400">Status</span>
                <span className="text-emerald-400 font-bold">100% Concluído</span>
              </div>

              <button
                type="button"
                onClick={() => setCelebratingBadge(null)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs tracking-wide transition-colors cursor-pointer"
              >
                Continuar Treinando
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from "react";
import {
  Trophy,
  Dumbbell,
  Medal,
  ArrowUpRight,
  Flame,
  TrendingUp,
  Navigation,
  Crown,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { UserProfile, CompletedWorkoutRecord, GPSActivity } from "../../types";

interface AthleteRankItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  volumeKg: number;
  distanceKm: number;
  workoutsCount: number;
  favoriteLift: string;
  isCurrentUser?: boolean;
}

interface GlobalVolumeRankingProps {
  currentUserProfile: UserProfile;
  workoutHistory: CompletedWorkoutRecord[];
  gpsActivities?: GPSActivity[];
  compact?: boolean; // For sidebar display
  onStartWorkoutClick?: () => void;
}

export const GlobalVolumeRanking: React.FC<GlobalVolumeRankingProps> = ({
  currentUserProfile,
  workoutHistory,
  gpsActivities = [],
  compact = false,
  onStartWorkoutClick,
}) => {
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");

  // Calculate current user's actual cumulative volume & GPS distance
  const userHistoryVolume = workoutHistory.reduce(
    (sum, record) => sum + (record.totalVolumeKg || 0),
    0
  );
  const userHistoryDistance = gpsActivities.reduce(
    (sum, act) => sum + (act.distanceKm || 0),
    0
  );

  // Dynamic user stats adjusted by period
  const userVolume =
    period === "week"
      ? Math.round(userHistoryVolume * 0.45) || 12400
      : period === "month"
      ? userHistoryVolume + 16000
      : userHistoryVolume + 52000;

  const userDistance =
    period === "week"
      ? Math.round((userHistoryDistance * 0.4 || 18.5) * 10) / 10
      : period === "month"
      ? Math.round((userHistoryDistance + 34.2) * 10) / 10
      : Math.round((userHistoryDistance + 120.5) * 10) / 10;

  // Formula: 1 pt per 10kg volume + 100 pts per 1km GPS run/ride
  const calculateScore = (volume: number, distance: number) => {
    return Math.round(volume / 10 + distance * 100);
  };

  const SEED_ATHLETES: AthleteRankItem[] = [
    {
      id: "ath-1",
      name: "Lucas Zanetti",
      handle: "@coachzanetti",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      volumeKg: period === "week" ? 16500 : period === "month" ? 48200 : 198000,
      distanceKm: period === "week" ? 28.4 : period === "month" ? 82.0 : 340.0,
      workoutsCount: period === "week" ? 5 : 19,
      favoriteLift: "Levantamento Terra (210kg)",
    },
    {
      id: "ath-current",
      name: `${currentUserProfile.name} (Você)`,
      handle: currentUserProfile.handle,
      avatar: currentUserProfile.avatarUrl,
      volumeKg: userVolume,
      distanceKm: userDistance,
      workoutsCount: workoutHistory.length || (period === "week" ? 4 : 14),
      favoriteLift: "Supino Reto (80kg)",
      isCurrentUser: true,
    },
    {
      id: "ath-2",
      name: "Thiago Rocha",
      handle: "@thiagorocha",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      volumeKg: period === "week" ? 14800 : period === "month" ? 41200 : 172000,
      distanceKm: period === "week" ? 19.2 : period === "month" ? 64.5 : 255.0,
      workoutsCount: period === "week" ? 4 : 16,
      favoriteLift: "Agachamento Livre (180kg)",
    },
    {
      id: "ath-3",
      name: "Camila Duarte",
      handle: "@camiladuarte",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      volumeKg: period === "week" ? 11200 : period === "month" ? 31500 : 128000,
      distanceKm: period === "week" ? 32.5 : period === "month" ? 95.0 : 410.0,
      workoutsCount: period === "week" ? 5 : 17,
      favoriteLift: "Hip Thrust (160kg)",
    },
    {
      id: "ath-4",
      name: "Felipe Andrade",
      handle: "@felipefit",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      volumeKg: period === "week" ? 9400 : period === "month" ? 27800 : 105000,
      distanceKm: period === "week" ? 21.0 : period === "month" ? 58.0 : 210.0,
      workoutsCount: period === "week" ? 3 : 13,
      favoriteLift: "Desenvolvimento Militar (70kg)",
    },
    {
      id: "ath-5",
      name: "Beatriz Lima",
      handle: "@bialima",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      volumeKg: period === "week" ? 8200 : period === "month" ? 23400 : 92000,
      distanceKm: period === "week" ? 25.0 : period === "month" ? 72.0 : 290.0,
      workoutsCount: period === "week" ? 4 : 14,
      favoriteLift: "Stiff / RDL (95kg)",
    },
  ];

  // Sort descending by calculated combined FORZON score
  const rankedAthletes = [...SEED_ATHLETES].sort(
    (a, b) =>
      calculateScore(b.volumeKg, b.distanceKm) -
      calculateScore(a.volumeKg, a.distanceKm)
  );

  const maxScore = calculateScore(
    rankedAthletes[0]?.volumeKg || 1,
    rankedAthletes[0]?.distanceKm || 1
  );
  const currentUserRankIndex = rankedAthletes.findIndex((a) => a.isCurrentUser);
  const currentUser = rankedAthletes[currentUserRankIndex];
  const currentUserScore = currentUser
    ? calculateScore(currentUser.volumeKg, currentUser.distanceKm)
    : 0;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-bold font-mono text-xs flex items-center justify-center border border-amber-500/40 shadow-sm shadow-amber-500/20">
          <Crown className="w-3.5 h-3.5" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-xl bg-neutral-300/20 text-neutral-200 font-bold font-mono text-xs flex items-center justify-center border border-neutral-300/40">
          2º
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-xl bg-amber-700/20 text-amber-500 font-bold font-mono text-xs flex items-center justify-center border border-amber-700/40">
          3º
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-xl bg-neutral-900 text-neutral-400 font-mono text-xs flex items-center justify-center border border-neutral-800">
        {rank}º
      </span>
    );
  };

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Leaderboard Global Semanal FORZON</span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Pontuação Híbrida
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Ranking unificado: Volume total de musculação (kg) + Distância outdoor (GPS)
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setPeriod("week")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
              period === "week"
                ? "bg-neutral-800 text-emerald-400 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Esta Semana
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
              period === "month"
                ? "bg-neutral-800 text-emerald-400 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Mês
          </button>
          <button
            type="button"
            onClick={() => setPeriod("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
              period === "all"
                ? "bg-neutral-800 text-emerald-400 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {/* Podium Top 3 Highlight (when not compact) */}
      {!compact && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* 2nd Place */}
          {rankedAthletes[1] && (
            <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 text-center flex flex-col justify-between space-y-2 order-1 mt-4">
              <div className="w-12 h-12 rounded-full border-2 border-neutral-300 mx-auto overflow-hidden relative shadow-md">
                <img
                  src={rankedAthletes[1].avatar}
                  alt={rankedAthletes[1].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-300 bg-neutral-300/10 px-2 py-0.5 rounded font-bold">
                  2º LUGAR
                </span>
                <div className="text-xs font-bold text-white mt-1 truncate">
                  {rankedAthletes[1].name}
                </div>
                <div className="text-sm font-black text-white font-mono mt-0.5">
                  {calculateScore(rankedAthletes[1].volumeKg, rankedAthletes[1].distanceKm).toLocaleString()}{" "}
                  <span className="text-[10px] text-neutral-400">pts</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place (Crown) */}
          {rankedAthletes[0] && (
            <div className="bg-gradient-to-b from-amber-500/10 to-neutral-950 border border-amber-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-2 order-2 shadow-lg shadow-amber-500/10">
              <div className="w-14 h-14 rounded-full border-2 border-amber-400 mx-auto overflow-hidden relative shadow-lg shadow-amber-500/20">
                <img
                  src={rankedAthletes[0].avatar}
                  alt={rankedAthletes[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-bold">
                  👑 CAMPEÃO
                </span>
                <div className="text-xs font-bold text-white mt-1 truncate">
                  {rankedAthletes[0].name}
                </div>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                  {calculateScore(rankedAthletes[0].volumeKg, rankedAthletes[0].distanceKm).toLocaleString()}{" "}
                  <span className="text-[10px] text-neutral-400">pts</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {rankedAthletes[2] && (
            <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 text-center flex flex-col justify-between space-y-2 order-3 mt-6">
              <div className="w-11 h-11 rounded-full border-2 border-amber-700 mx-auto overflow-hidden relative shadow-md">
                <img
                  src={rankedAthletes[2].avatar}
                  alt={rankedAthletes[2].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-600 bg-amber-700/10 px-2 py-0.5 rounded font-bold">
                  3º LUGAR
                </span>
                <div className="text-xs font-bold text-white mt-1 truncate">
                  {rankedAthletes[2].name}
                </div>
                <div className="text-sm font-black text-white font-mono mt-0.5">
                  {calculateScore(rankedAthletes[2].volumeKg, rankedAthletes[2].distanceKm).toLocaleString()}{" "}
                  <span className="text-[10px] text-neutral-400">pts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Standing Banner */}
      {currentUserRankIndex !== -1 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-neutral-200">
                Você está na{" "}
                <strong className="text-emerald-400 font-mono text-sm">
                  {currentUserRankIndex + 1}ª posição
                </strong>{" "}
                com{" "}
                <strong className="text-white font-mono text-sm">
                  {currentUserScore.toLocaleString()} pts
                </strong>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                {userVolume.toLocaleString()} kg levantados + {userDistance.toFixed(1)} km percorridos
              </div>
            </div>
          </div>

          {onStartWorkoutClick && (
            <button
              type="button"
              onClick={onStartWorkoutClick}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
            >
              <span>Subir no Ranking</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="space-y-2.5">
        {rankedAthletes.map((athlete, index) => {
          const rank = index + 1;
          const score = calculateScore(athlete.volumeKg, athlete.distanceKm);
          const percentageOfLead = Math.round((score / maxScore) * 100);

          return (
            <motion.div
              key={athlete.id}
              whileHover={{ scale: 1.005 }}
              className={`p-3.5 rounded-2xl border transition-all ${
                athlete.isCurrentUser
                  ? "bg-neutral-900 border-emerald-500/50 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "bg-neutral-950/80 border-neutral-850 hover:border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(rank)}

                  <img
                    src={athlete.avatar}
                    alt={athlete.name}
                    className="w-9 h-9 rounded-full object-cover border border-neutral-700 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          athlete.isCurrentUser ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {athlete.name}
                      </span>
                      {athlete.isCurrentUser && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 shrink-0">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2 truncate">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-neutral-500" />
                        {athlete.volumeKg.toLocaleString()}kg
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-neutral-500" />
                        {athlete.distanceKm.toFixed(1)}km
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black font-mono text-white flex items-center justify-end gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{score.toLocaleString()}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">pts</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    {athlete.workoutsCount} treinos
                  </div>
                </div>
              </div>

              {/* Relative score progress bar */}
              <div className="mt-2.5 w-full h-1.5 bg-neutral-850 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    athlete.isCurrentUser
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : rank === 1
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                      : "bg-neutral-600"
                  }`}
                  style={{ width: `${percentageOfLead}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-[11px] text-neutral-400 text-center font-mono pt-1 border-t border-neutral-850 flex items-center justify-center gap-2">
        <Zap className="w-3 h-3 text-amber-400" />
        <span>Fórmula FORZON: 1 pt por cada 10kg levantados + 100 pts por cada 1km percorrido (GPS).</span>
      </div>
    </div>
  );
};

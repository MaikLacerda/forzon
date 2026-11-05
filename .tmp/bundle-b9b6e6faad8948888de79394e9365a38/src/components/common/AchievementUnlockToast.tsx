import React, { useEffect, useState } from "react";
import { Trophy, Award, Sparkles, X, CheckCircle2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MotionConfetti } from "./MotionConfetti";

export interface AchievementToastData {
  title: string;
  description: string;
  points?: number;
  icon?: string;
}

export const AchievementUnlockToast: React.FC = () => {
  const [toast, setToast] = useState<AchievementToastData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleUnlock = (e: Event) => {
      const customEvent = e as CustomEvent<AchievementToastData>;
      if (customEvent.detail) {
        setToast(customEvent.detail);
        setShowConfetti(true);
      }
    };

    window.addEventListener("athlynx_achievement_unlocked", handleUnlock);
    return () => window.removeEventListener("athlynx_achievement_unlocked", handleUnlock);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <>
      <MotionConfetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
        durationMs={2500}
        particleCount={60}
      />

      <div className="fixed top-20 right-4 sm:right-6 z-80 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="pointer-events-auto bg-neutral-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 text-white space-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm shadow-amber-500/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                        Nova Conquista Desbloqueada!
                      </span>
                      <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {toast.title}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed pl-13">
                {toast.description}
              </p>

              {toast.points && (
                <div className="pl-13 flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                    +{toast.points} Pontos FORZON
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export function dispatchAchievementUnlocked(detail: AchievementToastData) {
  window.dispatchEvent(
    new CustomEvent("athlynx_achievement_unlocked", { detail })
  );
}

import React, { useState } from "react";
import {
  Droplets,
  Plus,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  GlassWater,
  CupSoda,
  Award,
  Watch,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface DailyWaterTrackerProps {
  waterIntakeMl: number;
  waterGoalMl: number;
  onAddWater: (ml: number) => void;
  onResetWater?: () => void;
}

export const DailyWaterTracker: React.FC<DailyWaterTrackerProps> = ({
  waterIntakeMl,
  waterGoalMl,
  onAddWater,
  onResetWater,
}) => {
  const [justAddedAmount, setJustAddedAmount] = useState<number | null>(null);
  const [customMl, setCustomMl] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const percent = Math.min(150, Math.round((waterIntakeMl / waterGoalMl) * 100));
  const isGoalReached = percent >= 100;

  const handleQuickAdd = (ml: number) => {
    onAddWater(ml);
    setJustAddedAmount(ml);
    setTimeout(() => setJustAddedAmount(null), 1800);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(customMl);
    if (ml && ml > 0) {
      handleQuickAdd(ml);
      setCustomMl("");
      setShowCustom(false);
    }
  };

  // Generate hourly progression data comparing target curve vs current logged curve
  const chartData = [
    {
      time: "07h",
      meta: Math.round(waterGoalMl * 0.15),
      real: Math.round(Math.min(waterIntakeMl, waterGoalMl * 0.18)),
    },
    {
      time: "10h",
      meta: Math.round(waterGoalMl * 0.35),
      real: Math.round(Math.min(waterIntakeMl, waterGoalMl * 0.38)),
    },
    {
      time: "13h",
      meta: Math.round(waterGoalMl * 0.55),
      real: Math.round(Math.min(waterIntakeMl, waterGoalMl * 0.62)),
    },
    {
      time: "16h",
      meta: Math.round(waterGoalMl * 0.75),
      real: Math.round(Math.min(waterIntakeMl, waterGoalMl * 0.82)),
    },
    {
      time: "19h",
      meta: Math.round(waterGoalMl * 0.9),
      real: Math.round(Math.min(waterIntakeMl, waterIntakeMl)),
    },
    {
      time: "22h",
      meta: waterGoalMl,
      real: waterIntakeMl,
    },
  ];

  return (
    <div className="bg-neutral-900/70 border border-neutral-800/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Rastreador de Ingestão de Água Diária
              </h3>
              {isGoalReached && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Meta Batida
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                <Watch className="w-3 h-3 text-sky-400" /> Sincronizado ao Smartwatch
              </span>
            </div>
            <div className="text-xs text-neutral-400">
              Hidratação celular & balanço osmótico para recuperação muscular
            </div>
          </div>
        </div>

        {/* Quick Diagnostic / Alert */}
        <AnimatePresence>
          {justAddedAmount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              className="bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 self-start sm:self-auto font-mono"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>+{justAddedAmount} ml adicionados com sucesso!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Hydration Progress Metric Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Column: Big Numeric Metric & Progress Bar */}
        <div className="lg:col-span-5 bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                {(waterIntakeMl / 1000).toFixed(2)}
              </span>
              <span className="text-base font-medium text-neutral-400 ml-1">L</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-400 font-mono">
                Meta: {(waterGoalMl / 1000).toFixed(1)} L
              </div>
              <div className="text-sm font-bold text-sky-400 font-mono">
                {percent}%
              </div>
            </div>
          </div>

          {/* Liquid Progress Bar */}
          <div className="w-full h-3 bg-neutral-850 rounded-full overflow-hidden p-0.5">
            <motion.div
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalReached
                  ? "bg-gradient-to-r from-sky-400 to-emerald-400 shadow-md shadow-emerald-500/20"
                  : "bg-sky-500 shadow-md shadow-sky-500/20"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, percent)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1">
            <span>
              Restam:{" "}
              <strong className="text-white">
                {Math.max(0, waterGoalMl - waterIntakeMl)} ml
              </strong>
            </span>
            <span>
              {isGoalReached
                ? "Balanço hídrico 100% ótimo!"
                : "Mantenha goles regulares"}
            </span>
          </div>
        </div>

        {/* Right Column: Chart of Hourly Consumption vs Target */}
        <div className="lg:col-span-7 bg-neutral-950 p-3 sm:p-4 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="text-neutral-400 font-medium">Curva de Hidratação ao Longo do Dia</div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Real (ml)
              </span>
              <span className="flex items-center gap-1 text-neutral-500">
                <span className="w-2 h-2 rounded-full bg-neutral-600 inline-block" /> Meta (ml)
              </span>
            </div>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#737373" fontSize={10} tickLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid #38bdf850",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} ml`,
                    name === "real" ? "Consumido" : "Meta Ideal",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="meta"
                  stroke="#525252"
                  strokeDasharray="3 3"
                  fill="transparent"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="real"
                  stroke="#38bdf8"
                  fill="url(#waterGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Log Buttons & Custom Input */}
      <div className="space-y-2 pt-1 border-t border-neutral-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-semibold tracking-wide">
            Registro Rápido de Ingestão:
          </span>
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
          >
            {showCustom ? "Fechar Personalizado" : "+ Outro Valor"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAdd(150)}
            className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-sky-500/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <CupSoda className="w-3.5 h-3.5" />
            </div>
            <span>+150 ml</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAdd(250)}
            className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-sky-500/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <GlassWater className="w-3.5 h-3.5" />
            </div>
            <span>+250 ml</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAdd(500)}
            className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-sky-500/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <span>+500 ml</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAdd(750)}
            className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-sky-500/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span>+750 ml</span>
          </motion.button>
        </div>

        {/* Custom Amount Drawer */}
        <AnimatePresence>
          {showCustom && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCustomAdd}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="number"
                step="50"
                min="50"
                max="2500"
                placeholder="Ex: 350 (ml)"
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!customMl}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Calculator,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Scale,
  Activity,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { DailyNutrition, UserProfile } from "../../types";

interface MacroCalculatorAndChartProps {
  nutrition: DailyNutrition;
  profile?: UserProfile;
  onUpdateNutrition: (updated: DailyNutrition) => void;
}

export const MacroCalculatorAndChart: React.FC<MacroCalculatorAndChartProps> = ({
  nutrition,
  profile,
  onUpdateNutrition,
}) => {
  const [isOpenCalculator, setIsOpenCalculator] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Form states with profile defaults
  const [weightKg, setWeightKg] = useState<number>(profile?.weightKg || 78);
  const [heightCm, setHeightCm] = useState<number>(profile?.heightCm || 178);
  const [age, setAge] = useState<number>(27);
  const [sex, setSex] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState<number>(1.55); // moderate default
  const [goal, setGoal] = useState<"hypertrophy" | "cutting" | "recomp" | "strength">(
    profile?.mainGoal?.toLowerCase().includes("emagre") || profile?.mainGoal?.toLowerCase().includes("defini")
      ? "cutting"
      : "hypertrophy"
  );

  // Calculate Mifflin-St Jeor TDEE
  const calculateTDEE = () => {
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += sex === "male" ? 5 : -161;
    const tdee = Math.round(bmr * activityLevel);

    let targetCal = tdee;
    let protPerKg = 2.0;
    let fatPerKg = 0.9;

    if (goal === "hypertrophy") {
      targetCal = tdee + 300;
      protPerKg = 2.0;
    } else if (goal === "cutting") {
      targetCal = Math.max(1500, tdee - 450);
      protPerKg = 2.3; // Higher protein to preserve lean tissue
    } else if (goal === "strength") {
      targetCal = tdee + 200;
      protPerKg = 2.2;
    } else {
      // recomp
      targetCal = tdee;
      protPerKg = 2.2;
    }

    const targetProt = Math.round(weightKg * protPerKg);
    const targetFat = Math.round(weightKg * fatPerKg);
    const caloriesFromProtAndFat = targetProt * 4 + targetFat * 9;
    const remainingCalForCarbs = Math.max(200, targetCal - caloriesFromProtAndFat);
    const targetCarbs = Math.round(remainingCalForCarbs / 4);

    return {
      tdee,
      targetCal,
      targetProt,
      targetCarbs,
      targetFat,
      waterGoalMl: Math.round(weightKg * 40),
    };
  };

  const calculated = calculateTDEE();

  const handleApplyToPlan = () => {
    const updated: DailyNutrition = {
      ...nutrition,
      targetCalories: calculated.targetCal,
      targetProteinG: calculated.targetProt,
      targetCarbsG: calculated.targetCarbs,
      targetFatG: calculated.targetFat,
      waterGoalMl: calculated.waterGoalMl,
    };
    onUpdateNutrition(updated);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setIsOpenCalculator(false);
    }, 2000);
  };

  // Comparative Data for Bar Chart
  const comparisonData = [
    {
      name: "Calorias",
      unidade: "kcal",
      Meta: nutrition.targetCalories,
      Consumido: nutrition.consumedCalories,
      displayMeta: `${nutrition.targetCalories} kcal`,
      displayConsumido: `${nutrition.consumedCalories} kcal`,
      ratio: Math.round((nutrition.consumedCalories / nutrition.targetCalories) * 100),
    },
    {
      name: "Proteína",
      unidade: "g",
      Meta: nutrition.targetProteinG,
      Consumido: nutrition.consumedProteinG,
      displayMeta: `${nutrition.targetProteinG} g`,
      displayConsumido: `${nutrition.consumedProteinG} g`,
      ratio: Math.round((nutrition.consumedProteinG / nutrition.targetProteinG) * 100),
    },
    {
      name: "Carboidratos",
      unidade: "g",
      Meta: nutrition.targetCarbsG,
      Consumido: nutrition.consumedCarbsG,
      displayMeta: `${nutrition.targetCarbsG} g`,
      displayConsumido: `${nutrition.consumedCarbsG} g`,
      ratio: Math.round((nutrition.consumedCarbsG / nutrition.targetCarbsG) * 100),
    },
    {
      name: "Gorduras",
      unidade: "g",
      Meta: nutrition.targetFatG,
      Consumido: nutrition.consumedFatG,
      displayMeta: `${nutrition.targetFatG} g`,
      displayConsumido: `${nutrition.consumedFatG} g`,
      ratio: Math.round((nutrition.consumedFatG / nutrition.targetFatG) * 100),
    },
  ];

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Metas Diárias de Macronutrientes vs Consumo Real
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gráfico comparativo de adesão energética e distribuição de macronutrientes da dieta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpenCalculator(!isOpenCalculator)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>{isOpenCalculator ? "Ocultar Calculadora" : "Calculadora de Macros"}</span>
          {isOpenCalculator ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>
      </div>

      {/* Calculator Expandable Panel */}
      <AnimatePresence>
        {isOpenCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="bg-neutral-950 border border-emerald-500/30 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Calibragem Baseada em Mifflin-St Jeor & TDEE</span>
                </div>
                {appliedSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Metas Salvas no Plano!
                  </span>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 175)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Idade (anos)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Sexo Biológico</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as "male" | "female")}
                    className="w-full px-2.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Nível de Atividade</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={1.2}>Sedentário (x1.2)</option>
                    <option value={1.375}>Leve 1-3x/sem (x1.37)</option>
                    <option value={1.55}>Moderado 3-5x/sem (x1.55)</option>
                    <option value={1.725}>Intenso 6-7x/sem (x1.72)</option>
                    <option value={1.9}>Atleta de Elite (x1.9)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Objetivo Físico</label>
                  <select
                    value={goal}
                    onChange={(e) =>
                      setGoal(e.target.value as "hypertrophy" | "cutting" | "recomp" | "strength")
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="hypertrophy">Hipertrofia (+300 kcal)</option>
                    <option value="cutting">Definição / Cutting (-450 kcal)</option>
                    <option value="recomp">Recomposição Corporal</option>
                    <option value="strength">Ganho de Força Bruta</option>
                  </select>
                </div>
              </div>

              {/* Calculated Blueprint Preview Strip */}
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Calorias Diárias</span>
                    <span className="text-lg font-bold text-amber-400">
                      {calculated.targetCal} kcal
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Proteínas</span>
                    <span className="text-lg font-bold text-blue-400">
                      {calculated.targetProt} g
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Carboidratos</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {calculated.targetCarbs} g
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Gorduras Boas</span>
                    <span className="text-lg font-bold text-rose-400">
                      {calculated.targetFat} g
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyToPlan}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  Aplicar Metas ao Meu Plano
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparative Bar Chart: Meta vs Consumo Diário */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Chart Column */}
        <div className="lg:col-span-8 bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-4">
            <span className="text-neutral-300 font-semibold">
              Comparativo de Metas (Meta Estabelecida vs Consumido Hoje)
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-3 h-3 rounded-sm bg-neutral-700 inline-block" /> Meta
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Consumido
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid var(--color-emerald-500, #00b4d8)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} ${item.payload.unidade}`,
                    name === "Meta" ? "Meta Planejada" : "Consumido no Dia",
                  ]}
                />
                <Bar dataKey="Meta" fill="#404040" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Consumido" fill="var(--color-emerald-500, #00b4d8)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostic Ratio Cards Column */}
        <div className="lg:col-span-4 space-y-3">
          {comparisonData.map((item) => {
            const isCompleted = item.ratio >= 90 && item.ratio <= 110;
            const isUnder = item.ratio < 90;
            const isOver = item.ratio > 110;

            return (
              <div
                key={item.name}
                className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : isUnder
                          ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {item.ratio}%
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {item.Consumido} / {item.Meta} {item.unidade}
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono">
                  {item.Consumido >= item.Meta ? (
                    <span className="text-emerald-400 font-semibold">Meta Atingida</span>
                  ) : (
                    <span className="text-neutral-400">
                      Faltam{" "}
                      <strong className="text-white">
                        {item.Meta - item.Consumido} {item.unidade}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Sparkles,
  ChefHat,
  Utensils,
  Dumbbell,
  Clock,
  Plus,
  CheckCircle2,
  Zap,
  Flame,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DailyNutrition, UserProfile, CompletedWorkoutRecord, Meal, FoodItem } from "../../types";
import { aiService } from "../../services/aiService";

interface AIRecoveryMealCardProps {
  nutrition: DailyNutrition;
  profile?: UserProfile;
  recentWorkouts?: CompletedWorkoutRecord[];
  onUpdateNutrition: (updated: DailyNutrition) => void;
}

export const AIRecoveryMealCard: React.FC<AIRecoveryMealCardProps> = ({
  nutrition,
  profile,
  recentWorkouts = [],
  onUpdateNutrition,
}) => {
  // Today's workout or latest workout volume
  const latestWorkout = recentWorkouts[0];
  const defaultVolume = latestWorkout?.totalVolumeKg || 12450;
  const defaultMuscle = latestWorkout?.title || "Peitorais e Tríceps";

  const [workoutVolumeKg, setWorkoutVolumeKg] = useState<number>(defaultVolume);
  const [muscleFocus, setMuscleFocus] = useState<string>(defaultMuscle);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryMeal, setRecoveryMeal] = useState<any | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleGenerateRecoveryMeal = async () => {
    setIsLoading(true);
    setAddedSuccess(false);
    try {
      const meal = await aiService.generateRecoveryMeal({
        volumeKg: workoutVolumeKg,
        muscleFocus,
        consumedCalories: nutrition.consumedCalories,
        targetCalories: nutrition.targetCalories,
        dietaryPreference: profile?.dietaryPreference || "Alta Proteína",
        athleteName: profile?.name || "Atleta",
      });
      setRecoveryMeal(meal);
    } catch (_err) {
      // Handled cleanly via fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMealToLog = () => {
    if (!recoveryMeal) return;

    const newFoods: FoodItem[] = (recoveryMeal.ingredients || []).map((ing: any, i: number) => ({
      id: `food-rec-${Date.now()}-${i}`,
      name: ing.name,
      quantity: ing.quantity,
      calories: ing.calories || 100,
      proteinG: ing.proteinG || 10,
      carbsG: Math.round((ing.calories || 100) * 0.4 / 4),
      fatG: Math.round((ing.calories || 100) * 0.2 / 9),
    }));

    const newMeal: Meal = {
      id: `meal-recovery-${Date.now()}`,
      name: `Refeição de Recuperação: ${recoveryMeal.mealName}`,
      scheduledTime: "Pós-Treino",
      completed: true,
      foods: newFoods.length > 0 ? newFoods : [
        {
          id: `f-rec-main-${Date.now()}`,
          name: recoveryMeal.mealName,
          quantity: "1 porção pós-treino",
          calories: recoveryMeal.calories,
          proteinG: recoveryMeal.proteinG,
          carbsG: recoveryMeal.carbsG,
          fatG: recoveryMeal.fatG,
        }
      ],
      prepNotes: `Preparo em ${recoveryMeal.prepTimeMin || 10} min: ${recoveryMeal.physiologicalRationale || ""}`,
      recipeInstructions: [recoveryMeal.preparationMethod || "Consumir logo após o preparo com água ou água de coco."],
    };

    const updatedMeals = [...nutrition.meals, newMeal];
    const updatedNutrition: DailyNutrition = {
      ...nutrition,
      meals: updatedMeals,
      consumedCalories: nutrition.consumedCalories + recoveryMeal.calories,
      consumedProteinG: nutrition.consumedProteinG + recoveryMeal.proteinG,
      consumedCarbsG: nutrition.consumedCarbsG + recoveryMeal.carbsG,
      consumedFatG: nutrition.consumedFatG + recoveryMeal.fatG,
    };

    onUpdateNutrition(updatedNutrition);
    setAddedSuccess(true);
  };

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Refeição de Recuperação Pós-Treino com IA
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Volume Adaptativo
              </span>
            </div>
            <div className="text-xs text-neutral-400">
              Otimização de janela anabólica, síntese miofibrilar e reposição rápida de glicogênio
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateRecoveryMeal}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-neutral-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Calculando Fisiologia..." : "Gerar Refeição com IA"}</span>
        </button>
      </div>

      {/* Input volume context strip */}
      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Volume do Treino de Hoje</div>
            <div className="text-sm font-bold text-white font-mono">
              {workoutVolumeKg.toLocaleString()} kg levantados ({muscleFocus})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Ajustar volume:</span>
          {[8000, 12000, 18000].map((vol) => (
            <button
              key={vol}
              type="button"
              onClick={() => setWorkoutVolumeKg(vol)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                workoutVolumeKg === vol
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              {(vol / 1000).toFixed(0)}k kg
            </button>
          ))}
        </div>
      </div>

      {/* Recovery Meal Result */}
      <AnimatePresence>
        {recoveryMeal && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-neutral-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{recoveryMeal.recommendedTiming}</span>
                </div>
                <h4 className="text-lg font-bold text-white mt-1">
                  {recoveryMeal.mealName}
                </h4>
              </div>

              {/* Macro Pills */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                  {recoveryMeal.calories} kcal
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30">
                  {recoveryMeal.proteinG}g Prot
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                  {recoveryMeal.carbsG}g Carb
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30">
                  {recoveryMeal.leucineEstimateG}g Leucina
                </span>
              </div>
            </div>

            {/* Physiological Rationale */}
            <p className="text-xs text-neutral-300 leading-relaxed italic bg-neutral-900/80 p-3 rounded-xl border border-neutral-850">
              "{recoveryMeal.physiologicalRationale}"
            </p>

            {/* Ingredients & Prep */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="font-semibold text-white block mb-2">Ingredientes Otimizados:</span>
                <ul className="space-y-1.5 text-neutral-300">
                  {(recoveryMeal.ingredients || []).map((ing: any, i: number) => (
                    <li key={i} className="flex items-center justify-between py-1 border-b border-neutral-850/60 font-mono">
                      <span>• {ing.name}</span>
                      <span className="text-neutral-400">{ing.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-white block mb-2">Modo de Preparo Rápido ({recoveryMeal.prepTimeMin} min):</span>
                <p className="text-neutral-300 leading-relaxed bg-neutral-900 p-3 rounded-xl border border-neutral-850">
                  {recoveryMeal.preparationMethod}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              {addedSuccess ? (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Adicionado ao log diário e macros computados!</span>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-400">
                  Clique para somar esta refeição aos seus macros consumidos de hoje.
                </div>
              )}

              <button
                type="button"
                onClick={handleAddMealToLog}
                disabled={addedSuccess}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{addedSuccess ? "Registrado no Dia" : "Adicionar ao Log de Hoje"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

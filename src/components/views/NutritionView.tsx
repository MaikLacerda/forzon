import React, { useState } from "react";
import {
  Apple,
  Droplets,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  ShoppingCart,
  Clock,
  Info,
  ChevronRight,
  Flame,
  AlertTriangle,
  BookOpen,
  Check,
  X,
  Watch,
} from "lucide-react";
import { DailyNutrition, Meal, FoodItem } from "../../types";
import { storage } from "../../services/storage";
import { UserProfile, CompletedWorkoutRecord } from "../../types";
import { MacroCalculatorAndChart } from "../nutrition/MacroCalculatorAndChart";
import { AIRecoveryMealCard } from "../nutrition/AIRecoveryMealCard";
import { AdBanner } from "../common/AdBanner";
import { smartwatchSyncService } from "../../services/smartwatchSyncService";

interface NutritionViewProps {
  nutrition: DailyNutrition;
  onUpdateNutrition: (updated: DailyNutrition) => void;
  onOpenCoachWithPrompt: (prompt: string) => void;
  profile?: UserProfile;
  recentWorkouts?: CompletedWorkoutRecord[];
  onOpenUpgradeModal?: () => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  nutrition,
  onUpdateNutrition,
  onOpenCoachWithPrompt,
  profile,
  recentWorkouts,
  onOpenUpgradeModal,
}) => {
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [activeRecipeMeal, setActiveRecipeMeal] = useState<Meal | null>(null);
  const [checkedGroceries, setCheckedGroceries] = useState<string[]>(() => storage.getCheckedGroceryItems());
  const [isAddingFoodMealId, setIsAddingFoodMealId] = useState<string | null>(null);
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodQty, setNewFoodQty] = useState("");
  const [newFoodCal, setNewFoodCal] = useState("");
  const [newFoodProt, setNewFoodProt] = useState("");

  const toggleGroceryCheck = (item: string) => {
    storage.toggleCheckedGroceryItem(item);
    setCheckedGroceries(storage.getCheckedGroceryItems());
  };

  const handleAddCustomFood = (mealId: string) => {
    if (!newFoodName.trim()) return;
    const calories = parseInt(newFoodCal) || 100;
    const protein = parseInt(newFoodProt) || 10;
    const newFood: FoodItem = {
      id: `f-custom-${Date.now()}`,
      name: newFoodName.trim(),
      quantity: newFoodQty.trim() || "1 porção",
      calories,
      proteinG: protein,
      carbsG: Math.round(calories * 0.4 / 4),
      fatG: Math.round(calories * 0.2 / 9),
    };

    const updatedMeals = nutrition.meals.map((m) => {
      if (m.id === mealId) {
        return { ...m, foods: [...m.foods, newFood] };
      }
      return m;
    });

    onUpdateNutrition({ ...nutrition, meals: updatedMeals });
    setIsAddingFoodMealId(null);
    setNewFoodName("");
    setNewFoodQty("");
    setNewFoodCal("");
    setNewFoodProt("");
  };

  const toggleMealCompleted = (mealId: string) => {
    const updatedMeals = nutrition.meals.map((meal) => {
      if (meal.id === mealId) {
        const nextState = !meal.completed;
        return { ...meal, completed: nextState };
      }
      return meal;
    });

    // Recalculate consumed
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    updatedMeals.forEach((m) => {
      if (m.completed) {
        m.foods.forEach((f) => {
          calories += f.calories;
          protein += f.proteinG;
          carbs += f.carbsG;
          fat += f.fatG;
        });
      }
    });

    onUpdateNutrition({
      ...nutrition,
      meals: updatedMeals,
      consumedCalories: calories,
      consumedProteinG: protein,
      consumedCarbsG: carbs,
      consumedFatG: fat,
    });
  };

  const addWater = (ml: number) => {
    const updated = {
      ...nutrition,
      waterIntakeMl: Math.min(nutrition.waterGoalMl * 2, nutrition.waterIntakeMl + ml),
    };
    onUpdateNutrition(updated);
    smartwatchSyncService.syncNutritionWithWatch(updated);
  };

  // Compile grocery list from foods
  const groceryItems = Array.from(
    new Set(
      nutrition.meals.flatMap((m) =>
        m.foods.map((f) => `${f.name} (${f.quantity})`)
      )
    )
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Planejamento Nutricional</span>
            <span aria-hidden="true">·</span>
            <span>Alta Proteína & Síntese</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Meta: 2.650 kcal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Nutrição & Hidratação
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Alimentação estruturada para otimizar síntese proteica miofibrilar, reposição de glicogênio e energia nos treinos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGroceryList(!showGroceryList)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lista de Compras ({groceryItems.length})</span>
          </button>
        </div>
      </div>

      {/* AdBanner for Free users in Nutrition */}
      <AdBanner
        isPremium={profile?.isPremium ?? false}
        onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
        slot="compact"
      />

      {/* Legal & Educational Disclaimer Notice */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-neutral-300 font-semibold">Orientações Educacionais:</span> As sugestões e valores nutricionais são estimativas calculadas com base em tabelas de composição de alimentos para adultos saudáveis. Não substituem o acompanhamento clínico individualizado de um nutricionista ou médico.
        </div>
      </div>

      {/* Grocery List Overlay Panel */}
      {showGroceryList && (
        <div className="bg-neutral-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Lista de Compras Semanal Compilada</span>
            </h3>
            <button
              onClick={() => setShowGroceryList(false)}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Fechar
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Ingredientes necessários para seu plano semanal (clique para marcar no mercado):</span>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(groceryItems.join("\n"));
                  alert("Lista de compras copiada para a área de transferência!");
                }
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              Copiar Lista Completa
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {groceryItems.map((item, idx) => {
              const isChecked = checkedGroceries.includes(item);
              return (
                <button
                  key={idx}
                  onClick={() => toggleGroceryCheck(item)}
                  className={`p-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isChecked
                      ? "bg-emerald-950/20 border-emerald-500/30 text-neutral-400 line-through"
                      : "bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-700"
                  }`}
                >
                  <span className="truncate">{item}</span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ml-2 ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-neutral-950"
                        : "border-neutral-700"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Macro & Energy Dashboard Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Calorias Totais</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {nutrition.consumedCalories}{" "}
            <span className="text-xs font-normal text-neutral-400">
              / {nutrition.targetCalories} kcal
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((nutrition.consumedCalories / nutrition.targetCalories) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Proteínas (1.8g - 2.2g/kg)</span>
            <span className="text-blue-400 font-mono text-[10px]">Alvo Alto</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {nutrition.consumedProteinG}g{" "}
            <span className="text-xs font-normal text-neutral-400">
              / {nutrition.targetProteinG}g
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((nutrition.consumedProteinG / nutrition.targetProteinG) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Carboidratos (Glicogênio)</span>
            <span className="text-emerald-400 font-mono text-[10px]">Energia</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {nutrition.consumedCarbsG}g{" "}
            <span className="text-xs font-normal text-neutral-400">
              / {nutrition.targetCarbsG}g
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((nutrition.consumedCarbsG / nutrition.targetCarbsG) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Fats */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Gorduras Boas (Hormonal)</span>
            <span className="text-neutral-400 font-mono text-[10px]">Lipídios</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {nutrition.consumedFatG}g{" "}
            <span className="text-xs font-normal text-neutral-400">
              / {nutrition.targetFatG}g
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((nutrition.consumedFatG / nutrition.targetFatG) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Water logger banner */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white">Registro de Hidratação</span>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Watch className="w-3 h-3 text-sky-400" /> WearOS & Apple Watch Sync
              </span>
            </div>
            <div className="text-xs text-neutral-400 font-mono tabular-nums">
              {(nutrition.waterIntakeMl / 1000).toFixed(2)}L de {(nutrition.waterGoalMl / 1000).toFixed(1)}L consumidos hoje
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addWater(250)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 text-sky-400" />
            <span>+250ml Copo</span>
          </button>
          <button
            onClick={() => addWater(500)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 text-sky-400" />
            <span>+500ml Garrafa</span>
          </button>
        </div>
      </div>

      {/* Macronutrient Calculator & Comparative Bar Chart (Meta vs Consumido) */}
      <MacroCalculatorAndChart
        nutrition={nutrition}
        profile={profile}
        onUpdateNutrition={onUpdateNutrition}
      />

      {/* AI Post-Workout Recovery Meal Card (volume adaptive) */}
      <AIRecoveryMealCard
        nutrition={nutrition}
        profile={profile}
        recentWorkouts={recentWorkouts}
        onUpdateNutrition={onUpdateNutrition}
      />

      {/* Daily Meals Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Refeições do Dia ({nutrition.meals.length})
          </h2>
          <span className="text-xs text-neutral-400">
            Clique no círculo para marcar como consumida
          </span>
        </div>

        <div className="space-y-4">
          {nutrition.meals.map((meal) => {
            const mealCalories = meal.foods.reduce((acc, f) => acc + f.calories, 0);
            const mealProtein = meal.foods.reduce((acc, f) => acc + f.proteinG, 0);
            const mealCarbs = meal.foods.reduce((acc, f) => acc + f.carbsG, 0);
            const mealFat = meal.foods.reduce((acc, f) => acc + f.fatG, 0);

            return (
              <div
                key={meal.id}
                className={`border rounded-2xl p-5 transition-all ${
                  meal.completed
                    ? "bg-neutral-900/40 border-neutral-850 opacity-90"
                    : "bg-neutral-900/80 border-neutral-800"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleMealCompleted(meal.id)}
                      className="mt-0.5 text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {meal.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-600" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base font-bold ${meal.completed ? "text-neutral-300 line-through" : "text-white"}`}>
                          {meal.name}
                        </h3>
                        <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                          <Clock className="w-3 h-3" /> {meal.scheduledTime}
                        </span>
                      </div>
                      {meal.prepNotes && (
                        <p className="text-xs text-neutral-400 mt-0.5">{meal.prepNotes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <div className="text-right text-xs font-mono tabular-nums">
                      <div className="font-bold text-white">{mealCalories} kcal</div>
                      <div className="text-neutral-400 text-[10px]">
                        {mealProtein}g P · {mealCarbs}g C · {mealFat}g G
                      </div>
                    </div>

                    {meal.recipeInstructions && (
                      <button
                        onClick={() => setActiveRecipeMeal(meal)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                        title="Ver Modo de Preparo da Receita"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    )}

                    <button
                      onClick={() => setIsAddingFoodMealId(isAddingFoodMealId === meal.id ? null : meal.id)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                      title="Adicionar alimento a esta refeição"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    </button>

                    <button
                      onClick={() =>
                        onOpenCoachWithPrompt(
                          `Gostaria de substituir a refeição "${meal.name}" (${meal.foods.map((f) => f.name).join(", ")}). Quais opções rápidas e equivalentes em macronutrientes você sugere?`
                        )
                      }
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                      title="Sugerir substituição para esta refeição"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>

                {/* Inline form to add custom food */}
                {isAddingFoodMealId === meal.id && (
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 mt-2 text-xs animate-fade-in">
                    <div className="font-semibold text-white">Adicionar Alimento Personalizado:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Nome (ex: Castanhas)"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Porção (ex: 30g)"
                        value={newFoodQty}
                        onChange={(e) => setNewFoodQty(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Calorias (kcal)"
                        value={newFoodCal}
                        onChange={(e) => setNewFoodCal(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Proteína (g)"
                        value={newFoodProt}
                        onChange={(e) => setNewFoodProt(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsAddingFoodMealId(null)}
                        className="px-3 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleAddCustomFood(meal.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 text-neutral-950 font-bold hover:bg-emerald-400"
                      >
                        Salvar Alimento
                      </button>
                    </div>
                  </div>
                )}

                {/* Food list items */}
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {meal.foods.map((food) => (
                    <div
                      key={food.id}
                      className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-neutral-200">{food.name}</div>
                        <div className="text-[11px] text-neutral-400">{food.quantity}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-neutral-400 tabular-nums">
                        <div>{food.calories} kcal</div>
                        <div className="text-[10px] text-neutral-500">{food.proteinG}g P</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipe Instructions Modal Overlay */}
      {activeRecipeMeal && (
        <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Receita: {activeRecipeMeal.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveRecipeMeal(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="font-semibold text-neutral-300 mb-2">Ingredientes & Proporções:</div>
              <div className="space-y-1 bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                {activeRecipeMeal.foods.map((f) => (
                  <div key={f.id} className="flex justify-between text-neutral-300">
                    <span>· {f.name}</span>
                    <span className="font-mono text-neutral-400">{f.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {activeRecipeMeal.recipeInstructions && (
              <div>
                <div className="font-semibold text-neutral-300 mb-2">Modo de Preparo:</div>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  {activeRecipeMeal.recipeInstructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <button
              onClick={() => setActiveRecipeMeal(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold cursor-pointer"
            >
              Fechar Receita
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

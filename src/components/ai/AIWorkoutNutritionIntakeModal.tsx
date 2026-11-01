import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Bot,
  User,
  Dumbbell,
  Apple,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Zap,
  Activity,
  Scale,
  Heart,
  Droplets,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
  WorkoutExercise,
  DailyNutrition,
  Meal,
  FoodItem,
  AthleteSpecificGoal,
} from "../../types";
import { storage } from "../../services/storage";
import confetti from "canvas-confetti";

interface AIWorkoutNutritionIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onPlanApplied: (plan: WorkoutPlan, nutrition: DailyNutrition, updatedProfile: UserProfile) => void;
}

interface IntakeState {
  goal: string;
  specificGoal: AthleteSpecificGoal;
  heightCm: number;
  weightKg: number;
  healthIssues: string;
  trainingDays: number;
  environment: "Academia" | "Casa" | "Híbrido";
  dietaryPreference: string;
}

export const AIWorkoutNutritionIntakeModal: React.FC<AIWorkoutNutritionIntakeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onPlanApplied,
}) => {
  // Step 1: Goal | Step 2: Measurements | Step 3: Health/Injuries | Step 4: Days & Place | Step 5: Diet | Step 6: Generating | Step 7: Results
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [intake, setIntake] = useState<IntakeState>({
    goal: profile.mainGoal || "Ganhar Massa Muscular (Hipertrofia)",
    specificGoal: profile.specificGoal || "ganhar_massa",
    heightCm: profile.heightCm || 175,
    weightKg: profile.weightKg || 76,
    healthIssues: profile.injuriesOrNotes || "Nenhuma restrição articular ou dor",
    trainingDays: profile.trainingDaysPerWeek || 4,
    environment: (profile.environment as any) || "Academia",
    dietaryPreference: profile.dietaryPreference || "Padrão (Como de tudo)",
  });

  const [customHealthText, setCustomHealthText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [generatedNutrition, setGeneratedNutrition] = useState<DailyNutrition | null>(null);
  const [generatedRationale, setGeneratedRationale] = useState<{
    tdee: number;
    deficitOrSurplus: string;
    jointProtection: string;
    coachMessage: string;
  } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentStep, isGenerating]);

  if (!isOpen) return null;

  // Scientific calculation of TDEE and tailored workouts based on conversation answers
  const computeTailoredPlanAndDiet = async () => {
    setIsGenerating(true);
    setCurrentStep(6);

    try {
      // 1. Try server-side Gemini generation with rich physiological context
      const res = await fetch("/api/ai/intake-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: intake.heightCm,
          weightKg: intake.weightKg,
          goal: intake.goal,
          specificGoal: intake.specificGoal,
          healthIssues: intake.healthIssues,
          trainingDays: intake.trainingDays,
          environment: intake.environment,
          dietaryPreference: intake.dietaryPreference,
          userName: profile.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.plan && data.nutrition) {
          setGeneratedPlan(data.plan);
          setGeneratedNutrition(data.nutrition);
          setGeneratedRationale(data.rationale);
          setIsGenerating(false);
          setCurrentStep(7);
          return;
        }
      }
    } catch {
      // Fallback to local physiological engine
    }

    // 2. Local High-Precision Physiological Formulation (Mifflin-St Jeor + Macro Partitioning)
    setTimeout(() => {
      const weight = intake.weightKg;
      const height = intake.heightCm;
      const age = profile.birthYear ? new Date().getFullYear() - profile.birthYear : 26;

      // Basal Metabolic Rate (BMR)
      const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);

      // Activity multiplier
      const activityMultiplier = intake.trainingDays <= 3 ? 1.375 : intake.trainingDays <= 5 ? 1.55 : 1.725;
      const tdee = Math.round(bmr * activityMultiplier);

      let targetCalories = tdee;
      let deficitOrSurplus = "Manutenção Calórica e Recomposição";
      let proteinMultiplier = 2.0;

      if (intake.specificGoal === "ganhar_massa") {
        targetCalories = tdee + 350; // Superávit limpo
        deficitOrSurplus = `Superávit controlado de +350 kcal sobre seu gasto diário (${tdee} kcal)`;
        proteinMultiplier = 2.2;
      } else if (intake.specificGoal === "perder_gordura") {
        targetCalories = Math.max(1400, tdee - 450); // Déficit moderado sustentável
        deficitOrSurplus = `Déficit estratégico de -450 kcal para queima lipídica preservando massa magra`;
        proteinMultiplier = 2.3; // Maior aporte para poupar massa muscular
      } else if (intake.specificGoal === "forca_pura") {
        targetCalories = tdee + 250;
        deficitOrSurplus = `Superávit energético moderado para suporte neural e recuperação de ATP-CP`;
        proteinMultiplier = 2.0;
      }

      const proteinG = Math.round(weight * proteinMultiplier);
      const fatG = Math.round(weight * 0.9);
      const remainingCals = Math.max(200, targetCalories - (proteinG * 4 + fatG * 9));
      const carbsG = Math.round(remainingCals / 4);
      const waterMl = Math.round(weight * 38);

      // Check joint protection logic
      const hasKneeIssue = intake.healthIssues.toLowerCase().includes("joelho");
      const hasBackIssue = intake.healthIssues.toLowerCase().includes("lombar") || intake.healthIssues.toLowerCase().includes("coluna");
      const hasShoulderIssue = intake.healthIssues.toLowerCase().includes("ombro");

      let jointProtection = "Articulações livres para sobrecarga progressiva integral.";
      if (hasKneeIssue) {
        jointProtection = "Proteção patelofemoral: agachamentos profundos substituídos por leg press em amplitude segura e foco na cadeia posterior.";
      } else if (hasBackIssue) {
        jointProtection = "Descompressão lombar: levantamento terra com barra e agachamentos livres pesados substituídos por remadas apoiadas no peito e leg press.";
      } else if (hasShoulderIssue) {
        jointProtection = "Proteção do manguito rotador: desenvolvimentos por trás eliminados, supinos executados com pegada neutra e inclusão de face pulls.";
      }

      // Build personalized session routine
      const repRange = intake.specificGoal === "forca_pura" ? "3-5 reps" : intake.specificGoal === "perder_gordura" ? "12-15 reps" : "8-12 reps";
      const restSec = intake.specificGoal === "forca_pura" ? 150 : intake.specificGoal === "perder_gordura" ? 45 : 90;

      const buildExercise = (
        name: string,
        targetMuscle: any,
        numSets: number,
        reps: string,
        restSeconds: number,
        notes?: string
      ): WorkoutExercise => ({
        id: `ex-ai-${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        exerciseId: `ex-${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name,
        targetMuscle,
        restSeconds,
        notes,
        sets: Array.from({ length: numSets }, (_, idx) => ({
          id: `s-${idx + 1}-${Math.random().toString(36).slice(2, 6)}`,
          setNumber: idx + 1,
          type: idx === 0 ? "warmup" : "working",
          weightKg: 20,
          targetReps: parseInt(reps) || 10,
          completed: false,
        })),
      });

      const sessions: WorkoutSession[] = [];

      // Session A (Push / Superior A)
      sessions.push({
        id: `sess-ai-${Date.now()}-1`,
        title: "Treino A — Peito, Tríceps & Deltóides",
        dayLabel: "Dia 1",
        muscleFocus: hasShoulderIssue ? "Peito & Tríceps (Pegada Neutra / Seguro)" : "Peito, Tríceps & Deltóides",
        estimatedMinutes: 55,
        warmupProtocol: "Mobilidade escapular e ativação de manguito leve (5 min)",
        completedCount: 0,
        exercises: [
          buildExercise(
            hasShoulderIssue ? "Supino Inclinado com Halteres (Pegada Neutra)" : "Supino Reto com Barra Olímpica",
            "Peitoral",
            4,
            repRange,
            restSec,
            hasShoulderIssue ? "Mantenha os cotovelos a 45° do corpo para proteger o ombro." : "Desça a barra até encostar suavemente no peitoral."
          ),
          buildExercise(
            "Supino Inclinado na Máquina / Articulado",
            "Peitoral",
            3,
            repRange,
            restSec,
            "Foco na contração de pico no topo."
          ),
          buildExercise(
            hasShoulderIssue ? "Elevação Lateral no Banco Inclinado" : "Desenvolvimento com Halteres",
            "Ombros",
            3,
            "12-15 reps",
            60,
            "Controle a descida em 3 segundos."
          ),
          buildExercise(
            "Tríceps Corda na Polia",
            "Tríceps",
            3,
            "12-15 reps",
            45,
            "Abra a corda na contração máxima embaixo."
          ),
        ],
      });

      // Session B (Pull / Costas e Bíceps)
      sessions.push({
        id: `sess-ai-${Date.now()}-2`,
        title: "Treino B — Costas, Dorsais & Bíceps",
        dayLabel: "Dia 2",
        muscleFocus: hasBackIssue ? "Costas & Bíceps (Apoio no Peito / Sem Sobrecarga Lombar)" : "Dorsais, Trapézio & Bíceps",
        estimatedMinutes: 50,
        warmupProtocol: "Ativação de dorsais e mobilidade torácica",
        completedCount: 0,
        exercises: [
          buildExercise(
            hasBackIssue ? "Remada Apoiada no Peito (Chest-Supported)" : "Puxada Frontal Aberta na Polia",
            "Costas",
            4,
            repRange,
            restSec,
            hasBackIssue ? "Peito apoiado no banco para eliminar 100% da tensão lombar." : "Puxe direcionando os cotovelos para o chão."
          ),
          buildExercise(
            "Puxada Triângulo no Pulley",
            "Costas",
            3,
            repRange,
            restSec,
            "Mantenha o tronco firme e sinta a musculatura abrir."
          ),
          buildExercise(
            "Crucifixo Invertido na Máquina / Halteres",
            "Ombros",
            3,
            "15 reps",
            45,
            "Postura reta sem balanço corporal."
          ),
          buildExercise(
            "Rosca Direta com Barra W ou Halteres",
            "Bíceps",
            3,
            "10-12 reps",
            60,
            "Cotovelos colados ao lado do corpo."
          ),
        ],
      });

      // Session C (Pernas / Membros Inferiores)
      sessions.push({
        id: `sess-ai-${Date.now()}-3`,
        title: "Treino C — Pernas, Glúteos & Panturrilhas",
        dayLabel: "Dia 3",
        muscleFocus: hasKneeIssue ? "Pernas & Glúteos (Proteção Patelar & Isquiotibiais)" : "Quadríceps, Glúteos & Panturrilhas",
        estimatedMinutes: 55,
        warmupProtocol: "Mobilidade de tornozelo e quadril (5 min)",
        completedCount: 0,
        exercises: [
          buildExercise(
            hasKneeIssue ? "Leg Press 45° (Pés Altos / Amplitude Confortável)" : "Agachamento Livre com Barra",
            "Pernas (Quadríceps)",
            4,
            hasKneeIssue ? "12-15 reps" : repRange,
            restSec,
            hasKneeIssue ? "Pés mais altos na plataforma para aliviar a pressão do joelho." : "Desça controlando com joelhos alinhados aos pés."
          ),
          buildExercise(
            "Cadeira Flexora Unilateral",
            "Pernas (Posterior)",
            4,
            "10-12 reps",
            60,
            "Mantenha a ponta do pé esticada e sinta o posterior queimar."
          ),
          buildExercise(
            "Elevação Pélvica com Barra ou Máquina",
            "Glúteos",
            3,
            "10-12 reps",
            75,
            "Segure 2 segundos contraindo no ponto mais alto."
          ),
          buildExercise(
            "Gêmeos em Pé (Panturrilhas)",
            "Panturrilhas",
            4,
            "15-20 reps",
            45,
            "Alongamento completo embaixo e pausa de 1 segundo em cima."
          ),
        ],
      });

      // If training days >= 4, add Session D
      if (intake.trainingDays >= 4) {
        sessions.push({
          id: `sess-ai-${Date.now()}-4`,
          title: "Treino D — Superior & Core Funcional",
          dayLabel: "Dia 4",
          muscleFocus: "Membros Superiores & Core Funcional",
          estimatedMinutes: 50,
          warmupProtocol: "Mobilidade articular e prancha de ativação",
          completedCount: 0,
          exercises: [
            buildExercise(
              "Desenvolvimento com Halteres",
              "Ombros",
              3,
              repRange,
              restSec,
              "Tronco estabilizado no encosto do banco."
            ),
            buildExercise(
              "Remada Baixa com Triângulo",
              "Costas",
              3,
              repRange,
              60,
              "Puxe direcionando a barra ao umbigo."
            ),
            buildExercise(
              "Mergulho nas Paralelas ou no Banco",
              "Tríceps",
              3,
              "10-12 reps",
              60,
              "Mantenha o corpo próximo ao apoio."
            ),
            buildExercise(
              "Prancha Abdominal Isométrica",
              "Abdômen & Core",
              3,
              "45 segundos",
              45,
              "Abdômen e glúteos contraídos sem curvar a lombar."
            ),
          ],
        });
      }

      const plan: WorkoutPlan = {
        id: `plan-forzon-ai-${Date.now()}`,
        title: `FORZON AI — ${intake.goal} (${intake.trainingDays}x por Semana)`,
        description: `Periodização desenhada pelo FORZON AI Coach considerando ${intake.weightKg}kg, ${intake.heightCm}cm e adaptação para: "${intake.healthIssues}".`,
        frequencyDaysPerWeek: intake.trainingDays,
        active: true,
        updatedAt: new Date().toISOString(),
        sessions,
      };

      const nutrition: DailyNutrition = {
        targetCalories,
        targetProteinG: proteinG,
        targetCarbsG: carbsG,
        targetFatG: fatG,
        consumedCalories: 0,
        consumedProteinG: 0,
        consumedCarbsG: 0,
        consumedFatG: 0,
        waterIntakeMl: 0,
        waterGoalMl: waterMl,
        meals: [
          {
            id: "m-ai-1",
            name: "Café da Manhã Energético",
            scheduledTime: "07:30",
            completed: false,
            foods: [
              {
                id: "f-1",
                name: "Ovos mexidos com azeite",
                quantity: "3 unidades",
                calories: Math.round(targetCalories * 0.15),
                proteinG: Math.round(proteinG * 0.15),
                carbsG: 2,
                fatG: 14,
              },
              {
                id: "f-2",
                name: "Pão integral com banana",
                quantity: "2 fatias + 1 fruta",
                calories: Math.round(targetCalories * 0.1),
                proteinG: 6,
                carbsG: Math.round(carbsG * 0.25),
                fatG: 2,
              },
            ],
          },
          {
            id: "m-ai-2",
            name: "Almoço de Alta Performance",
            scheduledTime: "12:30",
            completed: false,
            foods: [
              {
                id: "f-3",
                name: "Filé de frango ou patinho grelhado",
                quantity: "180g",
                calories: Math.round(targetCalories * 0.2),
                proteinG: Math.round(proteinG * 0.4),
                carbsG: 0,
                fatG: 8,
              },
              {
                id: "f-4",
                name: "Arroz branco ou batata doce com legumes",
                quantity: "200g",
                calories: Math.round(targetCalories * 0.15),
                proteinG: 6,
                carbsG: Math.round(carbsG * 0.4),
                fatG: 5,
              },
            ],
          },
          {
            id: "m-ai-3",
            name: "Lanche Pré-Treino",
            scheduledTime: "16:30",
            completed: false,
            foods: [
              {
                id: "f-5",
                name: "Iogurte com frutas e whey protein",
                quantity: "1 porção",
                calories: Math.round(targetCalories * 0.15),
                proteinG: Math.round(proteinG * 0.2),
                carbsG: Math.round(carbsG * 0.15),
                fatG: 4,
              },
            ],
          },
          {
            id: "m-ai-4",
            name: "Jantar Regenerativo",
            scheduledTime: "20:00",
            completed: false,
            foods: [
              {
                id: "f-6",
                name: "Peixe grelhado ou ovos cozidos com legumes",
                quantity: "1 prato",
                calories: Math.round(targetCalories * 0.25),
                proteinG: Math.round(proteinG * 0.25),
                carbsG: Math.round(carbsG * 0.2),
                fatG: 12,
              },
            ],
          },
        ],
      };

      setGeneratedPlan(plan);
      setGeneratedNutrition(nutrition);
      setGeneratedRationale({
        tdee,
        deficitOrSurplus,
        jointProtection,
        coachMessage: `Treino e dieta calibrados! Suas calorias foram fixadas em ${targetCalories} kcal diárias (${proteinG}g de proteína) para acelerar seus resultados. Os exercícios da sua ficha foram minuciosamente selecionados para respeitar sua saúde e blindar suas articulações.`,
      });

      setIsGenerating(false);
      setCurrentStep(7);
    }, 1500);
  };

  const handleApplyToApp = () => {
    if (!generatedPlan || !generatedNutrition) return;

    // 1. Update user profile
    const updatedProfile: UserProfile = {
      ...profile,
      heightCm: intake.heightCm,
      weightKg: intake.weightKg,
      mainGoal: intake.goal,
      specificGoal: intake.specificGoal,
      trainingDaysPerWeek: intake.trainingDays,
      environment: intake.environment,
      dietaryPreference: intake.dietaryPreference,
      injuriesOrNotes: intake.healthIssues,
      dailyCalorieGoal: generatedNutrition.targetCalories,
      dailyWaterGoalMl: generatedNutrition.waterGoalMl,
    };

    // 2. Persist in storage
    storage.saveProfile(updatedProfile);
    storage.saveWorkoutPlan(generatedPlan);
    storage.saveNutrition(generatedNutrition);

    // 3. Trigger parent callback
    onPlanApplied(generatedPlan, generatedNutrition, updatedProfile);

    // 4. Confetti feedback
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-cyan-500/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  FORZON AI Coach
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  TREINADOR & NUTRIÇÃO
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Entrevista interativa para gerar seu Treino e Dieta sob medida
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1 to 5) */}
        {currentStep <= 5 && (
          <div className="py-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
              <span>Etapa {currentStep} de 5</span>
              <span>{currentStep * 20}% Concluído</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${currentStep * 20}%` }}
              />
            </div>
          </div>
        )}

        {/* Interactive Chat Conversation Content */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin"
        >
          {/* STEP 1: OBJETIVO */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-2 max-w-[90%]">
              <p className="font-semibold text-white">
                Olá, {profile.name.split(" ")[0]}! Sou o seu Treinador e Nutricionista de IA da FORZON.
              </p>
              <p>
                Para eu montar o seu <strong>Plano de Treino</strong> perfeito e a sua <strong>Dieta personalizada</strong>, vou te fazer algumas perguntas rápidas sobre seu corpo e sua rotina.
              </p>
              <p className="text-cyan-400 font-medium">
                Primeiro: Qual é o seu <strong>Objetivo Principal</strong> hoje?
              </p>
            </div>
          </div>

          {currentStep >= 1 && (
            <div className="space-y-2 pl-11">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: "ganhar_massa",
                    title: "Ganhar Massa Muscular (Hipertrofia)",
                    desc: "Foco em sobrecarga progressiva e ganho de volume muscular.",
                    icon: <Dumbbell className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    id: "perder_gordura",
                    title: "Perder Gordura & Secar (Cutting)",
                    desc: "Déficit calórico estratégico com manutenção de massa magra.",
                    icon: <Flame className="w-4 h-4 text-amber-400" />,
                  },
                  {
                    id: "forca_pura",
                    title: "Força Bruta & Cargas Altas",
                    desc: "Foco em exercícios multiarticulares pesados e potência.",
                    icon: <Zap className="w-4 h-4 text-purple-400" />,
                  },
                  {
                    id: "recomposicao",
                    title: "Recomposição Corporal",
                    desc: "Perder gordura e ganhar músculo simultaneamente.",
                    icon: <Scale className="w-4 h-4 text-blue-400" />,
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setIntake((prev) => ({
                        ...prev,
                        goal: opt.title,
                        specificGoal: opt.id as any,
                      }));
                      if (currentStep === 1) setCurrentStep(2);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      intake.specificGoal === opt.id
                        ? "bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10"
                        : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40"
                    }`}
                  >
                    <div className="mt-0.5">{opt.icon}</div>
                    <div>
                      <div className="text-xs font-bold text-white">{opt.title}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: ALTURA E PESO */}
          {currentStep >= 2 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Excelente escolha! Vamos focar nisso com seriedade.
                  </p>
                  <p className="text-cyan-400 font-medium">
                    Agora me informe suas medidas corporais: qual é a sua <strong>Altura</strong> (em cm) e seu <strong>Peso atual</strong> (em kg)?
                  </p>
                </div>
              </div>

              <div className="pl-11 space-y-3">
                <div className="grid grid-cols-2 gap-3 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                      ALTURA (CM)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="130"
                        max="230"
                        value={intake.heightCm}
                        onChange={(e) =>
                          setIntake((prev) => ({
                            ...prev,
                            heightCm: Number(e.target.value) || 170,
                          }))
                        }
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">cm</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                      PESO ATUAL (KG)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="35"
                        max="250"
                        step="0.5"
                        value={intake.weightKg}
                        onChange={(e) =>
                          setIntake((prev) => ({
                            ...prev,
                            weightKg: Number(e.target.value) || 70,
                          }))
                        }
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">kg</span>
                    </div>
                  </div>
                </div>

                {currentStep === 2 && (
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <span>Confirmar Medidas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 3: LESÕES & PROBLEMAS DE SAÚDE */}
          {currentStep >= 3 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Dados computados!
                  </p>
                  <p className="text-cyan-400 font-medium">
                    Pergunta crucial de saúde: você tem alguma <strong>lesão, dor articular ou problema de saúde</strong> que eu deva proteger na escolha dos exercícios?
                  </p>
                  <p className="text-xs text-neutral-400">
                    Se você tiver dores no joelho, coluna ou ombro, a IA vai substituir automaticamente exercícios lesivos por variações seguras!
                  </p>
                </div>
              </div>

              <div className="pl-11 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: "Nenhuma restrição articular ou dor",
                      label: "100% Apto (Sem dores ou lesões)",
                      badge: "Treino livre com sobrecarga máxima",
                    },
                    {
                      id: "Dor no Joelho (Menisco / Tendão Patelar)",
                      label: "Joelho (Dor ao agachar / estalo)",
                      badge: "Elimina agachamento profundo e impacto",
                    },
                    {
                      id: "Dor na Coluna / Lombar (Hérnia de Disco)",
                      label: "Coluna / Lombar (Evitar peso axial)",
                      badge: "Substitui Levantamento Terra por apoio no peito",
                    },
                    {
                      id: "Dor no Ombro (Manguito Rotador / Pinçamento)",
                      label: "Ombro (Dor ao elevar ou empurrar)",
                      badge: "Substitui barra por halteres em pegada neutra",
                    },
                  ].map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => {
                        setIntake((prev) => ({ ...prev, healthIssues: issue.id }));
                        if (currentStep === 3) setCurrentStep(4);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        intake.healthIssues === issue.id
                          ? "bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10"
                          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{issue.label}</div>
                      <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                        {issue.badge}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom input for other health issues */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Outro problema de saúde? Digite aqui (ex: labirintite, punho)..."
                    value={customHealthText}
                    onChange={(e) => setCustomHealthText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                  {customHealthText.trim() && (
                    <button
                      onClick={() => {
                        setIntake((prev) => ({ ...prev, healthIssues: customHealthText.trim() }));
                        if (currentStep === 3) setCurrentStep(4);
                      }}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Aplicar
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* STEP 4: FREQUÊNCIA E LOCAL */}
          {currentStep >= 4 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Perfeito, vamos blindar sua rotina!
                  </p>
                  <p className="text-cyan-400 font-medium">
                    Quantos <strong>dias por semana</strong> você pode treinar e <strong>onde</strong> você treina?
                  </p>
                </div>
              </div>

              <div className="pl-11 space-y-3">
                <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 block mb-1.5">
                      DIAS DE TREINO NA SEMANA
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 4, 5, 6].map((days) => (
                        <button
                          key={days}
                          onClick={() => setIntake((prev) => ({ ...prev, trainingDays: days }))}
                          className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                            intake.trainingDays === days
                              ? "bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20"
                              : "bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          {days} Dias
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 block mb-1.5">
                      AMBIENTE DE TREINO
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Academia", "Casa", "Híbrido"] as const).map((env) => (
                        <button
                          key={env}
                          onClick={() => setIntake((prev) => ({ ...prev, environment: env }))}
                          className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            intake.environment === env
                              ? "bg-cyan-950/60 border border-cyan-500 text-cyan-300"
                              : "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          {env}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {currentStep === 4 && (
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <span>Próxima Pergunta (Dieta)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 5: PREFERÊNCIAS DE DIETA */}
          {currentStep >= 5 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Última pergunta para fechar o diagnóstico!
                  </p>
                  <p className="text-cyan-400 font-medium">
                    Como é a sua alimentação? Você tem alguma <strong>preferência ou restrição alimentar</strong> para o cálculo dos macronutrientes?
                  </p>
                </div>
              </div>

              <div className="pl-11 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Padrão (Como de tudo)",
                    "Sem Lactose",
                    "Sem Glúten",
                    "Vegetariano / Vegano",
                    "Low Carb / Cetogênica",
                    "Rica em Proteína",
                  ].map((diet) => (
                    <button
                      key={diet}
                      onClick={() => setIntake((prev) => ({ ...prev, dietaryPreference: diet }))}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                        intake.dietaryPreference === diet
                          ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold"
                          : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>

                {currentStep === 5 && (
                  <button
                    onClick={computeTailoredPlanAndDiet}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-neutral-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-cyan-500/25"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>GERAR MEU TREINO & DIETA COM IA AGORA</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 6: IA PROCESSANDO */}
          {currentStep === 6 && isGenerating && (
            <div className="p-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mx-auto animate-spin">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">
                  FORZON AI Coach Analisando Seus Dados...
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Calculando Taxa Metabólica Basal ({intake.weightKg}kg / {intake.heightCm}cm), distribuindo volume semanal de {intake.trainingDays} dias e blindando exercícios contra: "{intake.healthIssues}".
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-full text-[11px] font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Sintetizando Ficha de Exercícios e Metas de Calorias
              </div>
            </div>
          )}

          {/* STEP 7: RESULTADO COMPLETO */}
          {currentStep === 7 && generatedPlan && generatedNutrition && generatedRationale && (
            <div className="space-y-4 animate-fade-in">
              {/* Coach Diagnostic Message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Diagnóstico da IA Concluído com Sucesso!
                  </p>
                  <p>{generatedRationale.coachMessage}</p>
                </div>
              </div>

              {/* Nutrition Summary Cards */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Apple className="w-4 h-4 text-emerald-400" />
                    <span>Sua Dieta & Macronutrientes Diários</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {generatedRationale.deficitOrSurplus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-500 uppercase font-mono">Calorias</div>
                    <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                      {generatedNutrition.targetCalories} kcal
                    </div>
                  </div>
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-500 uppercase font-mono">Proteínas</div>
                    <div className="text-base font-black text-cyan-400 font-mono mt-0.5">
                      {generatedNutrition.targetProteinG}g
                    </div>
                  </div>
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-500 uppercase font-mono">Carboidratos</div>
                    <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                      {generatedNutrition.targetCarbsG}g
                    </div>
                  </div>
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-500 uppercase font-mono">Água Diária</div>
                    <div className="text-base font-black text-blue-400 font-mono mt-0.5 flex items-center justify-center gap-1">
                      <Droplets className="w-3.5 h-3.5" />
                      {generatedNutrition.waterGoalMl} ml
                    </div>
                  </div>
                </div>
              </div>

              {/* Workout Sessions Summary */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Dumbbell className="w-4 h-4 text-cyan-400" />
                    <span>Seu Novo Plano de Treino ({generatedPlan.sessions.length} Sessões)</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {intake.environment}
                  </span>
                </div>

                <div className="space-y-2">
                  {generatedPlan.sessions.map((sess, idx: number) => (
                    <div
                      key={sess.id || idx}
                      className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {sess.title || (sess as any).dayName} — {sess.muscleFocus || (sess as any).focus}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {sess.estimatedMinutes || (sess as any).estimatedDurationMin || 50} min · {sess.exercises?.length || 0} exercícios
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sess.exercises?.map((ex, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300"
                          >
                            {ex.name} ({ex.sets?.length || 3}x {ex.sets?.[0]?.targetReps || 10} reps)
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Joint Protection Callout */}
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2 text-xs text-neutral-300">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-400">Blindagem Articular Ativa: </span>
                    {generatedRationale.jointProtection}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleApplyToApp}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-xs sm:text-sm tracking-wider uppercase rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-5 h-5 fill-neutral-950" />
                  <span>APLICAR TREINO E DIETA NO MEU APP</span>
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refazer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

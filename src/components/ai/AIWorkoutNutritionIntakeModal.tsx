import { prepareGeneratedPlan } from "../../services/workoutPlanPolicy";
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
  Award,
  Trophy,
  Compass,
  Timer,
  Footprints,
  Play,
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
  ExperienceLevel,
  PostWorkoutCardioProtocol,
  Exercise,
} from "../../types";
import { resolveExerciseDetails } from "../../data/exercises";
import { ExerciseExecutionModal } from "../workout/ExerciseExecutionModal";
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
  experienceLevel: ExperienceLevel;
  heightCm: number;
  weightKg: number;
  healthIssues: string;
  trainingDays: number;
  environment: string;
  cardioMachine: "Escada" | "Esteira" | "Bicicleta" | "Misto";
  cardioMinutes: number;
  sports: string[];
  dietaryPreference: string;
}

export const AIWorkoutNutritionIntakeModal: React.FC<AIWorkoutNutritionIntakeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onPlanApplied,
}) => {
  // Step 1: Goal | Step 2: Experience Level | Step 3: Measurements | Step 4: Health/Injuries | Step 5: Days & Environment | Step 6: Post-Workout Cardio (Escada, Esteira, Bike) | Step 7: Other Sports | Step 8: Diet | Step 9: Generating | Step 10: Results
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [intake, setIntake] = useState<IntakeState>({
    goal: profile.mainGoal || "Ganhar Massa Muscular (Hipertrofia)",
    specificGoal: profile.specificGoal || "ganhar_massa",
    experienceLevel: profile.experienceLevel || "Intermediário",
    heightCm: profile.heightCm || 0,
    weightKg: profile.weightKg || 0,
    healthIssues: profile.injuriesOrNotes || "",
    trainingDays: profile.trainingDaysPerWeek || 4,
    environment: profile.environment || "Academia Comercial Completa",
    cardioMachine: "Misto",
    cardioMinutes: 20,
    sports: ["Musculação"],
    dietaryPreference: profile.dietaryPreference || "Padrão (Como de tudo)",
  });

  const [customHealthText, setCustomHealthText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [planningWarningsAccepted, setPlanningWarningsAccepted] = useState(false);
  useEffect(() => setPlanningWarningsAccepted(false), [generatedPlan]);
  const [generatedNutrition, setGeneratedNutrition] = useState<DailyNutrition | null>(null);
  const [generatedRationale, setGeneratedRationale] = useState<{
    tdee: number;
    deficitOrSurplus: string;
    jointProtection: string;
    coachMessage: string;
  } | null>(null);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentStep, isGenerating]);

  if (!isOpen) return null;

  // Scientific calculation of TDEE and tailored workouts based on conversation answers
  const computeTailoredPlanAndDiet = async () => {
    if (intake.heightCm < 100 || intake.heightCm > 250 || intake.weightKg < 25 || intake.weightKg > 350) { alert("Informe sua altura e peso antes de gerar o plano."); return; }
    setIsGenerating(true);
    setCurrentStep(9);

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
          experienceLevel: intake.experienceLevel,
          healthIssues: intake.healthIssues,
          trainingDays: intake.trainingDays,
          timePerSessionMin: profile.timePerSessionMin,
          environment: intake.environment,
          cardioMachine: intake.cardioMachine,
          cardioMinutes: intake.cardioMinutes,
          sports: intake.sports,
          dietaryPreference: intake.dietaryPreference,
          userName: profile.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.plan && data.nutrition) {
          const defaultCardios: PostWorkoutCardioProtocol[] = [
            {
              machine: "Escada",
              name: "Cardio Pós-Treino: Simulador de Escada (Stairmaster)",
              durationMin: 20,
              intensity: "Zona 2 (65-75% FC Máxima)",
              parameters: "Nível 7 a 9 contínuo, sem apoiar nas barras",
              estimatedKcal: 200,
              benefits: "Aceleração lipídica pós-treino, ativação de glúteos e preservação muscular.",
            },
            {
              machine: "Esteira",
              name: "Cardio Pós-Treino: Esteira Inclinada (Incline Treadmill Walk)",
              durationMin: 20,
              intensity: "Zona 2 (65-75% FC Máxima)",
              parameters: "Inclinação 10% a 12%, velocidade 5.2 a 5.6 km/h",
              estimatedKcal: 190,
              benefits: "Gasto calórico elevado, condicionamento aeróbico e zero estresse articular.",
            },
            {
              machine: "Bicicleta",
              name: "Cardio Pós-Treino: Bicicleta Ergométrica (Giro Leve Regenerativo)",
              durationMin: 20,
              intensity: "Recuperação Ativa & Flush de Lactato",
              parameters: "Cadência 80-90 RPM com carga leve/moderada (nível 4 a 5)",
              estimatedKcal: 150,
              benefits: "Recuperação muscular das pernas, remoção de lactato pós-leg press e oxigenação.",
            },
            {
              machine: "Escada",
              name: "Cardio Pós-Treino: Simulador de Escada ou Esteira HIIT",
              durationMin: 20,
              intensity: "Zona 2 / HIIT Aeróbico",
              parameters: "Nível 8 contínuo ou 10 tiros intervalados",
              estimatedKcal: 210,
              benefits: "Efeito metabólico EPOC acelerado por até 14 horas pós-treino.",
            },
          ];

          // Guarantee each session has cardioProtocol and final cardio exercise
          const sanitizedPlan = {
            ...data.plan,
            sessions: (data.plan.sessions || []).map((s: WorkoutSession, idx: number) => {
              const proto = s.cardioProtocol || defaultCardios[idx % defaultCardios.length];
              const liftingExs = (s.exercises || []).filter(
                (e) =>
                  e.targetMuscle !== "Cardio & Resistência" &&
                  !e.name.toLowerCase().includes("cardio") &&
                  !e.name.toLowerCase().includes("prancha")
              );

              const cardioEx: WorkoutExercise = {
                id: `ex-cardio-${idx + 1}`,
                exerciseId: `ex-cardio-${proto.machine.toLowerCase()}`,
                name: proto.name,
                targetMuscle: "Cardio & Resistência",
                restSeconds: 0,
                notes: `${proto.parameters} · ${proto.intensity}`,
                sets: [
                  {
                    id: `sc-ai-${idx + 1}-1`,
                    setNumber: 1,
                    type: "working",
                    weightKg: 0,
                    targetReps: proto.durationMin,
                    completed: false,
                  },
                ],
              };

              return {
                ...s,
                cardioProtocol: proto,
                exercises: [...liftingExs, cardioEx],
              };
            }),
          };

          setGeneratedPlan(prepareGeneratedPlan(sanitizedPlan, { ...profile, experienceLevel: intake.experienceLevel, cardioMinutes: intake.cardioMinutes, environment: intake.environment as UserProfile["environment"], injuriesOrNotes: intake.healthIssues, trainingDaysPerWeek: intake.trainingDays }));
          setGeneratedNutrition(data.nutrition);
          setGeneratedRationale(data.rationale);
          setIsGenerating(false);
          setCurrentStep(10);
          return;
        }
      }
    } catch {
      // Fallback to local physiological engine
    }

    // 2. Local High-Precision Physiological Formulation (Mifflin-St Jeor + Macro Partitioning + Real Heavy Routine + Integrated Cardio)
    setTimeout(() => {
      const weight = intake.weightKg;
      const height = intake.heightCm;
      const age = profile.birthYear ? new Date().getFullYear() - profile.birthYear : 26;

      // Basal Metabolic Rate (BMR)
      const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);

      // Activity multiplier adjusted for sports, cardio and experience
      const expMultiplier = intake.experienceLevel === "Atleta" ? 1.15 : intake.experienceLevel === "Avançado" ? 1.08 : 1.0;
      const cardioKcalPerSession = Math.round(intake.cardioMinutes * 9.5);
      const daysMultiplier = intake.trainingDays <= 3 ? 1.4 : intake.trainingDays <= 5 ? 1.6 : 1.78;
      const tdee = Math.round(bmr * daysMultiplier * expMultiplier + (cardioKcalPerSession * intake.trainingDays) / 7);

      let targetCalories = tdee;
      let deficitOrSurplus = "Manutenção Calórica e Recomposição Corporal";
      let proteinMultiplier = 2.0;

      if (intake.specificGoal === "ganhar_massa") {
        targetCalories = tdee + (intake.experienceLevel === "Iniciante" ? 400 : 350); // Superávit limpo
        deficitOrSurplus = `Superávit controlado de +350 kcal sobre seu gasto diário (${tdee} kcal)`;
        proteinMultiplier = 2.2;
      } else if (intake.specificGoal === "perder_gordura") {
        targetCalories = Math.max(1400, tdee - 450); // Déficit moderado sustentável
        deficitOrSurplus = `Déficit estratégico de -450 kcal para queima lipídica preservando massa magra`;
        proteinMultiplier = 2.3; // Maior aporte para poupar massa muscular
      } else if (intake.specificGoal === "forca_pura") {
        targetCalories = tdee + 300;
        deficitOrSurplus = `Superávit energético para suporte neural, recuperação de ATP-CP e ganho de força`;
        proteinMultiplier = 2.1;
      }

      const proteinG = Math.round(weight * proteinMultiplier);
      const fatG = Math.round(weight * 0.9);
      const remainingCals = Math.max(200, targetCalories - (proteinG * 4 + fatG * 9));
      const carbsG = Math.round(remainingCals / 4);
      const waterMl = Math.round(weight * 40);

      // Check joint protection logic
      const hasKneeIssue = intake.healthIssues.toLowerCase().includes("joelho");
      const hasBackIssue = intake.healthIssues.toLowerCase().includes("lombar") || intake.healthIssues.toLowerCase().includes("coluna");
      const hasShoulderIssue = intake.healthIssues.toLowerCase().includes("ombro");

      let jointProtection = "Articulações 100% livres para sobrecarga progressiva pesada.";
      if (hasKneeIssue) {
        jointProtection = "Proteção patelofemoral: agachamentos com peso axial livre substituídos por leg press em amplitude segura e foco na cadeia posterior. Cardio em bicicleta com baixa carga para preservar a patela.";
      } else if (hasBackIssue) {
        jointProtection = "Descompressão lombar: levantamento terra com barra e agachamentos pesados substituídos por remadas apoiadas no peito e leg press. Cardio na esteira inclinada sem impacto.";
      } else if (hasShoulderIssue) {
        jointProtection = "Proteção do manguito rotador: desenvolvimentos por trás eliminados, supinos executados com halteres em pegada neutra e face pulls adicionados.";
      }

      // Exercise calibration based on experience level
      const isAdvanced = intake.experienceLevel === "Avançado" || intake.experienceLevel === "Atleta";
      const isBeginner = intake.experienceLevel === "Iniciante";

      const compoundSets = isAdvanced ? 4 : isBeginner ? 3 : 4;
      const isolationSets = isAdvanced ? 4 : 3;

      const compoundReps = intake.specificGoal === "forca_pura" ? "5-6 reps" : isAdvanced ? "6-8 reps" : "8-10 reps";
      const isolationReps = isAdvanced ? "10-12 reps" : "12-15 reps";
      const restSecCompound = intake.specificGoal === "forca_pura" ? 120 : isAdvanced ? 90 : 75;
      const restSecIsolation = isAdvanced ? 60 : 45;

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
          weightKg: 0,
          targetReps: parseInt(reps) || 10,
          completed: false,
        })),
      });

      const sessions: WorkoutSession[] = [];
      const cardioMins = intake.cardioMinutes || 20;

      // SESSÃO A: PUSH (Peitoral, Ombros & Tríceps Completo) + CARDIO ESCADA
      const cardioA: PostWorkoutCardioProtocol = {
        machine: intake.cardioMachine === "Misto" ? "Escada" : intake.cardioMachine,
        name: intake.cardioMachine === "Bicicleta" ? "Cardio Pós-Treino: Bicicleta Ergométrica" : intake.cardioMachine === "Esteira" ? "Cardio Pós-Treino: Esteira Inclinada" : "Cardio Pós-Treino: Simulador de Escada",
        durationMin: cardioMins,
        intensity: "Zona 2 Constante (65-75% FC Máx)",
        parameters: intake.cardioMachine === "Bicicleta" ? "Cadência 80-85 RPM com carga moderada" : intake.cardioMachine === "Esteira" ? "Inclinação 10%, Velocidade 5.5 km/h" : "Nível 7 a 9 contínuo sem apoiar peso nas barras laterais",
        estimatedKcal: Math.round(cardioMins * 10),
        benefits: "Aceleração lipídica e preservação muscular pós-supino.",
      };

      sessions.push({
        id: `sess-ai-${Date.now()}-1`,
        title: "Treino A — Peito, Ombros & Tríceps Completo",
        dayLabel: "Dia 1",
        muscleFocus: hasShoulderIssue ? "Peito & Tríceps (Pegada Neutra / Proteção Escapular)" : "Peito, Ombros & Tríceps Completo",
        estimatedMinutes: 65 + cardioMins,
        warmupProtocol: "Mobilidade escapular dinâmica e rotação externa de manguito na polia (5 min)",
        cardioProtocol: cardioA,
        completedCount: 0,
        exercises: [
          buildExercise(
            hasShoulderIssue ? "Supino Inclinado com Halteres (Pegada Neutra)" : "Supino Reto com Barra Olímpica",
            "Peitoral",
            compoundSets,
            compoundReps,
            restSecCompound,
            hasShoulderIssue ? "Pegada neutra a 45° protegendo o manguito. Cadência 3s excêntrica." : "Barra descendo até a linha dos mamilos com escápulas aduzidas. RPE 8.5."
          ),
          buildExercise(
            "Supino Inclinado com Halteres no Banco 30°",
            "Peitoral",
            compoundSets,
            "8-10 reps",
            restSecCompound,
            "Foco na porção clavicular. Alongue completamente no ponto inferior."
          ),
          buildExercise(
            "Crossover na Polia Média ou Crucifixo Halteres",
            "Peitoral",
            isolationSets,
            isolationReps,
            restSecIsolation,
            "Pico de contração de 1 segundo espremendo o peitoral no centro."
          ),
          buildExercise(
            "Voador Peck Deck (Máquina)",
            "Peitoral",
            isolationSets,
            "10-12 reps",
            restSecIsolation,
            isAdvanced ? "Última série com drop-set de 30% da carga até a falha técnica." : "Controle a volta em 3 segundos."
          ),
          buildExercise(
            hasShoulderIssue ? "Elevação Lateral com Halteres no Banco Inclinado" : "Desenvolvimento Militar com Halteres",
            "Ombros",
            compoundSets,
            "8-10 reps",
            restSecCompound,
            "Tronco estabilizado no banco. Empurre sem travar os cotovelos."
          ),
          buildExercise(
            "Elevação Lateral na Polia ou com Halteres",
            "Ombros",
            isolationSets,
            "12-15 reps",
            restSecIsolation,
            "Foco na cabeça lateral do deltóide. Eleve até a linha do ombro sem encolher o pescoço."
          ),
          buildExercise(
            "Tríceps Corda na Polia Alta",
            "Tríceps",
            isolationSets,
            "10-12 reps",
            restSecIsolation,
            "Abra a corda no final da extensão com contração máxima da cabeça lateral."
          ),
          buildExercise(
            "Tríceps Testa com Barra W ou Halteres",
            "Tríceps",
            isolationSets,
            "10-12 reps",
            restSecIsolation,
            "Cotovelos apontados para o teto. Foco na cabeça longa do tríceps."
          ),
          // 9. Cardio Pós-Treino Integrado
          buildExercise(
            cardioA.name,
            "Cardio & Resistência",
            1,
            `${cardioA.durationMin} min`,
            0,
            `${cardioA.parameters} · ${cardioA.intensity}`
          ),
        ],
      });

      // SESSÃO B: PULL (Costas, Dorsais, Trapézio, Deltoide Posterior & Bíceps Completo) + CARDIO ESTEIRA INCLINADA
      const cardioB: PostWorkoutCardioProtocol = {
        machine: intake.cardioMachine === "Misto" ? "Esteira" : intake.cardioMachine,
        name: intake.cardioMachine === "Bicicleta" ? "Cardio Pós-Treino: Bicicleta Ergométrica" : intake.cardioMachine === "Escada" ? "Cardio Pós-Treino: Simulador de Escada" : "Cardio Pós-Treino: Esteira com Inclinação 10-12%",
        durationMin: cardioMins,
        intensity: "Zona 2 Metabólica (Incline Walk)",
        parameters: "Velocidade 5.2 a 5.8 km/h, inclinação de 10 a 12%, postura alinhada",
        estimatedKcal: Math.round(cardioMins * 9.5),
        benefits: "Estímulo cardiovascular sem impacto articular e ativação da cadeia posterior.",
      };

      sessions.push({
        id: `sess-ai-${Date.now()}-2`,
        title: "Treino B — Costas, Trapézio & Bíceps Completo",
        dayLabel: "Dia 2",
        muscleFocus: hasBackIssue ? "Costas & Bíceps (Apoio no Peito / Sem Tensão Lombar)" : "Dorsais, Trapézio, Deltoide Posterior & Bíceps",
        estimatedMinutes: 65 + cardioMins,
        warmupProtocol: "Mobilidade torácica dinâmica e ativação de latíssimo no elástico",
        cardioProtocol: cardioB,
        completedCount: 0,
        exercises: [
          buildExercise(
            hasBackIssue ? "Remada Apoiada no Peito (Chest-Supported Row)" : "Puxada Frontal Aberta na Polia",
            "Costas",
            compoundSets,
            compoundReps,
            restSecCompound,
            hasBackIssue ? "Peito apoiado no banco eliminando qualquer sobrecarga na coluna." : "Puxe direcionando os cotovelos em direção aos quadris."
          ),
          buildExercise(
            hasBackIssue ? "Puxada Triângulo no Pulley Alto" : "Remada Curvada com Barra Olímpica",
            "Costas",
            compoundSets,
            compoundReps,
            restSecCompound,
            "Tronco firme e adução completa das escápulas no final da puxada."
          ),
          buildExercise(
            "Remada Baixa na Polia com Triângulo",
            "Costas",
            compoundSets,
            "8-10 reps",
            restSecCompound,
            "Sinta o dorsal abrir na fase excêntrica e aperte as costas no final."
          ),
          buildExercise(
            "Pulldown no Cabo com Corda ou Barra Reta",
            "Costas",
            isolationSets,
            "12 reps",
            restSecIsolation,
            "Isolamento do grande dorsal com braços semi-estendidos."
          ),
          buildExercise(
            "Encolhimento de Ombros com Halteres (Trapézio)",
            "Costas",
            isolationSets,
            "12-15 reps",
            restSecIsolation,
            "Pausa de 2 segundos no ponto mais alto. Não faça rotação do ombro."
          ),
          buildExercise(
            "Crucifixo Invertido no Peck Deck ou Face Pull",
            "Ombros",
            isolationSets,
            "12-15 reps",
            restSecIsolation,
            "Deltóide posterior e rombóides. Essencial para postura e estabilidade."
          ),
          buildExercise(
            "Rosca Direta com Barra W",
            "Bíceps",
            compoundSets,
            "8-10 reps",
            restSecIsolation,
            "Cotovelos colados ao tronco, amplitude completa sem balanço lombar."
          ),
          buildExercise(
            "Rosca Martelo com Halteres no Banco 45°",
            "Bíceps",
            isolationSets,
            "10-12 reps",
            restSecIsolation,
            "Foco no braquial e braquiorradial para espessura e densidade do braço."
          ),
          // 9. Cardio Pós-Treino Integrado
          buildExercise(
            cardioB.name,
            "Cardio & Resistência",
            1,
            `${cardioB.durationMin} min`,
            0,
            `${cardioB.parameters} · ${cardioB.intensity}`
          ),
        ],
      });

      // SESSÃO C: LEGS (Quadríceps, Posterior de Coxa, Glúteos & Panturrilhas) + CARDIO BIKE REGENERATIVO
      const cardioC: PostWorkoutCardioProtocol = {
        machine: intake.cardioMachine === "Misto" ? "Bicicleta" : intake.cardioMachine,
        name: intake.cardioMachine === "Escada" ? "Cardio Pós-Treino: Simulador de Escada Leve" : intake.cardioMachine === "Esteira" ? "Cardio Pós-Treino: Caminhada na Esteira" : "Cardio Pós-Treino: Bicicleta Ergométrica (Giro Leve Regenerativo)",
        durationMin: Math.min(20, cardioMins),
        intensity: "Recuperação Ativa & Flush de Lactato",
        parameters: "Cadência fluida 80-90 RPM com carga leve (Nível 4-5) para soltar as pernas pós-leg press",
        estimatedKcal: Math.round(cardioMins * 8),
        benefits: "Remoção de lactato e metabólitos, oxigenação dos quadríceps e alívio da dor tardia.",
      };

      sessions.push({
        id: `sess-ai-${Date.now()}-3`,
        title: "Treino C — Pernas, Glúteos & Panturrilhas Completo",
        dayLabel: "Dia 3",
        muscleFocus: hasKneeIssue ? "Pernas & Glúteos (Proteção Patelar & Isquiotibiais)" : "Quadríceps, Glúteos, Posterior & Panturrilhas",
        estimatedMinutes: 65 + cardioC.durationMin,
        warmupProtocol: "Mobilidade profunda de tornozelo e quadril com agachamento corporal (5 min)",
        cardioProtocol: cardioC,
        completedCount: 0,
        exercises: [
          buildExercise(
            hasKneeIssue ? "Leg Press 45° (Pés Altos / Amplitude Segura)" : "Agachamento Livre com Barra Olímpica",
            "Pernas (Quadríceps)",
            compoundSets,
            hasKneeIssue ? "10-12 reps" : compoundReps,
            restSecCompound,
            hasKneeIssue ? "Pés mais altos na plataforma para aliviar a pressão patelar." : "Desça até quebrar o paralelo mantendo a coluna lombar travada."
          ),
          buildExercise(
            "Leg Press 45° Pesado",
            "Pernas (Quadríceps)",
            compoundSets,
            "8-10 reps",
            restSecCompound,
            "Carga progressiva. Não faça bloqueio articular dos joelhos no topo."
          ),
          buildExercise(
            "Cadeira Extensora",
            "Pernas (Quadríceps)",
            isolationSets,
            "12-15 reps",
            restSecIsolation,
            isAdvanced ? "Pausa isométrica de 2 segundos no topo em todas as repetições." : "Controle a descida."
          ),
          buildExercise(
            "Mesa Flexora ou Cadeira Flexora",
            "Pernas (Posterior)",
            compoundSets,
            "10-12 reps",
            restSecIsolation,
            "Quadril apoiado no banco sem compensação lombar."
          ),
          buildExercise(
            "Stiff com Barra ou Halteres",
            "Pernas (Posterior)",
            compoundSets,
            "8-10 reps",
            restSecCompound,
            "Coluna neutra, jogue o quadril para trás sentindo alongar o posterior."
          ),
          buildExercise(
            "Elevação Pélvica com Barra ou Máquina",
            "Glúteos",
            compoundSets,
            "10-12 reps",
            restSecCompound,
            "Pico de contração de 2 segundos com o glúteo travado no topo."
          ),
          buildExercise(
            "Panturrilha no Leg Press ou Gêmeos em Pé",
            "Panturrilhas",
            isAdvanced ? 5 : 4,
            "15-20 reps",
            restSecIsolation,
            "Alongamento máximo embaixo e contração máxima na ponta dos pés."
          ),
          buildExercise(
            "Gêmeos Sentado na Máquina (Músculo Solear)",
            "Panturrilhas",
            isolationSets,
            "12-15 reps",
            restSecIsolation,
            "Isolamento do músculo sóleo. Cadência lenta e controlada."
          ),
          // 9. Cardio Pós-Treino Regenerativo
          buildExercise(
            cardioC.name,
            "Cardio & Resistência",
            1,
            `${cardioC.durationMin} min`,
            0,
            `${cardioC.parameters} · ${cardioC.intensity}`
          ),
        ],
      });

      // SESSÃO D (Para 4+ dias na semana): DELTOIDES & BRAÇOS (SEM PRANCHA!) + CARDIO ESCADA/ESTEIRA
      if (intake.trainingDays >= 4) {
        const cardioD: PostWorkoutCardioProtocol = {
          machine: intake.cardioMachine === "Misto" ? "Escada" : intake.cardioMachine,
          name: intake.cardioMachine === "Bicicleta" ? "Cardio Pós-Treino: Bicicleta Ergométrica" : intake.cardioMachine === "Esteira" ? "Cardio Pós-Treino: Esteira Inclinada" : "Cardio Pós-Treino: Simulador de Escada (Stairmaster)",
          durationMin: cardioMins,
          intensity: "Zona 2 / Metabólico Intenso",
          parameters: "Ritmo constante sustentado para maximizar a queima calórica diária",
          estimatedKcal: Math.round(cardioMins * 10),
          benefits: "Elevação do metabolismo de repouso (EPOC) e condicionamento aeróbico.",
        };

        sessions.push({
          id: `sess-ai-${Date.now()}-4`,
          title: "Treino D — Ombros, Tríceps & Bíceps (Especialização)",
          dayLabel: "Dia 4",
          muscleFocus: "Deltóides 3D, Tríceps & Bíceps Especialização de Volume",
          estimatedMinutes: 60 + cardioD.durationMin,
          warmupProtocol: "Mobilidade escapular dinâmica e ativação de manguito rotador",
          cardioProtocol: cardioD,
          completedCount: 0,
          exercises: [
            buildExercise(
              "Desenvolvimento com Halteres no Banco 75°",
              "Ombros",
              compoundSets,
              "8-10 reps",
              restSecCompound,
              "Pegada pronada com subida forte e descida cadenciada até o queixo."
            ),
            buildExercise(
              "Elevação Lateral Unilateral no Cabo / Polia",
              "Ombros",
              isolationSets,
              "12-15 reps",
              restSecIsolation,
              "Tensão contínua proporcionada pelo cabo durante todo o arco do movimento."
            ),
            buildExercise(
              "Face Pull na Polia Alta com Rotação Externa",
              "Ombros",
              isolationSets,
              "15 reps",
              restSecIsolation,
              "Puxe na altura dos olhos abrindo as mãos para fortalecer deltóide posterior."
            ),
            buildExercise(
              "Supino Fechado com Barra (Close-Grip Bench Press)",
              "Tríceps",
              compoundSets,
              "8-10 reps",
              restSecCompound,
              "Mãos na largura dos ombros, cotovelos rentes ao tronco. Carga alta."
            ),
            buildExercise(
              "Tríceps Polia com Barra Reta ou V",
              "Tríceps",
              isolationSets,
              "10-12 reps",
              restSecIsolation,
              "Extensão máxima com punho firme sem descolar cotovelos do tronco."
            ),
            buildExercise(
              "Tríceps Francês no Cabo ou Halter Unilateral",
              "Tríceps",
              isolationSets,
              "10-12 reps",
              restSecIsolation,
              "Alongamento total da cabeça longa na fase excêntrica."
            ),
            buildExercise(
              "Rosca Scott no Banco ou na Máquina",
              "Bíceps",
              compoundSets,
              "8-10 reps",
              restSecIsolation,
              "Braço apoiado isolando 100% o bíceps no pico de contração."
            ),
            buildExercise(
              "Rosca Inclinada com Halteres no Banco 45°",
              "Bíceps",
              isolationSets,
              "10-12 reps",
              restSecIsolation,
              "Alongamento severo das fibras na posição inicial promovendo hipertrofia."
            ),
            // 9. Cardio Pós-Treino Integrado
            buildExercise(
              cardioD.name,
              "Cardio & Resistência",
              1,
              `${cardioD.durationMin} min`,
              0,
              `${cardioD.parameters} · ${cardioD.intensity}`
            ),
          ],
        });
      }

      // Adiciona sessões específicas para os demais esportes selecionados
      const hasRunning = intake.sports.some((s) => s.toLowerCase().includes("corrida"));
      const hasMartialArts = intake.sports.some((s) => s.toLowerCase().includes("luta") || s.toLowerCase().includes("jiu") || s.toLowerCase().includes("boxe") || s.toLowerCase().includes("muay"));
      const hasCross = intake.sports.some((s) => s.toLowerCase().includes("cross"));

      if (hasRunning) {
        sessions.push({
          id: `sess-ai-${Date.now()}-run`,
          title: "Sessão Cardio — Corrida de Rua & Ritmo Aeróbico",
          dayLabel: "Cardio",
          muscleFocus: "Resistência Cardiovascular & VO2 Max",
          estimatedMinutes: 45,
          warmupProtocol: "Mobilidade de tornozelo e trote leve (5 min)",
          completedCount: 0,
          exercises: [
            buildExercise("Trote Leve de Aquecimento", "Cardio & Resistência", 1, "10 min", 60, "Zona 2 regenerativa"),
            buildExercise("Tiros Intervalados de Alta Intensidade (HIIT)", "Cardio & Resistência", 5, "1 min tiro / 1 min trote", 60, "Tiro a 85-90% de FC máx"),
            buildExercise("Rodagem Contínua em Ritmo Firme", "Cardio & Resistência", 1, "20 min", 90, "Ritmo estável e cadência de ~170-180 passos/min"),
            buildExercise("Desaquecimento & Soltura de Panturrilha", "Mobilidade", 1, "5 min", 0, "Alongamento dinâmico e respiração profunda"),
          ],
        });
      }

      if (hasMartialArts) {
        sessions.push({
          id: `sess-ai-${Date.now()}-fight`,
          title: "Sessão Combate — Artes Marciais & Sparring",
          dayLabel: "Combate",
          muscleFocus: "Potência de Core, Pegada & Condicionamento Anaeróbico",
          estimatedMinutes: 60,
          warmupProtocol: "Polichinelos, rolamentos e mobilidade de punhos e pescoço",
          completedCount: 0,
          exercises: [
            buildExercise("Sombra / Golpes no Vazio com Esquivas", "Cardio & Resistência", 3, "3 min por round", 60, "Foco em velocidade de pés e rotação de tronco"),
            buildExercise("Trabalho Pesado em Saco de Pancadas", "Cardio & Resistência", 4, "3 min por round", 60, "Combinações de socos, chutes e joelhadas em potência máxima"),
            buildExercise("Drills de Solo / Passagem de Guarda ou Sparring", "Cardio & Resistência", 3, "5 min", 90, "Pressão isométrica e explosão de quadril"),
            buildExercise("Alongamento Específico para Adutores e Ombros", "Mobilidade", 1, "5 min", 0, "Prevenção de estiramentos pós-treino"),
          ],
        });
      }

      if (hasCross) {
        sessions.push({
          id: `sess-ai-${Date.now()}-cross`,
          title: "Sessão MetCon — Cross Training & WOD de Alta Potência",
          dayLabel: "WOD",
          muscleFocus: "Condicionamento Metabólico & Força Funcional",
          estimatedMinutes: 45,
          warmupProtocol: "Mobilidade com bastão de PVC e saltos leves (5 min)",
          completedCount: 0,
          exercises: [
            buildExercise("Kettlebell Swings Pesados", "Pernas (Posterior)", 4, "15 reps", 60, "Explosão de quadril com abdômen travado"),
            buildExercise("Wall Balls (Bola na Parede)", "Pernas (Quadríceps)", 4, "15 reps", 60, "Agachamento profundo e arremesso a 3 metros"),
            buildExercise("Box Jumps (Saltos na Caixa)", "Pernas (Quadríceps)", 4, "12 reps", 60, "Pouso suave com amortecimento nos joelhos"),
            buildExercise("Burpees Metabólicos", "Cardio & Resistência", 3, "15 reps", 45, "Ritmo constante sem pausas"),
          ],
        });
      }

      const plan: WorkoutPlan = {
        id: `plan-ai-${Date.now()}`,
        title: `FORZON Pro — ${intake.goal} (${intake.experienceLevel})`,
        description: `Periodização de elite calibrada para nível ${intake.experienceLevel} com exercícios de musculação com abdominais dinâmicos e volume ajustado ao tempo disponível + Cardio Pós-Treino (${intake.cardioMachine}) em ${intake.environment}. Zero pranchas e foco em sobrecarga progressiva real.`,
        frequencyDaysPerWeek: intake.trainingDays,
        active: true,
        updatedAt: new Date().toISOString(),
        sessions,
      };

      // Nutritional Plan tailored for experience, cardio and goal
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
            name: "Café da Manhã Anabólico",
            scheduledTime: "07:30",
            completed: false,
            foods: [
              {
                id: "f-1",
                name: "Ovos mexidos inteiros + claras",
                quantity: "4 ovos",
                calories: Math.round(targetCalories * 0.15),
                proteinG: Math.round(proteinG * 0.25),
                carbsG: 2,
                fatG: 15,
              },
              {
                id: "f-2",
                name: "Aveia em flocos com banana e mel",
                quantity: "80g aveia + 1 banana",
                calories: Math.round(targetCalories * 0.18),
                proteinG: 10,
                carbsG: Math.round(carbsG * 0.3),
                fatG: 5,
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
                quantity: "200g",
                calories: Math.round(targetCalories * 0.22),
                proteinG: Math.round(proteinG * 0.38),
                carbsG: 0,
                fatG: 8,
              },
              {
                id: "f-4",
                name: "Arroz branco ou batata doce com legumes e azeite",
                quantity: "220g",
                calories: Math.round(targetCalories * 0.18),
                proteinG: 6,
                carbsG: Math.round(carbsG * 0.4),
                fatG: 7,
              },
            ],
          },
          {
            id: "m-ai-3",
            name: "Lanche / Pré-Treino de Energia",
            scheduledTime: "16:30",
            completed: false,
            foods: [
              {
                id: "f-5",
                name: "Iogurte natural, whey protein e fruta",
                quantity: "1 porção + 1 scoop",
                calories: Math.round(targetCalories * 0.15),
                proteinG: Math.round(proteinG * 0.22),
                carbsG: Math.round(carbsG * 0.15),
                fatG: 4,
              },
            ],
          },
          {
            id: "m-ai-4",
            name: "Jantar Regenerativo",
            scheduledTime: "20:30",
            completed: false,
            foods: [
              {
                id: "f-6",
                name: "Tilápia grelhada ou patinho com salada rica",
                quantity: "200g",
                calories: Math.round(targetCalories * 0.2),
                proteinG: Math.round(proteinG * 0.25),
                carbsG: Math.round(carbsG * 0.15),
                fatG: 10,
              },
            ],
          },
        ],
      };

      setGeneratedPlan(prepareGeneratedPlan(plan, { ...profile, experienceLevel: intake.experienceLevel, cardioMinutes: intake.cardioMinutes, environment: intake.environment as UserProfile["environment"], injuriesOrNotes: intake.healthIssues, trainingDaysPerWeek: intake.trainingDays }));
      setGeneratedNutrition(nutrition);
      setGeneratedRationale({
        tdee,
        deficitOrSurplus,
        jointProtection,
        coachMessage: `Periodização de elite calibrada para nível ${intake.experienceLevel.toUpperCase()}! Todas as sessões de musculação possuem exercícios ajustados ao tempo disponível, incluindo abdominais dinâmicos + Bloco de Cardio Pós-Treino (${intake.cardioMachine}: ${cardioMins} min) com Escada, Esteira Inclinada e Bicicleta para otimizar o consumo de oxigênio e a recuperação muscular. Suas calorias foram fixadas em ${targetCalories} kcal diárias (${proteinG}g de proteína) compensando a musculação e o cardio.`,
      });

      setIsGenerating(false);
      setCurrentStep(10);
    }, 1500);
  };

  const handleApplyToApp = () => {
    if (!generatedPlan || !generatedNutrition) return;
    if (generatedPlan.sessions.some(s => s.planningWarnings?.length) && !planningWarningsAccepted) return;

    // 1. Update user profile
    const updatedProfile: UserProfile = {
      ...profile,
      experienceLevel: intake.experienceLevel,
      heightCm: intake.heightCm,
      weightKg: intake.weightKg,
      mainGoal: intake.goal,
      specificGoal: intake.specificGoal,
      trainingDaysPerWeek: intake.trainingDays,
      environment: intake.environment as any,
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
      particleCount: 100,
      spread: 75,
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
                  TREINADOR & NUTRIÇÃO PRO
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Prescrição de treino de verdade (musculação, abdominais dinâmicos + cardio: Escada, Esteira, Bike) e plano nutricional sob medida
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

        {/* Progress Bar (Steps 1 to 8) */}
        {currentStep <= 8 && (
          <div className="py-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
              <span>Etapa {currentStep} de 8</span>
              <span>{Math.round((currentStep / 8) * 100)}% Concluído</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.round((currentStep / 8) * 100)}%` }}
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
                Vou montar uma periodização de treino pesada de verdade (até 6 exercícios por sessão, com abdominais dinâmicos + cardio pós-treino prescrito) e uma dieta milimetricamente calculada para o seu corpo.
              </p>
              <p className="text-cyan-400 font-medium">
                1. Qual é o seu <strong>Objetivo Principal</strong> hoje?
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
                    desc: "Foco em sobrecarga progressiva, volume denso e ganho muscular.",
                    icon: <Dumbbell className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    id: "perder_gordura",
                    title: "Perder Gordura & Secar (Cutting)",
                    desc: "Déficit calórico estratégico com cardio focado preservando a massa magra.",
                    icon: <Flame className="w-4 h-4 text-amber-400" />,
                  },
                  {
                    id: "forca_pura",
                    title: "Força Bruta & Cargas Altas",
                    desc: "Foco em exercícios multiarticulares pesados e potência neuromuscular.",
                    icon: <Zap className="w-4 h-4 text-purple-400" />,
                  },
                  {
                    id: "recomposicao",
                    title: "Recomposição Corporal",
                    desc: "Perder gordura e construir massa muscular simultaneamente.",
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

          {/* STEP 2: NÍVEL DE EXPERIÊNCIA (INICIANTE, INTERMEDIÁRIO, AVANÇADO, ATLETA) */}
          {currentStep >= 2 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Excelente! Agora uma pergunta fundamental que define a densidade da sua rotina:
                  </p>
                  <p className="text-cyan-400 font-medium">
                    2. Qual é o seu <strong>Nível de Experiência</strong> com musculação e treinamento com pesos?
                  </p>
                  <p className="text-xs text-neutral-400">
                    Sua resposta calibra o número de séries, repetições, volume semanal e intensidade das técnicas (drop-sets, RPE, descansos):
                  </p>
                </div>
              </div>

              <div className="space-y-2 pl-11">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: "Iniciante" as ExperienceLevel,
                      title: "Iniciante",
                      period: "Até 6 meses",
                      desc: "Construindo base neural, aprendendo técnica dos movimentos e adaptação articular.",
                      badge: "Foco Técnico",
                      icon: <Activity className="w-4 h-4 text-cyan-400" />,
                    },
                    {
                      id: "Intermediário" as ExperienceLevel,
                      title: "Intermediário",
                      period: "6 meses a 2 anos",
                      desc: "Execução sólida, domínio dos exercícios compostos e prontidão para exercícios adequados à sua disponibilidade.",
                      badge: "Hipertrofia Sólida",
                      icon: <Dumbbell className="w-4 h-4 text-emerald-400" />,
                    },
                    {
                      id: "Avançado" as ExperienceLevel,
                      title: "Avançado",
                      period: "2 a 5 anos",
                      desc: "Treino pesado de verdade. Sobrecarga alta, divisão densa, RPE 8.5-9 e drop-sets nos isoladores.",
                      badge: "Alta Intensidade",
                      icon: <Flame className="w-4 h-4 text-amber-400" />,
                    },
                    {
                      id: "Atleta" as ExperienceLevel,
                      title: "Atleta / Bodybuilder Pro",
                      period: "5+ anos ou competidor",
                      desc: "Volume máximo recuperável, intensidade no limite, falha muscular controlada e densidade extrema.",
                      badge: "Cargas Extremas",
                      icon: <Trophy className="w-4 h-4 text-purple-400" />,
                    },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        setIntake((prev) => ({ ...prev, experienceLevel: lvl.id }));
                        if (currentStep === 2) setCurrentStep(3);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        intake.experienceLevel === lvl.id
                          ? "bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10"
                          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40"
                      }`}
                    >
                      <div className="mt-0.5">{lvl.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{lvl.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800 text-cyan-300">
                            {lvl.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Tempo: {lvl.period}</div>
                        <div className="text-[11px] text-neutral-300 mt-1 leading-snug">{lvl.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STEP 3: ALTURA E PESO */}
          {currentStep >= 3 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Perfeito! Nível <strong>{intake.experienceLevel}</strong> registrado.
                  </p>
                  <p className="text-cyan-400 font-medium">
                    3. Me informe suas medidas para o cálculo metabólico: qual é a sua <strong>Altura</strong> (cm) e seu <strong>Peso atual</strong> (kg)?
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

                {currentStep === 3 && (
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <span>Confirmar Medidas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 4: LESÕES & PROBLEMAS DE SAÚDE */}
          {currentStep >= 4 && (
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
                    4. Você tem alguma <strong>lesão, dor articular ou problema de saúde</strong> que eu deva proteger na escolha dos exercícios?
                  </p>
                  <p className="text-xs text-neutral-400">
                    Se você tiver dores no joelho, coluna ou ombro, a IA substitui automaticamente exercícios lesivos por variações seguras sem perder o peso e o estímulo:
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
                      badge: "Elimina impacto, usa Leg Press e Bike leve",
                    },
                    {
                      id: "Dor na Coluna / Lombar (Hérnia de Disco)",
                      label: "Coluna / Lombar (Evitar peso axial)",
                      badge: "Remadas com peito apoiado e esteira inclinada",
                    },
                    {
                      id: "Dor no Ombro (Manguito Rotador / Pinçamento)",
                      label: "Ombro (Dor ao elevar ou empurrar)",
                      badge: "Halteres em pegada neutra e face pull",
                    },
                  ].map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => {
                        setIntake((prev) => ({ ...prev, healthIssues: issue.id }));
                        if (currentStep === 4) setCurrentStep(5);
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
                        if (currentStep === 4) setCurrentStep(5);
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

          {/* STEP 5: FREQUÊNCIA SEMANAL E AMBIENTES DE TREINO */}
          {currentStep >= 5 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Perfeito, segurança articular garantida!
                  </p>
                  <p className="text-cyan-400 font-medium">
                    5. Quantos <strong>dias por semana</strong> você pode treinar e qual é o seu <strong>ambiente de treino principal</strong>?
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
                      AMBIENTE & ESTRUTURA DE TREINO
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          id: "Academia Comercial Completa",
                          name: "Academia Comercial Completa",
                          desc: "Smart Fit, BlueFit, Ironberg, etc. Barras, anilhas, polias e máquinas.",
                          badge: "Estrutura Total",
                        },
                        {
                          id: "Box de CrossFit / Funcional",
                          name: "Box de CrossFit / Funcional",
                          desc: "Barras olímpicas, anilhas bumper, kettlebells, cordas e caixas.",
                          badge: "Box & WOD",
                        },
                        {
                          id: "Home Gym Equipado",
                          name: "Home Gym Equipado",
                          desc: "Gaiola / rack de agachamento, banco articulado, barra e anilhas em casa.",
                          badge: "Home Gym Pro",
                        },
                        {
                          id: "Calistenia & Parque ao Ar Livre",
                          name: "Calistenia & Barras ao Ar Livre",
                          desc: "Barras fixas, paralelas, argolas olímpicas e street workout.",
                          badge: "Peso Corporal",
                        },
                        {
                          id: "Centro de Lutas / Dojô / Tatame",
                          name: "Centro de Lutas / Tatame",
                          desc: "Sacos de pancadas, tatame de solo e preparação de combate.",
                          badge: "Artes Marciais",
                        },
                        {
                          id: "Clube Esportivo / Pista de Atletismo",
                          name: "Clube Esportivo / Pista",
                          desc: "Pista de corrida, piscina, campo e sala de musculação.",
                          badge: "Poliesportivo",
                        },
                        {
                          id: "Em Casa (Halteres & Elásticos)",
                          name: "Em Casa (Halteres & Elásticos)",
                          desc: "Halteres ajustáveis, elásticos de resistência e banco regulável.",
                          badge: "Residencial",
                        },
                        {
                          id: "Treino Híbrido (Academia + Esportes)",
                          name: "Treino Híbrido (Academia + Esportes)",
                          desc: "Musculação pesada combinada com corrida, natação, lutas ou quadra.",
                          badge: "Multimodal",
                        },
                      ].map((env) => (
                        <button
                          key={env.id}
                          onClick={() => setIntake((prev) => ({ ...prev, environment: env.id }))}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            intake.environment === env.id
                              ? "bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-500/10"
                              : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{env.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-cyan-300">
                              {env.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{env.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {currentStep === 5 && (
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <span>Próxima Pergunta (Cardio Pós-Treino)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 6: CARDIO PÓS-TREINO (ESCADA, ESTEIRA, BICICLETA) */}
          {currentStep >= 6 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Perfeito! Agora um ponto essencial para condicionamento e secar com eficiência:
                  </p>
                  <p className="text-cyan-400 font-medium">
                    6. Qual é a sua preferência de <strong>Cardio Pós-Treino</strong> (Escada, Esteira, Bicicleta) e quantos minutos por dia?
                  </p>
                  <p className="text-xs text-neutral-400">
                    A IA vai anexar o protocolo exato de cardio (velocidade, nível, inclinação e cadência) no final de cada uma das suas fichas de musculação:
                  </p>
                </div>
              </div>

              <div className="pl-11 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: "Escada" as const,
                      title: "Simulador de Escada (Stairmaster)",
                      desc: "Altíssima queima calórica, foco em glúteos e condicionamento sem impacto nos joelhos.",
                      badge: "Máxima Queima",
                      icon: <Footprints className="w-4 h-4 text-emerald-400" />,
                    },
                    {
                      id: "Esteira" as const,
                      title: "Esteira (Inclinada / Caminhada Firme)",
                      desc: "Zona 2 metabólica (inclinação 10-12% a 5.5 km/h) sem impacto articular.",
                      badge: "Zona 2 Lipídica",
                      icon: <Timer className="w-4 h-4 text-cyan-400" />,
                    },
                    {
                      id: "Bicicleta" as const,
                      title: "Bicicleta Ergométrica / Spinning",
                      desc: "Zero impacto, excelente para drenar lactato das pernas e saúde cardiovascular.",
                      badge: "Zero Impacto",
                      icon: <Activity className="w-4 h-4 text-amber-400" />,
                    },
                    {
                      id: "Misto" as const,
                      title: "Cardio Misto / Alternado (Recomendado)",
                      desc: "Escada no Treino A (Push), Esteira no Treino B (Pull) e Bike leve regenerativa no Treino C (Legs).",
                      badge: "Periodizado",
                      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
                    },
                  ].map((cardio) => (
                    <button
                      key={cardio.id}
                      type="button"
                      onClick={() => setIntake((prev) => ({ ...prev, cardioMachine: cardio.id }))}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        intake.cardioMachine === cardio.id
                          ? "bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-500/10"
                          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div className="mt-0.5">{cardio.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{cardio.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-300">
                            {cardio.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-1 leading-snug">{cardio.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Cardio Duration Selector */}
                <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Duração do Cardio Pós-Treino:</span>
                    <span className="text-[11px] text-neutral-400">Tempo recomendado após a musculação</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[15, 20, 25, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setIntake((prev) => ({ ...prev, cardioMinutes: mins }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                          intake.cardioMinutes === mins
                            ? "bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20"
                            : "bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {currentStep === 6 && (
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <span>Próxima Pergunta (Demais Esportes)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 7: DEMAIS ESPORTES & MODALIDADES PRATICADAS */}
          {currentStep >= 7 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Cardio configurado! E sobre outras atividades físicas externas?
                  </p>
                  <p className="text-cyan-400 font-medium">
                    7. Além da musculação e do cardio de academia, quais <strong>outros esportes</strong> você pratica ou quer integrar?
                  </p>
                  <p className="text-xs text-neutral-400">
                    Selecione as modalidades. A IA prescreverá blocos específicos e calibrará seu gasto calórico total:
                  </p>
                </div>
              </div>

              <div className="pl-11 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "Musculação", name: "Musculação & Hipertrofia", desc: "Base de força, halteres, barras e polias", badge: "Base Força" },
                    { id: "Corrida de Rua", name: "Corrida de Rua / Outdoor", desc: "Tiros, 5k, 10k, endurance e VO2 Max", badge: "Endurance" },
                    { id: "Ciclismo / Bike", name: "Ciclismo & Bike Outdoor", desc: "Estrada, spinning, MTB e pernas", badge: "Cardio Bike" },
                    { id: "Lutas & Artes Marciais", name: "Lutas (Jiu-Jitsu, Boxe, Muay Thai)", desc: "Potência de core, rounds e combate", badge: "Artes Marciais" },
                    { id: "Natação", name: "Natação", desc: "Cardio e pulmão sem impacto articular", badge: "Zero Impacto" },
                    { id: "Cross Training", name: "Cross Training / Funcional", desc: "WODs intensos, agilidade e força", badge: "Metabólico" },
                    { id: "Futebol / Beach Tennis", name: "Futebol, Beach Tennis & Quadra", desc: "Esporte coletivo, pliometria e reflexo", badge: "Agilidade" },
                    { id: "Yoga & Mobilidade", name: "Yoga & Mobilidade Articular", desc: "Flexibilidade, respiração e postura", badge: "Recuperação" },
                  ].map((sport) => {
                    const isSelected = intake.sports.includes(sport.id);
                    return (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => {
                          setIntake((prev) => {
                            const exists = prev.sports.includes(sport.id);
                            if (exists) {
                              if (prev.sports.length === 1) return prev;
                              return { ...prev, sports: prev.sports.filter((s) => s !== sport.id) };
                            } else {
                              return { ...prev, sports: [...prev.sports, sport.id] };
                            }
                          });
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          isSelected
                            ? "bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-500/10"
                            : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sport.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-800 text-cyan-300">
                              {sport.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">{sport.desc}</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${
                            isSelected
                              ? "bg-cyan-500 border-cyan-400 text-neutral-950 font-black text-xs"
                              : "border-neutral-700 bg-neutral-950"
                          }`}
                        >
                          {isSelected && "✓"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-neutral-400">
                    {intake.sports.length} modalidade(s) selecionada(s)
                  </span>
                  {currentStep === 7 && (
                    <button
                      onClick={() => setCurrentStep(8)}
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      <span>Próxima Pergunta (Dieta)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* STEP 8: PREFERÊNCIAS DE DIETA */}
          {currentStep >= 8 && (
            <>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5 max-w-[90%]">
                  <p className="font-semibold text-white">
                    Última pergunta para fechar o diagnóstico de alta precisão!
                  </p>
                  <p className="text-cyan-400 font-medium">
                    8. Como é a sua alimentação? Você tem alguma <strong>preferência ou restrição alimentar</strong> para o cálculo dos macronutrientes?
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

                {currentStep === 8 && (
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

          {/* STEP 9: IA PROCESSANDO */}
          {currentStep === 9 && isGenerating && (
            <div className="p-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mx-auto animate-spin">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">
                  FORZON AI Coach Analisando Seus Dados...
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Calculando Taxa Metabólica Basal ({intake.weightKg}kg / {intake.heightCm}cm), prescrevendo rotina de nível <strong>{intake.experienceLevel}</strong> com exercícios ajustados ao tempo disponível, incluindo abdominais dinâmicos + Cardio Pós-Treino ({intake.cardioMachine}: Escada, Esteira, Bike), integrando ({intake.sports.join(", ")}) e eliminando pranchas.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-full text-[11px] font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Sintetizando Ficha de Exercícios, Protocolo de Cardio e Dieta
              </div>
            </div>
          )}

          {/* STEP 10: RESULTADO COMPLETO */}
          {currentStep === 10 && generatedPlan && generatedNutrition && generatedRationale && (
            <div className="space-y-4 animate-fade-in">
              {/* Coach Diagnostic Message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 space-y-1.5">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Treino de Verdade com Cardio & Dieta Concluídos!
                  </p>
                  <p>
                    Plano com {generatedPlan.sessions.length} sessões, ajustado ao tempo disponível.
                    {' '}Os grupos musculares e exercícios estão detalhados abaixo.
                    {' '}{generatedPlan.sessions.filter(s => s.exercises.some(e => /abd|core/i.test(e.targetMuscle))).length} sessões incluem abdominais dinâmicos.
                    {' '}Cardio pós-treino: {generatedPlan.sessions.filter(s => s.cardioProtocol).map(s => `${s.dayLabel}: ${s.cardioProtocol!.durationMin} min de ${s.cardioProtocol!.machine}`).join('; ') || 'não incluído neste plano'}.
                  </p>
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
                    <div className="text-[10px] text-neutral-500 uppercase font-mono">Gorduras</div>
                    <div className="text-base font-black text-purple-400 font-mono mt-0.5">
                      {generatedNutrition.targetFatG}g
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1 border-t border-neutral-800">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Meta de Hidratação Diária:</span>
                  <strong className="text-white font-mono">{generatedNutrition.waterGoalMl} ml</strong>
                </div>
              </div>

              {/* Workout Routine Preview */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Dumbbell className="w-4 h-4 text-cyan-400" />
                    <span>Seu Novo Plano de Treino ({generatedPlan.sessions.length} Sessões)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Nível: {intake.experienceLevel}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                      {intake.environment}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {generatedPlan.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{sess.title}</span>
                            <span className="text-[10px] text-neutral-400 font-normal hidden sm:inline">
                              — {sess.muscleFocus}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="text-neutral-400">{sess.estimatedMinutes} min</span>
                          <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {sess.exercises.length} exercícios
                          </span>
                        </div>
                      </div>

                      {/* Exercises Grid - Clickable to open execution video */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                          <span>Exercícios ({sess.exercises.length}) · Clique para ver o vídeo da execução:</span>
                          <span className="text-cyan-400 font-bold">▶ Vídeo Disponível</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {sess.exercises.map((ex, idx) => {
                            const isCardio =
                              ex.targetMuscle === "Cardio & Resistência" ||
                              ex.name.toLowerCase().includes("cardio") ||
                              ex.name.toLowerCase().includes("escada") ||
                              ex.name.toLowerCase().includes("esteira") ||
                              ex.name.toLowerCase().includes("bicicleta");

                            return (
                              <button
                                key={ex.id || idx}
                                type="button"
                                onClick={() => {
                                  const details = resolveExerciseDetails(ex.name || ex.exerciseId, ex.targetMuscle);
                                  setSelectedExerciseForModal(details);
                                }}
                                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] transition-all cursor-pointer group text-left ${
                                  isCardio
                                    ? "bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 font-bold shadow-sm shadow-cyan-500/10"
                                    : "bg-neutral-950/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-emerald-500/50 text-neutral-200"
                                }`}
                                title="Clique para ver o vídeo explicativo da execução"
                              >
                                <span className="font-medium truncate pr-2 flex items-center gap-1.5">
                                  {isCardio ? (
                                    <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
                                  ) : (
                                    <span className="text-neutral-500 font-mono text-[10px] group-hover:text-emerald-400">{idx + 1}.</span>
                                  )}
                                  <span className="truncate group-hover:text-emerald-300 transition-colors">{ex.name}</span>
                                </span>
                                <span className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                                  <span className="text-cyan-400 font-bold">
                                    {isCardio
                                      ? `${ex.sets?.[0]?.targetReps || 20} min`
                                      : `${ex.sets?.length || 4}x ${ex.sets?.[0]?.targetReps || "8-10"}`}
                                  </span>
                                  <Play className="w-2.5 h-2.5 text-neutral-500 group-hover:text-emerald-400 fill-current" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cardio Protocol Card */}
                      {sess.cardioProtocol && (
                        <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs">
                          <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-white text-[11px]">
                                {sess.cardioProtocol.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                                  {sess.cardioProtocol.durationMin} MIN · ~{sess.cardioProtocol.estimatedKcal} KCAL
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const details = resolveExerciseDetails(sess.cardioProtocol!.name, "Cardio & Resistência");
                                    setSelectedExerciseForModal(details);
                                  }}
                                  className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  <span>Vídeo</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-[10px] text-neutral-300 mt-0.5">
                              {sess.cardioProtocol.parameters} ({sess.cardioProtocol.intensity})
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {generatedPlan.sessions.some(s => s.planningWarnings?.length) && (
                <div className="rounded-xl border border-amber-400/40 bg-amber-950/30 p-4 text-sm text-amber-100 space-y-3">
                  <p className="font-bold">Revise o tempo e a distribuição antes de aplicar</p>
                  {generatedPlan.sessions.filter(s => s.planningWarnings?.length).map(s => (
                    <div key={s.id}><strong>{s.dayLabel}</strong>{s.planningWarnings!.map((warning, i) => <p key={i}>{warning}</p>)}</div>
                  ))}
                  <label className="flex gap-2 items-start cursor-pointer">
                    <input type="checkbox" checked={planningWarningsAccepted} onChange={e => setPlanningWarningsAccepted(e.target.checked)} className="mt-1" />
                    <span>Revisei os avisos e aceito aplicar este plano com as durações e limitações informadas. Posso refazer a avaliação para mudar a divisão.</span>
                  </label>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleApplyToApp}
                  disabled={generatedPlan.sessions.some(s => s.planningWarnings?.length) && !planningWarningsAccepted}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-neutral-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APLICAR TREINO & DIETA AO FORZON</span>
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refazer Diagnóstico</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exercise Video Demonstration & Technique Modal */}
      {selectedExerciseForModal && (
        <ExerciseExecutionModal
          exercise={selectedExerciseForModal}
          isOpen={Boolean(selectedExerciseForModal)}
          onClose={() => setSelectedExerciseForModal(null)}
        />
      )}
    </div>
  );
};

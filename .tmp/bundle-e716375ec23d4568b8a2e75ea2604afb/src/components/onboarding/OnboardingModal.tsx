import React, { useState } from "react";
import {
  X,
  Check,
  Sparkles,
  Dumbbell,
  Compass,
  Flame,
  Shield,
  ArrowRight,
  ArrowLeft,
  Target,
  Zap,
  Activity,
  Heart,
  Scale,
} from "lucide-react";
import { UserProfile, ExperienceLevel, AthleteSpecificGoal } from "../../types";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onTriggerPlanGeneration: (profile: UserProfile) => void;
}

interface SpecificGoalOption {
  id: AthleteSpecificGoal;
  title: string;
  tagline: string;
  scientificFocus: string;
  repRangeTarget: string;
  restIntervalSeconds: number;
  metabolicFocus: "tensão_mecanica" | "estresse_metabolico" | "capacidade_mitocondrial" | "queima_lipidica";
  icon: React.ReactNode;
  accentColor: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onTriggerPlanGeneration,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(currentProfile.name);
  const [weightKg, setWeightKg] = useState(currentProfile.weightKg);
  const [heightCm, setHeightCm] = useState(currentProfile.heightCm);
  const [mainGoal, setMainGoal] = useState(currentProfile.mainGoal || "Hipertrofia e Ganho de Massa Muscular");
  
  // Specific athlete goal calibration state
  const [specificGoal, setSpecificGoal] = useState<AthleteSpecificGoal>(
    currentProfile.specificGoal || "ganhar_massa"
  );
  const [targetFocusArea, setTargetFocusArea] = useState<string>("Corpo Inteiro (Simetria)");

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(currentProfile.experienceLevel);
  const [trainingDays, setTrainingDays] = useState(currentProfile.trainingDaysPerWeek);
  const [timePerSession, setTimePerSession] = useState(currentProfile.timePerSessionMin);
  const [environment, setEnvironment] = useState(currentProfile.environment);
  const [dietaryPreference, setDietaryPreference] = useState(currentProfile.dietaryPreference);
  const [injuries, setInjuries] = useState(currentProfile.injuriesOrNotes);

  if (!isOpen) return null;

  const specificGoalOptions: SpecificGoalOption[] = [
    {
      id: "ganhar_massa",
      title: "Ganhar Massa Muscular (Hipertrofia)",
      tagline: "Hipertrofia Miofibrilar & Densidade",
      scientificFocus: "Sobrecarga progressiva, tempo sob tensão de 40-50s e RPE 8-9.",
      repRangeTarget: "8 - 12 reps",
      restIntervalSeconds: 90,
      metabolicFocus: "tensão_mecanica",
      icon: <Dumbbell className="w-5 h-5 text-emerald-400" />,
      accentColor: "border-emerald-500 bg-emerald-950/30 text-emerald-400",
    },
    {
      id: "perder_gordura",
      title: "Perder Gordura & Secar (Cutting)",
      tagline: "Densidade Metabólica & EPOC",
      scientificFocus: "Super-séries, intervalos curtos e manutenção da massa magra sob déficit.",
      repRangeTarget: "12 - 15 reps",
      restIntervalSeconds: 45,
      metabolicFocus: "queima_lipidica",
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      accentColor: "border-amber-500 bg-amber-950/30 text-amber-400",
    },
    {
      id: "forca_pura",
      title: "Força Bruta & Recrutamento Neural (Power)",
      tagline: "Recrutamento de Unidades Motoras Rápidas",
      scientificFocus: "Cargas submáximas (>85% 1RM), exercícios básicos multiarticulares e recuperação completa do SNC.",
      repRangeTarget: "3 - 5 reps",
      restIntervalSeconds: 180,
      metabolicFocus: "tensão_mecanica",
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      accentColor: "border-purple-500 bg-purple-950/30 text-purple-400",
    },
    {
      id: "resistencia",
      title: "Resistência & Capacidade Muscular (Endurance)",
      tagline: "Densidade Mitocondrial & Vascularização",
      scientificFocus: "Resistência ao lactato sanguíneo, cadência rítmica e capacidade cardiovascular integrada.",
      repRangeTarget: "15 - 25 reps",
      restIntervalSeconds: 45,
      metabolicFocus: "capacidade_mitocondrial",
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      accentColor: "border-cyan-500 bg-cyan-950/30 text-cyan-400",
    },
    {
      id: "recomposicao",
      title: "Recomposição Corporal (Gordura -> Músculo)",
      tagline: "Estímulo Ondulatório Concorrente",
      scientificFocus: "Equilíbrio entre blocos de tensão mecânica alta e estímulos metabólicos de alta frequência.",
      repRangeTarget: "8 - 15 reps (Ondulatório)",
      restIntervalSeconds: 60,
      metabolicFocus: "estresse_metabolico",
      icon: <Scale className="w-5 h-5 text-blue-400" />,
      accentColor: "border-blue-500 bg-blue-950/30 text-blue-400",
    },
  ];

  const currentSelectedOption =
    specificGoalOptions.find((g) => g.id === specificGoal) || specificGoalOptions[0];

  const handleFinish = () => {
    const updated: UserProfile = {
      ...currentProfile,
      name,
      weightKg,
      heightCm,
      mainGoal: currentSelectedOption.title,
      specificGoal,
      goalCalibration: {
        repRangeTarget: currentSelectedOption.repRangeTarget,
        restIntervalSeconds: currentSelectedOption.restIntervalSeconds,
        metabolicFocus: currentSelectedOption.metabolicFocus,
      },
      experienceLevel,
      trainingDaysPerWeek: trainingDays,
      timePerSessionMin: timePerSession,
      environment,
      dietaryPreference,
      injuriesOrNotes: injuries,
    };
    onSaveProfile(updated);
    onTriggerPlanGeneration(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <div className="text-xs text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Onboarding do Atleta · Etapa {step} de 4</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">
              {step === 1 && "Biometria & Dados Básicos"}
              {step === 2 && "Objetivo Específico & Calibração IA"}
              {step === 3 && "Rotina & Ambiente de Treino"}
              {step === 4 && "Nutrição & Prescrição Final"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Physical & Personal Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Nome Completo ou Como Prefere Ser Chamado:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Peso Corporal Atual (kg):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Estatura / Altura (cm):
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 175)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-neutral-950/70 p-3.5 rounded-2xl border border-neutral-800 text-neutral-400 leading-relaxed text-[11px]">
              Estes parâmetros biométricos são sincronizados com a taxa de metabolismo basal e permitem calibrar o cálculo de tonelagem e volume semanal ótimo do atleta.
            </div>
          </div>
        )}

        {/* Step 2: Specific Athlete Goals & Prompt Calibration */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-neutral-200 font-bold flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Qual o seu objetivo biomecânico e fisiológico específico?</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">Calibração do Algoritmo</span>
              </div>
              <p className="text-neutral-400 text-[11px] mb-3">
                A IA do FORZON ajustará a faixa de repetições, tempos de descanso e volume de séries estritamente de acordo com esta escolha:
              </p>

              <div className="space-y-2.5">
                {specificGoalOptions.map((opt) => {
                  const isSelected = specificGoal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSpecificGoal(opt.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? `border-emerald-500 bg-emerald-950/30 text-white ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/50`
                          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-300"
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 shrink-0 mt-0.5">
                        {opt.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-white">{opt.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-emerald-300 font-semibold shrink-0">
                            {opt.repRangeTarget}
                          </span>
                        </div>

                        <div className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                          {opt.tagline}
                        </div>

                        <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                          {opt.scientificFocus}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-neutral-400 border-t border-neutral-800/60 pt-1.5">
                          <span>Descanso: <strong className="text-white">{opt.restIntervalSeconds}s</strong></span>
                          <span>·</span>
                          <span>Foco: <strong className="text-emerald-400">{opt.metabolicFocus.replace("_", " ")}</strong></span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Emphasis Area */}
            <div className="pt-2">
              <label className="block text-neutral-300 font-semibold mb-1.5">
                Ênfase Muscular Prioritária:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  "Corpo Inteiro (Simetria)",
                  "Peitoral & Deltóides",
                  "Dorsal & Trapézio",
                  "Quadríceps & Glúteos",
                  "Posteriores & Panturrilhas",
                  "Core & Resistência",
                ].map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setTargetFocusArea(area)}
                    className={`p-2 rounded-xl border text-center text-[11px] font-medium transition-colors cursor-pointer ${
                      targetFocusArea === area
                        ? "bg-emerald-500 text-neutral-950 font-bold border-emerald-400"
                        : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Training Environment & Schedule */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Nível de Experiência do Atleta:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["Iniciante", "Intermediário", "Avançado", "Atleta"] as ExperienceLevel[]).map(
                  (lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`p-2.5 rounded-xl border text-center font-medium transition-colors cursor-pointer ${
                        experienceLevel === lvl
                          ? "bg-emerald-500 text-neutral-950 font-bold"
                          : "bg-neutral-950 border-neutral-800 text-neutral-300"
                      }`}
                    >
                      {lvl}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Frequência Semanal:
                </label>
                <select
                  value={trainingDays}
                  onChange={(e) => setTrainingDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {[2, 3, 4, 5, 6].map((d) => (
                    <option key={d} value={d}>
                      {d} dias / semana
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Duração por Sessão:
                </label>
                <select
                  value={timePerSession}
                  onChange={(e) => setTimePerSession(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={30}>30 minutos (Express)</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (Padrão)</option>
                  <option value={75}>75 minutos</option>
                  <option value={90}>90 minutos (Volume Alto)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Ambiente de Treino:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["Academia", "Casa", "Ao Ar Livre", "Híbrido"] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-colors cursor-pointer ${
                      environment === env
                        ? "bg-emerald-950/40 border-emerald-500 text-white font-semibold"
                        : "bg-neutral-950 border-neutral-800 text-neutral-300"
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Lesões ou Restrições Articulares (Importante):
              </label>
              <input
                type="text"
                placeholder="Ex: dor no ombro direito, condromalácia patelar, lombalgia..."
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Diet & Plan Confirmation */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Preferência Alimentar:
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Equilibrada (Foco em Alta Proteína)">Equilibrada (Foco em Alta Proteína)</option>
                <option value="Low Carb / Cetogênica">Low Carb / Cetogênica</option>
                <option value="Vegetariana">Vegetariana com Ovos e Laticínios</option>
                <option value="Vegana (100% Plant-Based)">Vegana (100% Plant-Based)</option>
                <option value="Sem Glúten & Sem Lactose">Sem Glúten & Sem Lactose</option>
              </select>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2.5">
              <div className="font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Prescrição IA Calibrada FORZON</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  PROMPT OTIMIZADO
                </span>
              </div>

              <div className="space-y-1.5 text-neutral-300 font-mono text-[11px]">
                <div>· Atleta: <strong className="text-white">{name}</strong> ({weightKg}kg · {heightCm}cm)</div>
                <div>· Objetivo Fisiológico: <strong className="text-emerald-400">{currentSelectedOption.title}</strong></div>
                <div>· Calibração de Repetições: <strong className="text-white">{currentSelectedOption.repRangeTarget}</strong></div>
                <div>· Intervalo de Descanso: <strong className="text-white">{currentSelectedOption.restIntervalSeconds}s</strong> ({currentSelectedOption.metabolicFocus})</div>
                <div>· Frequência & Local: <strong className="text-white">{trainingDays} dias/sem</strong> ({timePerSession} min) em {environment}</div>
                <div>· Restrições: <strong className="text-amber-400">{injuries || "Nenhuma informada"}</strong></div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400">
              Ao clicar abaixo, o motor de inteligência artificial gerará sua periodização semanal completa respeitando exatamente a faixa de repetições e a densidade metabólica configuradas.
            </p>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>GERAR PLANO INDIVIDUALIZADO</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


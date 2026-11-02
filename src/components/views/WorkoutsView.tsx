import React, { useState } from "react";
import {
  Dumbbell,
  Play,
  Clock,
  Sparkles,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Zap,
  Flame,
  Swords,
  Waves,
  Sun,
  Music,
  Shield,
  Activity,
  CheckCircle2,
  Check,
  ArrowRight,
  Layers,
  Trophy,
  Crown,
  Lock,
} from "lucide-react";
import { WorkoutPlan, WorkoutSession, Exercise, SportModality, SportModalityId } from "../../types";
import { EXERCISE_LIBRARY, resolveExerciseDetails } from "../../data/exercises";
import { hasExerciseVideo } from "../../data/exerciseVideoAssets";
import { SPORT_MODALITIES } from "../../data/sportModalities";
import { AdBanner } from "../common/AdBanner";
import { ExerciseExecutionModal } from "../workout/ExerciseExecutionModal";
import { AnatomicalExerciseIllustration } from "../workout/AnatomicalExerciseIllustration";

interface WorkoutsViewProps {
  plan: WorkoutPlan;
  isPremium?: boolean;
  onStartSession: (sessionId: string) => void;
  onOpenCoachWithPrompt: (prompt: string) => void;
  onRegeneratePlanAI: () => void;
  onApplyPlan?: (newPlan: WorkoutPlan) => void;
  onOpenUpgradeModal?: (feature?: string) => void;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  plan,
  isPremium = false,
  onStartSession,
  onOpenCoachWithPrompt,
  onRegeneratePlanAI,
  onApplyPlan,
  onOpenUpgradeModal,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(plan.sessions[0]?.id || "");
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState<string>("");
  const [onlyWithVideo, setOnlyWithVideo] = useState(false);
  const [exerciseFilterMuscle, setExerciseFilterMuscle] = useState<string>("all");
  const [exerciseFilterEquipment, setExerciseFilterEquipment] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<"routine" | "modalities" | "library" | "progression">("routine");

  // Modality view states
  const [modalityFilter, setModalityFilter] = useState<string>("all");
  const [expandedModalityId, setExpandedModalityId] = useState<SportModalityId | null>("hyrox");
  const [appliedToast, setAppliedToast] = useState<string | null>(null);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);

  const currentSession = plan.sessions.find((s) => s.id === selectedSessionId) || plan.sessions[0];

  const handleApplyModality = (modality: SportModality) => {
    if (modality.isPremiumOnly && !isPremium) {
      if (onOpenUpgradeModal) onOpenUpgradeModal(modality.name);
      return;
    }
    if (onApplyPlan) {
      onApplyPlan(modality.presetPlan);
      setAppliedToast(`Plano de ${modality.name} ativado com sucesso!`);
      setTimeout(() => setAppliedToast(null), 3500);
      setActiveSubTab("routine");
      if (modality.presetPlan.sessions[0]) {
        setSelectedSessionId(modality.presetPlan.sessions[0].id);
      }
    }
  };

  const getModalityIcon = (id: SportModalityId) => {
    switch (id) {
      case "hyrox":
        return <Flame className="w-5 h-5 text-amber-400" />;
      case "luta":
        return <Swords className="w-5 h-5 text-rose-400" />;
      case "natacao":
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case "crossfit":
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case "futvolley":
        return <Sun className="w-5 h-5 text-yellow-400" />;
      case "danca":
        return <Music className="w-5 h-5 text-pink-400" />;
      case "calistenia":
        return <Layers className="w-5 h-5 text-purple-400" />;
      case "funcional_hiit":
        return <Activity className="w-5 h-5 text-orange-400" />;
      case "pilates":
        return <Sparkles className="w-5 h-5 text-teal-400" />;
      default:
        return <Dumbbell className="w-5 h-5 text-cyan-400" />;
    }
  };

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.alternatives.some((alt) => alt.toLowerCase().includes(exerciseSearch.toLowerCase()));
    const matchesMuscle =
      exerciseFilterMuscle === "all" || ex.primaryMuscle === exerciseFilterMuscle;
    const matchesEquipment =
      exerciseFilterEquipment === "all" || ex.equipment === exerciseFilterEquipment;
    return matchesSearch && matchesMuscle && matchesEquipment && (!onlyWithVideo || hasExerciseVideo(ex.id));
  });

  const filteredModalities = SPORT_MODALITIES.filter((mod) => {
    if (modalityFilter === "all") return true;
    if (modalityFilter === "hibrido") return mod.category === "hibrido";
    if (modalityFilter === "combate") return mod.category === "combate";
    if (modalityFilter === "aquatico") return mod.category === "aquatico";
    if (modalityFilter === "areia") return mod.category === "areia";
    if (modalityFilter === "ritmo") return mod.category === "ritmo";
    if (modalityFilter === "forca") return mod.category === "forca" || mod.category === "peso_corporal";
    return true;
  });

  const muscleCategories = [
    "all",
    "Peitoral",
    "Costas",
    "Ombros",
    "Pernas (Quadríceps)",
    "Pernas (Posterior)",
    "Glúteos",
    "Panturrilhas",
    "Bíceps",
    "Tríceps",
    "Abdômen & Core",
    "Cardio & Resistência",
  ];

  const equipmentCategories = [
    "all",
    "Barra",
    "Halteres",
    "Polia/Cabos",
    "Máquina",
    "Peso Corporal",
    "Kettlebell",
    "Elásticos",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
      {/* Toast feedback when modality is switched */}
      {appliedToast && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-white shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold font-mono">{appliedToast}</span>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1 flex-wrap">
            <span>Periodização Semanal</span>
            <span aria-hidden="true">·</span>
            <span>{plan.frequencyDaysPerWeek} Dias / Semana</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">
              {plan.modalityId
                ? `Modalidade Ativa: ${SPORT_MODALITIES.find((m) => m.id === plan.modalityId)?.shortName || "Personalizada"}`
                : "Musculação & Hipertrofia"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {plan.title}
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            {plan.description}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab("modalities")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:border-cyan-400 transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
          >
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>Mudar Modalidade / Esporte</span>
          </button>

          <button
            onClick={onRegeneratePlanAI}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Regenerar Plano (IA)</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-900 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab("routine")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === "routine"
              ? "bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          Minha Rotina Ativa
        </button>

        <button
          onClick={() => setActiveSubTab("modalities")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === "modalities"
              ? "bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20"
              : "text-neutral-300 hover:text-white hover:bg-neutral-900 border border-neutral-800"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Modalidades & Esportes ({SPORT_MODALITIES.length})</span>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1 rounded font-mono">
            NOVO
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("library")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === "library"
              ? "bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          Biblioteca de Exercícios ({EXERCISE_LIBRARY.length})
        </button>

        <button
          onClick={() => setActiveSubTab("progression")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === "progression"
              ? "bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          Evolução & Sobrecarga
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. MODALIDADES & ESPORTES CATALOG (NEW FEATURE)           */}
      {/* ========================================================= */}
      {activeSubTab === "modalities" && (
        <div className="space-y-6">
          {/* Quick Intro Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-6 sm:p-8">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Ecossistema Multiesportivo AthLynx</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Escolha sua Modalidade de Treino
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Treine com rotinas personalizadas e calibradas biomecanicamente para cada esporte: <strong>HYROX</strong>, <strong>Lutas/Boxe</strong>, <strong>Natação</strong>, <strong>CrossFit</strong>, <strong>Futevôlei</strong>, <strong>Dança</strong>, <strong>Calistenia</strong> e muito mais. Você pode iniciar uma sessão avulsa agora mesmo ou definir como seu plano principal da semana.
              </p>
            </div>

            {/* Quick Sport Selector Badges */}
            <div className="flex items-center gap-2 pt-5 overflow-x-auto pb-1 scrollbar-none">
              {SPORT_MODALITIES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    setExpandedModalityId(mod.id);
                    const el = document.getElementById(`modality-card-${mod.id}`);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    expandedModalityId === mod.id
                      ? "bg-neutral-800 border-cyan-400 text-white shadow-sm"
                      : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  {getModalityIcon(mod.id)}
                  <span>{mod.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-neutral-500 font-mono text-[11px] shrink-0 mr-1">Filtrar Categoria:</span>
            {[
              { id: "all", label: "Todas as Modalidades" },
              { id: "hibrido", label: "Híbrido & Metcon (HYROX, CrossFit, Funcional)" },
              { id: "combate", label: "Lutas & Combate" },
              { id: "aquatico", label: "Natação & Água" },
              { id: "areia", label: "Futevôlei & Areia" },
              { id: "ritmo", label: "Dança & Ritmo" },
              { id: "forca", label: "Força & Peso Corporal (Musculação, Calistenia)" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setModalityFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer font-medium ${
                  modalityFilter === f.id
                    ? "bg-neutral-800 text-white font-bold border border-neutral-700"
                    : "bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Modalities Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredModalities.map((modality) => {
              const isExpanded = expandedModalityId === modality.id;
              const isCurrentPlan = plan.modalityId === modality.id;
              const primarySession = modality.presetPlan.sessions[0];

              return (
                <div
                  key={modality.id}
                  id={`modality-card-${modality.id}`}
                  className={`rounded-3xl border transition-all overflow-hidden flex flex-col ${
                    isCurrentPlan
                      ? "bg-neutral-900/90 border-emerald-500/50 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                      : "bg-neutral-900/60 border-neutral-800/90 hover:border-neutral-700"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-6 sm:p-7 space-y-4 flex-1">
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner"
                          style={{
                            backgroundColor: `${modality.accentColor}15`,
                            borderColor: `${modality.accentColor}40`,
                          }}
                        >
                          {getModalityIcon(modality.id)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold uppercase tracking-wider">
                              {modality.badge}
                            </span>
                            {modality.isPremiumOnly ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-400" /> PRO (PAGO)
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                GRÁTIS
                              </span>
                            )}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/50">
                              {modality.intensity}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              ~{modality.estimatedKcalPerHour} kcal/h
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white mt-1">
                            {modality.name}
                          </h3>
                        </div>
                      </div>

                      {isCurrentPlan && (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Plano Ativo</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                      {modality.tagline}
                    </p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {modality.description}
                    </p>

                    {/* Key Benefits */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                        Benefícios Fisiológicos & Metas:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-300">
                        {modality.keyBenefits.map((b, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                            <span className="truncate">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Equipment Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-neutral-400">
                      <span className="font-mono text-neutral-500">Equipamentos:</span>
                      {modality.equipmentNeeded.map((eq, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Collapsible Session Preview */}
                  {isExpanded && primarySession && (
                    <div className="p-6 bg-neutral-950/70 border-t border-neutral-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-mono text-neutral-400 font-bold">
                          Exercícios da Sessão: <strong className="text-white">{primarySession.title}</strong>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400">
                          {primarySession.estimatedMinutes} min · {primarySession.exercises.length} exercícios
                        </div>
                      </div>

                      <div className="space-y-2">
                        {primarySession.exercises.map((ex, idx) => (
                          <div
                            key={ex.id}
                            onClick={() => {
                              const details = resolveExerciseDetails(ex.name || ex.exerciseId, ex.targetMuscle);
                              setSelectedExerciseForModal(details);
                            }}
                            className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800/80 hover:border-emerald-500/40 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer group"
                            title="Ver execução e instruções do exercício"
                          >
                            <div className="flex items-center gap-3">
                              <AnatomicalExerciseIllustration
                                exercise={resolveExerciseDetails(ex.name || ex.exerciseId, ex.targetMuscle)}
                                size="thumbnail"
                              />
                              <div>
                                <div className="font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                                  <span>{ex.name}</span>
                                  <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-normal text-emerald-400 flex items-center gap-0.5">
                                    <Play className="w-2.5 h-2.5 fill-current" /> Execução
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-400 italic">
                                  {ex.notes || ex.targetMuscle}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right font-mono text-[11px] text-neutral-300">
                                <span>{ex.sets.length} séries</span>
                                {ex.sets[0]?.targetReps ? (
                                  <span className="text-neutral-400 ml-1">× {ex.sets[0].targetReps} reps</span>
                                ) : null}
                              </div>
                              <span className="px-2 py-1 rounded-lg bg-neutral-800 group-hover:bg-emerald-500/20 text-neutral-400 group-hover:text-emerald-300 text-[10px] font-mono flex items-center gap-1 transition-colors">
                                <Play className="w-2.5 h-2.5 fill-current" /> Ver
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-neutral-400 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                        <strong className="text-neutral-300 font-mono">Aquecimento Sugerido:</strong> {primarySession.warmupProtocol}
                      </div>
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="p-4 sm:p-5 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
                    <button
                      onClick={() =>
                        setExpandedModalityId(isExpanded ? null : modality.id)
                      }
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? "Ocultar Exercícios" : "Ver Exercícios"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onOpenCoachWithPrompt(
                            `Gostaria de começar a treinar "${modality.name}". Quais são as melhores recomendações biomecânicas, aquecimento e ritmo para iniciantes e intermediários?`
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 transition-colors cursor-pointer"
                        title="Dicas do Coach IA para este esporte"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      {!isCurrentPlan && (
                        <button
                          onClick={() => handleApplyModality(modality)}
                          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition-all cursor-pointer flex items-center gap-1.5"
                          title="Definir esta modalidade como plano semanal ativo"
                        >
                          {modality.isPremiumOnly && !isPremium && <Lock className="w-3 h-3 text-amber-400" />}
                          <span>Definir como Plano</span>
                        </button>
                      )}

                      {primarySession && (
                        <button
                          onClick={() => {
                            if (modality.isPremiumOnly && !isPremium) {
                              if (onOpenUpgradeModal) onOpenUpgradeModal(modality.name);
                              return;
                            }
                            onStartSession(primarySession.id);
                          }}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md ${
                            modality.isPremiumOnly && !isPremium
                              ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 shadow-amber-500/20 font-black"
                              : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20"
                          }`}
                        >
                          {modality.isPremiumOnly && !isPremium ? (
                            <>
                              <Crown className="w-3.5 h-3.5 fill-current" />
                              <span>Desbloquear Pro</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Iniciar Treino</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MINHA ROTINA ATIVA (ROUTINE TAB)                      */}
      {/* ========================================================= */}
      {activeSubTab === "routine" && (
        <div className="space-y-6">
          {/* Active Modality Banner & Switcher Shortcut */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-neutral-400 font-mono">
                  Modalidade do Mesociclo: <strong className="text-white">{plan.title}</strong>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Quer praticar outra disciplina hoje? Escolha entre HYROX, Luta, Natação, CrossFit, Futevôlei ou Dança.
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab("modalities")}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-cyan-300 border border-neutral-700 transition-colors cursor-pointer"
            >
              Explorar Outras Opções →
            </button>
          </div>

          {/* Ad Banner for Free Plan */}
          <AdBanner
            isPremium={isPremium}
            onOpenUpgradeModal={() => onOpenUpgradeModal?.()}
          />

          {/* Day selection horizontal scroller */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {plan.sessions.map((sess) => {
              const isSelected = sess.id === currentSession?.id;
              return (
                <button
                  key={sess.id}
                  onClick={() => setSelectedSessionId(sess.id)}
                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer min-w-[200px] shrink-0 ${
                    isSelected
                      ? "bg-neutral-900 border-emerald-500 shadow-md shadow-emerald-500/10"
                      : "bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      {sess.dayLabel}
                    </span>
                    {sess.isPremiumOnly ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5 font-bold">
                        <Lock className="w-2.5 h-2.5 text-amber-400" /> PRO
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                        GRÁTIS
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white mt-1 truncate">
                    {sess.title.split("—")[0]}
                  </span>
                  <span className="text-xs text-neutral-400 mt-0.5 truncate">
                    {sess.muscleFocus.split(",")[0]}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-2 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{sess.estimatedMinutes} min</span>
                    <span>·</span>
                    <span>{sess.exercises.length} exs</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Session Detail Card */}
          {currentSession && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                <div>
                  <div className="text-xs text-emerald-400 font-semibold tracking-wide">
                    {currentSession.dayLabel.toUpperCase()}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    {currentSession.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Foco: <span className="text-neutral-200">{currentSession.muscleFocus}</span>
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Aquecimento: <span className="text-neutral-300">{currentSession.warmupProtocol}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() =>
                      onOpenCoachWithPrompt(
                        `Tenho apenas 25 minutos para fazer a sessão "${currentSession.title}". Quais 2 exercícios manter com superséries ou drop-sets para ter o melhor estímulo?`
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Versão Rápida (20 min)</span>
                  </button>

                  {currentSession.isPremiumOnly && !isPremium ? (
                    <button
                      onClick={() => onOpenUpgradeModal?.(currentSession.title)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-xs tracking-wide shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      <span>Desbloquear com Pro</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartSession(currentSession.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Iniciar Treino</span>
                    </button>
                  )}
                </div>
              </div>

              {currentSession.isPremiumOnly && !isPremium && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200 font-mono">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Esta sessão ({currentSession.title}) faz parte da periodização avançada do plano pago FORZON Pro. Faça upgrade para desbloquear todos os treinos e ter uma experiência 100% sem anúncios.</span>
                </div>
              )}

              {/* Exercises in Session */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Exercícios da Sessão ({currentSession.exercises.length})
                </div>

                <div className="space-y-3">
                  {currentSession.exercises.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <AnatomicalExerciseIllustration
                          exercise={resolveExerciseDetails(ex.name || ex.exerciseId, ex.targetMuscle)}
                          size="thumbnail"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              onClick={() => {
                                const details = resolveExerciseDetails(ex.name || ex.exerciseId, ex.targetMuscle);
                                setSelectedExerciseForModal(details);
                              }}
                              className="text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer group flex items-center gap-1.5"
                              title="Ver execução e instruções do exercício"
                            >
                              <span>{ex.name}</span>
                              <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-emerald-400 transition-opacity">
                                ▶ Ver execução
                              </span>
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                              {ex.targetMuscle}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const details = resolveExerciseDetails(ex.name || ex.exerciseId, ex.targetMuscle);
                                setSelectedExerciseForModal(details);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Abrir execução e instruções do exercício"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Execução</span>
                            </button>
                          </div>
                          {ex.notes && (
                            <p className="text-xs text-neutral-400 mt-1 italic">
                              "{ex.notes}"
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2 font-mono">
                            <span>{ex.sets.length} séries planejadas</span>
                            <span>·</span>
                            <span>Descanso: {ex.restSeconds}s</span>
                          </div>
                        </div>
                      </div>

                      {/* Sets list preview pills */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ex.sets.map((set) => (
                          <div
                            key={set.id}
                            className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] border ${
                              set.completed
                                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400"
                                : "bg-neutral-900 border-neutral-800 text-neutral-300"
                            }`}
                          >
                            <span className="text-neutral-500 mr-1">#{set.setNumber}</span>
                            <span>
                              {set.weightKg}kg × {set.targetReps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BIBLIOTECA DE EXERCÍCIOS (LIBRARY TAB)                 */}
      {/* ========================================================= */}
      {activeSubTab === "library" && (
        <div className="space-y-6">
          {/* Header banner with total count */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white tracking-wide">
                  Enciclopédia de Musculação & Exercícios Pro
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Catálogo biomecânico completo com instruções anatômicas, erros comuns, dicas de execução e alternativas para cada grupo muscular.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3.5 py-1.5 rounded-xl shrink-0">
              <span className="text-xs font-mono text-emerald-400 font-bold">{filteredExercises.length}</span>
              <span className="text-xs font-mono text-neutral-500">/ {EXERCISE_LIBRARY.length} exercícios</span>
            </div>
          </div>

          {/* Search, Muscle and Equipment filters */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
              <input type="checkbox" checked={onlyWithVideo} onChange={event=>setOnlyWithVideo(event.target.checked)} className="accent-emerald-500" />
              Somente exercícios com vídeo ({EXERCISE_LIBRARY.filter(ex=>hasExerciseVideo(ex.id)).length})
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome, músculo ou equipamento (ex: Supino, Agachamento, Halteres, Polia, Panturrilha)..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1">
                  <Filter className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <select
                    value={exerciseFilterMuscle}
                    onChange={(e) => setExerciseFilterMuscle(e.target.value)}
                    className="bg-transparent text-xs text-neutral-300 focus:outline-none py-1.5 cursor-pointer"
                  >
                    {muscleCategories.map((m) => (
                      <option key={m} value={m} className="bg-neutral-900 text-white">
                        {m === "all" ? "Todos os Músculos" : m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1">
                  <Dumbbell className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <select
                    value={exerciseFilterEquipment}
                    onChange={(e) => setExerciseFilterEquipment(e.target.value)}
                    className="bg-transparent text-xs text-neutral-300 focus:outline-none py-1.5 cursor-pointer"
                  >
                    {equipmentCategories.map((eq) => (
                      <option key={eq} value={eq} className="bg-neutral-900 text-white">
                        {eq === "all" ? "Todos Equipamentos" : eq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick muscle pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mr-1 shrink-0">
                Atalhos:
              </span>
              {[
                { label: "Todos", value: "all" },
                { label: "Peitoral", value: "Peitoral" },
                { label: "Costas", value: "Costas" },
                { label: "Ombros", value: "Ombros" },
                { label: "Quadríceps", value: "Pernas (Quadríceps)" },
                { label: "Posterior", value: "Pernas (Posterior)" },
                { label: "Glúteos", value: "Glúteos" },
                { label: "Panturrilhas", value: "Panturrilhas" },
                { label: "Bíceps", value: "Bíceps" },
                { label: "Tríceps", value: "Tríceps" },
                { label: "Abdômen & Core", value: "Abdômen & Core" },
              ].map((pill) => {
                const isActive = exerciseFilterMuscle === pill.value;
                return (
                  <button
                    key={pill.value}
                    onClick={() => setExerciseFilterMuscle(pill.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/20"
                        : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty state if nothing matches */}
          {filteredExercises.length === 0 && (
            <div className="p-12 text-center bg-neutral-900/40 border border-neutral-800 rounded-2xl space-y-3">
              <Dumbbell className="w-8 h-8 text-neutral-600 mx-auto" />
              <div className="text-sm font-bold text-neutral-300">
                Nenhum exercício encontrado para estes filtros
              </div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Tente limpar os termos de busca ou selecionar "Todos os Músculos" e "Todos Equipamentos".
              </p>
              <button
                onClick={() => {
                  setExerciseSearch("");
                  setExerciseFilterMuscle("all");
                  setExerciseFilterEquipment("all");
                  setOnlyWithVideo(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/20 transition-colors"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}

          {/* Exercise cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((ex) => {
              const isExpanded = expandedExerciseId === ex.id;
              const hasVideo = hasExerciseVideo(ex.id);
              return (
                <div
                  key={ex.id}
                  className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 space-y-3 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ex.primaryMuscle}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          {ex.equipment}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {ex.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1.5">
                        {ex.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedExerciseForModal(ex)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                        title={hasVideo ? "Abrir vídeo deste exercício" : "Abrir instruções deste exercício"}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{hasVideo ? "Vídeo" : "Instruções"}</span>
                      </button>

                      <button
                        onClick={() =>
                          setExpandedExerciseId(isExpanded ? null : ex.id)
                        }
                        className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cues badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ex.cues.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800"
                      >
                        ✓ {c}
                      </span>
                    ))}
                  </div>

                  {/* Expanded instructions & biomechanics */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-neutral-800 space-y-3 text-xs">
                      <div>
                        <div className="font-semibold text-neutral-300 mb-1">
                          Instruções de Execução:
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                          {ex.instructions.map((ins, i) => (
                            <li key={i}>{ins}</li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <div className="font-semibold text-rose-400 mb-1">
                          Erros Comuns a Evitar:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-neutral-400">
                          {ex.commonMistakes.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>

                      {ex.alternatives.length > 0 && (
                        <div>
                          <div className="font-semibold text-neutral-300 mb-1">
                            Variações & Substituições:
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap text-neutral-400">
                            {ex.alternatives.map((alt, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-neutral-800 text-[11px]"
                              >
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. EVOLUÇÃO & SOBRECARGA PROGRESSIVA (PROGRESSION TAB)    */}
      {/* ========================================================= */}
      {activeSubTab === "progression" && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>ALGORITMO DE PROGRESSÃO MECÂNICA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Diretrizes de Aumento de Carga e Repetições
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
              O AthLynx monitora o esforço percebido (RPE) e o volume de repetições executadas em cada série. Quando você atinge o limite superior de repetições com RPE ≤ 8 em duas sessões consecutivas, o sistema sugere automaticamente o incremento de 2,5% a 5% de carga para manter a sobrecarga mecânica contínua.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="text-xs font-mono text-neutral-400 uppercase">Faixa de Carga</div>
                <div className="text-lg font-bold text-emerald-400">+2.5kg a +5kg</div>
                <div className="text-[11px] text-neutral-500">Para exercícios multiarticulares pesados</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="text-xs font-mono text-neutral-400 uppercase">Gatilho de Repetições</div>
                <div className="text-lg font-bold text-cyan-400">Top Set Cumprido</div>
                <div className="text-[11px] text-neutral-500">2 sessões seguidas no teto da faixa</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="text-xs font-mono text-neutral-400 uppercase">Regulação por Sono</div>
                <div className="text-lg font-bold text-amber-400">RPE Dinâmico</div>
                <div className="text-[11px] text-neutral-500">Ajuste automático em dias de estresse alto</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Video Demonstration & Biomechanical Technique Modal */}
      {selectedExerciseForModal && (
        <ExerciseExecutionModal
          exercise={selectedExerciseForModal}
          isOpen={Boolean(selectedExerciseForModal)}
          onClose={() => setSelectedExerciseForModal(null)}
          onOpenCoachWithPrompt={onOpenCoachWithPrompt}
        />
      )}
    </div>
  );
};

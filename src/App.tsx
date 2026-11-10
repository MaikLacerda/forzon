import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Sparkles,
  ShoppingBag,
  ArrowLeftRight,
  Scan,
  Maximize2,
  Compass,
  Dumbbell,
  Check,
  Activity,
  RotateCcw,
  Sliders,
  ChevronRight,
  Droplets,
  Plus,
  Minus
} from 'lucide-react';

import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { LiveWorkoutRunnerModal, WorkoutExerciseItem } from './components/workout/LiveWorkoutRunnerModal';
import { ExerciseLibraryModal, CatalogExercise } from './components/workout/ExerciseLibraryModal';
import { CreateChallengeModal } from './components/social/CreateChallengeModal';
import { CommunityFeedView } from './components/social/CommunityFeedView';
import { ProfileView } from './components/profile/ProfileView';
import { GPSOutdoorModal } from './components/gps/GPSOutdoorModal';
import { ComprehensiveMedicalIntakeModal, MedicalIntakeData } from './components/intake/ComprehensiveMedicalIntakeModal';
import { NutritionScannerModal, ScannedFoodResult } from './components/nutrition/NutritionScannerModal';
import { FoodSwapModal, FoodItemData } from './components/nutrition/FoodSwapModal';
import { GroceryListModal } from './components/nutrition/GroceryListModal';
import { BiofeedbackReadinessCard } from './components/biofeedback/BiofeedbackReadinessCard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'bio' | 'community' | 'profile'>('workout');
  const [userName, setUserName] = useState('Maikon Lacerda');
  const [userHandle, setUserHandle] = useState('@maiklacerda');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('forzon_athlete_avatar') || null;
    } catch {
      return null;
    }
  });

  const [showLiveWorkout, setShowLiveWorkout] = useState(false);
  const [isWorkoutMinimized, setIsWorkoutMinimized] = useState(false);
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);

  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [swapTargetExercise, setSwapTargetExercise] = useState<WorkoutExerciseItem | null>(null);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [swapTargetFood, setSwapTargetFood] = useState<FoodItemData | null>(null);

  const [activeSplitName, setActiveSplitName] = useState('ABCD CLÁSSICO PESADO');
  const [activeWorkoutTitle, setActiveWorkoutTitle] = useState('Treino A — Peitorais, Deltóide & 3x Tríceps');
  const [seriesPerExercise, setSeriesPerExercise] = useState(4);

  // 💧 HIDRATAÇÃO DIÁRIA INTELIGENTE (Zera automaticamente com a virada da data + localStorage)
  const getTodayKey = () => `forzon_water_intake_${new Date().toISOString().split('T')[0]}`;

  const [waterGoalMl, setWaterGoalMl] = useState<number>(3200);
  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(() => {
    try {
      const todayKey = `forzon_water_intake_${new Date().toISOString().split('T')[0]}`;
      const saved = localStorage.getItem(todayKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleAddWater = (amountMl: number = 250) => {
    setWaterIntakeMl((prev) => {
      const next = Math.max(0, prev + amountMl);
      try {
        localStorage.setItem(getTodayKey(), next.toString());
      } catch (err) {
        console.warn('Erro ao salvar hidratação:', err);
      }
      return next;
    });
  };

  const handleResetWater = () => {
    setWaterIntakeMl(0);
    try {
      localStorage.setItem(getTodayKey(), '0');
    } catch {}
  };

  useEffect(() => {
    let interval: any = null;
    if (showLiveWorkout || isWorkoutMinimized) {
      interval = setInterval(() => {
        setWorkoutElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showLiveWorkout, isWorkoutMinimized]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateExercisesForSplit = (split: string, seriesCount: number): WorkoutExerciseItem[] => {
    if (split.includes('Upper') || split.includes('Lower')) {
      return [
        { id: 1, name: 'Supino Reto com Barra Olímpica', targetMuscle: 'Peitoral Maior', cue: 'Descida controlada até a linha dos mamilos.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 80.0, reps: 8, completed: false })) },
        { id: 2, name: 'Puxada Frontal na Polia Alta', targetMuscle: 'Latíssimo do Dorso', cue: 'Puxe direcionando cotovelos para os bolsos.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 65.0, reps: 10, completed: false })) },
        { id: 3, name: 'Desenvolvimento com Halteres Sentado', targetMuscle: 'Deltóides', cue: 'Banco a 80°, empurrar vertical.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 24.0, reps: 10, completed: false })) },
        { id: 4, name: 'Remada Curvada com Barra', targetMuscle: 'Costas', cue: 'Tronco a 45° com curvatura anatômica.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 60.0, reps: 10, completed: false })) },
        { id: 5, name: 'Tríceps Testa com Barra W', targetMuscle: 'Tríceps', cue: 'Cotovelos fechados, descida até a testa.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 25.0, reps: 12, completed: false })) },
        { id: 6, name: 'Rosca Direta com Barra W', targetMuscle: 'Bíceps', cue: 'Flexão estrita sem balanço de tronco.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 25.0, reps: 10, completed: false })) },
        { id: 7, name: 'Abdominal na Polia Alta (Cable Crunch)', targetMuscle: 'Abdômen Dinâmico', cue: 'Aproxime costelas da pelve com quadril travado.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 35.0, reps: 15, completed: false })) },
      ];
    }
    return [
      { id: 1, name: 'Supino Inclinado com Halteres', targetMuscle: 'Peitoral Superior', cue: 'Pegada neutra a 30° com retração escapular ativa.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 32.5, reps: 10, completed: false })) },
      { id: 2, name: 'Supino Reto com Barra Olímpica', targetMuscle: 'Peitoral Maior (Esternal)', cue: 'Descida controlada até os mamilos mantendo arco firme.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 80.0, reps: 10, completed: false })) },
      { id: 3, name: 'Crucifixo no Crossover (Polia Média)', targetMuscle: 'Peitoral Médio', cue: 'Tensão constante em todo o arco. Pico de 2s.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 17.5, reps: 12, completed: false })) },
      { id: 4, name: 'Elevação Lateral com Halteres', targetMuscle: 'Deltóide Lateral', cue: 'Plano escapular com cotovelos liderando o vetor.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 14.0, reps: 15, completed: false })) },
      { id: 5, name: 'Desenvolvimento com Halteres Sentado', targetMuscle: 'Deltóides', cue: 'Banco a 80°, empurrar vertical.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 24.0, reps: 10, completed: false })) },
      { id: 6, name: 'Tríceps Testa com Barra W no Banco Reto', targetMuscle: 'Tríceps (Medial/Lateral)', cue: 'Cotovelos fechados, descida até a testa.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 25.0, reps: 12, completed: false })) },
      { id: 7, name: 'Tríceps Francês Unilateral com Halter', targetMuscle: 'Tríceps (Cabeça Longa)', cue: 'Alongamento profundo com tronco reto.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 12.5, reps: 10, completed: false })) },
      { id: 8, name: 'Tríceps Corda na Polia Alta', targetMuscle: 'Tríceps (Extensão)', cue: 'Abra as pontas da corda com pico isométrico.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 25.0, reps: 15, completed: false })) },
      { id: 9, name: 'Abdominal na Polia Alta (Cable Crunch)', targetMuscle: 'Abdômen Dinâmico', cue: 'Aproxime as costelas da pelve com quadril travado.', sets: Array.from({ length: seriesCount }, (_, i) => ({ setNumber: i + 1, weightKg: 35.0, reps: 15, completed: false })) },
    ];
  };

  const [activeWorkoutExercises, setActiveWorkoutExercises] = useState<WorkoutExerciseItem[]>(() => generateExercisesForSplit('ABCD Clássico', 4));

  const handleToggleSeriesCount = (count: number) => {
    setSeriesPerExercise(count);
    setActiveWorkoutExercises((prev) =>
      prev.map((ex) => {
        let newSets = [...ex.sets];
        if (count === 3 && newSets.length > 3) {
          newSets = newSets.slice(0, 3);
        } else if (count === 4 && newSets.length < 4) {
          const last = newSets[newSets.length - 1] || { weightKg: 20, reps: 10 };
          newSets.push({ setNumber: 4, weightKg: last.weightKg, reps: Math.max(6, last.reps - 2), completed: false });
        }
        return { ...ex, sets: newSets };
      })
    );
  };

  const handleApplyMedicalIntake = (data: MedicalIntakeData) => {
    const split = data.splitPreference || 'ABCD Clássico';
    const series = (data.exactSessionMinutes && data.exactSessionMinutes <= 50) ? 3 : 4;
    if (data.waterLiters) {
      setWaterGoalMl(Math.round(data.waterLiters * 1000));
    }
    setActiveSplitName(split.toUpperCase());
    setSeriesPerExercise(series);
    if (split.includes('Upper') || split.includes('Lower')) {
      setActiveWorkoutTitle('Treino A — Superiores Completos (Upper 1)');
    } else if (split.includes('Full')) {
      setActiveWorkoutTitle('Treino A — Corpo Inteiro (Full Body 1)');
    } else {
      setActiveWorkoutTitle('Treino A — Peitorais, Deltóide & 3x Tríceps');
    }
    setActiveWorkoutExercises(generateExercisesForSplit(split, series));
    setShowIntakeModal(false);
    setActiveTab('workout');
  };

  const handleSwapExercise = (replacement: CatalogExercise) => {
    if (!swapTargetExercise) return;
    setActiveWorkoutExercises((prev) =>
      prev.map((ex) => ex.id === swapTargetExercise.id ? { ...ex, name: replacement.name, targetMuscle: replacement.group, cue: replacement.cue } : ex)
    );
    setSwapTargetExercise(null);
  };

  // 🍽️ REFEIÇÕES DO DIA INICIAM DESMARCADAS (completed: false)
  const [dietMeals, setDietMeals] = useState([
    {
      id: 'm-1',
      title: 'Café da Manhã Anabólico',
      time: '08:00',
      calories: 540,
      completed: false,
      foods: [
        { id: 'f-1', name: '4 Ovos Caipiras Mexidos com Cúrcuma', quantity: '4 unidades', calories: 280, proteinG: 26, carbsG: 2, fatG: 20, category: 'proteina' as const },
        { id: 'f-2', name: 'Mamão Papaia Fresco em Cubos', quantity: '150g (1/2 unid)', calories: 60, proteinG: 1, carbsG: 15, fatG: 0.2, category: 'fruta' as const },
        { id: 'f-3', name: 'Aveia em Flocos Finos com Canela', quantity: '50g', calories: 200, proteinG: 7, carbsG: 34, fatG: 3.8, category: 'carboidrato' as const },
      ]
    },
    {
      id: 'm-2',
      title: 'Almoço — Recuperação Miofibrilar',
      time: '12:30',
      calories: 680,
      completed: false,
      foods: [
        { id: 'f-4', name: 'Filé de Peito de Frango Grelhado', quantity: '180g', calories: 290, proteinG: 55, carbsG: 0, fatG: 5.5, category: 'proteina' as const },
        { id: 'f-5', name: 'Mandioca Cozida no Vapor', quantity: '180g', calories: 240, proteinG: 2, carbsG: 58, fatG: 0.4, category: 'carboidrato' as const },
        { id: 'f-6', name: 'Uva Thompson Sem Semente Gelada', quantity: '100g (1 cacho)', calories: 70, proteinG: 0.7, carbsG: 18, fatG: 0.2, category: 'fruta' as const },
        { id: 'f-7', name: 'Azeite de Oliva Extra Virgem', quantity: '1 colher (10ml)', calories: 80, proteinG: 0, carbsG: 0, fatG: 9, category: 'gordura' as const },
      ]
    },
    {
      id: 'm-3',
      title: 'Lanche da Tarde — Pré-Treino',
      time: '16:30',
      calories: 420,
      completed: false,
      foods: [
        { id: 'f-8', name: 'Whey Protein Isolado Baunilha', quantity: '35g (1 scoop)', calories: 140, proteinG: 29, carbsG: 2, fatG: 1.5, category: 'proteina' as const },
        { id: 'f-9', name: 'Abacaxi Pérola em Fatias', quantity: '150g (2 fatias)', calories: 75, proteinG: 0.8, carbsG: 19, fatG: 0.2, category: 'fruta' as const },
        { id: 'f-10', name: 'Castanha-do-Pará Selecionada', quantity: '20g (4 unid)', calories: 130, proteinG: 3, carbsG: 2.5, fatG: 13, category: 'gordura' as const },
      ]
    },
    {
      id: 'm-4',
      title: 'Jantar — Reposição Noturna',
      time: '20:30',
      calories: 520,
      completed: false,
      foods: [
        { id: 'f-11', name: 'Patinho Moído Magro com Ervas', quantity: '160g', calories: 260, proteinG: 45, carbsG: 0, fatG: 8, category: 'proteina' as const },
        { id: 'f-12', name: 'Arroz Branco ou Batata Inglesa', quantity: '160g', calories: 200, proteinG: 4, carbsG: 44, fatG: 0.5, category: 'carboidrato' as const },
        { id: 'f-13', name: 'Mix de Folhas e Brócolis', quantity: '100g', calories: 60, proteinG: 2, carbsG: 6, fatG: 0.5, category: 'carboidrato' as const },
      ]
    }
  ]);

  const toggleMealCompleted = (mealId: string) => {
    setDietMeals((prev) => prev.map((meal) => meal.id === mealId ? { ...meal, completed: !meal.completed } : meal));
  };

  const consumedTotals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    dietMeals.forEach((m) => {
      if (m.completed) {
        m.foods.forEach((f) => {
          calories += f.calories || 0;
          protein += f.proteinG || 0;
          carbs += f.carbsG || 0;
          fat += f.fatG || 0;
        });
      }
    });
    return { calories, protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  }, [dietMeals]);

  const targetTotals = { calories: 2500, protein: 170, carbs: 280, fat: 70 };
  const calPercentage = Math.min(100, Math.round((consumedTotals.calories / targetTotals.calories) * 100));
  const waterPercentage = Math.min(100, Math.round((waterIntakeMl / waterGoalMl) * 100));

  const handleSwapFood = (newFood: FoodItemData) => {
    if (!swapTargetFood) return;
    setDietMeals((prev) => prev.map((meal) => ({
      ...meal,
      foods: meal.foods.map((f) => f.id === swapTargetFood.id ? { ...newFood, id: f.id } : f)
    })));
    setSwapTargetFood(null);
  };

  const handleAddScannedFood = (scanned: ScannedFoodResult) => {
    setDietMeals((prev) => [
      ...prev,
      {
        id: 'meal-scanned-' + Date.now(),
        title: 'Alimento Escaneado via OCR/IA',
        time: 'Agora',
        calories: scanned.calories,
        completed: true,
        foods: [{ id: 'scanned-' + Date.now(), name: scanned.name + ' (' + (scanned.brand || 'Item') + ')', quantity: scanned.serving, calories: scanned.calories, proteinG: scanned.proteinG, carbsG: scanned.carbsG, fatG: scanned.fatG, category: 'proteina' as const }]
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-neutral-950 font-sans pb-24">
      <Header streakDays={14} userName={userName} userAvatar={avatarUrl} onOpenCoach={() => setShowIntakeModal(true)} />

      <main className="max-w-md mx-auto w-full px-4 pt-4 flex-1 space-y-4">
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-[#0f131c] to-[#0a0e17] border border-cyan-500/40 flex items-center justify-between shadow-[0_0_25px_rgba(0,210,255,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.3)]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">COACH IA & BIOMECÂNICA</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">Prontidão 88%</span>
                  </div>
                  <h3 className="text-xs font-black text-white">Anamnese & Refazer Treino</h3>
                  <p className="text-[10px] text-slate-400">Recalibre tempo, divisões, foco muscular e restrições</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowIntakeModal(true)} className="px-3.5 py-2 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all cursor-pointer">
                <Sliders className="w-3.5 h-3.5 fill-neutral-950" /> Refazer
              </button>
            </div>

            <div className="p-4 rounded-3xl bg-[#0f131c] border border-cyan-500/30 space-y-3 shadow-[0_0_20px_rgba(0,210,255,0.1)]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">DIVISÃO ATIVA: {activeSplitName}</span>
                  <h2 className="text-base font-black text-white">{activeWorkoutTitle}</h2>
                  <p className="text-[11px] text-slate-400">{seriesPerExercise} Séries / ex • {activeWorkoutExercises.length} Exercícios + Cardio • ~{seriesPerExercise === 3 ? '52' : '70'} min</p>
                </div>
                <button type="button" onClick={() => setShowExerciseLibrary(true)} className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer">104 Vídeos</button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-bold text-[11px]">Volume da Sessão:</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleToggleSeriesCount(3)} className={"px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer " + (seriesPerExercise === 3 ? "bg-[#00d2ff] border-[#00d2ff] text-neutral-950 font-black shadow-[0_0_10px_#00d2ff]" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white")}>3 Séries / ex (~52 min)</button>
                  <button type="button" onClick={() => handleToggleSeriesCount(4)} className={"px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer " + (seriesPerExercise === 4 ? "bg-[#00d2ff] border-[#00d2ff] text-neutral-950 font-black shadow-[0_0_10px_#00d2ff]" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white")}>4 Séries / ex (~70 min)</button>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => { setShowLiveWorkout(true); setIsWorkoutMinimized(false); }} className="w-full py-4 rounded-2xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.35)] transition-all cursor-pointer">
              <Play className="w-5 h-5 fill-neutral-950" /> {isWorkoutMinimized ? 'Continuar Treino em Andamento' : 'Iniciar Treino ao Vivo Agora'}
            </button>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sequência Principal ({activeWorkoutExercises.length} Movimentos)</span>
                <button type="button" onClick={() => { setSwapTargetExercise(activeWorkoutExercises[0]); setShowExerciseLibrary(true); }} className="text-[11px] font-bold text-[#00d2ff] flex items-center gap-1 hover:underline cursor-pointer">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Trocar Exercício
                </button>
              </div>

              {activeWorkoutExercises.map((ex, idx) => (
                <div key={ex.id} className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-[#00d2ff]">0{idx + 1}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                        <button type="button" onClick={() => { setSwapTargetExercise(ex); setShowExerciseLibrary(true); }} className="text-[10px] text-slate-500 hover:text-[#00d2ff] flex items-center gap-0.5 cursor-pointer">
                          <ArrowLeftRight className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ex.sets.length} séries • {ex.cue}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#00d2ff] block">{ex.sets[0]?.weightKg} kg</span>
                    <span className="text-[9px] text-emerald-400 font-bold">Float Ativo</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-3xl bg-[#0f131c] border border-cyan-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(0,210,255,0.08)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]"><Activity className="w-5 h-5" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-[#00d2ff] uppercase tracking-wider block">CARDIO PÓS-TREINO INTEGRADO</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold">Zona 2</span>
                  </div>
                  <h4 className="text-xs font-black text-white">Simulador de Escadas (Stairmaster)</h4>
                  <p className="text-[10px] text-slate-400">20 min contínuos • Nível 7 a 9 sem apoiar os braços</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#00d2ff] block">20 min</span>
                <span className="text-[9px] text-emerald-400 font-bold">~200 kcal</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button type="button" onClick={() => setShowIntakeModal(true)} className="w-full p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/30 hover:border-[#00d2ff] flex items-center justify-between transition-all cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]">
                    <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00d2ff] transition-colors">Reavaliar Periodização Completa</h4>
                    <span className="text-[10px] text-slate-400">Ajustar peso, altura, restrições e divisões de treino</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setShowGPSModal(true)} className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 flex items-center gap-2.5 transition-all cursor-pointer">
                  <Compass className="w-4 h-4 text-[#00d2ff]" />
                  <div className="text-left"><h4 className="text-xs font-bold text-white">GPS Outdoor</h4><span className="text-[10px] text-slate-400">Corrida & Ciclismo</span></div>
                </button>
                <button type="button" onClick={() => setShowExerciseLibrary(true)} className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 flex items-center gap-2.5 transition-all cursor-pointer">
                  <Dumbbell className="w-4 h-4 text-[#00d2ff]" />
                  <div className="text-left"><h4 className="text-xs font-bold text-white">Biblioteca 3D</h4><span className="text-[10px] text-slate-400">104 Movimentos</span></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 2: DIÁRIO NUTRICIONAL COM HIDRATAÇÃO CORRIGIDA ================= */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-1">
              <div>
                <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">NUTRIÇÃO CIENTÍFICA & MACROS</span>
                <h2 className="text-xl font-black text-white">Diário Nutricional</h2>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setShowScannerModal(true)} className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer" title="Escanear Tabela Nutricional"><Scan className="w-4 h-4" /></button>
                <button type="button" onClick={() => setShowGroceryList(true)} className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer" title="Lista de Compras"><ShoppingBag className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2.5 text-xs text-slate-200">
              <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0" />
              <span>Ficha Nutricional: <strong>Mamão, Uva e Abacaxi</strong> priorizados; <strong>Banana banida</strong>.</span>
            </div>

            {/* Balanço Calórico Consumido (Inicia em 0% e soma com as refeições) */}
            <div className="p-4 rounded-3xl bg-[#0f131c] border border-cyan-500/30 space-y-2.5 shadow-[0_0_25px_rgba(0,210,255,0.1)]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">Balanço Calórico Consumido</span>
                <span className="font-mono text-[#00d2ff] font-bold">{consumedTotals.calories.toLocaleString('pt-BR')} / {targetTotals.calories.toLocaleString('pt-BR')} kcal ({calPercentage}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-[#00d2ff] rounded-full transition-all duration-300 shadow-[0_0_8px_#00d2ff]" style={{ width: calPercentage + '%' }} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800"><span className="text-[10px] text-slate-400 block font-bold">Proteínas</span><strong className="text-emerald-400 font-mono text-sm block">{consumedTotals.protein}g / {targetTotals.protein}g</strong></div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800"><span className="text-[10px] text-slate-400 block font-bold">Carboidratos</span><strong className="text-cyan-400 font-mono text-sm block">{consumedTotals.carbs}g / {targetTotals.carbs}g</strong></div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800"><span className="text-[10px] text-slate-400 block font-bold">Gorduras</span><strong className="text-amber-400 font-mono text-sm block">{consumedTotals.fat}g / {targetTotals.fat}g</strong></div>
              </div>
            </div>

            {/* 💧 CARD OFICIAL DE HIDRATAÇÃO COM BOTÃO -250ml E ZERADO NO INÍCIO */}
            <div className="p-4 rounded-3xl bg-[#0f131c] border border-cyan-500/30 space-y-2.5 shadow-[0_0_20px_rgba(0,210,255,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Meta Hídrica Diária</h3>
                    <span className="text-[10px] text-slate-400">Hidratação celular & equilíbrio osmótico</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddWater(-250)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5"
                    title="Diminuir 250ml"
                  >
                    <Minus className="w-3 h-3" />
                    <span>250ml</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddWater(250)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 hover:bg-cyan-900 text-[#00d2ff] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,210,255,0.2)]"
                    title="Adicionar 250ml de água"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+250 ml</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddWater(500)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer"
                    title="Adicionar 500ml de água"
                  >
                    +500ml
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-xl font-black text-[#00d2ff]">
                    {waterIntakeMl.toLocaleString('pt-BR')} ml
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    / {waterGoalMl.toLocaleString('pt-BR')} ml
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {waterPercentage}%
                  </span>
                  {waterIntakeMl > 0 && (
                    <button
                      type="button"
                      onClick={handleResetWater}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Zerar hidratação de hoje"
                    >
                      Zerar
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-[#00d2ff] rounded-full transition-all duration-300 shadow-[0_0_8px_#00d2ff]"
                  style={{ width: `${waterPercentage}%` }}
                />
              </div>
            </div>

            {/* Refeições do Dia com Checkbox (Iniciam Pendentes) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Refeições do Dia ({dietMeals.filter((m) => m.completed).length} de {dietMeals.length} Realizadas)</span>
                <button type="button" onClick={() => setShowGroceryList(true)} className="text-[11px] font-bold text-[#00d2ff] hover:underline cursor-pointer">Ver Lista de Compras ➔</button>
              </div>

              {dietMeals.map((meal) => (
                <div key={meal.id} className={'p-3.5 rounded-2xl border transition-all space-y-2 ' + (meal.completed ? 'bg-[#0f131c]/90 border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.08)]' : 'bg-[#0f131c] border-slate-800 opacity-80')}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <button type="button" onClick={() => toggleMealCompleted(meal.id)} className={'w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ' + (meal.completed ? 'bg-[#00d2ff] border-[#00d2ff] text-neutral-950 shadow-[0_0_10px_#00d2ff]' : 'border-slate-700 bg-slate-900 hover:border-cyan-400')}>
                        {meal.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                      <div>
                        <h4 className={'text-xs font-black ' + (meal.completed ? 'text-white' : 'text-slate-300')}>{meal.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{meal.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#00d2ff] block">{meal.calories} kcal</span>
                      <span className={'text-[9px] font-bold ' + (meal.completed ? 'text-emerald-400' : 'text-slate-500')}>{meal.completed ? 'Consumida' : 'Pendente'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1.5 border-t border-slate-800/80">
                    {meal.foods.map((food) => (
                      <div key={food.id} className="flex justify-between items-center text-xs py-1">
                        <div>
                          <span className={'font-bold block ' + (meal.completed ? 'text-slate-200' : 'text-slate-400')}>{food.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{food.quantity} • P: {food.proteinG}g | C: {food.carbsG}g</span>
                        </div>
                        <button type="button" onClick={() => { setSwapTargetFood(food); setShowSwapModal(true); }} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-bold text-[#00d2ff] flex items-center gap-1 transition-all cursor-pointer">
                          <ArrowLeftRight className="w-3 h-3" /> Trocar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bio' && (
          <div className="space-y-4 animate-in fade-in">
            <BiofeedbackReadinessCard onOpenCoach={() => setShowIntakeModal(true)} />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-4 animate-in fade-in">
            <CommunityFeedView userName={userName} userHandle={userHandle} onCreateChallengeClick={() => setShowCreateChallenge(true)} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in">
            <ProfileView userName={userName} userHandle={userHandle} onUpdateProfile={(name, handle, newAvatar) => { setUserName(name); setUserHandle(handle); if (newAvatar) setAvatarUrl(newAvatar); }} />
          </div>
        )}
      </main>

      {isWorkoutMinimized && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-[#0a0e17]/95 border border-cyan-500/50 backdrop-blur-xl rounded-2xl p-3 flex items-center justify-between shadow-[0_0_25px_rgba(0,210,255,0.3)] animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="text-[9px] font-bold text-[#00d2ff] uppercase tracking-wider block">TREINO EM ANDAMENTO (MINIMIZADO)</span>
              <h4 className="text-xs font-black text-white">{activeWorkoutTitle}</h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#00d2ff] bg-cyan-950/80 px-2 py-1 rounded-lg border border-cyan-500/30">{formatTimer(workoutElapsedSeconds)}</span>
            <button type="button" onClick={() => { setIsWorkoutMinimized(false); setShowLiveWorkout(true); }} className="p-2 rounded-xl bg-[#00d2ff] text-neutral-950 hover:bg-cyan-400 cursor-pointer shadow-[0_0_10px_#00d2ff]"><Maximize2 className="w-4 h-4 stroke-[3]" /></button>
          </div>
        </div>
      )}

      {showLiveWorkout && (
        <LiveWorkoutRunnerModal workoutTitle={activeWorkoutTitle} splitName={activeSplitName} exercises={activeWorkoutExercises} elapsedSeconds={workoutElapsedSeconds} onClose={() => setShowLiveWorkout(false)} onMinimize={() => { setShowLiveWorkout(false); setIsWorkoutMinimized(true); }} onFinishWorkout={() => { setShowLiveWorkout(false); setIsWorkoutMinimized(false); setWorkoutElapsedSeconds(0); }} />
      )}

      {showExerciseLibrary && (
        <ExerciseLibraryModal onClose={() => { setShowExerciseLibrary(false); setSwapTargetExercise(null); }} onSelectExercise={handleSwapExercise} />
      )}

      {showCreateChallenge && (
        <CreateChallengeModal onClose={() => setShowCreateChallenge(false)} onCreateChallenge={(ch) => console.log('Novo Desafio:', ch)} />
      )}

      {showGPSModal && (
        <GPSOutdoorModal onClose={() => setShowGPSModal(false)} />
      )}

      {showIntakeModal && (
        <ComprehensiveMedicalIntakeModal onClose={() => setShowIntakeModal(false)} onApplyIntake={handleApplyMedicalIntake} />
      )}

      {showScannerModal && (
        <NutritionScannerModal onClose={() => setShowScannerModal(false)} onAddFood={handleAddScannedFood} />
      )}

      {showSwapModal && swapTargetFood && (
        <FoodSwapModal currentFood={swapTargetFood} onClose={() => { setShowSwapModal(false); setSwapTargetFood(null); }} onSwapFood={handleSwapFood} />
      )}

      {showGroceryList && (
        <GroceryListModal onClose={() => setShowGroceryList(false)} />
      )}

      <BottomNavigation activeTab={activeTab} onTabChange={(tab) => {
        setShowExerciseLibrary(false);
        setShowCreateChallenge(false);
        setShowGPSModal(false);
        setShowIntakeModal(false);
        setShowScannerModal(false);
        setShowSwapModal(false);
        setShowGroceryList(false);
        if (showLiveWorkout) {
          setShowLiveWorkout(false);
          setIsWorkoutMinimized(true);
        }
        setActiveTab(tab);
      }} />
    </div>
  );
}
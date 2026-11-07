import React, { useState, useEffect } from 'react';
import {
  Play,
  Sparkles,
  ShoppingBag,
  ArrowLeftRight,
  Scan,
  Maximize2,
  Compass,
  Dumbbell
} from 'lucide-react';

// Componentes de Layout Persistente
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';

// Modais Centrais & Telas Especializadas
import { LiveWorkoutRunnerModal, WorkoutExerciseItem } from './components/workout/LiveWorkoutRunnerModal';
import { ExerciseLibraryModal } from './components/workout/ExerciseLibraryModal';
import { CreateChallengeModal } from './components/social/CreateChallengeModal';
import { CommunityFeedView } from './components/social/CommunityFeedView';
import { ProfileView } from './components/profile/ProfileView';
import { GPSOutdoorModal } from './components/gps/GPSOutdoorModal';
import { ComprehensiveMedicalIntakeModal } from './components/intake/ComprehensiveMedicalIntakeModal';
import { NutritionScannerModal, ScannedFoodResult } from './components/nutrition/NutritionScannerModal';
import { FoodSwapModal, FoodItemData } from './components/nutrition/FoodSwapModal';
import { GroceryListModal } from './components/nutrition/GroceryListModal';
import { BiofeedbackReadinessCard } from './components/biofeedback/BiofeedbackReadinessCard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'bio' | 'community' | 'profile'>('workout');

  // Perfil do Atleta
  const [userName, setUserName] = useState('Maikon Lacerda');
  const [userHandle, setUserHandle] = useState('@maiklacerda');

  // Modais de Controle
  const [showLiveWorkout, setShowLiveWorkout] = useState(false);
  const [isWorkoutMinimized, setIsWorkoutMinimized] = useState(false);
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);

  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [swapTargetFood, setSwapTargetFood] = useState<FoodItemData | null>(null);

  // Timer Persistente do Treino ao Vivo (continua rodando mesmo minimizado)
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

  // Exercícios da Sessão de Treino Ativa (com suporte a decimais float)
  const [activeWorkoutExercises] = useState<WorkoutExerciseItem[]>([
    {
      id: 1,
      name: 'Supino Inclinado com Halteres',
      targetMuscle: 'Peitoral Superior',
      cue: 'Pegada neutra a 30° com retração escapular ativa.',
      sets: [
        { setNumber: 1, weightKg: 32.5, reps: 10, completed: true },
        { setNumber: 2, weightKg: 32.5, reps: 8, completed: false },
        { setNumber: 3, weightKg: 34.0, reps: 8, completed: false },
        { setNumber: 4, weightKg: 36.5, reps: 6, completed: false },
      ],
    },
    {
      id: 2,
      name: 'Crucifixo no Crossover (Polia Média)',
      targetMuscle: 'Peitoral Médio',
      cue: 'Tensão constante em todo o arco sem hiperestender cotovelos.',
      sets: [
        { setNumber: 1, weightKg: 17.5, reps: 12, completed: false },
        { setNumber: 2, weightKg: 17.5, reps: 12, completed: false },
        { setNumber: 3, weightKg: 20.0, reps: 10, completed: false },
        { setNumber: 4, weightKg: 20.0, reps: 10, completed: false },
      ],
    },
    {
      id: 3,
      name: 'Elevação Lateral com Halteres',
      targetMuscle: 'Deltóide Lateral',
      cue: 'Plano escapular com cotovelos liderando o vetor de subida.',
      sets: [
        { setNumber: 1, weightKg: 14.0, reps: 15, completed: false },
        { setNumber: 2, weightKg: 14.0, reps: 12, completed: false },
        { setNumber: 3, weightKg: 16.0, reps: 10, completed: false },
      ],
    },
    {
      id: 4,
      name: 'Tríceps Francês Unilateral com Halter',
      targetMuscle: 'Tríceps (Cabeça Longa)',
      cue: 'Alongamento profundo com tronco reto sem abrir os cotovelos.',
      sets: [
        { setNumber: 1, weightKg: 12.5, reps: 12, completed: false },
        { setNumber: 2, weightKg: 12.5, reps: 10, completed: false },
        { setNumber: 3, weightKg: 15.0, reps: 8, completed: false },
      ],
    },
    {
      id: 5,
      name: 'Abdominal na Polia Alta Ajoelhado (Cable Crunch)',
      targetMuscle: 'Abdômen Dinâmico',
      cue: 'Aproxime as costelas da pelve mantendo o quadril travado.',
      sets: [
        { setNumber: 1, weightKg: 35.0, reps: 15, completed: false },
        { setNumber: 2, weightKg: 40.0, reps: 12, completed: false },
        { setNumber: 3, weightKg: 45.0, reps: 10, completed: false },
      ],
    },
  ]);

  // Alimentos Prescritos no Diário Nutricional (Mamão, Uva e Abacaxi; exclusão de Banana)
  const [dietMeals, setDietMeals] = useState([
    {
      id: 'm-1',
      title: 'Café da Manhã Anabólico',
      time: '08:00',
      calories: 540,
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
      foods: [
        { id: 'f-8', name: 'Whey Protein Isolado Baunilha', quantity: '35g (1 scoop)', calories: 140, proteinG: 29, carbsG: 2, fatG: 1.5, category: 'proteina' as const },
        { id: 'f-9', name: 'Abacaxi Pérola em Fatias', quantity: '150g (2 fatias)', calories: 75, proteinG: 0.8, carbsG: 19, fatG: 0.2, category: 'fruta' as const },
        { id: 'f-10', name: 'Castanha-do-Pará Selecionada', quantity: '20g (4 unid)', calories: 130, proteinG: 3, carbsG: 2.5, fatG: 13, category: 'gordura' as const },
      ]
    }
  ]);

  // Handler de Swap
  const handleSwapFood = (newFood: FoodItemData) => {
    if (!swapTargetFood) return;
    setDietMeals(prev =>
      prev.map(meal => ({
        ...meal,
        foods: meal.foods.map(f => (f.id === swapTargetFood.id ? { ...newFood, id: f.id } : f))
      }))
    );
    setSwapTargetFood(null);
  };

  // Handler de Scanner
  const handleAddScannedFood = (scanned: ScannedFoodResult) => {
    const newFoodItem = {
      id: `scanned-${Date.now()}`,
      name: `${scanned.name} (${scanned.brand || 'Item'})`,
      quantity: scanned.serving,
      calories: scanned.calories,
      proteinG: scanned.proteinG,
      carbsG: scanned.carbsG,
      fatG: scanned.fatG,
      category: 'proteina' as const,
    };

    setDietMeals(prev => [
      ...prev,
      {
        id: `meal-scanned-${Date.now()}`,
        title: 'Alimento Escaneado via OCR/IA',
        time: 'Agora',
        calories: scanned.calories,
        foods: [newFoodItem]
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-neutral-950 font-sans pb-24">
      
      {/* Top Header Oficial */}
      <Header
        streakDays={14}
        userName={userName}
        onOpenCoach={() => setShowIntakeModal(true)}
      />

      {/* Conteúdo Principal Dinâmico por Aba */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 flex-1 space-y-4">
        
        {/* ================= ABA 1: TREINO ================= */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-3xl bg-[#0f131c] border border-cyan-500/30 flex items-center justify-between shadow-[0_0_20px_rgba(0,210,255,0.1)]">
              <div>
                <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                  DIVISÃO ATIVA: ABCD CLÁSSICO
                </span>
                <h2 className="text-base font-black text-white">Treino A — Peitorais, Deltóide & Tríceps</h2>
                <p className="text-[11px] text-slate-400">4 Séries • 5 Exercícios • Cargas Decimais Prontas</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExerciseLibrary(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer"
              >
                104 Vídeos
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowLiveWorkout(true);
                setIsWorkoutMinimized(false);
              }}
              className="w-full py-4 rounded-2xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.35)] transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-neutral-950" />
              {isWorkoutMinimized ? 'Continuar Treino em Andamento' : 'Iniciar Treino ao Vivo Agora'}
            </button>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Sequência da Sessão ({activeWorkoutExercises.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(true)}
                  className="text-[11px] font-bold text-[#00d2ff] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Reavaliar Anamnese
                </button>
              </div>

              {activeWorkoutExercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-[#00d2ff]">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ex.sets.length} séries • {ex.cue}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#00d2ff] block">
                      {ex.sets[0]?.weightKg} kg
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">Float Ativo</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowGPSModal(true)}
                className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#00d2ff]" />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">GPS Outdoor</h4>
                  <span className="text-[10px] text-slate-400">Corrida & Ciclismo</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowExerciseLibrary(true)}
                className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <Dumbbell className="w-4 h-4 text-[#00d2ff]" />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Biblioteca 3D</h4>
                  <span className="text-[10px] text-slate-400">104 Movimentos</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ================= ABA 2: NUTRIÇÃO ================= */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-1">
              <div>
                <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                  NUTRIÇÃO CIENTÍFICA & MACROS
                </span>
                <h2 className="text-xl font-black text-white">Diário Nutricional</h2>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowScannerModal(true)}
                  className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer"
                  title="Scanner de Tabela por Câmera/IA"
                >
                  <Scan className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroceryList(true)}
                  className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer"
                  title="Lista de Compras Semanal"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2.5 text-xs text-slate-200">
              <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0" />
              <span>
                Ficha Nutricional: <strong>Mamão, Uva e Abacaxi</strong> priorizados; <strong>Banana banida</strong>.
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-[#0f131c] border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Balanço Calórico</span>
                <span className="font-mono text-[#00d2ff] font-bold">1.640 / 2.500 kcal</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-[#00d2ff] rounded-full shadow-[0_0_8px_#00d2ff]" style={{ width: '65%' }} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Proteínas</span>
                  <strong className="text-emerald-400 font-mono">145g / 170g</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Carboidratos</span>
                  <strong className="text-cyan-400 font-mono">180g / 280g</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Gorduras</span>
                  <strong className="text-amber-400 font-mono">48g / 70g</strong>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Refeições Prescritas ({dietMeals.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowGroceryList(true)}
                  className="text-[11px] font-bold text-[#00d2ff] hover:underline cursor-pointer"
                >
                  Ver Lista de Compras ➔
                </button>
              </div>

              {dietMeals.map((meal) => (
                <div key={meal.id} className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-white">{meal.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{meal.time}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00d2ff]">{meal.calories} kcal</span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                    {meal.foods.map((food) => (
                      <div key={food.id} className="flex justify-between items-center text-xs py-1">
                        <div>
                          <span className="font-bold text-slate-200 block">{food.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {food.quantity} • P: {food.proteinG}g | C: {food.carbsG}g
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSwapTargetFood(food);
                            setShowSwapModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-bold text-[#00d2ff] flex items-center gap-1 transition-all cursor-pointer"
                        >
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

        {/* ================= ABA 3: BIOFEEDBACK ================= */}
        {activeTab === 'bio' && (
          <div className="space-y-4 animate-in fade-in">
            <BiofeedbackReadinessCard onOpenCoach={() => setShowIntakeModal(true)} />
          </div>
        )}

        {/* ================= ABA 4: COMUNIDADE ================= */}
        {activeTab === 'community' && (
          <div className="space-y-4 animate-in fade-in">
            <CommunityFeedView
              userName={userName}
              userHandle={userHandle}
              onCreateChallengeClick={() => setShowCreateChallenge(true)}
            />
          </div>
        )}

        {/* ================= ABA 5: PERFIL ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in">
            <ProfileView
              userName={userName}
              userHandle={userHandle}
              onUpdateProfile={(name, handle) => {
                setUserName(name);
                setUserHandle(handle);
              }}
            />
          </div>
        )}

      </main>

      {/* ================= FLOATING MINI-PLAYER PERSISTENTE DE TREINO ================= */}
      {isWorkoutMinimized && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-[#0a0e17]/95 border border-cyan-500/50 backdrop-blur-xl rounded-2xl p-3 flex items-center justify-between shadow-[0_0_25px_rgba(0,210,255,0.3)] animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="text-[9px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                TREINO EM ANDAMENTO (MINIMIZADO)
              </span>
              <h4 className="text-xs font-black text-white">Treino A — Peitorais, Deltóide & Tríceps</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#00d2ff] bg-cyan-950/80 px-2 py-1 rounded-lg border border-cyan-500/30">
              {formatTimer(workoutElapsedSeconds)}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsWorkoutMinimized(false);
                setShowLiveWorkout(true);
              }}
              className="p-2 rounded-xl bg-[#00d2ff] text-neutral-950 hover:bg-cyan-400 cursor-pointer shadow-[0_0_10px_#00d2ff]"
              title="Expandir treino"
            >
              <Maximize2 className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAIS ESPECÍFICOS ================= */}
      
      {showLiveWorkout && (
        <LiveWorkoutRunnerModal
          workoutTitle="Treino A — Peitorais, Deltóide & Tríceps"
          splitName="ABCD CLÁSSICO"
          exercises={activeWorkoutExercises}
          elapsedSeconds={workoutElapsedSeconds}
          onClose={() => setShowLiveWorkout(false)}
          onMinimize={() => {
            setShowLiveWorkout(false);
            setIsWorkoutMinimized(true);
          }}
          onFinishWorkout={() => {
            setShowLiveWorkout(false);
            setIsWorkoutMinimized(false);
            setWorkoutElapsedSeconds(0);
          }}
        />
      )}

      {showExerciseLibrary && (
        <ExerciseLibraryModal onClose={() => setShowExerciseLibrary(false)} />
      )}

      {showCreateChallenge && (
        <CreateChallengeModal
          onClose={() => setShowCreateChallenge(false)}
          onCreateChallenge={(ch) => {
            console.log('Novo Desafio Criado:', ch);
          }}
        />
      )}

      {showGPSModal && (
        <GPSOutdoorModal onClose={() => setShowGPSModal(false)} />
      )}

      {showIntakeModal && (
        <ComprehensiveMedicalIntakeModal onClose={() => setShowIntakeModal(false)} />
      )}

      {showScannerModal && (
        <NutritionScannerModal
          onClose={() => setShowScannerModal(false)}
          onAddFood={handleAddScannedFood}
        />
      )}

      {showSwapModal && swapTargetFood && (
        <FoodSwapModal
          currentFood={swapTargetFood}
          onClose={() => {
            setShowSwapModal(false);
            setSwapTargetFood(null);
          }}
          onSwapFood={handleSwapFood}
        />
      )}

      {showGroceryList && (
        <GroceryListModal onClose={() => setShowGroceryList(false)} />
      )}

      {/* Barra de Navegação Inferior Fixa */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

    </div>
  );
}

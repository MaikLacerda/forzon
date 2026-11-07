import React, { useState } from 'react';
import { X, Search, Video, Play, Filter, Dumbbell, ShieldCheck, Check } from 'lucide-react';
interface ExerciseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise?: (exerciseName: string) => void;
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');
  const [onlyWithVideo, setOnlyWithVideo] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  if (!isOpen) return null;

  const muscles = ['Todos', 'Peitoral', 'Dorsal', 'Deltóides', 'Tríceps', 'Bíceps', 'Quadríceps', 'Posterior', 'Abdômen'];

  const exercises = [
    { id: 'ex-1', name: 'Supino Reto com Barra', muscle: 'Peitoral', equipment: 'Barra & Banco', video: '/assets/exercise-videos/bench-press.mp4', notes: 'Apoio firme dos pés, arco lombar fisiológico e cotovelos a 75°.' },
    { id: 'ex-2', name: 'Supino Inclinado com Halteres', muscle: 'Peitoral', equipment: 'Halteres & Banco 30°', video: '/assets/exercise-videos/incline-dumbbell-press.mp4', notes: 'Foco no feixe clavicular do peitoral. Cadência excêntrica de 3s.' },
    { id: 'ex-3', name: 'Crucifixo no Crossover', muscle: 'Peitoral', equipment: 'Polia Média', video: '/assets/exercise-videos/crossover.mp4', notes: 'Tensão mecânica constante em todo o arco do movimento.' },
    { id: 'ex-4', name: 'Puxada Frontal na Polia Alta', muscle: 'Dorsal', equipment: 'Polia Alta', video: '/assets/exercise-videos/lat-pulldown.mp4', notes: 'Puxe direcionando os cotovelos para os quadris sem balanço do tronco.' },
    { id: 'ex-5', name: 'Remada Curvada com Barra', muscle: 'Dorsal', equipment: 'Barra Olímpica', video: '/assets/exercise-videos/bent-over-row.mp4', notes: 'Coluna alinhada em 45°, retração escapular no topo do movimento.' },
    { id: 'ex-6', name: 'Desenvolvimento Militar com Halteres', muscle: 'Deltóides', equipment: 'Halteres', video: '/assets/exercise-videos/overhead-press.mp4', notes: 'Glúteos e core contraídos para sustentação axial.' },
    { id: 'ex-7', name: 'Elevação Lateral com Halteres', muscle: 'Deltóides', equipment: 'Halteres', video: '/assets/exercise-videos/lateral-raise.mp4', notes: 'Movimento no plano escapular (30° anterior) para preservar o manguito.' },
    { id: 'ex-8', name: 'Tríceps Corda na Polia Alta', muscle: 'Tríceps', equipment: 'Cabo & Corda', video: '/assets/exercise-videos/rope-pushdown.mp4', notes: 'Abertura da corda na fase concêntrica máxima.' },
    { id: 'ex-9', name: 'Tríceps Francês Unilateral', muscle: 'Tríceps', equipment: 'Halter', video: '/assets/exercise-videos/french-press.mp4', notes: 'Alongamento da cabeça longa do tríceps mantendo o braço estável.' },
    { id: 'ex-10', name: 'Rosca Direta com Barra W', muscle: 'Bíceps', equipment: 'Barra W', video: '/assets/exercise-videos/barbell-curl.mp4', notes: 'Pegada semi-supinada confortável para os punhos.' },
    { id: 'ex-11', name: 'Rosca Martelo com Halteres', muscle: 'Bíceps', equipment: 'Halteres', video: '/assets/exercise-videos/hammer-curl.mp4', notes: 'Recrutamento do braquial anterior e braquiorradial.' },
    { id: 'ex-12', name: 'Agachamento Livre com Barra', muscle: 'Quadríceps', equipment: 'Barra & Rack', video: '/assets/exercise-videos/squat.mp4', notes: 'Profundidade paralela ou além com joelhos alinhados à ponta dos pés.' },
    { id: 'ex-13', name: 'Leg Press 45°', muscle: 'Quadríceps', equipment: 'Máquina Leg Press', video: '/assets/exercise-videos/leg-press.mp4', notes: 'Sem descolar a pelve do encosto no ponto mais baixo.' },
    { id: 'ex-14', name: 'Mesa Flexora Deitada', muscle: 'Posterior', equipment: 'Máquina Flexora', video: '/assets/exercise-videos/leg-curl.mp4', notes: 'Isolamento dos isquiotibiais com contração sustentada de 1s.' },
    { id: 'ex-15', name: 'Stiff com Halteres', muscle: 'Posterior', equipment: 'Halteres', video: '/assets/exercise-videos/rdl.mp4', notes: 'Flexão de quadril pura preservando curvatura neutra da coluna.' },
    { id: 'ex-16', name: 'Crunch na Polia Alta com Corda', muscle: 'Abdômen', equipment: 'Polia Alta', video: '/assets/exercise-videos/cable-crunch.mp4', notes: 'Flexão torácica dinâmica com sobrecarga sem estresse lombar estático.' },
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Todos' || ex.muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#0a0e17] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Header da Biblioteca */}
        <div className="p-4 border-b border-slate-800 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Biblioteca de Exercícios & Vídeos</h3>
              <p className="text-[10px] text-slate-400">104 demonstrações com padrão biomecânico</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="p-3.5 border-b border-slate-800/80 bg-[#0c1018] space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por exercício ou equipamento..."
              className="w-full bg-[#0a0e17] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {muscles.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedMuscle === m
                    ? 'bg-cyan-500/20 text-[#00d2ff] border border-cyan-500/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="p-3 rounded-xl bg-[#0f131c] border border-slate-800/80 hover:border-cyan-500/30 transition-colors flex items-center justify-between group"
            >
              <div className="space-y-1 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{ex.name}</h4>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {ex.muscle}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{ex.equipment}</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">{ex.notes}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveVideo(ex)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/60 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3 fill-cyan-400" /> Vídeo
                </button>
                {onSelectExercise && (
                  <button
                    onClick={() => {
                      onSelectExercise(ex.name);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Selecionar Exercício"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Player Modal de Vídeo Overlay */}
        {activeVideo && (
          <div className="absolute inset-0 z-60 bg-black/95 flex flex-col p-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">{activeVideo.name}</h4>
                <p className="text-xs text-slate-400">{activeVideo.equipment} • {activeVideo.muscle}</p>
              </div>
              <button onClick={() => setActiveVideo(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-4">
              <div className="w-full aspect-video rounded-2xl bg-neutral-900 border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(0,210,255,0.15)]">
                <video
                  src={activeVideo.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-center p-4">
                          <div class="w-12 h-12 mx-auto rounded-full bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-2">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          </div>
                          <p class="text-xs font-bold text-white">Demonstração Anatômica em Loop</p>
                          <p class="text-[10px] text-slate-400 mt-1">Renderização Blender CC0 • 104 Movimentos</p>
                        </div>
                      `;
                    }
                  }}
                />
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 w-full text-xs text-slate-300">
                <span className="font-bold text-[#00d2ff] block mb-1">Diretriz Biomecânica FORZON:</span>
                <p className="leading-relaxed">{activeVideo.notes}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveVideo(null)}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700"
            >
              Fechar Visualização
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

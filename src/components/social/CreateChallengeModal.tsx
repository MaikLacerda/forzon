import React, { useState } from 'react';
import {
  Trophy,
  X,
  Dumbbell,
  Flame,
  Zap,
  Users,
  Check,
  Share2,
  Copy,
  Sparkles,
  Plus
} from 'lucide-react';

export interface CreatedChallengeData {
  id: string;
  title: string;
  category: 'volume' | 'streak' | 'outdoor';
  targetValue: number;
  targetMetricLabel: string;
  rewardPoints: number;
  invitedAthletes: string[];
}

interface CreateChallengeModalProps {
  onClose: () => void;
  onCreateChallenge: (challenge: CreatedChallengeData) => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  onClose,
  onCreateChallenge,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'volume' | 'streak' | 'outdoor'>('volume');
  const [targetValue, setTargetValue] = useState<number>(50000);
  const [rewardPoints, setRewardPoints] = useState<number>(500);
  const [copiedLink, setCopiedLink] = useState(false);

  // Atletas da Comunidade para Marcar e Convidar
  const [communityAthletes] = useState([
    { id: 'ath-1', name: 'Rodrigo Ferraz', username: '@rodrigoferraz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
    { id: 'ath-2', name: 'Camila Santos', username: '@camilafit', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
    { id: 'ath-3', name: 'Felipe Rocha', username: '@feliperocha', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
    { id: 'ath-4', name: 'Larissa Lima', username: '@larissafit', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
  ]);

  const [selectedAthletes, setSelectedAthletes] = useState<string[]>(['ath-1', 'ath-2']);

  const toggleAthlete = (id: string) => {
    setSelectedAthletes(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleCopyInviteLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCategorySelect = (cat: 'volume' | 'streak' | 'outdoor') => {
    setCategory(cat);
    if (cat === 'volume') {
      setTargetValue(50000);
      setRewardPoints(500);
      if (!title) setTitle('Desafio 50 Toneladas do Ferro');
    } else if (cat === 'streak') {
      setTargetValue(14);
      setRewardPoints(350);
      if (!title) setTitle('Streak Implacável de 14 Dias');
    } else {
      setTargetValue(25);
      setRewardPoints(400);
      if (!title) setTitle('Expedição Outdoor 25km');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const metricLabel =
      category === 'volume'
        ? `${targetValue.toLocaleString('pt-BR')} kg levantados`
        : category === 'streak'
        ? `${targetValue} dias seguidos`
        : `${targetValue} km percorridos`;

    onCreateChallenge({
      id: `chal-user-${Date.now()}`,
      title,
      category,
      targetValue,
      targetMetricLabel: metricLabel,
      rewardPoints,
      invitedAthletes: selectedAthletes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-[0_0_40px_rgba(0,210,255,0.2)] max-h-[92vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                GAMIFICAÇÃO & COMUNIDADE
              </span>
              <h3 className="text-sm font-black text-white">Criar Novo Desafio</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Nome do Desafio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Nome do Desafio</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Desafio 50 Toneladas, Streak 21 Dias, 30km Outdoor..."
              className="w-full bg-[#0f131c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Tipo de Meta</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCategorySelect('volume')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  category === 'volume'
                    ? 'bg-cyan-950/90 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                    : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span className="text-[10px] font-bold">Tonelagem (kg)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('streak')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  category === 'streak'
                    ? 'bg-cyan-950/90 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                    : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span className="text-[10px] font-bold">Streak (Dias)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('outdoor')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  category === 'outdoor'
                    ? 'bg-cyan-950/90 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                    : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-bold">GPS (km)</span>
              </button>
            </div>
          </div>

          {/* Meta Numérica e Pontos de Recompensa */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Meta ({category === 'volume' ? 'kg' : category === 'streak' ? 'dias' : 'km'})
              </label>
              <input
                type="number"
                step="any"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                className="w-full font-mono font-bold text-white bg-transparent text-sm outline-none focus:border-b border-[#00d2ff]"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Recompensa (Pontos)</label>
              <input
                type="number"
                required
                value={rewardPoints}
                onChange={(e) => setRewardPoints(parseInt(e.target.value, 10) || 0)}
                className="w-full font-mono font-bold text-[#00d2ff] bg-transparent text-sm outline-none focus:border-b border-[#00d2ff]"
              />
            </div>
          </div>

          {/* Convidar Atletas da Comunidade */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00d2ff]" />
                Convidar Atletas & Amigos ({selectedAthletes.length})
              </label>
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="text-[10px] font-bold text-[#00d2ff] hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {communityAthletes.map((ath) => {
                const isSelected = selectedAthletes.includes(ath.id);
                return (
                  <div
                    key={ath.id}
                    onClick={() => toggleAthlete(ath.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/50'
                        : 'bg-[#0f131c] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={ath.avatar} alt={ath.name} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{ath.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{ath.username}</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#00d2ff] border-[#00d2ff] text-neutral-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botão de Criação */}
          <button
            type="submit"
            className="w-full mt-3 py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 fill-neutral-950" />
            Lançar Desafio para a Comunidade
          </button>
        </form>

      </div>
    </div>
  );
};
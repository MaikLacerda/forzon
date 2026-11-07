import React, { useState } from 'react';
import {
  Trophy,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Send,
  X,
  Copy,
  Check
} from 'lucide-react';

export interface PostItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  timeAgo: string;
  tag: string;
  content: string;
  likes: number;
  commentsCount: number;
  isLiked: boolean;
  isOwner?: boolean;
}

interface CommunityFeedViewProps {
  userName: string;
  userHandle: string;
  onCreateChallengeClick: () => void;
}

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  userName,
  userHandle,
  onCreateChallengeClick,
}) => {
  const [newPostText, setNewPostText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareModalPost, setShareModalPost] = useState<PostItem | null>(null);

  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: 'post-1',
      authorName: userName || 'Maikon Lacerda',
      authorHandle: userHandle || '@maiklacerda',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'Agora mesmo',
      tag: 'Treino A • Peitorais, Deltóide & Tríceps',
      content: 'Finalizei a sessão de peito e ombros! O biofeedback em 88% deu sinal verde para sobrecarga progressiva no Supino Inclinado com Halteres. Cargas registradas com precisão!',
      likes: 12,
      commentsCount: 2,
      isLiked: true,
      isOwner: true,
    },
    {
      id: 'post-2',
      authorName: 'Rodrigo Ferraz',
      authorHandle: '@rodrigoferraz',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'Há 45 min',
      tag: 'Rotina Hipertrofia A • Peito & Tríceps',
      content: 'Bati PR no Supino Inclinado com 36kg hoje! O descanso ATP-CP de 90 segundos com +30s na última série fez toda a diferença na recuperação neural.',
      likes: 24,
      commentsCount: 4,
      isLiked: false,
    },
    {
      id: 'post-3',
      authorName: 'Camila Santos',
      authorHandle: '@camilafit',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'Há 2 horas',
      tag: 'Stairmaster Pós-Treino • Zona 2',
      content: '20 min de Simulador de Escadas após o treino de pernas. 210 kcal pagas e sincronizadas direto com o Strava!',
      likes: 42,
      commentsCount: 5,
      isLiked: true,
    },
  ]);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: PostItem = {
      id: `user-p-${Date.now()}`,
      authorName: userName || 'Maikon Lacerda',
      authorHandle: userHandle || '@maiklacerda',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'Agora mesmo',
      tag: 'Atualização do Atleta',
      content: newPostText,
      likes: 1,
      commentsCount: 0,
      isLiked: true,
      isOwner: true,
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  return (
    <div className="space-y-4 animate-in fade-in select-none">
      
      {/* Cabeçalho da Comunidade com Botão de Criar Desafio */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
            COMUNIDADE & SOCIAL
          </span>
          <h2 className="text-xl font-black text-white">Feed dos Atletas</h2>
        </div>
        <button
          type="button"
          onClick={onCreateChallengeClick}
          className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00d2ff] text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-900 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,210,255,0.2)]"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Criar Desafio</span>
        </button>
      </div>

      {/* Caixa de Publicação de Novo Post */}
      <form onSubmit={handleCreatePost} className="p-3.5 rounded-3xl bg-[#0f131c] border border-slate-800 space-y-2.5">
        <div className="flex gap-2.5 items-center">
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs text-[#00d2ff]">
            {userName ? userName.slice(0, 2).toUpperCase() : 'ML'}
          </div>
          <input
            type="text"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Compartilhe seu treino, carga ou conquista..."
            className="flex-1 bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00d2ff]"
          />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={!newPostText.trim()}
            className="px-4 py-1.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Publicar
          </button>
        </div>
      </form>

      {/* Lista de Postagens da Comunidade */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 rounded-3xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2.5"
          >
            {/* Topo do Post */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h4 className="text-xs font-black text-white">{post.authorName}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <span>{post.authorHandle}</span>
                    <span>•</span>
                    <span>{post.timeAgo}</span>
                  </div>
                </div>
              </div>

              {/* Tag de Treino ou Lixeira se for o dono */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-[#00d2ff] max-w-[170px] truncate">
                  {post.tag}
                </span>
                {post.isOwner && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Excluir Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>

            {/* Ações: Curtir, Comentar, Compartilhar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  post.isLiked ? 'text-cyan-400 font-bold' : 'hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-cyan-400' : ''}`} />
                <span>{post.likes} Curtidas</span>
              </button>

              <button type="button" className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentsCount} Comentários</span>
              </button>

              <button
                type="button"
                onClick={() => setShareModalPost(post)}
                className="flex items-center gap-1.5 hover:text-[#00d2ff] transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Compartilhamento Social */}
      {shareModalPost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-[0_0_40px_rgba(0,210,255,0.25)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">Compartilhar na Comunidade</h3>
              <button type="button" onClick={() => setShareModalPost(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setCopiedLink(true);
                  setTimeout(() => {
                    setCopiedLink(false);
                    setShareModalPost(null);
                  }, 1500);
                }}
                className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00d2ff] font-bold flex flex-col items-center gap-1.5 hover:bg-cyan-900 cursor-pointer"
              >
                {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Confira meu treino no FORZON: ${shareModalPost.content}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold flex flex-col items-center gap-1.5 hover:bg-emerald-900 cursor-pointer text-center"
              >
                <Share2 className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
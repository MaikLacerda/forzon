import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Dumbbell,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Send,
  Plus,
  X,
  Copy,
  Check,
  Search,
  UserPlus,
  UserCheck,
  Sparkles,
  Users
} from 'lucide-react';

interface CommentItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timeAgo: string;
}

interface PostItem {
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
  commentsList: CommentItem[];
}

interface SuggestedAthlete {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  streakDays: number;
  badge: string;
  isFollowing: boolean;
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

  // Modal de Comentários Interativo
  const [activeCommentsPost, setActiveCommentsPost] = useState<PostItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Busca e atletas recomendados da plataforma
  const [searchFriend, setSearchFriend] = useState('');
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false);

  const [suggestedAthletes, setSuggestedAthletes] = useState<SuggestedAthlete[]>([
    {
      id: 'ath-1',
      name: 'Rodrigo Ferraz',
      handle: '@rodrigoferraz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      streakDays: 28,
      badge: 'Top 5% Volume',
      isFollowing: false,
    },
    {
      id: 'ath-2',
      name: 'Camila Santos',
      handle: '@camilafit',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      streakDays: 45,
      badge: 'Stairmaster Queen',
      isFollowing: true,
    },
    {
      id: 'ath-3',
      name: 'Felipe Rocha',
      handle: '@feliperocha',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      streakDays: 14,
      badge: 'Jiu-Jitsu & Força',
      isFollowing: false,
    },
    {
      id: 'ath-4',
      name: 'Larissa Lima',
      handle: '@larissafit',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      streakDays: 32,
      badge: 'Maratonista GPS',
      isFollowing: false,
    },
  ]);

  const toggleFollow = (id: string) => {
    setSuggestedAthletes((prev) =>
      prev.map((ath) => (ath.id === id ? { ...ath, isFollowing: !ath.isFollowing } : ath))
    );
  };

  const filteredAthletes = suggestedAthletes.filter(
    (a) =>
      a.name.toLowerCase().includes(searchFriend.toLowerCase()) ||
      a.handle.toLowerCase().includes(searchFriend.toLowerCase())
  );

  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: 'post-1',
      authorName: userName || 'Maikon Lacerda',
      authorHandle: userHandle || '@maiklacerda',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'Agora mesmo',
      tag: 'Treino A • Peitorais, Deltóide & 3x Tríceps',
      content: 'Finalizei a sessão de peito e ombros! O biofeedback em 88% deu sinal verde para sobrecarga progressiva no Supino Inclinado com Halteres. Cargas registradas com precisão!',
      likes: 12,
      commentsCount: 2,
      isLiked: true,
      isOwner: true,
      commentsList: [
        {
          id: 'c-1',
          authorName: 'Rodrigo Ferraz',
          authorHandle: '@rodrigoferraz',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          content: 'Volume monstro! Qual carga você usou no inclinado?',
          timeAgo: 'Há 10 min'
        },
        {
          id: 'c-2',
          authorName: 'Camila Santos',
          authorHandle: '@camilafit',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          content: 'A consistência tá absurda! Parabéns!',
          timeAgo: 'Há 5 min'
        }
      ]
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
      commentsCount: 1,
      isLiked: false,
      commentsList: [
        {
          id: 'c-3',
          authorName: userName || 'Maikon Lacerda',
          authorHandle: userHandle || '@maiklacerda',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          content: 'Descanso ATP-CP salva vidas no supino!',
          timeAgo: 'Há 20 min'
        }
      ]
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
      commentsCount: 0,
      isLiked: true,
      commentsList: []
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
      commentsList: []
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  // Enviar novo comentário no post aberto
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentsPost || !newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `comm-${Date.now()}`,
      authorName: userName || 'Maikon Lacerda',
      authorHandle: userHandle || '@maiklacerda',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      content: newCommentText.trim(),
      timeAgo: 'Agora mesmo'
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === activeCommentsPost.id) {
          const updatedComments = [...(p.commentsList || []), newComment];
          const updatedPost = {
            ...p,
            commentsList: updatedComments,
            commentsCount: updatedComments.length
          };
          setActiveCommentsPost(updatedPost);
          return updatedPost;
        }
        return p;
      })
    );

    setNewCommentText('');
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
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setShowFindFriendsModal(true)}
            className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-[#00d2ff] hover:bg-cyan-900 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Encontrar Amigos"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Amigos</span>
          </button>
          <button
            type="button"
            onClick={onCreateChallengeClick}
            className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00d2ff] text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-900 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,210,255,0.2)]"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Criar Desafio</span>
          </button>
        </div>
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

      {/* SEÇÃO INTEGRADA: ENCONTRAR AMIGOS & INDICADOS DA PLATAFORMA */}
      <div className="p-4 rounded-3xl bg-[#0f131c] border border-cyan-500/30 space-y-3 shadow-[0_0_20px_rgba(0,210,255,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00d2ff]" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Encontrar Atletas & Amigos
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#00d2ff] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
            {suggestedAthletes.filter((a) => a.isFollowing).length} Seguidos
          </span>
        </div>

        {/* Barra de Pesquisa de Amigos */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFriend}
            onChange={(e) => setSearchFriend(e.target.value)}
            placeholder="Buscar por @username ou nome do atleta..."
            className="w-full bg-[#07090e] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00d2ff]"
          />
        </div>

        {/* Carrossel / Lista de Atletas Indicados */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Recomendados pela Comunidade FORZON:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredAthletes.map((ath) => (
              <div
                key={ath.id}
                className="p-2.5 rounded-2xl bg-[#07090e] border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={ath.avatar}
                      alt={ath.name}
                      className="w-9 h-9 rounded-full object-cover border border-cyan-500/30"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#07090e]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{ath.name}</h4>
                    <span className="text-[10px] font-mono text-[#00d2ff] block">{ath.handle}</span>
                    <span className="text-[9px] text-slate-400">{ath.badge}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFollow(ath.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    ath.isFollowing
                      ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40'
                      : 'bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black shadow-[0_0_10px_#00d2ff]'
                  }`}
                >
                  {ath.isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> Seguido
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" /> Seguir
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

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

            {/* Ações: Curtir, Comentar (ABRE O MODAL INTERATIVO), Compartilhar */}
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

              <button
                type="button"
                onClick={() => {
                  setActiveCommentsPost(post);
                  setNewCommentText('');
                }}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  post.commentsCount > 0 ? 'text-[#00d2ff] font-bold' : 'hover:text-white'
                }`}
              >
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

      {/* Modal de Comentários Interativo (NOVO & FUNCIONAL) */}
      {activeCommentsPost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border-t sm:border border-cyan-500/40 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-[0_0_40px_rgba(0,210,255,0.25)] max-h-[85vh] flex flex-col">
            
            {/* Topo do Modal de Comentários */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Comentários da Comunidade</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Post de {activeCommentsPost.authorName} ({activeCommentsPost.commentsCount})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCommentsPost(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resumo do Post Comentado */}
            <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800/80 shrink-0 space-y-1">
              <span className="text-[9px] font-mono text-[#00d2ff] font-bold block truncate">
                {activeCommentsPost.tag}
              </span>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                "{activeCommentsPost.content}"
              </p>
            </div>

            {/* Lista Rolável de Comentários */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {activeCommentsPost.commentsList && activeCommentsPost.commentsList.length > 0 ? (
                activeCommentsPost.commentsList.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.authorAvatar}
                          alt={c.authorName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">
                            {c.authorName}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            {c.authorHandle}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">{c.timeAgo}</span>
                    </div>
                    <p className="text-xs text-slate-200 pl-8 leading-relaxed">{c.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs space-y-1">
                  <MessageCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold text-slate-400">Nenhum comentário ainda.</p>
                  <p className="text-[10px]">Seja o primeiro a motivar o atleta!</p>
                </div>
              )}
            </div>

            {/* Caixa de Enviar Novo Comentário */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-800 shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Escreva um comentário ou incentive o atleta..."
                  className="flex-1 bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00d2ff]"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer shadow-[0_0_10px_#00d2ff]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

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
                className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold flex flex-col items-center gap-1.5 hover:bg-emerald-900"
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
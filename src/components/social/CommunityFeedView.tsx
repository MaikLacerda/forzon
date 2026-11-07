import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Trash2,
  Send,
  Image as ImageIcon,
  UserPlus,
  Search,
  Trophy,
  X,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';

export interface PostComment {
  id: string;
  author: string;
  username: string;
  text: string;
  time: string;
}

export interface PostItem {
  id: string;
  author: string;
  username: string;
  avatar?: string;
  time: string;
  content: string;
  workoutTag?: string;
  likes: number;
  liked: boolean;
  isOwner?: boolean;
  comments: PostComment[];
}

interface CommunityFeedViewProps {
  currentUser: { name: string; username: string; avatar?: string };
  onCreateChallengeClick: () => void;
}

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  currentUser,
  onCreateChallengeClick,
}) => {
  const [newPostText, setNewPostText] = useState('');
  const [searchFriend, setSearchFriend] = useState('');
  
  // Modais de Compartilhamento & Comentários
  const [sharingPost, setSharingPost] = useState<PostItem | null>(null);
  const [commentingPost, setCommentingPost] = useState<PostItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Feed com posts iniciais
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: 'p-1',
      author: 'Rodrigo Ferraz',
      username: '@rodrigoferraz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      time: 'Há 25 min',
      content: 'Bati PR no Supino Inclinado com 36kg hoje! O biofeedback em 88% deu sinal verde e rendeu demais.',
      workoutTag: 'Rotina Hipertrofia A • Peito & Tríceps',
      likes: 24,
      liked: false,
      isOwner: false,
      comments: [
        { id: 'c-1', author: 'Camila Santos', username: '@camilafit', text: 'Carga monstra! Parabéns!', time: 'Há 10 min' }
      ]
    },
    {
      id: 'p-2',
      author: 'Camila Santos',
      username: '@camilafit',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      time: 'Há 1 hora',
      content: '20 min de Simulador de Escadas após o treino de pernas. Suor no máximo e 210 kcal pagas no Strava!',
      workoutTag: 'Stairmaster Pós-Treino • Zona 2',
      likes: 42,
      liked: true,
      isOwner: false,
      comments: []
    }
  ]);

  // Criar novo post
  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      author: currentUser.name || 'Atleta FORZON',
      username: currentUser.username || '@atleta',
      avatar: currentUser.avatar,
      time: 'Agora mesmo',
      content: newPostText,
      workoutTag: 'Sessão Registrada • FORZON Pro',
      likes: 1,
      liked: true,
      isOwner: true, // Post criado pelo próprio usuário pode ser deletado
      comments: []
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  // Excluir post com confirmação rápida
  const handleDeletePost = (postId: string) => {
    if (confirm('Deseja realmente excluir esta publicação do seu feed?')) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  // Curtir/descurtir
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            liked: !p.liked,
            likes: p.liked ? p.likes - 1 : p.likes + 1
          };
        }
        return p;
      })
    );
  };

  // Adicionar comentário real
  const handleAddComment = () => {
    if (!commentingPost || !newCommentText.trim()) return;
    const commentObj: PostComment = {
      id: `comm-${Date.now()}`,
      author: currentUser.name || 'Atleta',
      username: currentUser.username || '@atleta',
      text: newCommentText,
      time: 'Agora mesmo'
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === commentingPost.id) {
          return { ...p, comments: [...p.comments, commentObj] };
        }
        return p;
      })
    );

    setCommentingPost((prev) => (prev ? { ...prev, comments: [...prev.comments, commentObj] } : null));
    setNewCommentText('');
  };

  // Compartilhar nas redes sociais
  const handleShareToPlatform = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'reddit' | 'copy') => {
    if (!sharingPost) return;
    const text = encodeURIComponent(`Confira meu treino no FORZON: "${sharingPost.content}" por ${sharingPost.username}`);
    const url = encodeURIComponent(window.location.origin);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    } else if (platform === 'reddit') {
      window.open(`https://reddit.com/submit?url=${url}&title=${text}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard?.writeText(`${window.location.origin}/post/${sharingPost.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider">COMUNIDADE & SOCIAL</span>
          <h1 className="text-2xl font-black text-white tracking-tight">Feed dos Atletas</h1>
        </div>
        <button
          onClick={onCreateChallengeClick}
          className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00d2ff] text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-900 transition-all"
        >
          <Trophy className="w-3.5 h-3.5" /> Criar Desafio
        </button>
      </div>

      {/* Caixa de Criação de Post */}
      <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center text-xs font-bold text-[#00d2ff]">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'ML'
            )}
          </div>
          <input
            type="text"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Compartilhe seu treino, carga ou conquista..."
            className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => alert('Selecione uma foto da sua galeria pós-treino.')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" /> Adicionar Foto
          </button>
          <button
            onClick={handleCreatePost}
            className="px-3.5 py-1.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Publicar
          </button>
        </div>
      </div>

      {/* Encontrar Atletas & Amigos */}
      <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encontrar Atletas & Amigos</span>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFriend}
              onChange={(e) => setSearchFriend(e.target.value)}
              placeholder="Buscar por @username ou nome..."
              className="w-full bg-[#07090e] border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
            />
          </div>
          <button
            onClick={() => {
              if (searchFriend) alert(`Convite de amizade enviado para ${searchFriend}!`);
            }}
            className="px-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00d2ff] text-xs font-bold flex items-center gap-1 hover:bg-cyan-900"
          >
            <UserPlus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>
      </div>

      {/* Feed de Publicações */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="p-4 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center text-xs font-bold text-[#00d2ff]">
                  {post.avatar ? (
                    <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                  ) : (
                    post.author.substring(0, 2)
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{post.author}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{post.username} • {post.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {post.workoutTag && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {post.workoutTag}
                  </span>
                )}
                {/* Botão de Lixeira para excluir post próprio */}
                {post.isOwner && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                    title="Excluir post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

            {/* Ações: Curtir, Comentários Reais, Compartilhamento Multi-Plataforma */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <button
                onClick={() => handleToggleLike(post.id)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  post.liked ? 'text-[#00d2ff] font-bold' : 'hover:text-white'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${post.liked ? 'fill-[#00d2ff]' : ''}`} />
                <span>{post.likes} Curtidas</span>
              </button>

              <button
                onClick={() => setCommentingPost(post)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{post.comments.length} Comentários</span>
              </button>

              <button
                onClick={() => setSharingPost(post)}
                className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL DE COMENTÁRIOS REAIS ================= */}
      {commentingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/30 rounded-3xl max-w-md w-full p-4 space-y-4 max-h-[85vh] flex flex-col justify-between shadow-[0_0_30px_rgba(0,210,255,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00d2ff]" />
                <h3 className="text-xs font-bold text-white">Comentários ({commentingPost.comments.length})</h3>
              </div>
              <button onClick={() => setCommentingPost(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {commentingPost.comments.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </div>
              ) : (
                commentingPost.comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-[#0f131c] border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{c.author}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{c.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
              />
              <button
                onClick={handleAddComment}
                className="px-3.5 py-2 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 text-xs font-black flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL MULTI-COMPARTILHAMENTO REAL ================= */}
      {sharingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0e17] border border-cyan-500/30 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-[0_0_35px_rgba(0,210,255,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#00d2ff]" />
                <h3 className="text-xs font-bold text-white">Compartilhar Treino & Post</h3>
              </div>
              <button onClick={() => setSharingPost(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">Escolha a plataforma para enviar:</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleShareToPlatform('whatsapp')}
                className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-900/60"
              >
                WhatsApp
              </button>

              <button
                onClick={() => handleShareToPlatform('twitter')}
                className="p-3 rounded-xl bg-sky-950/50 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-sky-900/60"
              >
                Twitter / X
              </button>

              <button
                onClick={() => handleShareToPlatform('facebook')}
                className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-900/60"
              >
                Facebook
              </button>

              <button
                onClick={() => handleShareToPlatform('reddit')}
                className="p-3 rounded-xl bg-orange-950/50 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-900/60"
              >
                Reddit
              </button>
            </div>

            <button
              onClick={() => handleShareToPlatform('copy')}
              className="w-full py-2.5 rounded-xl bg-[#0f131c] border border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:border-cyan-500/40"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Direto'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
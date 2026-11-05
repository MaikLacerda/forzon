import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Users,
  Flame,
  Dumbbell,
  Send,
  Plus,
  Medal,
  CheckCircle,
  Sparkles,
  UserPlus,
  UserCheck,
  Flag,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { SocialPost, GroupChallenge, Achievement, UserProfile, CompletedWorkoutRecord, GPSActivity } from "../../types";
import { GlobalVolumeRanking } from "../social/GlobalVolumeRanking";
import { BadgesList } from "../profile/BadgesList";
import { badgeService } from "../../services/badgeService";
import { aiService } from "../../services/aiService";
import { dispatchAchievementUnlocked } from "../common/AchievementUnlockToast";

interface SocialViewProps {
  posts: SocialPost[];
  challenges: GroupChallenge[];
  achievements: Achievement[];
  profile: UserProfile;
  workoutHistory?: CompletedWorkoutRecord[];
  gpsActivities?: GPSActivity[];
  streakDays?: number;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onToggleJoinChallenge: (challengeId: string) => void;
  onOpenNewPostModal: () => void;
  onToggleFollow: (handle: string) => void;
  onReportPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onStartWorkoutClick?: () => void;
}

export const SocialView: React.FC<SocialViewProps> = ({
  posts,
  challenges,
  achievements,
  profile,
  workoutHistory = [],
  gpsActivities = [],
  streakDays = 7,
  onLikePost,
  onAddComment,
  onToggleJoinChallenge,
  onOpenNewPostModal,
  onToggleFollow,
  onReportPost,
  onDeletePost,
  onStartWorkoutClick,
}) => {
  const [activeTab, setActiveTab] = useState<"feed" | "ranking" | "challenges" | "badges">("feed");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [aiChallenges, setAiChallenges] = useState<any[]>([]);
  const [isLoadingAiChallenges, setIsLoadingAiChallenges] = useState(false);

  const dynamicBadges = badgeService.calculateBadges(workoutHistory, streakDays, gpsActivities);
  const totalVolumeKg = workoutHistory.reduce((sum, item) => sum + (item.totalVolumeKg || 0), 0);

  const handleGenerateAiChallenges = async () => {
    setIsLoadingAiChallenges(true);
    try {
      const suggestions = await aiService.suggestChallenges({
        workoutHistory,
        totalVolumeKg,
        streakDays,
        profile,
      });
      setAiChallenges(suggestions);
    } catch (_err) {
      // Handled cleanly
    } finally {
      setIsLoadingAiChallenges(false);
    }
  };

  const handleClaimAiChallenge = (ch: any) => {
    dispatchAchievementUnlocked({
      title: ch.title,
      description: ch.description,
      points: ch.rewardPoints,
    });
  };

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Rede Esportiva FORZON</span>
            <span aria-hidden="true">·</span>
            <span>Comunidade de Alta Performance</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Moderação Ativa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Comunidade & Desafios
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Compartilhe conquistas, celebre recordes de carga e participe de desafios coletivos sem cobranças irreais.
          </p>
        </div>

        <button
          onClick={onOpenNewPostModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Publicação</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-900 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("feed")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "feed" ? "bg-neutral-800 text-emerald-400" : "text-neutral-400 hover:text-white"
          }`}
        >
          Feed Social ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("ranking")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "ranking" ? "bg-neutral-800 text-emerald-400" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Ranking Global de Tonelagem</span>
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "challenges" ? "bg-neutral-800 text-emerald-400" : "text-neutral-400 hover:text-white"
          }`}
        >
          Grupos & Desafios ({challenges.length})
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "badges" ? "bg-neutral-800 text-emerald-400" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Medal className="w-3.5 h-3.5" />
          <span>Minhas Conquistas ({dynamicBadges.filter((b) => b.unlocked).length}/{dynamicBadges.length})</span>
        </button>
      </div>

      {/* 1. Feed Tab */}
      {activeTab === "feed" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-5">
            {posts.map((post) => {
              const isCommentsOpen = Boolean(expandedComments[post.id]);
              return (
                <div
                  key={post.id}
                  className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-4"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{post.authorName}</span>
                          <span className="text-xs font-normal text-neutral-500 font-mono">
                            {post.authorHandle}
                          </span>
                          {post.authorHandle !== profile.handle && (
                            <button
                              onClick={() => onToggleFollow(post.authorHandle)}
                              className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                                (profile.followingIds || []).includes(post.authorHandle)
                                  ? "bg-neutral-800 text-neutral-400 hover:text-white"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              }`}
                            >
                              {(profile.followingIds || []).includes(post.authorHandle)
                                ? "Seguindo"
                                : "+ Seguir"}
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400">{post.timestamp}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                        {post.category === "record"
                          ? "Recorde Pessoal"
                          : post.category === "run"
                          ? "Corrida Outdoor"
                          : "Treino de Força"}
                      </span>

                      {post.authorHandle === profile.handle ? (
                        <button
                          onClick={() => {
                            if (confirm("Deseja apagar sua publicação?")) {
                              onDeletePost(post.id);
                            }
                          }}
                          className="p-1 rounded-md text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Apagar minha publicação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onReportPost(post.id);
                            alert("Publicação denunciada. Nossa moderação esportiva irá analisar o conteúdo.");
                          }}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            post.reportedByCurrentUser
                              ? "text-amber-400"
                              : "text-neutral-500 hover:text-neutral-300"
                          }`}
                          title="Denunciar publicação"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {post.reportedByCurrentUser && (
                    <div className="bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs p-2.5 rounded-xl">
                      Você denunciou este conteúdo. Ele está sob análise da moderação da comunidade.
                    </div>
                  )}

                  {/* Post Content with line break preservation */}
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Post Media: Photo or Video */}
                  {post.mediaUrl && (
                    <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/80 shadow-md">
                      {post.mediaType === "video" ? (
                        <video
                          src={post.mediaUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full max-h-[420px] bg-black rounded-2xl object-contain mx-auto"
                        />
                      ) : (
                        <div className="relative">
                          <img
                            src={post.mediaUrl}
                            alt="Foto do treino"
                            className="w-full max-h-[420px] rounded-2xl object-contain bg-black mx-auto"
                          />
                          {post.workoutData?.totalKgLifted && (
                            <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 text-white shadow-xl">
                              <span className="text-emerald-400 font-bold">
                                {post.workoutData.totalKgLifted.toLocaleString("pt-BR")} KG
                              </span>
                              <span className="text-neutral-400 text-[10px]">LEVANTADOS</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Workout Highlight Box */}
                  {post.workoutData && (
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3 font-mono">
                      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                        <span className="font-bold text-white text-sm">{post.workoutData.title}</span>
                        <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                          {post.workoutData.highlight}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-300">
                        <span className="flex items-center gap-1">
                          <span className="text-neutral-500">Tempo:</span>
                          <strong>{post.workoutData.duration}</strong>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <span>{post.workoutData.volumeOrDistance}</span>
                        </span>
                      </div>

                      {/* Exercises summary breakdown if available */}
                      {post.workoutData.exercisesSummary && post.workoutData.exercisesSummary.length > 0 && (
                        <div className="pt-2 border-t border-neutral-900 space-y-1.5 text-[11px]">
                          <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            Exercícios Executados na Sessão:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {post.workoutData.exercisesSummary.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="bg-neutral-900/70 border border-neutral-850 px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2"
                              >
                                <span className="text-neutral-200 font-semibold truncate">{ex.name}</span>
                                <span className="text-emerald-400 font-mono text-[10px] shrink-0">{ex.setsDetail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Actions: Like, Comment, Share */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs text-neutral-400">
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.likedByCurrentUser ? "text-rose-500 font-semibold" : "hover:text-white"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${post.likedByCurrentUser ? "fill-rose-500" : ""}`}
                      />
                      <span>{post.likesCount} curtidas</span>
                    </button>

                    <button
                      onClick={() =>
                        setExpandedComments((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length} comentários</span>
                    </button>

                    <button
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(
                            `Confira o treino de ${post.authorName} na FORZON: "${post.content.slice(0, 50)}..."`
                          );
                        }
                      }}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                      title="Copiar link do post"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </button>
                  </div>

                  {/* Comments list & input */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-neutral-850 space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                            referrerPolicy="no-referrer"
                          />
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white">{comment.authorName}</span>
                              <span className="text-[10px] text-neutral-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-neutral-300">{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Comment input box */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Escreva um comentário incentivador..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendComment(post.id);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => handleSendComment(post.id)}
                          className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Sidebar: Mini-Ranking Global, Quick Challenges & Guidelines */}
          <div className="space-y-5">
            {/* Global Volume & GPS Weekly Leaderboard */}
            <GlobalVolumeRanking
              currentUserProfile={profile}
              workoutHistory={workoutHistory}
              gpsActivities={gpsActivities}
              compact
              onStartWorkoutClick={onStartWorkoutClick}
            />

            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Desafios Coletivos</span>
                </h3>
                <button
                  onClick={() => setActiveTab("challenges")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  Ver Todos
                </button>
              </div>

              <div className="space-y-3">
                {challenges.slice(0, 2).map((ch) => (
                  <div key={ch.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 space-y-1.5">
                    <div className="text-xs font-bold text-white truncate">{ch.title}</div>
                    <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                      <span>Progresso</span>
                      <span className="text-amber-400">{ch.currentValue} / {ch.targetValue}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((ch.currentValue / ch.targetValue) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fair Play & Anti-Toxicity Badge */}
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-4 text-xs text-neutral-400 space-y-1.5">
              <div className="font-semibold text-neutral-200">Código Esportivo FORZON</div>
              <p className="text-[11px] leading-relaxed">
                Nossa comunidade valoriza a consistência diária e a evolução individual, e não a comparação tóxica ou métricas vazias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Global Leaderboard Ranking Tab (Full view) */}
      {activeTab === "ranking" && (
        <div className="max-w-4xl mx-auto space-y-5">
          <GlobalVolumeRanking
            currentUserProfile={profile}
            workoutHistory={workoutHistory}
            gpsActivities={gpsActivities}
            onStartWorkoutClick={onStartWorkoutClick}
          />
        </div>
      )}

      {/* 2. Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="space-y-6">
          {/* AI Gamification Challenges Generator Card */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Desafios Personalizados com IA
                    </h3>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Gamificação Adaptativa
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    A IA analisa seu histórico de tonelagem ({totalVolumeKg.toLocaleString()}kg) e streak ({streakDays} dias) para calibrar metas individuais.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() =>
                    dispatchAchievementUnlocked({
                      title: "Mestre da Sobrecarga",
                      description: "Você superou a barreira dos 50.000 kg levantados com consistência implacável!",
                      points: 500,
                    })
                  }
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  title="Testar notificação toast de conquista"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Testar Toast 🎉</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAiChallenges}
                  disabled={isLoadingAiChallenges}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isLoadingAiChallenges ? "animate-spin" : ""}`} />
                  <span>{isLoadingAiChallenges ? "Analisando..." : "Sugerir com IA"}</span>
                </button>
              </div>
            </div>

            {/* AI Generated Challenges Cards */}
            {aiChallenges.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                {aiChallenges.map((ach) => (
                  <div
                    key={ach.id}
                    className="bg-neutral-950 p-4 rounded-2xl border border-purple-500/30 space-y-3 flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-purple-400 uppercase font-bold">{ach.category}</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-amber-400" />
                          +{ach.rewardPoints} pts
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">{ach.description}</p>
                      {ach.coachTip && (
                        <div className="text-[11px] text-neutral-400 italic bg-neutral-900 p-2 rounded-lg border border-neutral-850">
                          Coach: "{ach.coachTip}"
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaimAiChallenge(ach)}
                      className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>Desbloquear / Aceitar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((ch) => (
              <div
                key={ch.id}
                className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold">{ch.category}</span>
                    <span className="text-neutral-400 font-mono">{ch.deadlineDaysLeft} dias restantes</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{ch.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{ch.description}</p>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-neutral-300 font-mono mb-1">
                      <span>Seu Progresso</span>
                      <span className="font-bold text-amber-400">
                        {ch.currentValue} / {ch.targetValue}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((ch.currentValue / ch.targetValue) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Leaderboard mini table */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-850">
                  <div className="text-[11px] font-semibold text-neutral-400">Top Participantes:</div>
                  {ch.leaderboard.slice(0, 3).map((lb) => (
                    <div key={lb.rank} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-500 w-3">{lb.rank}.</span>
                        <span className="text-neutral-200">{lb.name}</span>
                      </div>
                      <span className="font-mono text-neutral-400 tabular-nums">{lb.score}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onToggleJoinChallenge(ch.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    ch.joined
                      ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      : "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20"
                  }`}
                >
                  {ch.joined ? "Inscrito no Desafio" : "Participar Deste Desafio"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Dynamic Badges Tab */}
      {activeTab === "badges" && (
        <div className="space-y-4">
          <BadgesList
            badges={dynamicBadges}
            workoutsCount={workoutHistory.length}
            streakDays={streakDays}
            totalVolumeKg={totalVolumeKg}
          />
        </div>
      )}
    </div>
  );
};

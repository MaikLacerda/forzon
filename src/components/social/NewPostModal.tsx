import React, { useState } from "react";
import { X, Send, Dumbbell, Award, Flame, Navigation } from "lucide-react";
import { SocialPost, UserProfile } from "../../types";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSubmitPost: (post: SocialPost) => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSubmitPost,
}) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"workout" | "run" | "nutrition" | "record">("workout");
  const [workoutHighlight, setWorkoutHighlight] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      authorName: profile.name,
      authorHandle: profile.handle,
      authorAvatar: profile.avatarUrl,
      timestamp: "Agora",
      content: content.trim(),
      category,
      workoutData: workoutHighlight.trim()
        ? {
            title: category === "run" ? "Corrida Outdoor FORZON" : "Sessão de Força FORZON",
            duration: "45 min",
            volumeOrDistance: category === "run" ? "5.0 km" : "7.500 kg volume",
            highlight: workoutHighlight.trim(),
          }
        : undefined,
      likesCount: 1,
      likedByCurrentUser: true,
      comments: [],
    };

    onSubmitPost(newPost);
    setContent("");
    setWorkoutHighlight("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-white">Criar Publicação na Comunidade</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Categoria do Post:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "workout", label: "Musculação" },
                { id: "record", label: "Recorde / PR" },
                { id: "run", label: "Corrida" },
                { id: "nutrition", label: "Nutrição" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as any)}
                  className={`py-2 px-1 text-center rounded-xl border font-medium transition-colors cursor-pointer truncate ${
                    category === c.id
                      ? "bg-emerald-500 text-neutral-950 font-bold"
                      : "bg-neutral-950 border-neutral-800 text-neutral-300"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              O que você realizou hoje?
            </label>
            <textarea
              rows={4}
              placeholder="Compartilhe sua evolução, técnica utilizada ou aprendizado do treino..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none text-xs"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Destaque de Carga ou Ritmo (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ex: Novo PR: 85kg no Supino x 6 reps"
              value={workoutHighlight}
              onChange={(e) => setWorkoutHighlight(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Dumbbell,
  Award,
  Flame,
  Navigation,
  Camera,
  Video,
  Image as ImageIcon,
  Film,
  Trash2,
  StopCircle,
  CheckCircle2,
} from "lucide-react";
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

  // Media attachments
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isRecordingLiveVideo, setIsRecordingLiveVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Hidden file inputs
  const cameraPhotoInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoInputRef = useRef<HTMLInputElement>(null);
  const galleryPhotoInputRef = useRef<HTMLInputElement>(null);
  const galleryVideoInputRef = useRef<HTMLInputElement>(null);

  // Live video refs
  const videoLiveStreamRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  if (!isOpen) return null;

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecordingLiveVideo(false);
    setRecordingSeconds(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 40 * 1024 * 1024) {
      alert("O arquivo selecionado é maior que 40MB. Escolha um vídeo ou foto menor.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaUrl(event.target.result as string);
        setMediaType(type);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleStartLiveVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;

      if (videoLiveStreamRef.current) {
        videoLiveStreamRef.current.srcObject = stream;
        videoLiveStreamRef.current.play();
      }

      recordedChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? { mimeType: "video/webm;codecs=vp9,opus" }
        : { mimeType: "video/webm" };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setMediaUrl(ev.target.result as string);
            setMediaType("video");
          }
        };
        reader.readAsDataURL(blob);
        stopCameraStream();
      };

      mediaRecorder.start(250);
      setIsRecordingLiveVideo(true);
      setRecordingSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            handleStopLiveVideo();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      if (cameraVideoInputRef.current) {
        cameraVideoInputRef.current.click();
      }
    }
  };

  const handleStopLiveVideo = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClearMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
    stopCameraStream();
  };

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
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      likesCount: 1,
      likedByCurrentUser: true,
      comments: [],
    };

    onSubmitPost(newPost);
    setContent("");
    setWorkoutHighlight("");
    handleClearMedia();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Hidden file inputs */}
      <input
        ref={cameraPhotoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        ref={cameraVideoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, "video")}
      />
      <input
        ref={galleryPhotoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        ref={galleryVideoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "video")}
      />

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-white">Criar Publicação na Comunidade</h2>
          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
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

          {/* Media Attachments Section */}
          <div className="space-y-2 pt-1 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="block text-neutral-300 font-semibold">
                Anexar Foto ou Vídeo:
              </label>
              {mediaUrl && (
                <button
                  type="button"
                  onClick={handleClearMedia}
                  className="text-rose-400 text-[11px] font-mono hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover</span>
                </button>
              )}
            </div>

            {!mediaUrl && !isRecordingLiveVideo && (
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => cameraPhotoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500 text-neutral-300 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[10px] font-bold">Câmera</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartLiveVideo}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500 text-neutral-300 transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4 text-cyan-400 mb-1" />
                  <span className="text-[10px] font-bold">Gravar</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryPhotoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500 text-neutral-300 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-[10px] font-bold">Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryVideoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-neutral-300 transition-colors cursor-pointer"
                >
                  <Film className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-[10px] font-bold">Vídeo</span>
                </button>
              </div>
            )}

            {/* In-app Video Recorder */}
            {isRecordingLiveVideo && (
              <div className="rounded-xl overflow-hidden bg-black border border-cyan-500 p-3 text-center space-y-2">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950">
                  <video
                    ref={videoLiveStreamRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>00:{recordingSeconds.toString().padStart(2, "0")}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleStopLiveVideo}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Parar Gravação</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-mono cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Media Preview */}
            {mediaUrl && (
              <div className="rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 p-2">
                {mediaType === "video" ? (
                  <video src={mediaUrl} controls playsInline className="w-full max-h-48 rounded-lg" />
                ) : (
                  <img src={mediaUrl} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
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

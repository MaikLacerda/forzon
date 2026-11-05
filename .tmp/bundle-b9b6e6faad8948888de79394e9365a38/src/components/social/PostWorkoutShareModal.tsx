import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Video,
  Image,
  Film,
  Send,
  Dumbbell,
  Clock,
  Flame,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  Share2,
  Check,
  Eye,
  StopCircle,
} from "lucide-react";
import { CompletedWorkoutRecord, SocialPost, UserProfile } from "../../types";
import confetti from "canvas-confetti";

interface PostWorkoutShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CompletedWorkoutRecord;
  profile: UserProfile;
  onPublishPost: (post: SocialPost, record: CompletedWorkoutRecord) => void;
  onSavePrivateOnly: (record: CompletedWorkoutRecord) => void;
  onOpenStoryGenerator?: () => void;
}

export const PostWorkoutShareModal: React.FC<PostWorkoutShareModalProps> = ({
  isOpen,
  onClose,
  record,
  profile,
  onPublishPost,
  onSavePrivateOnly,
  onOpenStoryGenerator,
}) => {
  // Post caption and settings
  const [caption, setCaption] = useState(
    `🔥 Treino finalizado com sucesso! Levantei ${record.totalVolumeKg.toLocaleString("pt-BR")} kg no total em ${Math.round(
      record.durationSeconds / 60
    )} min. Superando limites no FORZON! ⚡`
  );
  const [includeExercisesInText, setIncludeExercisesInText] = useState(true);
  const [sessionRpe, setSessionRpe] = useState<number>(record.perceivedEffortRpe || 8);
  const [sessionNotes, setSessionNotes] = useState<string>(record.notes || "");

  // Media state
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isRecordingLiveVideo, setIsRecordingLiveVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Hidden file inputs
  const cameraPhotoInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoInputRef = useRef<HTMLInputElement>(null);
  const galleryPhotoInputRef = useRef<HTMLInputElement>(null);
  const galleryVideoInputRef = useRef<HTMLInputElement>(null);

  // Live Camera stream & MediaRecorder refs
  const videoLiveStreamRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Clean up media streams on unmount or close
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

  // Convert File to Base64 / DataURL for safe in-browser persistence
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 40MB for video, 10MB for photo)
    if (file.size > 40 * 1024 * 1024) {
      alert("O arquivo selecionado é maior que 40MB. Escolha um vídeo ou foto mais curto.");
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

    // Reset input value so user can re-select the same file if needed
    e.target.value = "";
  };

  // Live In-Browser Video Recording via getUserMedia & MediaRecorder
  const handleStartLiveVideoRecording = async () => {
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
            // Auto stop at 60 seconds
            handleStopLiveVideoRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn("Could not access live camera via getUserMedia, falling back to camera input:", err);
      if (cameraVideoInputRef.current) {
        cameraVideoInputRef.current.click();
      }
    }
  };

  const handleStopLiveVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClearMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
    stopCameraStream();
  };

  // Format workout duration into readable text
  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins} min ${secs > 0 ? `${secs}s` : ""}`;
  };

  // Build complete exercises summary
  const exercisesSummary = record.exercisesLogged.map((ex) => {
    const completedSets = ex.sets.filter((s) => s.completed);
    const setsDetail =
      completedSets.length > 0
        ? `${completedSets.length} séries (${completedSets.map((s) => `${s.weightKg}kg×${s.reps}`).join(", ")})`
        : `${ex.sets.length} séries planejadas`;
    return { name: ex.name, setsDetail };
  });

  const handlePublish = () => {
    // Construct final post text
    let finalContent = caption.trim();
    if (includeExercisesInText && exercisesSummary.length > 0) {
      finalContent += `\n\n📋 Exercícios Executados:\n` +
        exercisesSummary.map((e) => `• ${e.name}: ${e.setsDetail}`).join("\n");
    }

    const updatedRecord: CompletedWorkoutRecord = {
      ...record,
      perceivedEffortRpe: sessionRpe,
      notes: sessionNotes,
    };

    const newPost: SocialPost = {
      id: `post-workout-${Date.now()}`,
      authorName: profile.name,
      authorHandle: profile.handle,
      authorAvatar: profile.avatarUrl,
      timestamp: "Agora",
      content: finalContent,
      category: "workout",
      workoutData: {
        title: record.title,
        duration: formatDuration(record.durationSeconds),
        volumeOrDistance: `${record.totalVolumeKg.toLocaleString("pt-BR")} kg total`,
        highlight: record.prsAchieved[0] || `${record.totalSets} séries cumpridas`,
        totalKgLifted: record.totalVolumeKg,
        exercisesSummary,
      },
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      likesCount: 1,
      likedByCurrentUser: true,
      comments: [],
    };

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#10b981", "#06b6d4", "#ffffff", "#f59e0b"],
      });
    } catch {}

    onPublishPost(newPost, updatedRecord);
  };

  const handleSavePrivate = () => {
    const updatedRecord: CompletedWorkoutRecord = {
      ...record,
      perceivedEffortRpe: sessionRpe,
      notes: sessionNotes,
    };
    onSavePrivateOnly(updatedRecord);
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Hidden File Inputs for all media modes */}
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

        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Flame className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                Treino Concluído com Sucesso
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Publicar no Feed da Comunidade
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* 1. HERO BANNER: TOTAL KG LEVANTADOS */}
          <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-cyan-950/60 border border-emerald-500/40 p-5 sm:p-6 shadow-xl overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>CARGA TOTAL COMPUTADA</span>
            </div>

            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
              {record.totalVolumeKg.toLocaleString("pt-BR")}{" "}
              <span className="text-emerald-400 text-2xl sm:text-3xl font-extrabold">KG</span>
            </div>
            <p className="text-xs text-neutral-300 font-mono mt-1">
              Tonelagem total acumulada somando todas as séries e repetições executadas
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 font-mono text-center">
              <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Duração</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white mt-1">
                  {formatDuration(record.durationSeconds)}
                </div>
              </div>

              <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase flex items-center justify-center gap-1">
                  <Dumbbell className="w-3 h-3 text-emerald-400" />
                  <span>Séries / Reps</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white mt-1">
                  {record.totalSets} / {record.totalReps}
                </div>
              </div>

              <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Exercícios</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white mt-1">
                  {record.exercisesLogged.length}
                </div>
              </div>
            </div>
          </div>

          {/* 2. MEDIA ATTACHMENT SECTION (CAMERA & GALLERY) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Foto ou Vídeo da Sessão (Câmera & Galeria):</span>
              </label>
              {mediaUrl && (
                <button
                  type="button"
                  onClick={handleClearMedia}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover mídia</span>
                </button>
              )}
            </div>

            {/* Media Action Buttons */}
            {!mediaUrl && !isRecordingLiveVideo && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Tirar Foto Câmera */}
                <button
                  type="button"
                  onClick={() => cameraPhotoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-emerald-500/50 text-neutral-300 hover:text-white transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold">Tirar Foto</div>
                    <div className="text-[10px] text-neutral-500 font-mono">Câmera Direta</div>
                  </div>
                </button>

                {/* 2. Gravar Vídeo Câmera */}
                <button
                  type="button"
                  onClick={handleStartLiveVideoRecording}
                  className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-cyan-500/50 text-neutral-300 hover:text-white transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition-colors">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold">Gravar Vídeo</div>
                    <div className="text-[10px] text-neutral-500 font-mono">Câmera ao Vivo</div>
                  </div>
                </button>

                {/* 3. Foto da Galeria */}
                <button
                  type="button"
                  onClick={() => galleryPhotoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-purple-500/50 text-neutral-300 hover:text-white transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400 flex items-center justify-center transition-colors">
                    <Image className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold">Foto Galeria</div>
                    <div className="text-[10px] text-neutral-500 font-mono">Rolo de Fotos</div>
                  </div>
                </button>

                {/* 4. Vídeo da Galeria */}
                <button
                  type="button"
                  onClick={() => galleryVideoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 hover:text-white transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold">Vídeo Galeria</div>
                    <div className="text-[10px] text-neutral-500 font-mono">Vídeo do Celular</div>
                  </div>
                </button>
              </div>
            )}

            {/* In-App Live Video Recorder HUD */}
            {isRecordingLiveVideo && (
              <div className="relative rounded-2xl overflow-hidden bg-black border border-cyan-500/50 p-4 text-center space-y-4">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 mx-auto">
                  <video
                    ref={videoLiveStreamRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Top Recording badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-xs font-bold shadow-lg animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    <span>GRAVANDO: 00:{recordingSeconds.toString().padStart(2, "0")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleStopLiveVideoRecording}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Concluir Gravação</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Media Preview Box */}
            {mediaUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {mediaType === "video" ? "Vídeo Pronto para Publicar" : "Foto Pronta para Publicar"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearMedia}
                    className="text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Trocar mídia
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-black max-h-80 flex items-center justify-center">
                  {mediaType === "image" ? (
                    <div className="relative w-full">
                      <img
                        src={mediaUrl}
                        alt="Foto do treino"
                        className="w-full max-h-80 object-contain rounded-xl"
                      />
                      {/* Brand Watermark Overlay */}
                      <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2 text-white shadow-xl">
                        <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        <span className="font-bold">FORZON</span>
                        <span className="text-emerald-400 font-bold">
                          {record.totalVolumeKg.toLocaleString("pt-BR")} KG
                        </span>
                      </div>
                    </div>
                  ) : (
                    <video
                      src={mediaUrl}
                      controls
                      playsInline
                      className="w-full max-h-80 rounded-xl"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. CAPTION & SOCIAL TEXT */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold">
              Legenda do Post na Comunidade:
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Descreva a sensação do treino, superação de cargas ou motivação..."
              className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm resize-none"
            />

            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={includeExercisesInText}
                onChange={(e) => setIncludeExercisesInText(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>Incluir lista completa de todos os exercícios com cargas no texto do post</span>
            </label>
          </div>

          {/* 4. COMPLETE EXERCISES LOGGED ACCORDION */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resumo Detalhado dos Exercícios:</span>
              </span>
              <span className="text-emerald-400">{record.exercisesLogged.length} movimentos</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {record.exercisesLogged.map((ex, idx) => {
                const completedSets = ex.sets.filter((s) => s.completed);
                return (
                  <div
                    key={idx}
                    className="bg-neutral-900/80 border border-neutral-850 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{ex.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {completedSets.length > 0 ? (
                          completedSets.map((s, sIdx) => (
                            <span key={sIdx} className="mr-2">
                              S{sIdx + 1}: <strong className="text-emerald-400">{s.weightKg}kg</strong>×{s.reps}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-500">Sem séries registradas</span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                      {completedSets.length} séries ✓
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. RPE SLIDER & PRIVATE NOTES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-neutral-950/70 border border-neutral-800 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-neutral-300 font-bold">Esforço (RPE):</span>
                <span className="text-emerald-400 font-bold">{sessionRpe}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={sessionRpe}
                onChange={(e) => setSessionRpe(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>Leve (1-4)</span>
                <span>Ótimo (7-8)</span>
                <span>Falha Total (10)</span>
              </div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 p-3.5 rounded-2xl space-y-1.5">
              <span className="text-neutral-300 font-mono font-bold block">
                Notas do Treino (Opcional):
              </span>
              <input
                type="text"
                placeholder="Ex: Pegada firme, amplitude excelente..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-6 border-t border-neutral-800 bg-neutral-950/90 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePublish}
            className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 fill-neutral-950" />
            <span>Publicar no Feed Social</span>
          </button>

          {onOpenStoryGenerator && (
            <button
              type="button"
              onClick={onOpenStoryGenerator}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 cursor-pointer"
              title="Gerar Story 9:16 para WhatsApp e Instagram"
            >
              <Share2 className="w-4 h-4" />
              <span>Story 9:16</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSavePrivate}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
          >
            Apenas Salvar Privado
          </button>
        </div>
      </div>
    </div>
  );
};

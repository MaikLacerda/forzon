import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Sparkles,
  Zap,
  Activity,
  Flame,
  Music,
  Sliders,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Headphones,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MusicIntensity,
  PowerTrack,
  PLAYLIST_CATEGORIES,
  INITIAL_POWER_TRACKS,
  detectRecommendedIntensity,
  musicSynth,
} from "../../services/musicService";

interface PowerPlaylistWidgetProps {
  currentExerciseName: string;
  targetMuscle: string;
  isResting: boolean;
  currentSetIndex: number;
  totalSets: number;
  weightKg: number;
  previousWeightKg?: number;
  isSoundMuted?: boolean;
}

export const PowerPlaylistWidget: React.FC<PowerPlaylistWidgetProps> = ({
  currentExerciseName,
  targetMuscle,
  isResting,
  currentSetIndex,
  totalSets,
  weightKg,
  previousWeightKg,
  isSoundMuted = false,
}) => {
  const [tracks, setTracks] = useState<PowerTrack[]>(INITIAL_POWER_TRACKS);
  const [selectedIntensity, setSelectedIntensity] = useState<MusicIntensity>("hypertrophy");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(isSoundMuted);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoSyncIntensity, setAutoSyncIntensity] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Auto-detect workout intensity
  const recommendedIntensity = detectRecommendedIntensity({
    isResting,
    currentSetIndex,
    totalSets,
    weightKg,
    previousWeightKg,
  });

  // Sync intensity category if auto-sync is enabled
  useEffect(() => {
    if (autoSyncIntensity && recommendedIntensity !== selectedIntensity) {
      setSelectedIntensity(recommendedIntensity);
      // Pick first track of the newly matched intensity
      const matchIdx = tracks.findIndex((t) => t.intensity === recommendedIntensity);
      if (matchIdx !== -1) {
        setCurrentTrackIndex(matchIdx);
      }
    }
  }, [recommendedIntensity, autoSyncIntensity, tracks]);

  // Filter tracks by active intensity
  const currentCategoryTracks = tracks.filter((t) => t.intensity === selectedIntensity);
  const currentTrack: PowerTrack =
    tracks[currentTrackIndex] || currentCategoryTracks[0] || tracks[0];

  // Handle Play / Pause with procedural Web Audio beat synth
  const togglePlay = () => {
    if (isPlaying) {
      musicSynth.stop();
      setIsPlaying(false);
    } else {
      musicSynth.setVolume(isMuted ? 0 : volume);
      musicSynth.start(currentTrack.bpm);
      setIsPlaying(true);
    }
  };

  // When track or BPM changes while playing, update synth
  useEffect(() => {
    if (isPlaying) {
      musicSynth.setVolume(isMuted ? 0 : volume);
      musicSynth.updateBpm(currentTrack.bpm);
    }
  }, [currentTrack.bpm, isPlaying, volume, isMuted]);

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      musicSynth.stop();
    };
  }, []);

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    setSelectedIntensity(tracks[nextIdx].intensity);
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    setSelectedIntensity(tracks[prevIdx].intensity);
  };

  const handleSelectIntensity = (intensity: MusicIntensity) => {
    setSelectedIntensity(intensity);
    const matchIdx = tracks.findIndex((t) => t.intensity === intensity);
    if (matchIdx !== -1) {
      setCurrentTrackIndex(matchIdx);
    }
  };

  const handleToggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    musicSynth.setVolume(newMute ? 0 : volume);
  };

  // AI Power Playlist generator simulation / customization
  const handleGenerateAIPowerPlaylist = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const generatedTrack: PowerTrack = {
        id: `track-ai-${Date.now()}`,
        title: `${currentExerciseName} Overdrive [AI Curated]`,
        artist: `FORZON DJ AI · Foco em ${targetMuscle}`,
        genre: selectedIntensity === "max_effort" ? "Aggressive Cyberpunk & Heavy Bass" : "High Energy Gym Trap",
        bpm: selectedIntensity === "max_effort" ? 160 : selectedIntensity === "warmup" ? 116 : 134,
        intensity: selectedIntensity,
        durationSeconds: 195,
        gradient: selectedIntensity === "max_effort" ? "from-red-600 via-rose-950 to-neutral-950" : "from-emerald-600 via-teal-950 to-neutral-950",
        spotifySearchUrl: `https://open.spotify.com/search/${encodeURIComponent(`${currentExerciseName} gym workout beat`)}`,
        youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${currentExerciseName} workout music`)}`,
        motivationalQuote: `Sincronizado biomecanicamente para ${currentExerciseName} com ${weightKg}kg de carga!`,
      };

      setTracks((prev) => [generatedTrack, ...prev]);
      setCurrentTrackIndex(0);
      setIsGeneratingAI(false);
      if (!isPlaying) {
        musicSynth.setVolume(isMuted ? 0 : volume);
        musicSynth.start(generatedTrack.bpm);
        setIsPlaying(true);
      }
    }, 900);
  };

  const activeCategory = PLAYLIST_CATEGORIES[selectedIntensity];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl transition-all">
      {/* Compact Player Top Bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-neutral-950/60">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Animated Vinyl / Sound Disc */}
          <div
            onClick={togglePlay}
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${currentTrack.gradient} flex items-center justify-center text-white cursor-pointer shadow-md shrink-0 relative group transition-transform ${
              isPlaying ? "scale-105" : ""
            }`}
          >
            {isPlaying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-full h-full flex items-center justify-center"
              >
                <Music className="w-5 h-5 text-white/90" />
              </motion.div>
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
            <div className="absolute inset-0 bg-black/20 rounded-xl group-hover:bg-transparent transition-colors" />
          </div>

          {/* Current Track & Dynamic Intensity info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                {currentTrack.bpm} BPM
              </span>
              <span
                className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${activeCategory.badgeColor}`}
              >
                {activeCategory.shortLabel}
              </span>
              {autoSyncIntensity && (
                <span className="text-[10px] font-mono text-emerald-400 hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Auto-Sync Ativo
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
              {currentTrack.title}
            </div>
            <div className="text-[11px] text-neutral-400 truncate font-mono">
              {currentTrack.artist} · <span className="text-neutral-500">{currentTrack.genre}</span>
            </div>
          </div>
        </div>

        {/* Audio Waveform Visualizer (Animated when playing) */}
        <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-neutral-900 rounded-xl border border-neutral-800 h-9 shrink-0">
          {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 50].map((h, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full ${
                isPlaying ? "bg-emerald-400" : "bg-neutral-700"
              }`}
              animate={
                isPlaying
                  ? {
                      height: [
                        `${Math.max(15, h * 0.3)}%`,
                        `${Math.min(100, h * 1.1)}%`,
                        `${Math.max(20, h * 0.4)}%`,
                      ],
                    }
                  : { height: "25%" }
              }
              transition={{
                duration: 0.5 + (i % 4) * 0.12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrevTrack}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Faixa Anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            title={isPlaying ? "Pausar Ritmo" : "Iniciar Ritmo"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-neutral-950" />
            ) : (
              <Play className="w-4 h-4 fill-neutral-950 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleNextTrack}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Próxima Faixa"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer hidden sm:block"
            title={isMuted ? "Desmutar Áudio" : "Mutar Áudio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="Expandir Console de Playlist"
          >
            <span className="hidden sm:inline font-mono text-[11px]">Categorias</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Console & Intensity Selector */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-neutral-800 p-4 sm:p-5 space-y-4 bg-neutral-950/80"
          >
            {/* Header / Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Power Playlist FORZON · Categorias por Intensidade
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Ajuste a frequência sonora ideal para cadência muscular, picos adrenérgicos ou regeneração cardíaca.
                </p>
              </div>

              {/* Auto Sync Toggle & AI Generator Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoSyncIntensity(!autoSyncIntensity)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                    autoSyncIntensity
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Auto-Sync: {autoSyncIntensity ? "Ligado" : "Manual"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAIPowerPlaylist}
                  disabled={isGeneratingAI}
                  className="px-3 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{isGeneratingAI ? "Gerando..." : "Gerar com IA"}</span>
                </button>
              </div>
            </div>

            {/* 4 Interactive Intensity Category Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(Object.keys(PLAYLIST_CATEGORIES) as MusicIntensity[]).map((catKey) => {
                const cat = PLAYLIST_CATEGORIES[catKey];
                const isSelected = selectedIntensity === catKey;
                const isRecommended = recommendedIntensity === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleSelectIntensity(catKey)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[92px] ${
                      isSelected
                        ? `bg-neutral-900 ${cat.borderColor} shadow-lg ring-1 ${cat.borderColor}`
                        : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold ${isSelected ? cat.textColor : "text-white"}`}>
                          {cat.shortLabel}
                        </span>
                        {isRecommended && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {cat.bpmRange}
                      </div>
                    </div>

                    <div className="text-[10px] text-neutral-500 line-clamp-2 mt-2 leading-tight">
                      {cat.idealFor}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Current Track Motivational Quote & External Streaming Links */}
            <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-[11px] text-neutral-300 italic flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>"{currentTrack.motivationalQuote}"</span>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Sincronizado com Web Audio Synthesizer (Kick & Hi-hat a {currentTrack.bpm} BPM)
                </div>
              </div>

              {/* External Spotify & YouTube Music Deep Search Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={currentTrack.spotifySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/40 text-[#1DB954] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Abrir pesquisa correspondente no Spotify"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Spotify</span>
                </a>

                <a
                  href={currentTrack.youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Abrir no YouTube Music"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export type MusicIntensity = "warmup" | "hypertrophy" | "max_effort" | "rest_recovery";

export interface PowerTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  intensity: MusicIntensity;
  durationSeconds: number;
  gradient: string;
  spotifySearchUrl: string;
  youtubeSearchUrl: string;
  motivationalQuote: string;
}

export interface PlaylistCategory {
  id: MusicIntensity;
  label: string;
  shortLabel: string;
  bpmRange: string;
  description: string;
  badgeColor: string;
  borderColor: string;
  textColor: string;
  bgGlow: string;
  idealFor: string;
}

export const PLAYLIST_CATEGORIES: Record<MusicIntensity, PlaylistCategory> = {
  warmup: {
    id: "warmup",
    label: "Aquecimento & Mobilidade",
    shortLabel: "Aquecimento",
    bpmRange: "105 - 118 BPM",
    description: "Batidas cadenciadas para elevar a temperatura corporal e lubrificar articulações sem fadiga neural.",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    borderColor: "border-sky-500/30",
    textColor: "text-sky-400",
    bgGlow: "from-sky-500/10 via-neutral-900 to-neutral-950",
    idealFor: "Séries de aquecimento, mobilidade e ativação neuromuscular inicial",
  },
  hypertrophy: {
    id: "hypertrophy",
    label: "Heavy Hypertrophy & Volume",
    shortLabel: "Hipertrofia",
    bpmRange: "125 - 135 BPM",
    description: "Graves pesados e ritmo constante para manter cadência controlada (3s excêntricos) e RIR 2.",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    bgGlow: "from-amber-500/10 via-neutral-900 to-neutral-950",
    idealFor: "Séries de trabalho moderadas a pesadas (8 a 12 repetições)",
  },
  max_effort: {
    id: "max_effort",
    label: "Max Effort & PR Mode (100% Carga)",
    shortLabel: "PR Mode",
    bpmRange: "145 - 165 BPM",
    description: "Aggressive Phonk, Hardstyle e Industrial Dark para pico adrenérgico e recrutamento de unidades motoras.",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-400",
    bgGlow: "from-rose-500/15 via-neutral-900 to-neutral-950",
    idealFor: "Tentativas de Recorde Pessoal (PR), última série até a falha e RPE 9-10",
  },
  rest_recovery: {
    id: "rest_recovery",
    label: "Recuperação & Redução de FC",
    shortLabel: "Descanso Ativo",
    bpmRange: "75 - 90 BPM",
    description: "Ondas alfa e batidas lentas para desacelerar a frequência cardíaca e restaurar estoques de fosfocreatina (ATP).",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
    bgGlow: "from-emerald-500/10 via-neutral-900 to-neutral-950",
    idealFor: "Intervalo de 60s a 120s entre séries pesadas",
  },
};

export const INITIAL_POWER_TRACKS: PowerTrack[] = [
  // MAX EFFORT / PR MODE (145-165 BPM)
  {
    id: "track-pr-1",
    title: "Overdrive Protocol: 1RM Slayer",
    artist: "FORZON Sound Lab · Phonk Wave",
    genre: "Drift Phonk / Hardstyle",
    bpm: 154,
    intensity: "max_effort",
    durationSeconds: 168,
    gradient: "from-rose-600 via-red-900 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/aggressive%20phonk%20workout%20gym",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=aggressive+gym+phonk+150+bpm",
    motivationalQuote: "A barra não sabe o peso que tem. Suba com agressividade calculada.",
  },
  {
    id: "track-pr-2",
    title: "Viking Heartbeat (Heavy Compound)",
    artist: "Nordic Iron · Industrial Dark",
    genre: "Industrial Hard Techno",
    bpm: 158,
    intensity: "max_effort",
    durationSeconds: 192,
    gradient: "from-orange-600 via-rose-950 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/hard%20techno%20gym%20pr",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=hard+techno+powerlifting+soundtrack",
    motivationalQuote: "Pico adrenérgico ativado. Foco total na contração concêntrica.",
  },
  {
    id: "track-pr-3",
    title: "Titanium Lockout",
    artist: "SubZero Beats",
    genre: "Aggressive Trap & Bass",
    bpm: 148,
    intensity: "max_effort",
    durationSeconds: 175,
    gradient: "from-purple-700 via-rose-900 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/heavy%20bass%20gym%20workout",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=heavy+bass+gym+hype+tracks",
    motivationalQuote: "Última repetição separa a intenção do resultado.",
  },

  // HYPERTROPHY / VOLUME (125-135 BPM)
  {
    id: "track-hyp-1",
    title: "Iron Temple Flow",
    artist: "Grimm & Tempo · Rio Cypher",
    genre: "Boom Bap & Dark Trap",
    bpm: 130,
    intensity: "hypertrophy",
    durationSeconds: 210,
    gradient: "from-amber-600 via-yellow-950 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/hip%20hop%20workout%20gym%20pump",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=gym+hip+hop+pump+playlist",
    motivationalQuote: "Cadência estrita: 3 segundos de descida, explosão controlada na subida.",
  },
  {
    id: "track-hyp-2",
    title: "Hypertrophy Blueprint",
    artist: "Synth District",
    genre: "Darksynth / Cyberpunk",
    bpm: 128,
    intensity: "hypertrophy",
    durationSeconds: 184,
    gradient: "from-amber-500 via-orange-950 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/synthwave%20gym%20workout",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=dark+synthwave+gym+pump",
    motivationalQuote: "Tensão mecânica máxima sob amplitude de movimento completa.",
  },
  {
    id: "track-hyp-3",
    title: "Sarcoplasmic Surge",
    artist: "Kevlar Groove",
    genre: "Brazilian Bass / G-House",
    bpm: 132,
    intensity: "hypertrophy",
    durationSeconds: 198,
    gradient: "from-yellow-600 via-amber-950 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/brazilian%20bass%20gym",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=brazilian+bass+gym+workout",
    motivationalQuote: "Conexão mente-músculo mantendo o fluxo sanguíneo local no ápice.",
  },

  // WARMUP / ACTIVATION (105-118 BPM)
  {
    id: "track-wrm-1",
    title: "Neuromuscular Synapse",
    artist: "Pulse & Wave",
    genre: "Deep House & Groovy Minimal",
    bpm: 114,
    intensity: "warmup",
    durationSeconds: 220,
    gradient: "from-sky-600 via-cyan-950 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/deep%20house%20workout%20warmup",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=deep+house+gym+warmup+track",
    motivationalQuote: "Eleve a temperatura interna. Lubrifique as cápsulas articulares.",
  },
  {
    id: "track-wrm-2",
    title: "Kinetic Awakening",
    artist: "Solaris Unit",
    genre: "Nu-Disco / Melodic Groove",
    bpm: 112,
    intensity: "warmup",
    durationSeconds: 205,
    gradient: "from-cyan-600 via-sky-950 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/nu%20disco%20warmup%20fitness",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=melodic+groove+warmup+fitness",
    motivationalQuote: "Ative os estabilizadores centrais com respiração diafragmática.",
  },

  // REST & RECOVERY (75-90 BPM)
  {
    id: "track-rst-1",
    title: "Parasympathetic Reset (432Hz)",
    artist: "Dr. Soundwave · BioRecovery",
    genre: "Ambient Lo-Fi & Binaural",
    bpm: 80,
    intensity: "rest_recovery",
    durationSeconds: 150,
    gradient: "from-emerald-600 via-teal-950 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/432hz%20binaural%20recovery%20rest",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=binaural+beats+workout+rest+recovery",
    motivationalQuote: "Inspire 4 segundos, segure 2, expire 6. Ressintetize a fosfocreatina muscular.",
  },
  {
    id: "track-rst-2",
    title: "Lactate Clearance Drift",
    artist: "Echoes of Zen",
    genre: "Chillstep / Post-Workout",
    bpm: 86,
    intensity: "rest_recovery",
    durationSeconds: 165,
    gradient: "from-teal-600 via-emerald-950 to-neutral-950",
    spotifySearchUrl: "https://open.spotify.com/search/lofi%20gym%20chill%20rest",
    youtubeSearchUrl: "https://www.youtube.com/results?search_query=lofi+gym+rest+timer+track",
    motivationalQuote: "O oxigênio recaptura o equilíbrio químico para a próxima série forte.",
  },
];

/**
 * Procedural Web Audio Beat Synthesizer
 * Plays an authentic real-time acoustic rhythm (Kick drum + Hi-hat + Sub drone)
 * matching the exact BPM of the selected intensity category!
 */
class RhythmicAudioSynth {
  private audioCtx: AudioContext | null = null;
  private intervalId: number | null = null;
  private isPlaying = false;
  private currentBpm = 130;
  private volume = 0.4;

  private init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public start(bpm: number) {
    this.init();
    if (!this.audioCtx) return;
    this.currentBpm = bpm;
    this.stop();
    this.isPlaying = true;

    const intervalMs = (60 / this.currentBpm) * 1000;
    let beatStep = 0;

    // Trigger immediate first beat
    this.playBeat(beatStep);
    beatStep = (beatStep + 1) % 4;

    this.intervalId = window.setInterval(() => {
      this.playBeat(beatStep);
      beatStep = (beatStep + 1) % 4;
    }, intervalMs);
  }

  public updateBpm(newBpm: number) {
    if (this.isPlaying && this.currentBpm !== newBpm) {
      this.start(newBpm);
    } else {
      this.currentBpm = newBpm;
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playBeat(step: number) {
    if (!this.audioCtx || this.volume <= 0) return;
    try {
      const now = this.audioCtx.currentTime;

      // 1. Kick on beat 0 and beat 2 (for energetic pulse)
      if (step === 0 || step === 2) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const basePitch = step === 0 ? 110 : 85;
        osc.frequency.setValueAtTime(basePitch, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

        gain.gain.setValueAtTime(this.volume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.start(now);
        osc.stop(now + 0.25);
      }

      // 2. Hi-hat / Percussive noise on each beat
      const hatOsc = this.audioCtx.createOscillator();
      const hatGain = this.audioCtx.createGain();
      hatOsc.type = "triangle";
      hatOsc.connect(hatGain);
      hatGain.connect(this.audioCtx.destination);

      hatOsc.frequency.setValueAtTime(step % 2 === 1 ? 8000 : 5000, now);
      hatGain.gain.setValueAtTime(this.volume * 0.18, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      hatOsc.start(now);
      hatOsc.stop(now + 0.06);

      // 3. Sub harmonic chord progression drone (gentle synth bed)
      if (step === 0) {
        const chordOsc = this.audioCtx.createOscillator();
        const chordGain = this.audioCtx.createGain();
        chordOsc.type = "sine";
        chordOsc.connect(chordGain);
        chordGain.connect(this.audioCtx.destination);

        const rootFrequencies = [55, 65.41, 48.99, 58.27]; // A, C, G, Bb sub-harmonics
        chordOsc.frequency.setValueAtTime(rootFrequencies[Math.floor(Math.random() * rootFrequencies.length)], now);
        chordGain.gain.setValueAtTime(this.volume * 0.25, now);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        chordOsc.start(now);
        chordOsc.stop(now + 0.95);
      }
    } catch {
      // AudioContext policy
    }
  }
}

export const musicSynth = new RhythmicAudioSynth();

/**
 * Automatically determine the recommended music intensity based on the workout state:
 * - Is user in rest timer? -> "rest_recovery"
 * - Is current set a PR attempt or weight > 100kg or last set? -> "max_effort"
 * - Is set index == 0 (warmup set)? -> "warmup"
 * - Standard working set -> "hypertrophy"
 */
export function detectRecommendedIntensity(params: {
  isResting: boolean;
  currentSetIndex: number;
  totalSets: number;
  weightKg: number;
  previousWeightKg?: number;
  perceivedRpeTarget?: number;
}): MusicIntensity {
  if (params.isResting) {
    return "rest_recovery";
  }

  // PR attempt or very heavy set
  if (
    (params.previousWeightKg && params.weightKg > params.previousWeightKg) ||
    (params.perceivedRpeTarget && params.perceivedRpeTarget >= 9) ||
    (params.currentSetIndex === params.totalSets - 1 && params.totalSets >= 3)
  ) {
    return "max_effort";
  }

  // Warmup set (first set with low weight)
  if (params.currentSetIndex === 0 && params.totalSets > 2) {
    return "warmup";
  }

  return "hypertrophy";
}

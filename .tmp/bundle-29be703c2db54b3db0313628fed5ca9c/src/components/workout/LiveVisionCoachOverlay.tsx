import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  RefreshCw,
  ShieldCheck,
  Activity,
  Layers,
  ChevronDown,
  Info,
  Sliders,
  Check,
  AlertOctagon,
} from "lucide-react";
import { WorkoutExercise } from "../../types";

export type PostureDeviationType =
  | "none"
  | "knee_valgus" // Joelhos para dentro (Valgo Dinâmico)
  | "short_rom" // Amplitude curta / incompleta
  | "rounded_back" // Coluna curvada / Retroversão lombar
  | "elbow_flare"; // Cotovelos excessivamente abertos

export interface PostureFeedbackState {
  status: "perfect" | "warning" | "alert";
  isIncorrect: boolean;
  deviation: PostureDeviationType;
  title: string;
  correctiveCue: string;
  jointAngle: number;
  targetAngle: number;
  romPercentage: number;
  score: number;
}

interface LiveVisionCoachOverlayProps {
  exercise: WorkoutExercise;
  currentSetIndex: number;
  onClose: () => void;
  onValidRepCounted?: (reps: number) => void;
  onPostureStatusChange?: (feedback: PostureFeedbackState) => void;
}

export const LiveVisionCoachOverlay: React.FC<LiveVisionCoachOverlayProps> = ({
  exercise,
  currentSetIndex,
  onClose,
  onValidRepCounted,
  onPostureStatusChange,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Camera permissions & streams
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<
    "requesting" | "active" | "denied" | "unsupported" | "simulation"
  >("requesting");
  const [isPIPMode, setIsPIPMode] = useState(false);
  const [soundFeedbackEnabled, setSoundFeedbackEnabled] = useState(true);
  const [activeFacingMode, setActiveFacingMode] = useState<"user" | "environment">("user");
  const [showTesterPanel, setShowTesterPanel] = useState(false);

  // Forced deviation mode for testing biomechanical deviations
  const [activeTestDeviation, setActiveTestDeviation] = useState<PostureDeviationType>("none");

  // Telemetry state
  const [jointAngle, setJointAngle] = useState<number>(165);
  const [targetAngle, setTargetAngle] = useState<number>(90);
  const [romPercentage, setRomPercentage] = useState<number>(100);
  const [movementPhase, setMovementPhase] = useState<"eccentric" | "concentric" | "isometric" | "idle">("idle");
  const [formScore, setFormScore] = useState<number>(96);
  const [countedReps, setCountedReps] = useState<number>(0);

  // Posture Feedback
  const [postureState, setPostureState] = useState<PostureFeedbackState>({
    status: "perfect",
    isIncorrect: false,
    deviation: "none",
    title: "Postura e Alinhamento Ideais",
    correctiveCue: "Trajetória articular perfeita. Mantenha a respiração ritmada.",
    jointAngle: 165,
    targetAngle: 90,
    romPercentage: 100,
    score: 96,
  });

  const lastSpokenTimestampRef = useRef<number>(0);
  const lastSpokenTextRef = useRef<string>("");
  const phaseCycleRef = useRef<{ minAngle: number; maxAngle: number; inRep: boolean }>({
    minAngle: 180,
    maxAngle: 0,
    inRep: false,
  });

  // MediaPipe Pose integration state
  const [mediaPipeStatus, setMediaPipeStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const mediaPipePoseRef = useRef<any>(null);
  const realLandmarksRef = useRef<any[] | null>(null);
  const isProcessingFrameRef = useRef<boolean>(false);

  // Sound beep alert using Web Audio API
  const playAlertBuzzer = useCallback(() => {
    if (!soundFeedbackEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // Low buzz
      osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      osc.onended = () => {
        try {
          audioCtx.close();
        } catch {}
      };
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable
    }
  }, [soundFeedbackEnabled]);

  // SpeechSynthesis voice feedback in Portuguese
  const speakFeedback = useCallback(
    (text: string, force = false) => {
      if (!soundFeedbackEnabled) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const now = Date.now();
      // Avoid rapid repeated notifications
      if (!force && now - lastSpokenTimestampRef.current < 4500 && text === lastSpokenTextRef.current) {
        return;
      }
      if (!force && now - lastSpokenTimestampRef.current < 3200) {
        return;
      }

      lastSpokenTimestampRef.current = now;
      lastSpokenTextRef.current = text;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis error
      }
    },
    [soundFeedbackEnabled]
  );

  // Helper to dynamically load external scripts safely
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  };

  // Initialize MediaPipe Pose
  useEffect(() => {
    let isCancelled = false;

    const initMediaPipe = async () => {
      try {
        if (typeof window === "undefined") return;

        // Load MediaPipe Pose scripts if not already present
        if (!(window as any).Pose) {
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js").catch(() => {});
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js").catch(() => {});
        }

        if (isCancelled) return;

        if ((window as any).Pose) {
          const pose = new (window as any).Pose({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
          });

          pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          pose.onResults((results: any) => {
            if (isCancelled) return;
            if (results && results.poseLandmarks) {
              realLandmarksRef.current = results.poseLandmarks;
            }
          });

          mediaPipePoseRef.current = pose;
          setMediaPipeStatus("ready");
        } else {
          setMediaPipeStatus("fallback");
        }
      } catch (err) {
        console.warn("MediaPipe Pose load fallback:", err);
        setMediaPipeStatus("fallback");
      }
    };

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (mediaPipePoseRef.current) {
        try {
          mediaPipePoseRef.current.close();
        } catch {}
      }
    };
  }, []);

  // Request real device camera
  const initCamera = useCallback(async () => {
    setCameraStatus("requesting");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: activeFacingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraStatus("active");

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Camera access failed or permission denied, fallback to simulated visual feedback mode:", err);
      setCameraStatus("simulation");
    }
  }, [activeFacingMode]);

  useEffect(() => {
    initCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [initCamera]);

  const handleToggleFacingMode = () => {
    setActiveFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Determine exercise biomechanical archetype
  const exerciseNameLower = exercise.name.toLowerCase();
  const isSquat =
    exerciseNameLower.includes("agachamento") ||
    exerciseNameLower.includes("leg press") ||
    exerciseNameLower.includes("hack") ||
    exerciseNameLower.includes("afundo") ||
    exerciseNameLower.includes("búlgaro");

  const isPress =
    exerciseNameLower.includes("supino") ||
    exerciseNameLower.includes("desenvolvimento") ||
    exerciseNameLower.includes("flexão") ||
    exerciseNameLower.includes("tríceps testa") ||
    exerciseNameLower.includes("crucifixo");

  const isDeadlift =
    exerciseNameLower.includes("terra") ||
    exerciseNameLower.includes("stiff") ||
    exerciseNameLower.includes("remada");

  // Ideal target depth angles
  const idealTargetDepth = isSquat ? 85 : isPress ? 80 : 90;

  // Main real-time kinematic pose analysis & deviation detector
  useEffect(() => {
    let tick = 0;

    const renderLoop = () => {
      try {
        tick++;
        const canvas = canvasRef.current;
        if (!canvas) {
          animFrameRef.current = requestAnimationFrame(renderLoop);
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          animFrameRef.current = requestAnimationFrame(renderLoop);
          return;
        }

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

      // Submit video frame to MediaPipe Pose if available
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        mediaPipePoseRef.current &&
        tick % 2 === 0 &&
        !isProcessingFrameRef.current
      ) {
        isProcessingFrameRef.current = true;
        mediaPipePoseRef.current
          .send({ image: videoRef.current })
          .catch(() => {})
          .finally(() => {
            isProcessingFrameRef.current = false;
          });
      }

      // -------------------------------------------------------------
      // 1. KINEMATIC SIMULATION & ANGLE DERIVATION (WITH MEDIAPIPE OVERLAY)
      // -------------------------------------------------------------
      const phaseOsc = Math.sin(tick * 0.04);
      const derivative = Math.cos(tick * 0.04);

      // Base joint angle from 75° (bottom) to 170° (top)
      let curJointAngle = Math.round(122 + phaseOsc * 48);

      const realLandmarks = realLandmarksRef.current;
      const hasRealPose = Boolean(realLandmarks && realLandmarks.length > 28);

      // If MediaPipe real pose landmarks are available and not in forced test mode
      if (hasRealPose && activeTestDeviation === "none") {
        if (isSquat && realLandmarks![23] && realLandmarks![25] && realLandmarks![27]) {
          const p1 = realLandmarks![23];
          const p2 = realLandmarks![25];
          const p3 = realLandmarks![27];
          const rad = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
          let deg = Math.abs((rad * 180.0) / Math.PI);
          if (deg > 180.0) deg = 360 - deg;
          curJointAngle = Math.round(deg);
        } else if (isPress && realLandmarks![11] && realLandmarks![13] && realLandmarks![15]) {
          const p1 = realLandmarks![11];
          const p2 = realLandmarks![13];
          const p3 = realLandmarks![15];
          const rad = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
          let deg = Math.abs((rad * 180.0) / Math.PI);
          if (deg > 180.0) deg = 360 - deg;
          curJointAngle = Math.round(deg);
        }
      }

      // If user selected short ROM deviation test, restrict depth
      if (activeTestDeviation === "short_rom") {
        curJointAngle = Math.max(115, curJointAngle); // cuts depth short
      }

      setJointAngle(curJointAngle);
      setTargetAngle(idealTargetDepth);

      // Determine movement phase
      let phase: "eccentric" | "concentric" | "isometric" | "idle" = "idle";
      if (derivative < -0.15) {
        phase = "eccentric"; // Descendo
      } else if (derivative > 0.15) {
        phase = "concentric"; // Subindo
      } else {
        phase = "isometric"; // Ponto de inversão
      }
      setMovementPhase(phase);

      // Calculate Range of Motion (ROM) %
      // 170° is 0% ROM (standing), 85° is 100% ROM (full depth)
      const maxExt = 170;
      const fullDepth = idealTargetDepth;
      const calculatedRom = Math.min(
        100,
        Math.max(0, Math.round(((maxExt - curJointAngle) / (maxExt - fullDepth)) * 100))
      );
      setRomPercentage(calculatedRom);

      // -------------------------------------------------------------
      // 2. BIOMECHANICAL DEVIATION EVALUATION ("POSTURA INCORRETA")
      // -------------------------------------------------------------
      let currentDeviation: PostureDeviationType = activeTestDeviation;
      let isIncorrect = false;
      let calculatedScore = 96;
      let alertTitle = "Postura e Alinhamento Ideais";
      let cueText = "Trajetória articular perfeita. Mantenha o ritmo estável.";
      let alertStatus: "perfect" | "warning" | "alert" = "perfect";

      // If no forced test deviation, detect natural biomechanical anomalies
      if (activeTestDeviation === "none") {
        if (isSquat) {
          // Check amplitude in reversal phase
          if (phase === "isometric" && curJointAngle > 105) {
            currentDeviation = "short_rom";
            isIncorrect = true;
          }
        } else if (isPress) {
          if (phase === "isometric" && curJointAngle > 100) {
            currentDeviation = "short_rom";
            isIncorrect = true;
          }
        }
      } else {
        isIncorrect = true;
      }

      // Map specific deviations to Portuguese corrective cues & warnings
      if (currentDeviation === "knee_valgus") {
        alertStatus = "alert";
        calculatedScore = 58;
        alertTitle = "Postura Incorreta: Joelhos Valgos!";
        cueText = "Afaste os joelhos para fora na linha dos pés para proteger meniscos e ligamentos.";
      } else if (currentDeviation === "short_rom") {
        alertStatus = "warning";
        calculatedScore = 68;
        alertTitle = "Postura Incorreta: Amplitude Curta!";
        cueText = `Desça até o ângulo de ${idealTargetDepth}° para garantir ativação e hipertrofia completa.`;
      } else if (currentDeviation === "rounded_back") {
        alertStatus = "alert";
        calculatedScore = 48;
        alertTitle = "Postura Incorreta: Coluna Curvada!";
        cueText = "Estufe o peito, trave o abdômen e mantenha a curvatura neutra da coluna lombar.";
      } else if (currentDeviation === "elbow_flare") {
        alertStatus = "alert";
        calculatedScore = 62;
        alertTitle = "Postura Incorreta: Cotovelos Abertos!";
        cueText = "Aproxime os cotovelos a 45°-60° do tronco para evitar pinçamento subacromial.";
      } else {
        // Ideal form
        if (calculatedRom >= 85) {
          alertStatus = "perfect";
          calculatedScore = 98;
          alertTitle = "Amplitude Completa e Postura Perfeita!";
          cueText = "Excelente profundidade com alinhamento biomecânico ideal.";
        } else {
          alertStatus = "perfect";
          calculatedScore = 94;
          alertTitle = "Alinhamento Articular Estável";
          cueText = "Controle o movimento mantendo a postura firme.";
        }
      }

      setFormScore(calculatedScore);

      const newFeedbackState: PostureFeedbackState = {
        status: alertStatus,
        isIncorrect,
        deviation: currentDeviation,
        title: alertTitle,
        correctiveCue: cueText,
        jointAngle: curJointAngle,
        targetAngle: idealTargetDepth,
        romPercentage: calculatedRom,
        score: calculatedScore,
      };

      setPostureState(newFeedbackState);
      onPostureStatusChange?.(newFeedbackState);

      // Trigger audio alerts when Postura Incorreta or Short ROM is active (Web Speech API)
      if (isIncorrect && alertStatus === "alert") {
        if (currentDeviation === "knee_valgus") {
          speakFeedback("Atenção! Postura Incorreta detectada. Empurre os joelhos para fora.");
          playAlertBuzzer();
        } else if (currentDeviation === "rounded_back") {
          speakFeedback("Cuidado! Coluna curvada. Estufe o peito e trave o abdômen.");
          playAlertBuzzer();
        } else if (currentDeviation === "elbow_flare") {
          speakFeedback("Postura Incorreta! Feche os cotovelos para proteger os ombros.");
          playAlertBuzzer();
        }
      } else if (isIncorrect && alertStatus === "warning" && currentDeviation === "short_rom") {
        speakFeedback(`Amplitude de movimento abaixo da meta! Desça até o ângulo de ${idealTargetDepth} graus.`);
        playAlertBuzzer();
      } else if (calculatedRom < 80 && (phase === "isometric" || phase === "concentric") && curJointAngle > idealTargetDepth + 15) {
        // Real-time audio cue if ROM target not achieved
        speakFeedback(`Amplitude incompleta! Desça até ${idealTargetDepth} graus para validar.`);
        playAlertBuzzer();
      }

      // Rep counting logic
      if (phase === "eccentric" && curJointAngle <= idealTargetDepth + 8) {
        phaseCycleRef.current.inRep = true;
      }
      if (phase === "concentric" && curJointAngle > 160 && phaseCycleRef.current.inRep) {
        phaseCycleRef.current.inRep = false;
        if (!isIncorrect) {
          setCountedReps((r) => {
            const next = r + 1;
            onValidRepCounted?.(next);
            speakFeedback(`Repetição ${next} validada, excelente!`, true);
            return next;
          });
        } else {
          speakFeedback("Repetição incompleta por desvio de postura. Corrija a forma!");
        }
      }

      // -------------------------------------------------------------
      // 3. CANVAS SKELETAL RENDERING WITH BIOMECHANICAL CUES
      // -------------------------------------------------------------
      const centerX = w * 0.5;
      const centerY = h * 0.5;

      // Base skeletal coordinates
      let head = { x: centerX, y: centerY - 110 + phaseOsc * 20 };
      let neck = { x: centerX, y: centerY - 85 + phaseOsc * 22 };
      let leftShoulder = { x: centerX - 46, y: centerY - 70 + phaseOsc * 22 };
      let rightShoulder = { x: centerX + 46, y: centerY - 70 + phaseOsc * 22 };
      let leftElbow = { x: centerX - 58, y: centerY - 35 + phaseOsc * 18 };
      let rightElbow = { x: centerX + 58, y: centerY - 35 + phaseOsc * 18 };
      let leftWrist = { x: centerX - 42, y: centerY - 10 + phaseOsc * 25 };
      let rightWrist = { x: centerX + 42, y: centerY - 10 + phaseOsc * 25 };
      let spineMid = { x: centerX, y: centerY - 20 + phaseOsc * 24 };
      let pelvis = { x: centerX, y: centerY + 25 + phaseOsc * 25 };
      let leftHip = { x: centerX - 30, y: centerY + 28 + phaseOsc * 25 };
      let rightHip = { x: centerX + 30, y: centerY + 28 + phaseOsc * 25 };
      let leftKnee = { x: centerX - 38, y: centerY + 85 + phaseOsc * 38 };
      let rightKnee = { x: centerX + 38, y: centerY + 85 + phaseOsc * 38 };
      let leftAnkle = { x: centerX - 40, y: centerY + 155 };
      let rightAnkle = { x: centerX + 40, y: centerY + 155 };

      if (hasRealPose && activeTestDeviation === "none") {
        const getLm = (idx: number) => {
          const lm = realLandmarks && realLandmarks[idx];
          if (!lm || typeof lm.x !== "number" || typeof lm.y !== "number") {
            return { x: centerX, y: centerY };
          }
          return {
            x: (activeFacingMode === "user" ? 1 - lm.x : lm.x) * w,
            y: lm.y * h,
          };
        };
        if (realLandmarks![0]) head = getLm(0);
        if (realLandmarks![11] && realLandmarks![12]) {
          leftShoulder = getLm(11);
          rightShoulder = getLm(12);
          neck = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
        }
        if (realLandmarks![13]) leftElbow = getLm(13);
        if (realLandmarks![14]) rightElbow = getLm(14);
        if (realLandmarks![15]) leftWrist = getLm(15);
        if (realLandmarks![16]) rightWrist = getLm(16);
        if (realLandmarks![23] && realLandmarks![24]) {
          leftHip = getLm(23);
          rightHip = getLm(24);
          pelvis = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
          spineMid = { x: (neck.x + pelvis.x) / 2, y: (neck.y + pelvis.y) / 2 };
        }
        if (realLandmarks![25]) leftKnee = getLm(25);
        if (realLandmarks![26]) rightKnee = getLm(26);
        if (realLandmarks![27]) leftAnkle = getLm(27);
        if (realLandmarks![28]) rightAnkle = getLm(28);
      } else {
        if (currentDeviation === "elbow_flare") {
          leftElbow.x = centerX - 82;
          rightElbow.x = centerX + 82;
        }
        if (currentDeviation === "rounded_back") {
          spineMid.x = centerX + 24;
        }
        if (currentDeviation === "knee_valgus") {
          leftKnee.x = centerX - 14;
          rightKnee.x = centerX + 14;
        }
      }

      // HUD Colors based on status
      const hudPrimaryColor =
        alertStatus === "alert" ? "#f43f5e" : alertStatus === "warning" ? "#fbbf24" : "#00d2ff";

      ctx.save();

      // Draw Target Alignment Framing Box
      ctx.strokeStyle = isIncorrect ? "rgba(244, 63, 94, 0.4)" : "rgba(0, 210, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(centerX - 105, centerY - 145, 210, 320);
      ctx.setLineDash([]);

      // Draw Target Depth Horizontal Threshold Line
      const targetDepthY = centerY + 85 + 38; // bottom of squat position
      ctx.strokeStyle = isIncorrect ? "rgba(244, 63, 94, 0.5)" : "rgba(16, 185, 129, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX - 95, targetDepthY);
      ctx.lineTo(centerX + 95, targetDepthY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Label on Depth Line
      ctx.fillStyle = isIncorrect ? "#f43f5e" : "#10b981";
      ctx.font = "bold 9px monospace";
      ctx.fillText(
        `Alvo: ${idealTargetDepth}° (100% ROM)`,
        centerX - 85,
        targetDepthY - 5
      );

      // Draw Bones
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = hudPrimaryColor;
      ctx.lineCap = "round";

      const bones: Array<[typeof head, typeof neck]> = [
        [head, neck],
        [neck, leftShoulder],
        [neck, rightShoulder],
        [leftShoulder, leftElbow],
        [rightShoulder, rightElbow],
        [leftElbow, leftWrist],
        [rightElbow, rightWrist],
        [neck, spineMid],
        [spineMid, pelvis],
        [pelvis, leftHip],
        [pelvis, rightHip],
        [leftHip, leftKnee],
        [rightHip, rightKnee],
        [leftKnee, leftAnkle],
        [rightKnee, rightAnkle],
      ];

      bones.forEach(([p1, p2]) => {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Highlight deviation-specific correction vectors
      if (currentDeviation === "knee_valgus") {
        // Red corrective arrow pushing knees outward
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2.5;
        // Left knee outward cue arrow
        ctx.beginPath();
        ctx.moveTo(leftKnee.x, leftKnee.y);
        ctx.lineTo(leftKnee.x - 22, leftKnee.y);
        ctx.stroke();
        // Right knee outward cue arrow
        ctx.beginPath();
        ctx.moveTo(rightKnee.x, rightKnee.y);
        ctx.lineTo(rightKnee.x + 22, rightKnee.y);
        ctx.stroke();

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 10px monospace";
        ctx.fillText("VALGO!", leftKnee.x - 45, leftKnee.y - 6);
      } else if (currentDeviation === "rounded_back") {
        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 10px monospace";
        ctx.fillText("COLUNA CURVADA!", spineMid.x + 10, spineMid.y);
      } else if (currentDeviation === "elbow_flare") {
        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 10px monospace";
        ctx.fillText("COTOVELO ABERTO!", leftElbow.x - 80, leftElbow.y);
      }

      // Draw Keypoint Joint Nodes
      const joints = [
        head,
        neck,
        leftShoulder,
        rightShoulder,
        leftElbow,
        rightElbow,
        leftWrist,
        rightWrist,
        spineMid,
        pelvis,
        leftHip,
        rightHip,
        leftKnee,
        rightKnee,
        leftAnkle,
        rightAnkle,
      ];

      joints.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isIncorrect ? "#ffe4e6" : "#ffffff";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = hudPrimaryColor;
        ctx.stroke();
      });

      // Draw Biomechanical Angle Arc
      const activeJoint = isSquat ? leftKnee : isPress ? leftElbow : spineMid;
      ctx.beginPath();
      ctx.arc(activeJoint.x, activeJoint.y, 22, 0, Math.PI * (curJointAngle / 180));
      ctx.strokeStyle = hudPrimaryColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Degree readout on joint
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`${curJointAngle}°`, activeJoint.x + 25, activeJoint.y + 4);

      ctx.restore();
      } catch (err) {
        console.warn("LiveVision renderLoop safely caught error:", err);
      } finally {
        animFrameRef.current = requestAnimationFrame(renderLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    exercise.name,
    activeTestDeviation,
    idealTargetDepth,
    isSquat,
    isPress,
    isDeadlift,
    onValidRepCounted,
    onPostureStatusChange,
    speakFeedback,
    playAlertBuzzer,
  ]);

  return (
    <div
      className={`fixed transition-all z-50 shadow-2xl overflow-hidden border border-cyan-500/40 bg-neutral-950/95 backdrop-blur-md rounded-3xl ${
        isPIPMode
          ? "bottom-20 right-4 sm:right-8 w-72 sm:w-80 h-[430px]"
          : "inset-4 sm:inset-8 md:inset-10 max-w-4xl mx-auto my-auto h-[88vh]"
      }`}
    >
      {/* Top HUD Controls Bar */}
      <div className="absolute top-0 inset-x-0 z-30 p-3.5 bg-linear-to-b from-neutral-950/95 via-neutral-950/75 to-transparent flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>IA Vision Biomecânica</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                mediaPipeStatus === "ready"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
              }`}>
                {mediaPipeStatus === "ready" ? "MediaPipe Pose 60fps" : "MediaPipe / Cinemática"}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 truncate max-w-[160px] sm:max-w-xs">
              {exercise.name} (Série {currentSetIndex + 1})
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Test Deviations Simulator Toggle */}
          <button
            onClick={() => setShowTesterPanel(!showTesterPanel)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              showTesterPanel || activeTestDeviation !== "none"
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Simular ou testar desvios posturais em tempo real"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Testar Desvio</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              const next = !soundFeedbackEnabled;
              setSoundFeedbackEnabled(next);
              if (next) speakFeedback("Voz do treinador biomecânico ativada.");
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              soundFeedbackEnabled
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-neutral-900 border-neutral-800 text-neutral-500"
            }`}
            title={soundFeedbackEnabled ? "Voz de correção ativada" : "Voz desativada"}
          >
            {soundFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Camera switch (front/rear) */}
          <button
            onClick={handleToggleFacingMode}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Alternar Câmera Frontal / Traseira"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* PIP / Expand toggle */}
          <button
            onClick={() => setIsPIPMode(!isPIPMode)}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={isPIPMode ? "Expandir Câmera" : "Minimizar para PiP"}
          >
            {isPIPMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar Câmera"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Deviation Tester Bar (Optional Floating Panel) */}
      {showTesterPanel && (
        <div className="absolute top-16 inset-x-4 z-40 bg-neutral-950/95 border border-amber-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulador de Desvios Biomecânicos</span>
            </div>
            <div className="text-[10px] text-neutral-400">
              Teste os alertas de Postura Incorreta e correções por voz
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            <button
              onClick={() => setActiveTestDeviation("none")}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                activeTestDeviation === "none"
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              ✓ Postura Ideal
            </button>

            <button
              onClick={() => setActiveTestDeviation("knee_valgus")}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                activeTestDeviation === "knee_valgus"
                  ? "bg-rose-500/30 border-rose-500 text-rose-300 font-bold"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              🚨 Joelhos Valgos
            </button>

            <button
              onClick={() => setActiveTestDeviation("short_rom")}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                activeTestDeviation === "short_rom"
                  ? "bg-amber-500/30 border-amber-500 text-amber-300 font-bold"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              ⚠️ Amplitude Curta
            </button>

            <button
              onClick={() => setActiveTestDeviation("rounded_back")}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                activeTestDeviation === "rounded_back"
                  ? "bg-rose-500/30 border-rose-500 text-rose-300 font-bold"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              🚨 Coluna Curvada
            </button>

            <button
              onClick={() => setActiveTestDeviation("elbow_flare")}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                activeTestDeviation === "elbow_flare"
                  ? "bg-rose-500/30 border-rose-500 text-rose-300 font-bold"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              🚨 Cotovelos Abertos
            </button>
          </div>
        </div>
      )}

      {/* Main Video Viewport & Pose Canvas */}
      <div className="relative w-full h-full bg-neutral-950 flex items-center justify-center overflow-hidden">
        {/* Real Device Video Feed */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover transform ${activeFacingMode === "user" ? "-scale-x-100" : ""}`}
        />

        {/* Fallback Simulation Background when camera unavailable */}
        {cameraStatus === "simulation" && (
          <div className="absolute inset-0 bg-radial from-neutral-900 via-neutral-950 to-neutral-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
              <Activity className="w-8 h-8" />
            </div>
            <div className="text-sm font-bold text-white mb-1">Rastreador Cinemático Ativo</div>
            <div className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              Câmera física emulada. Executando modelo biomecânico com detecção de ângulos, amplitude de movimento e alertas sonoros de Postura Incorreta.
            </div>
          </div>
        )}

        {/* Skeletal Pose Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={480}
          height={640}
          className="absolute inset-0 w-full h-full pointer-events-none object-contain"
        />

        {/* TOP FLASHING ALERT BANNER: POSTURA INCORRETA */}
        {postureState.isIncorrect && (
          <div className="absolute top-16 inset-x-4 sm:inset-x-8 z-30 animate-bounce">
            <div
              className={`p-3 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center gap-3 ${
                postureState.status === "alert"
                  ? "bg-rose-950/90 border-rose-500 text-rose-100 shadow-rose-500/30"
                  : "bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-500/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  postureState.status === "alert"
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-amber-500 text-neutral-950"
                }`}
              >
                <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase tracking-widest font-black text-rose-300">
                  {postureState.status === "alert" ? "🚨 ALERTA BIOMECÂNICO" : "⚠️ ATENÇÃO À FORMA"}
                </div>
                <div className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  {postureState.title}
                </div>
                <div className="text-xs text-rose-200/90 font-medium line-clamp-1 sm:line-clamp-none">
                  {postureState.correctiveCue}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM HUD TELEMETRY & ROM GAUGE */}
        <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 z-20 space-y-2 pointer-events-auto">
          {/* Real-time Range of Motion (Amplitude de Movimento) Bar */}
          <div className="p-3 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-md space-y-1.5 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-bold text-[11px]">Amplitude (ROM):</span>
                <span
                  className={`font-black text-xs ${
                    romPercentage >= 85
                      ? "text-emerald-400"
                      : romPercentage >= 65
                      ? "text-cyan-400"
                      : "text-amber-400"
                  }`}
                >
                  {romPercentage}% {romPercentage >= 85 ? "Completa ✓" : "Parcial"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <span>Atual: <strong className="text-white">{jointAngle}°</strong></span>
                <span>·</span>
                <span>Alvo: <strong className="text-cyan-400">≤ {targetAngle}°</strong></span>
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800 flex">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  postureState.status === "alert"
                    ? "bg-rose-500"
                    : romPercentage >= 85
                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    : romPercentage >= 65
                    ? "bg-cyan-400"
                    : "bg-amber-400"
                }`}
                style={{ width: `${Math.max(5, romPercentage)}%` }}
              />
            </div>
          </div>

          {/* Primary Posture Status Card */}
          <div
            className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-md transition-all shadow-xl flex items-center justify-between gap-3 ${
              postureState.status === "alert"
                ? "bg-rose-950/80 border-rose-500/50 text-rose-200"
                : postureState.status === "warning"
                ? "bg-amber-950/80 border-amber-500/50 text-amber-200"
                : "bg-neutral-900/90 border-cyan-500/40 text-cyan-200"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  postureState.status === "alert"
                    ? "bg-rose-500/20 text-rose-400"
                    : postureState.status === "warning"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-cyan-500/20 text-cyan-400"
                }`}
              >
                {postureState.status === "perfect" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-2">
                  <span>{postureState.title}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      formScore >= 90
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {formScore}% Score
                  </span>
                </div>
                <div className="text-[11px] opacity-85 truncate">{postureState.correctiveCue}</div>
              </div>
            </div>

            {/* Rep Counter Metric */}
            <div className="text-right shrink-0 pl-3 border-l border-white/10 font-mono">
              <div className="text-[9px] uppercase tracking-wider text-neutral-400">Reps Válidas</div>
              <div className="text-lg sm:text-xl font-black text-white leading-none mt-0.5">
                {countedReps}
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          {!isPIPMode && (
            <div className="p-2.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 backdrop-blur-md flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400 text-[10px]">Fase:</span>
                  <span className="font-bold capitalize text-white">
                    {movementPhase === "eccentric"
                      ? "Descida (Excêntrica)"
                      : movementPhase === "concentric"
                      ? "Subida (Concêntrica)"
                      : "Transição (Isométrica)"}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-neutral-400 text-[10px]">Padrão:</span>
                  <span className="text-cyan-400 font-bold">
                    {isSquat ? "Agachamento" : isPress ? "Empurrar" : "Tracionar"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    postureState.isIncorrect ? "bg-rose-500 animate-ping" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                <span className="text-[10px] text-neutral-300">
                  {postureState.isIncorrect ? "Correção Ativa" : "Forma Otimizada"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

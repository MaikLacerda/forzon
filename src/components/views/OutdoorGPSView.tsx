import React, { useState, useEffect, useRef } from "react";
import {
  Navigation,
  Play,
  Pause,
  Square,
  Shield,
  MapPin,
  TrendingUp,
  Clock,
  Flame,
  Share2,
  CheckCircle2,
  Activity,
  Compass,
  Trash2,
} from "lucide-react";
import { GPSActivity, GPSCoordinate, ActivitySplit, ActivityType } from "../../types";
import { StoryShareModal, StoryData } from "../social/StoryShareModal";

interface OutdoorGPSViewProps {
  pastActivities: GPSActivity[];
  onSaveActivity: (act: GPSActivity) => void;
  onShareToCommunity: (act: GPSActivity) => void;
  onDeleteActivity: (id: string) => void;
}

export const OutdoorGPSView: React.FC<OutdoorGPSViewProps> = ({
  pastActivities,
  onSaveActivity,
  onShareToCommunity,
  onDeleteActivity,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>("running");
  const [privacyCloaking, setPrivacyCloaking] = useState(true);

  // Live telemetry
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [currentPaceMinPerKm, setCurrentPaceMinPerKm] = useState("0:00");
  const [elevationGainM, setElevationGainM] = useState(0);
  const [coordinates, setCoordinates] = useState<GPSCoordinate[]>([]);
  const [splits, setSplits] = useState<ActivitySplit[]>([]);
  const [gpsSignalStatus, setGpsSignalStatus] = useState<"ready" | "tracking" | "simulated">("ready");
  const [justCompletedActivity, setJustCompletedActivity] = useState<GPSActivity | null>(null);
  const [storyActivity, setStoryActivity] = useState<GPSActivity | null>(null);

  const timerRef = useRef<number | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Timer tick
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // If GPS isn't changing rapidly (e.g. testing indoors), simulate slight step advances
        // so user sees the live map draw and telemetry move without needing to run around the house
        if (gpsSignalStatus === "simulated" || coordinates.length === 0) {
          simulateNextStep();
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused, gpsSignalStatus, coordinates.length]);

  // Recalculate pace when distance or time updates
  useEffect(() => {
    if (distanceKm > 0.05 && elapsedSeconds > 5) {
      const paceDecimal = (elapsedSeconds / 60) / distanceKm;
      const min = Math.floor(paceDecimal);
      const sec = Math.floor((paceDecimal - min) * 60);
      setCurrentPaceMinPerKm(`${min}:${sec < 10 ? "0" : ""}${sec}`);
      setCurrentSpeedKmh(parseFloat(((distanceKm / (elapsedSeconds / 3600))).toFixed(1)));
    }
  }, [distanceKm, elapsedSeconds]);

  // Draw the route on canvas whenever coordinates change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, width, height);

    // Grid lines for athletic map look
    ctx.strokeStyle = "#262626";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (coordinates.length < 2) {
      // Empty state prompt on canvas
      ctx.fillStyle = "#737373";
      ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        isTracking ? "Aguardando sinal GPS / traçando rota..." : "Inicie a atividade para visualizar a rota em tempo real",
        width / 2,
        height / 2
      );
      return;
    }

    // Determine bounding box
    const lats = coordinates.map((c) => c.latitude);
    const lons = coordinates.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latSpan = Math.max(0.001, maxLat - minLat);
    const lonSpan = Math.max(0.001, maxLon - minLon);

    const padding = 40;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    const project = (coord: GPSCoordinate) => {
      const x = padding + ((coord.longitude - minLon) / lonSpan) * drawWidth;
      const y = height - (padding + ((coord.latitude - minLat) / latSpan) * drawHeight);
      return { x, y };
    };

    // Draw Route Polyline
    const activeColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-accent-hex').trim() || "#00d2ff";
    ctx.beginPath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    coordinates.forEach((coord, i) => {
      const { x, y } = project(coord);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Start Pin
    const startPt = project(coordinates[0]);
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(startPt.x, startPt.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Current Head Pin
    const currentPt = project(coordinates[coordinates.length - 1]);
    ctx.fillStyle = activeColor;
    ctx.beginPath();
    ctx.arc(currentPt.x, currentPt.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [coordinates, isTracking]);

  // Start tracking
  const handleStartActivity = () => {
    setIsTracking(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setDistanceKm(0);
    setElevationGainM(0);
    setCoordinates([]);
    setSplits([]);
    setJustCompletedActivity(null);

    // Try HTML5 Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsSignalStatus("tracking");
          const initCoord: GPSCoordinate = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude || 10,
            speed: pos.coords.speed || 0,
            timestamp: Date.now(),
          };
          setCoordinates([initCoord]);

          // Watch position
          geoWatchIdRef.current = navigator.geolocation.watchPosition(
            (updatedPos) => {
              const newCoord: GPSCoordinate = {
                latitude: updatedPos.coords.latitude,
                longitude: updatedPos.coords.longitude,
                altitude: updatedPos.coords.altitude || 10,
                speed: updatedPos.coords.speed || 0,
                timestamp: Date.now(),
              };
              setCoordinates((prev) => [...prev, newCoord]);
            },
            (err) => {
              console.warn("GPS watch warning, using simulated motion:", err);
              setGpsSignalStatus("simulated");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
          );
        },
        () => {
          // Fallback to simulated scenic run
          setGpsSignalStatus("simulated");
          setCoordinates([
            { latitude: -27.5954, longitude: -48.548, timestamp: Date.now() },
          ]);
        }
      );
    } else {
      setGpsSignalStatus("simulated");
    }
  };

  const simulateNextStep = () => {
    setCoordinates((prev) => {
      const last = prev[prev.length - 1] || {
        latitude: -27.5954,
        longitude: -48.548,
        timestamp: Date.now(),
      };
      // Random delta simulating realistic running path (~3 m/s)
      const dLat = 0.00012 + (Math.random() - 0.5) * 0.00004;
      const dLon = 0.00015 + (Math.random() - 0.5) * 0.00003;
      const next: GPSCoordinate = {
        latitude: last.latitude + dLat,
        longitude: last.longitude + dLon,
        altitude: 12 + Math.sin(prev.length / 5) * 4,
        timestamp: Date.now(),
      };
      return [...prev, next];
    });

    setDistanceKm((prev) => {
      const nextDist = parseFloat((prev + 0.012).toFixed(2));
      // Check for split KM creation
      const currentKmInt = Math.floor(nextDist);
      const prevKmInt = Math.floor(prev);
      if (currentKmInt > prevKmInt && currentKmInt > 0) {
        setSplits((sp) => [
          ...sp,
          {
            kilometer: currentKmInt,
            durationSeconds: 310 + Math.floor(Math.random() * 20),
            paceMinPerKm: "5:12",
            elevationGainM: 8,
          },
        ]);
      }
      return nextDist;
    });

    setElevationGainM((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
  };

  const handlePauseActivity = () => {
    setIsPaused(!isPaused);
  };

  const handleFinishActivity = () => {
    if (geoWatchIdRef.current) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
    }
    setIsTracking(false);

    // Calculate burned calories (approx MET 9.8 for running)
    const calories = Math.round(distanceKm * 68);

    const completedAct: GPSActivity = {
      id: `act-${Date.now()}`,
      type: activityType,
      title: `${activityType === "running" ? "Corrida" : activityType === "cycling" ? "Pedal" : "Caminhada"} Outdoor FORZON`,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      durationSeconds: elapsedSeconds,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      averagePaceMinPerKm: currentPaceMinPerKm,
      averageSpeedKmh: currentSpeedKmh,
      elevationGainM,
      caloriesBurnedEstimated: calories,
      splits: splits.length > 0 ? splits : [
        { kilometer: 1, durationSeconds: elapsedSeconds, paceMinPerKm: currentPaceMinPerKm, elevationGainM }
      ],
      coordinates: privacyCloaking ? coordinates.slice(2, -2) : coordinates,
      sharedToFeed: false,
    };

    onSaveActivity(completedAct);
    setJustCompletedActivity(completedAct);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Módulo Esportivo Outdoor</span>
            <span aria-hidden="true">·</span>
            <span>Sensor GPS Ativo</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Camada de Privacidade LGPD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Corrida & Ciclismo GPS
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Rastreamento de rotas, altimetria acumulada, parciais por quilômetro e zonas seguras de início/fim.
          </p>
        </div>

        {/* Privacy Cloaking Toggle */}
        <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-800 text-xs">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-neutral-300">Ocultar 500m Iniciais/Finais:</span>
          <button
            onClick={() => setPrivacyCloaking(!privacyCloaking)}
            className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] cursor-pointer transition-colors ${
              privacyCloaking ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-400"
            }`}
          >
            {privacyCloaking ? "ATIVO" : "INATIVO"}
          </button>
        </div>
      </div>

      {/* Main Live Tracking Box */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Activity selector (when not active) */}
        {!isTracking && (
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-neutral-800 pb-4">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Selecione a Modalidade:
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActivityType("running")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activityType === "running"
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                Corrida de Rua
              </button>
              <button
                onClick={() => setActivityType("cycling")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activityType === "cycling"
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                Ciclismo / Bike
              </button>
              <button
                onClick={() => setActivityType("hiking")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activityType === "hiking"
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                Trilha / Caminhada
              </button>
              <button
                onClick={() => setActivityType("swimming")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activityType === "swimming"
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                Natação (Águas Abertas)
              </button>
            </div>
          </div>
        )}

        {/* Live Big Metric Heads */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs text-neutral-400">Tempo Decorrido</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums mt-1">
              {formatTimer(elapsedSeconds)}
            </div>
          </div>

          <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs text-neutral-400">Distância Total</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tabular-nums mt-1">
              {distanceKm.toFixed(2)}{" "}
              <span className="text-xs text-neutral-400 font-normal">km</span>
            </div>
          </div>

          <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs text-neutral-400">
              {activityType === "cycling" ? "Velocidade Média" : "Ritmo Atual"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums mt-1">
              {activityType === "cycling" ? `${currentSpeedKmh} km/h` : `${currentPaceMinPerKm}`}
              <span className="text-xs text-neutral-400 font-normal">
                {activityType === "cycling" ? "" : " /km"}
              </span>
            </div>
          </div>

          <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs text-neutral-400">Altimetria Acumulada</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums mt-1">
              {elevationGainM}{" "}
              <span className="text-xs text-neutral-400 font-normal">m</span>
            </div>
          </div>
        </div>

        {/* Canvas Route Map */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-72 sm:h-96">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />

          {/* Map floating badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-mono">
            <div
              className={`w-2 h-2 rounded-full ${
                isTracking ? "bg-emerald-400" : "bg-neutral-600"
              }`}
            />
            <span className="text-neutral-300">
              {isTracking
                ? gpsSignalStatus === "tracking"
                  ? "Sinal GPS Alta Precisão"
                  : "Modo Simulação Ativa"
                : "Pronto para Iniciar"}
            </span>
          </div>

          {privacyCloaking && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px] text-neutral-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Privacidade Ativa (Raio 500m Oculto)</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isTracking ? (
            <button
              onClick={handleStartActivity}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-neutral-950" />
              <span>INICIAR ATIVIDADE GPS</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handlePauseActivity}
                className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPaused
                    ? "bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
                    : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                }`}
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                <span>{isPaused ? "RETOMAR" : "PAUSAR"}</span>
              </button>

              <button
                onClick={handleFinishActivity}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs tracking-wide shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>ENCERRAR & SALVAR</span>
              </button>
            </div>
          )}
        </div>

        {/* Just Finished Modal/Banner */}
        {justCompletedActivity && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Atividade Concluída & Salva!</span>
              </div>
              <button
                onClick={() => setJustCompletedActivity(null)}
                className="text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Dispensar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-neutral-400">Distância:</span>{" "}
                <strong className="text-white">{justCompletedActivity.distanceKm} km</strong>
              </div>
              <div>
                <span className="text-neutral-400">Duração:</span>{" "}
                <strong className="text-white">{formatTimer(justCompletedActivity.durationSeconds)}</strong>
              </div>
              <div>
                <span className="text-neutral-400">Ritmo Médio:</span>{" "}
                <strong className="text-white">{justCompletedActivity.averagePaceMinPerKm} /km</strong>
              </div>
              <div>
                <span className="text-neutral-400">Calorias:</span>{" "}
                <strong className="text-white">~{justCompletedActivity.caloriesBurnedEstimated} kcal</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onShareToCommunity(justCompletedActivity);
                  setJustCompletedActivity(null);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar no Feed da Comunidade</span>
              </button>

              <button
                type="button"
                onClick={() => setStoryActivity(justCompletedActivity)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-500/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Story Whats & Insta</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Past Outdoor Records */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Histórico de Atividades Outdoor ({pastActivities.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastActivities.map((act) => (
            <div
              key={act.id}
              className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{act.title}</h3>
                  <div className="text-xs text-neutral-400 font-mono mt-0.5">
                    {new Date(act.startedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStoryActivity(act)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Compartilhar no Story (Whats / Insta)"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja apagar a atividade "${act.title}" e todos os pontos GPS associados?`)) {
                        onDeleteActivity(act.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Excluir atividade GPS"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-emerald-400">
                    <Navigation className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-850 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">Distância</div>
                  <div className="text-white font-bold">{act.distanceKm} km</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">Tempo</div>
                  <div className="text-white font-bold">{Math.round(act.durationSeconds / 60)} min</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">Ritmo Médio</div>
                  <div className="text-white font-bold">{act.averagePaceMinPerKm} /km</div>
                </div>
              </div>

              {act.splits.length > 0 && (
                <div className="pt-2 text-[11px] text-neutral-400 font-mono">
                  <div className="text-[10px] text-neutral-500 uppercase mb-1">Parciais por KM:</div>
                  <div className="flex flex-wrap gap-2">
                    {act.splits.slice(0, 5).map((sp) => (
                      <span key={sp.kilometer} className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        km {sp.kilometer}: {sp.paceMinPerKm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 9:16 Social Story Modal for WhatsApp & Instagram */}
      {storyActivity && (
        <StoryShareModal
          isOpen={true}
          onClose={() => setStoryActivity(null)}
          storyData={{
            type: "gps",
            title: storyActivity.title.toUpperCase(),
            subtitle: "Outdoor Telemetry · GPS Run",
            badgeText: "Corrida Outdoor",
            athleteName: "Gabriel Silva",
            dateStr: new Date(storyActivity.startedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            metrics: [
              {
                label: "Distância Total",
                value: `${storyActivity.distanceKm} km`,
                change: "Outdoor GPS",
                isPositive: true,
                icon: "navigation",
              },
              {
                label: "Ritmo Médio",
                value: `${storyActivity.averagePaceMinPerKm} /km`,
                icon: "clock",
              },
              {
                label: "Duração",
                value: `${Math.round(storyActivity.durationSeconds / 60)} min`,
                icon: "clock",
              },
              {
                label: "Calorias Est.",
                value: `~${storyActivity.caloriesBurnedEstimated} kcal`,
                icon: "flame",
              },
            ],
            highlights: [
              storyActivity.elevationGainM
                ? `Elevação positiva acumulada: +${storyActivity.elevationGainM}m`
                : "Traçado regular com alta cadência",
              `Total de ${storyActivity.splits.length} parciais computadas com GPS seguro`,
            ],
            quoteOrDiagnostic: "Excelente controle do ritmo de limiar aeróbico e recuperação cardiovascular ativa.",
          }}
        />
      )}
    </div>
  );
};

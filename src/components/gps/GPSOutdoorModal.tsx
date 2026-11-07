import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Compass,
  MapPin,
  Clock,
  Zap,
  Activity,
  X,
  CheckCircle2
} from 'lucide-react';

interface GPSOutdoorModalProps {
  onClose: () => void;
  onSaveActivity: (summary: {
    modality: string;
    distanceKm: number;
    durationSeconds: number;
    paceMinKm: string;
    kcalEstimated: number;
  }) => void;
}

export const GPSOutdoorModal: React.FC<GPSOutdoorModalProps> = ({ onClose, onSaveActivity }) => {
  const [selectedModality, setSelectedModality] = useState<'Corrida' | 'Bike' | 'Caminhada' | 'Trilha'>('Corrida');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Simulação de cálculo dinâmico de distância e ritmo
  const speedKmhMap = { Corrida: 10.5, Bike: 22.0, Caminhada: 5.2, Trilha: 6.0 };
  const currentSpeed = speedKmhMap[selectedModality] || 10.0;
  const distanceKm = parseFloat(((seconds * (currentSpeed / 3600))).toFixed(2));
  
  // Cálculo de Pace (min/km)
  const paceMinutes = distanceKm > 0 ? (seconds / 60) / distanceKm : 0;
  const paceMin = Math.floor(paceMinutes);
  const paceSec = Math.round((paceMinutes - paceMin) * 60);
  const paceStr = distanceKm > 0 ? `${paceMin}'${paceSec.toString().padStart(2, '0')}"` : "0'00\"";

  // Gasto calórico estimado
  const kcalMap = { Corrida: 68, Bike: 42, Caminhada: 35, Trilha: 50 };
  const estimatedKcal = Math.round(distanceKm * (kcalMap[selectedModality] || 60));

  useEffect(() => {
    let timer: any = null;
    if (isRunning) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTimer = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col justify-between p-4 overflow-y-auto animate-in fade-in">
      <header className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">TELEMETRIA POR SATÉLITE</span>
            <h2 className="text-sm font-black text-white">GPS Outdoor & Rastreamento</h2>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Conteúdo Central */}
      <div className="space-y-4 max-w-md mx-auto w-full my-auto py-2">
        {/* Seletor de Modalidade */}
        <div className="grid grid-cols-4 gap-2">
          {(['Corrida', 'Bike', 'Caminhada', 'Trilha'] as const).map((mod) => (
            <button
              key={mod}
              onClick={() => {
                if (!isRunning) setSelectedModality(mod);
              }}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedModality === mod
                  ? 'bg-cyan-950 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                  : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Display Central do Cronômetro & Distância */}
        <div className="p-6 rounded-3xl bg-[#0f131c] border border-cyan-500/30 text-center space-y-2 shadow-[0_0_25px_rgba(0,210,255,0.1)]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
            {selectedModality.toUpperCase()} • CRONÔMETRO ATIVO
          </span>
          <div className="text-6xl font-mono font-black text-[#00d2ff] tracking-tight">
            {formatTimer(seconds)}
          </div>
          <div className="flex items-baseline justify-center gap-1.5 pt-2">
            <span className="text-4xl font-mono font-black text-white">{distanceKm}</span>
            <span className="text-xs text-slate-400 font-bold uppercase">km</span>
          </div>
        </div>

        {/* Grid de Telemetria: Pace, Calorias e Sinal */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Ritmo (Pace)</span>
            <p className="text-sm font-mono font-black text-white mt-0.5">{paceStr} /km</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Gasto Est.</span>
            <p className="text-sm font-mono font-black text-[#00d2ff] mt-0.5">{estimatedKcal} kcal</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Sinal GPS</span>
            <p className="text-xs font-mono font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ótimo (5m)
            </p>
          </div>
        </div>

        {/* Mapa Tático Visual */}
        <div className="w-full h-36 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00d2ff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 z-10 bg-black/60 px-3 py-1.5 rounded-xl border border-cyan-500/30">
            <MapPin className="w-4 h-4 text-[#00d2ff]" />
            <span>Rastreamento Ativo • Satélite Conectado</span>
          </div>
        </div>
      </div>

      {/* Controles: Iniciar, Pausar, Salvar */}
      <footer className="pt-3 max-w-md mx-auto w-full space-y-2">
        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="flex-1 py-4 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-neutral-950 text-neutral-950" />
              {seconds > 0 ? 'Retomar Atividade' : 'Iniciar Atividade'}
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="flex-1 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-neutral-950 text-neutral-950" />
              Pausar
            </button>
          )}

          {seconds > 0 && !isRunning && (
            <button
              onClick={() => {
                setSeconds(0);
                setIsRunning(false);
              }}
              className="px-4 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:text-white"
              title="Zerar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {seconds > 0 && !isRunning && (
          <button
            onClick={() => {
              onSaveActivity({
                modality: selectedModality,
                distanceKm,
                durationSeconds: seconds,
                paceMinKm: paceStr,
                kcalEstimated: estimatedKcal
              });
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 fill-neutral-950" />
            Salvar e Conectar ao Strava
          </button>
        )}
      </footer>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { X, Play, Square, Compass, MapPin } from 'lucide-react';
interface GPSOutdoorProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishRun?: (distKm: number) => void;
}

export const GPSOutdoorModal: React.FC<GPSOutdoorProps> = ({
  isOpen,
  onClose,
  onFinishRun,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
        setDistanceKm((d) => +(d + 0.003).toFixed(3));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const pace = distanceKm > 0 ? (seconds / 60 / distanceKm).toFixed(2) : '5.30';

  return (
    <div className="fixed inset-0 z-50 bg-[#070a11] flex flex-col animate-in fade-in duration-200">
      <div className="p-4 border-b border-slate-800 bg-[#0a0e17] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#00d2ff]" />
          <div>
            <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">Rastreamento Outdoor</span>
            <h3 className="text-sm font-bold text-white">Corrida / GPS Satélite</h3>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 bg-[#090d16] relative flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00d2ff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative text-center z-10 space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full border-2 border-cyan-500/40 bg-cyan-950/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,210,255,0.2)]">
            <MapPin className="w-8 h-8 text-[#00d2ff] animate-bounce" />
          </div>
          <span className="text-5xl font-black text-white font-mono">{distanceKm.toFixed(2)}</span>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Quilômetros Percorridos</p>
        </div>
      </div>

      <div className="p-4 bg-[#0a0e17] border-t border-slate-800">
        <div className="grid grid-cols-3 gap-2 text-center pb-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400">Tempo</span>
            <p className="text-sm font-mono font-bold text-white mt-0.5">{formatTime(seconds)}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400">Pace Médio</span>
            <p className="text-sm font-mono font-bold text-cyan-400 mt-0.5">{pace} <span className="text-[9px]">min/km</span></p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400">Calorias</span>
            <p className="text-sm font-mono font-bold text-amber-400 mt-0.5">{Math.round(distanceKm * 65)} kcal</p>
          </div>
        </div>

        {!isRunning ? (
          <button
            onClick={() => setIsRunning(true)}
            className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-[#00c0ea] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)]"
          >
            <Play className="w-4 h-4 fill-slate-950" /> Iniciar Rastreamento GPS
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsRunning(false)}
              className="py-3 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs"
            >
              Pausar
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                if (onFinishRun) onFinishRun(distanceKm);
                onClose();
              }}
              className="py-3 rounded-xl bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1"
            >
              <Square className="w-3.5 h-3.5 fill-white" /> Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

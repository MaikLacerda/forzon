import React, { useState } from 'react';
import { Camera, X, Scan, Sparkles, Check, RefreshCw, Barcode, Flame } from 'lucide-react';

export interface ScannedFoodResult {
  name: string;
  brand?: string;
  serving: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface NutritionScannerModalProps {
  onClose: () => void;
  onAddFood: (food: ScannedFoodResult) => void;
}

export const NutritionScannerModal: React.FC<NutritionScannerModalProps> = ({
  onClose,
  onAddFood,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedFoodResult | null>(null);

  // Simulação realista do OCR / Visor de Câmera da IA
  const handleTriggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult({
        name: 'Whey Protein Isolado 100% Baunilha',
        brand: 'Dux Nutrition / Forzon Pro',
        serving: '1 scoop (30g)',
        calories: 120,
        proteinG: 24.5,
        carbsG: 2.1,
        fatG: 1.2,
      });
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-[#0a0e17] border border-cyan-500/50 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-[0_0_40px_rgba(0,210,255,0.25)]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                OCR & VISOR IA
              </span>
              <h3 className="text-sm font-black text-white">Scanner Nutricional</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor de Câmera com Guias Táticas de Enquadramento */}
        <div className="relative w-full h-56 rounded-2xl bg-[#07090e] border border-cyan-500/30 overflow-hidden flex flex-col items-center justify-center shadow-inner">
          {/* Mira / Frame Tático de Leitura */}
          <div className="relative w-44 h-36 border-2 border-dashed border-[#00d2ff]/60 rounded-xl flex items-center justify-center">
            {/* Linha laser de scan animada */}
            <div className={`absolute left-0 right-0 h-0.5 bg-[#00d2ff] shadow-[0_0_12px_#00d2ff] ${isScanning ? 'animate-bounce' : 'top-1/2 -translate-y-1/2 opacity-70'}`} />
            <div className="text-center p-2">
              <Barcode className="w-8 h-8 mx-auto text-[#00d2ff]/50 mb-1" />
              <span className="text-[9px] font-mono text-slate-400 block uppercase">
                {isScanning ? 'Lendo tabela...' : 'Aponte para a Tabela ou Código de Barras'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[9px] font-mono text-slate-300">
            <span>Sensor: 1080p 60fps</span>
            <span className="text-emerald-400 font-bold">Auto-Focus Ativo</span>
          </div>
        </div>

        {/* Ação de Disparo ou Resultado Detectado */}
        {!scannedResult ? (
          <div className="space-y-2">
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="w-full py-3.5 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                  Decodificando Informação Nutricional...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Escanear Embalagem Agora
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Captura automática de Kcal, Proteínas, Carboidratos e Gorduras.
            </p>
          </div>
        ) : (
          /* Card do Alimento Detectado */
          <div className="space-y-3 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-[#0f131c] border border-cyan-500/40 space-y-2 shadow-[0_0_20px_rgba(0,210,255,0.15)]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono text-[#00d2ff] uppercase font-bold block">
                    {scannedResult.brand || 'Item Identificado'}
                  </span>
                  <h4 className="text-xs font-black text-white">{scannedResult.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Porção: {scannedResult.serving}</span>
                </div>
                <div className="px-2 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-right">
                  <span className="text-xs font-mono font-black text-[#00d2ff]">{scannedResult.calories}</span>
                  <span className="text-[9px] text-slate-400 block -mt-0.5">kcal</span>
                </div>
              </div>

              {/* Grid de Macronutrientes Decodificados */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center">
                <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Proteínas</span>
                  <strong className="text-xs font-mono text-emerald-400">{scannedResult.proteinG}g</strong>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Carboidratos</span>
                  <strong className="text-xs font-mono text-cyan-400">{scannedResult.carbsG}g</strong>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Gorduras</span>
                  <strong className="text-xs font-mono text-amber-400">{scannedResult.fatG}g</strong>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onAddFood(scannedResult);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Registrar no Diário
              </button>
              <button
                onClick={() => setScannedResult(null)}
                className="px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
              >
                Repetir
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
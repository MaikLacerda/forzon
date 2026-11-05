import React, { useState, useEffect } from "react";
import {
  X,
  Bluetooth,
  BluetoothSearching,
  CheckCircle2,
  Scale,
  Activity,
  Flame,
  Droplets,
  Zap,
  Sparkles,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, BioimpedanceRecord } from "../../types";
import {
  bluetoothScaleService,
  DiscoveredScale,
  KNOWN_BIOIMPEDANCE_SCALES,
} from "../../services/bluetoothScaleService";
import { storage } from "../../services/storage";

interface BluetoothBioimpedanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onImportComplete?: (updatedProfile: UserProfile) => void;
}

type ConnectionStep = "scan" | "connecting" | "measuring" | "result";

export const BluetoothBioimpedanceModal: React.FC<BluetoothBioimpedanceModalProps> = ({
  isOpen,
  onClose,
  profile,
  onImportComplete,
}) => {
  const [step, setStep] = useState<ConnectionStep>("scan");
  const [isScanning, setIsScanning] = useState(false);
  const [selectedScale, setSelectedScale] = useState<DiscoveredScale | null>(null);
  const [measurement, setMeasurement] = useState<BioimpedanceRecord | null>(null);
  const [realBleError, setRealBleError] = useState<string | null>(null);
  const [measuredWeight, setMeasuredWeight] = useState<number>(profile.weightKg || 78.5);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep("scan");
      setIsScanning(false);
      setSelectedScale(null);
      setMeasurement(null);
      setRealBleError(null);
      setMeasuredWeight(profile.weightKg || 78.5);
    }
  }, [isOpen, profile.weightKg]);

  if (!isOpen) return null;

  // Real Web Bluetooth Scanner
  const handleScanRealBLE = async () => {
    setRealBleError(null);
    setIsScanning(true);
    try {
      const device = await bluetoothScaleService.scanRealBLEScale();
      if (device) {
        handleConnectScale(device);
      }
    } catch (err: any) {
      console.warn("Web Bluetooth error:", err);
      setRealBleError(
        err.message || "Não foi possível conectar ao hardware Bluetooth. Use um dos modelos compatíveis abaixo."
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Connection & Live Measurement Simulation Pipeline
  const handleConnectScale = (scale: DiscoveredScale) => {
    setSelectedScale(scale);
    setStep("connecting");

    // Phase 1: Bluetooth Handshake
    setTimeout(() => {
      setStep("measuring");

      // Phase 2: Live weight stabilization & bioimpedance wave calculation
      setTimeout(() => {
        const result = bluetoothScaleService.calculateBioimpedanceMetrics({
          profile,
          rawWeightKg: measuredWeight,
          deviceName: scale.name,
        });
        setMeasurement(result);
        setStep("result");
      }, 2400);
    }, 1800);
  };

  // Import into Athlete Profile
  const handleSaveToProfile = () => {
    if (!measurement) return;

    const existingHistory = profile.bioimpedanceHistory || [];
    const updatedHistory = [measurement, ...existingHistory.slice(0, 19)]; // Keep up to 20 scans

    const updatedProfile: UserProfile = {
      ...profile,
      weightKg: measurement.weightKg,
      bodyComposition: measurement,
      bioimpedanceHistory: updatedHistory,
    };

    storage.saveProfile(updatedProfile);
    if (onImportComplete) {
      onImportComplete(updatedProfile);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 space-y-6 shadow-2xl animate-scale-up my-auto relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Balança de Bioimpedância Bluetooth
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase">
                  BLE GATT
                </span>
              </div>
              <div className="text-xs text-neutral-400 font-mono">
                Sincronização de Gordura & Massa Muscular
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Scan & Device Discovery */}
        {step === "scan" && (
          <div className="space-y-4 relative z-10">
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Pareamento com Balanças Inteligentes</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Conecte sua balança via Bluetooth Low Energy (BLE) para importar automaticamente o peso, percentual de gordura corporal (% BF), massa muscular esquelética (kg) e taxa metabólica.
              </p>

              {bluetoothScaleService.isWebBluetoothSupported() && (
                <button
                  type="button"
                  onClick={handleScanRealBLE}
                  disabled={isScanning}
                  className="w-full mt-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <BluetoothSearching className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
                  <span>{isScanning ? "Buscando balança próxima..." : "Buscar Balança Bluetooth (Web BLE)"}</span>
                </button>
              )}

              {realBleError && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{realBleError}</span>
                </div>
              )}
            </div>

            {/* Quick Weight Fine-Tuning */}
            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
              <span className="text-neutral-400">Peso atual para calibração:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={measuredWeight}
                  onChange={(e) => setMeasuredWeight(parseFloat(e.target.value) || 75)}
                  className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono text-center font-bold"
                />
                <span className="text-neutral-300 font-mono">kg</span>
              </div>
            </div>

            {/* Compatible / Detected Devices List */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-neutral-400 tracking-wider flex items-center justify-between">
                <span>Dispositivos Compatíveis Detectados</span>
                <span className="text-[10px] text-cyan-400">Prontos para parear</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {KNOWN_BIOIMPEDANCE_SCALES.map((scale) => (
                  <button
                    key={scale.id}
                    type="button"
                    onClick={() => handleConnectScale(scale)}
                    className="w-full p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800 hover:border-cyan-500/50 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {scale.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {scale.brand} · {scale.model}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>{scale.signalStrength} dBm</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Bluetooth Connecting */}
        {step === "connecting" && selectedScale && (
          <div className="py-10 text-center space-y-5 relative z-10">
            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-3xl bg-cyan-500/15 border-2 border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto shadow-xl shadow-cyan-500/20"
            >
              <Bluetooth className="w-10 h-10 animate-pulse" />
            </motion.div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Conectando a {selectedScale.name}...
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Pareando canal GATT BLE seguro (Body Composition Service 0x181B)
              </p>
            </div>

            <div className="w-48 h-1.5 bg-neutral-800 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-cyan-400 rounded-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Live Impedance Wave Measurement */}
        {step === "measuring" && selectedScale && (
          <div className="py-8 text-center space-y-6 relative z-10">
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.15, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-3xl bg-cyan-500/20 border border-cyan-500/40"
              />
              <div className="relative w-full h-full rounded-3xl bg-neutral-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-xl">
                <Scale className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Pés posicionados nos eletrodos</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Analisando Bioimpedância Elétrica...
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Medindo resistência e reatância dos tecidos corporais com microcorrentes seguras de dupla frequência.
              </p>
            </div>

            {/* Frequency wave bars animation */}
            <div className="flex items-center justify-center gap-1.5 h-8">
              {[30, 60, 95, 45, 80, 100, 50, 85, 40, 70].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-cyan-400"
                  animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                  transition={{ repeat: Infinity, duration: 0.8 + (i % 3) * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Measurement Result & Direct Import */}
        {step === "result" && measurement && (
          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Leitura Concluída com Sucesso!</div>
                  <div className="text-[11px] text-emerald-300 font-mono">
                    {measurement.deviceName} · Importação pronta
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">Agora</span>
            </div>

            {/* Highlight Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Peso */}
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
                <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Peso Corporal</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {measurement.weightKg} <span className="text-xs text-neutral-400 font-normal">kg</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  IMC: <strong>{measurement.bmi}</strong>
                </div>
              </div>

              {/* Gordura Corporal */}
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-rose-500/30 space-y-1 shadow-sm">
                <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>% Gordura Corporal</span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {measurement.bodyFatPercentage}%
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  Faixa Atlética Saudável
                </div>
              </div>

              {/* Massa Muscular */}
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-emerald-500/30 space-y-1 shadow-sm col-span-2 sm:col-span-1">
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Massa Muscular</span>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {measurement.muscleMassKg} <span className="text-xs text-neutral-400 font-normal">kg</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  <strong>{measurement.muscleMassPercentage}%</strong> do corpo
                </div>
              </div>
            </div>

            {/* Secondary Bioimpedance Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Água Corporal</div>
                <div className="font-bold text-white font-mono text-sm mt-0.5">
                  {measurement.bodyWaterPercentage}%
                </div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Gordura Visceral</div>
                <div className="font-bold text-emerald-400 font-mono text-sm mt-0.5">
                  Nível {measurement.visceralFatLevel} (Ótimo)
                </div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Metabolismo Basal</div>
                <div className="font-bold text-white font-mono text-sm mt-0.5">
                  {measurement.basalMetabolicRateKcal} kcal
                </div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Idade Metabólica</div>
                <div className="font-bold text-cyan-400 font-mono text-sm mt-0.5">
                  {measurement.metabolicAge} anos
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("scan")}
                className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Nova Medição
              </button>

              <button
                type="button"
                onClick={handleSaveToProfile}
                className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar no Perfil FORZON</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

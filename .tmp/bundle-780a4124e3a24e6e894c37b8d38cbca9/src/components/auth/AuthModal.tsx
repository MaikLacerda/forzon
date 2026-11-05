import React, { useState } from "react";
import { X, Lock, CheckCircle2, Shield, LogOut, User, KeyRound, Check } from "lucide-react";
import { UserProfile } from "../../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onSwitchToNewUser: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onSwitchToNewUser,
}) => {
  const [activeTab, setActiveTab] = useState<"session" | "consents">("session");
  const [email, setEmail] = useState("atleta@athlynx.com");
  const [password, setPassword] = useState("••••••••••••");

  if (!isOpen) return null;

  const handleToggleConsent = (key: "lgpdDataCollection" | "healthSensorsConsent") => {
    const updated: UserProfile = {
      ...profile,
      consents: {
        ...profile.consents,
        [key]: !profile.consents[key],
        termsAcceptedAt: new Date().toISOString(),
      },
    };
    onUpdateProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md min-w-0 w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-up text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Conta & Segurança</h2>
              <div className="text-[11px] text-neutral-400 font-mono">Sessão Autenticada</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab("session")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === "session" ? "bg-neutral-800 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Dados da Sessão
          </button>
          <button
            onClick={() => setActiveTab("consents")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === "consents" ? "bg-neutral-800 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Termos & LGPD
          </button>
        </div>

        {activeTab === "session" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover border border-neutral-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-bold text-white text-sm">{profile.name}</div>
                <div className="text-neutral-400 font-mono text-[11px]">{profile.handle}</div>
                <div className="text-emerald-400 font-mono text-[10px] mt-0.5">
                  Membro Premium Ativo · ID: {profile.id}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 font-medium">E-mail Cadastrado:</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-medium">Senha / Chave de Sessão:</label>
                <input
                  type="password"
                  disabled
                  value={password}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (confirm("Deseja simular o fluxo de criação de conta com um novo atleta?")) {
                    onSwitchToNewUser();
                    onClose();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Trocar ou Criar Novo Perfil de Atleta</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "consents" && (
          <div className="space-y-3">
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              O FORZON armazena dados físicos e métricas exclusivamente para a geração de planos e telemetria dos treinos, sem compartilhamento com terceiros.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleToggleConsent("lgpdDataCollection")}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left flex items-start justify-between gap-3 cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white">Coleta Mínima de Dados Físicos</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Peso, altura e histórico de esforço para prescrição inteligente.
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    profile.consents.lgpdDataCollection
                      ? "bg-emerald-500 border-emerald-500 text-neutral-950"
                      : "border-neutral-700"
                  }`}
                >
                  {profile.consents.lgpdDataCollection && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              <button
                onClick={() => handleToggleConsent("healthSensorsConsent")}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left flex items-start justify-between gap-3 cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white">Acesso ao GPS & Sensores</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Permite traçar rota, ritmo e altimetria durante corrida e ciclismo.
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    profile.consents.healthSensorsConsent
                      ? "bg-emerald-500 border-emerald-500 text-neutral-950"
                      : "border-neutral-700"
                  }`}
                >
                  {profile.consents.healthSensorsConsent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>

            <div className="text-[10px] text-neutral-500 font-mono pt-2">
              Termos aceitos em: {new Date(profile.consents.termsAcceptedAt).toLocaleString("pt-BR")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

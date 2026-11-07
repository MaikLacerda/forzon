import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Camera,
  CheckCircle2,
  Watch,
  Activity,
  Radio,
  Bell,
  HardDrive,
  ShieldCheck,
  UploadCloud,
  Edit2,
  Check
} from 'lucide-react';

interface ProfileViewProps {
  userName: string;
  userHandle: string;
  onUpdateProfile: (name: string, handle: string, avatarUrl: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userName: initialName,
  userHandle: initialHandle,
  onUpdateProfile
}) => {
  const [userName, setUserName] = useState(initialName || 'Maikon Lacerda');
  const [userHandle, setUserHandle] = useState(initialHandle || '@maiklacerda');
  
  // Persistência real em LocalStorage para a foto não sumir ao recarregar a aba ou dar F5
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('forzon_athlete_avatar') || null;
    } catch {
      return null;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sensores & Wearables
  const [sensors] = useState([
    { id: 'apple-watch', name: 'Apple Watch / Wear OS', detail: 'Conectado (FC 68 bpm)', status: 'conectado', icon: Watch },
    { id: 'strava', name: 'Strava Sync', detail: 'Exportação automática de treinos', status: 'sincronizado', icon: Activity },
    { id: 'zepp', name: 'Zepp OS / Amazfit', detail: 'Telemetria de Sono e HRV', status: 'pareado', icon: ShieldCheck },
    { id: 'garmin', name: 'Garmin Connect', detail: 'Exportação de cargas e RPE', status: 'pronto', icon: Radio },
  ]);

  const [notificationsActive, setNotificationsActive] = useState(true);

  // Leitura como Base64 permanente: nunca expira no reload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setAvatarUrl(base64Data);
        try {
          localStorage.setItem('forzon_athlete_avatar', base64Data);
        } catch (err) {
          console.warn('Erro ao salvar avatar no localStorage:', err);
        }
        onUpdateProfile(userName, userHandle, base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    onUpdateProfile(userName, userHandle, avatarUrl || '');
  };

  return (
    <div className="space-y-4 animate-in fade-in select-none">
      <div>
        <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
          CONFIGURAÇÕES & IDENTIDADE
        </span>
        <h2 className="text-xl font-black text-white">Perfil do Atleta</h2>
      </div>

      {/* Cartão de Identidade com Troca de Foto e Edição */}
      <div className="p-5 rounded-3xl bg-[#0f131c] border border-cyan-500/30 text-center space-y-3 shadow-[0_0_30px_rgba(0,210,255,0.12)]">
        
        {/* Avatar com Botão de Câmera */}
        <div className="relative w-24 h-24 mx-auto">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar do Atleta"
              className="w-24 h-24 rounded-full object-cover border-2 border-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.4)]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-cyan-950/80 border-2 border-cyan-500/40 flex items-center justify-center text-3xl font-mono font-black text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.25)]">
              {userName ? userName.slice(0, 2).toUpperCase() : 'ML'}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
            title="Escolher Foto da Galeria ou Câmera"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <UploadCloud className="w-3 h-3 text-[#00d2ff]" />
            <span>Foto e biometria persistidas localmente & Firebase</span>
          </div>

          {isEditing ? (
            <div className="space-y-2 pt-2 max-w-xs mx-auto">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Seu Nome Completo"
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white text-center outline-none focus:border-[#00d2ff]"
              />
              <input
                type="text"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                placeholder="@username"
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#00d2ff] text-center outline-none focus:border-[#00d2ff]"
              />
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2 rounded-xl bg-[#00d2ff] text-neutral-950 font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Salvar Perfil
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-black text-white">{userName}</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-[#00d2ff]"
                  title="Editar Nome e @Username"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs font-mono font-bold text-[#00d2ff]">{userHandle}</span>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-2 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-bold text-cyan-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>PLANO FORZON PRO ATIVO</span>
              </div>
              <p className="text-[10px] text-slate-400 italic mt-2">
                “MORE THAN FITNESS. A WAY OF LIFE.”
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dispositivos, Sensores & Wearables */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Watch className="w-3.5 h-3.5 text-[#00d2ff]" />
            Dispositivos & Sensores
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            4 Conectados
          </span>
        </div>

        <div className="space-y-1.5">
          {sensors.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 flex items-center justify-between hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00d2ff]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{s.name}</h4>
                    <span className="text-[10px] text-slate-400">{s.detail}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                  {s.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configurações do Aplicativo */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-1">
          Configurações do Aplicativo
        </span>

        <div className="p-4 rounded-3xl bg-[#0f131c] border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#00d2ff]" />
              <div>
                <span className="font-bold text-white block">Notificações e Lembretes de Hidratação</span>
                <span className="text-[10px] text-slate-400">Alertas de descanso e ingestão de água</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsActive(!notificationsActive)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                notificationsActive ? 'bg-[#00d2ff]' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-neutral-950 transition-transform absolute top-1 ${
                  notificationsActive ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white block">Cache Offline dos 104 Vídeos 3D</span>
                <span className="text-[10px] text-slate-400">104 / 104 catalogados (Armazenamento Local)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400">Ativo</span>
          </div>
        </div>
      </div>

      {/* Rodapé e Versão */}
      <div className="pt-2 text-center text-[10px] text-slate-500 font-mono space-y-1">
        <div>Versão 1.0.0 (Kinetic Obsidian) • Package: com.forzon.fitness.app</div>
        <div className="text-slate-400">FORZON — More Than Fitness. A Way of Life.</div>
      </div>
    </div>
  );
};

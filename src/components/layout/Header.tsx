import React from 'react';
import { Flame } from 'lucide-react';
interface HeaderProps {
  onOpenCoach?: () => void;
  streakDays?: number;
  userAvatar?: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  streakDays = 12,
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  userName = 'Maikon',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0e17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/forzon-logo.jpg"
            alt="FORZON"
            className="w-9 h-9 rounded-xl object-cover border border-cyan-500/30 shadow-[0_0_12px_rgba(0,210,255,0.25)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-base tracking-wider text-white font-sans">
                FOR<span className="text-[#00d2ff]">Z</span>ON
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono tracking-tight -mt-0.5">
              MORE THAN FITNESS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streakDays}d</span>
          </div>

          <div className="relative">
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0a0e17]" />
          </div>
        </div>
      </div>
    </header>
  );
};

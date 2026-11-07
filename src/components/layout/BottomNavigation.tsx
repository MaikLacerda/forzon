import React from 'react';
import { Dumbbell, Utensils, Activity, Users, User } from 'lucide-react';
interface BottomNavigationProps {
  activeTab: 'workout' | 'nutrition' | 'bio' | 'community' | 'profile';
  onTabChange: (tab: 'workout' | 'nutrition' | 'bio' | 'community' | 'profile') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workout' as const, label: 'Treino', icon: Dumbbell },
    { id: 'nutrition' as const, label: 'Nutrição', icon: Utensils },
    { id: 'bio' as const, label: 'Bio', icon: Activity, badge: '84' },
    { id: 'community' as const, label: 'Comunidade', icon: Users },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e17]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive ? 'text-[#00d2ff]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 text-[9px] font-bold bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 rounded-full leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-[#00d2ff]' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#00d2ff] mt-0.5 shadow-[0_0_6px_#00d2ff]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

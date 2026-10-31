import React from "react";
import { LayoutDashboard, Dumbbell, Apple, Navigation, Users } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "hoje", label: "Hoje", icon: LayoutDashboard },
    { id: "treinos", label: "Treinos", icon: Dumbbell },
    { id: "nutricao", label: "Nutrição", icon: Apple },
    { id: "gps", label: "GPS", icon: Navigation },
    { id: "comunidade", label: "Social", icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-900 pb-[env(safe-area-inset-bottom)]">
      <nav className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="min-h-[44px] flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <div
                className={`transition-transform duration-200 ${
                  isActive ? "text-cyan-400 scale-105" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? "text-cyan-400 font-semibold" : "text-neutral-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

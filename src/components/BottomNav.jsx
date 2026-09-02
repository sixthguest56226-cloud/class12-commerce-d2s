import React from 'react';
import { Home, BookOpen, BarChart3 } from 'lucide-react';

export default function BottomNav({ currentView, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#101C2D]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1E2E46] pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] px-4 shadow-lg transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'subjects' && (currentView === 'subject-detail' || currentView === 'chapter-view'));

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-colors min-w-[64px] active:scale-95 ${
                isActive
                  ? 'text-[#315E8C] dark:text-[#4FA19B] font-semibold'
                  : 'text-slate-500 dark:text-[#9AA9BC] hover:text-slate-700 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-slate-100 dark:bg-[#142238]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#315E8C] dark:text-[#4FA19B]' : 'text-slate-500 dark:text-[#9AA9BC]'}`} />
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

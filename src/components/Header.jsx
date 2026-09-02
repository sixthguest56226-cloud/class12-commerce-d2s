import React from 'react';
import { BookOpen, Flame, Clock, Home, BarChart3, Sun, Moon } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ currentView, onNavigate }) {
  const { currentStreak, todayMinutes, dailyGoalMinutes, todayGoalCompleted } = useStudy();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#101C2D]/95 backdrop-blur-xs border-b border-slate-200 dark:border-[#1E2E46] px-4 py-3 shadow-2xs transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* App Title */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 text-left focus:outline-hidden shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#315E8C] dark:bg-[#3B76B2] text-white flex items-center justify-center font-bold text-sm shadow-xs transition-colors group-hover:bg-[#25496F]">
            C12
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight group-hover:text-[#315E8C] dark:group-hover:text-[#3B76B2] transition-colors">
              Commerce D2S
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-[#9AA9BC] font-medium">Class 12 Academic System</p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#08111F]/80 p-1 rounded-xl border border-slate-200/60 dark:border-[#1E2E46]/60">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'subjects' && (currentView === 'subject-detail' || currentView === 'chapter-view'));

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#101C2D] text-[#315E8C] dark:text-[#4FA19B] shadow-2xs border border-slate-200/80 dark:border-[#1E2E46]'
                    : 'text-slate-600 dark:text-[#9AA9BC] hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#315E8C] dark:text-[#4FA19B]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Header Actions & Stats */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sun / Moon Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#142238] dark:text-slate-200 dark:hover:bg-[#1E2E46] transition-colors border border-slate-200/60 dark:border-[#1E2E46]"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 rounded-full text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />
            <span>{currentStreak}d streak</span>
          </div>

          {/* Today's Goal Progress */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            todayGoalCompleted 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300' 
              : 'bg-slate-100 dark:bg-[#142238] border-slate-200 dark:border-[#1E2E46] text-slate-700 dark:text-[#9AA9BC]'
          }`}>
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{todayMinutes}/{dailyGoalMinutes}m</span>
          </div>
        </div>
      </div>
    </header>
  );
}

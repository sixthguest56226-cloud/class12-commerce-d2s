import React, { useState } from 'react';
import { BookOpen, Flame, Clock, Home, BarChart3, Sun, Moon, LogIn, LogOut, CloudCheck, User } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Header({ currentView, onNavigate }) {
  const { currentStreak, todayMinutes, dailyGoalMinutes, todayGoalCompleted } = useStudy();
  const { theme, toggleTheme } = useTheme();
  const { user, loginWithGoogle, logout, syncStatus } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#101C2D]/95 backdrop-blur-xs border-b border-slate-200 dark:border-[#1E2E46] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] shadow-2xs transition-colors">
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
            className="p-2 rounded-xl text-slate-600 dark:text-[#9AA9BC] hover:bg-slate-100 dark:hover:bg-[#142238] transition-colors focus:outline-hidden"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Daily Study Timer Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#08111F] border border-slate-200/80 dark:border-[#1E2E46]">
            <Clock className={`w-3.5 h-3.5 ${todayGoalCompleted ? 'text-emerald-500' : 'text-[#315E8C] dark:text-[#4FA19B]'}`} />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
              {todayMinutes}m
            </span>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
            <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
              {currentStreak}d
            </span>
          </div>

          {/* Google Auth / Sync Control */}
          {!user ? (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#142238] border border-slate-200 dark:border-[#1E2E46] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1A2D4A] shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Sign in with Google"
            >
              <LogIn className="w-3.5 h-3.5 text-[#315E8C] dark:text-[#4FA19B]" />
              <span className="inline">Sign in with Google</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(prev => !prev)}
                className="flex items-center gap-1.5 p-1 pl-1.5 rounded-xl bg-slate-100 dark:bg-[#08111F] border border-slate-200 dark:border-[#1E2E46] hover:bg-slate-200 dark:hover:bg-[#142238] transition-all cursor-pointer"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User Profile" className="w-6 h-6 rounded-full object-cover border border-[#315E8C]/40" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#315E8C] text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Cloud Synced" />
              </button>

              {/* User Account Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#101C2D] border border-slate-200 dark:border-[#1E2E46] shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="pb-2 mb-2 border-b border-slate-100 dark:border-[#1E2E46]">
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{user.displayName || 'Google Student'}</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#9AA9BC] truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CloudCheck className="w-3 h-3" />
                      <span>Cloud Sync Active</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

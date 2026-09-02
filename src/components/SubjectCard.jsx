import React from 'react';
import { Calculator, Briefcase, TrendingUp, BookOpen, Compass, Laptop, ChevronRight } from 'lucide-react';

const iconMap = {
  Calculator: Calculator,
  Briefcase: Briefcase,
  TrendingUp: TrendingUp,
  BookOpen: BookOpen,
  Compass: Compass,
  Laptop: Laptop
};

const colorMap = {
  amber: {
    bg: 'bg-[#315E8C] dark:bg-[#3B76B2]',
    lightBg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/50',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40'
  },
  emerald: {
    bg: 'bg-[#3E7C78] dark:bg-[#4FA19B]',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
  },
  indigo: {
    bg: 'bg-[#315E8C] dark:bg-[#3B76B2]',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/50',
    text: 'text-indigo-700 dark:text-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40'
  },
  rose: {
    bg: 'bg-[#315E8C] dark:bg-[#3B76B2]',
    lightBg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/50',
    text: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40'
  },
  purple: {
    bg: 'bg-[#3E7C78] dark:bg-[#4FA19B]',
    lightBg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/50',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40'
  },
  sky: {
    bg: 'bg-[#315E8C] dark:bg-[#3B76B2]',
    lightBg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800/50',
    text: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40'
  }
};

export default function SubjectCard({ subject, onSelect, completedCount = 0 }) {
  const IconComponent = iconMap[subject.icon] || BookOpen;
  const colors = colorMap[subject.color] || colorMap.indigo;

  const progressPercent = subject.totalChapters > 0
    ? Math.round((completedCount / subject.totalChapters) * 100)
    : 0;

  return (
    <button
      onClick={() => onSelect(subject.id)}
      className="academic-card academic-card-hover p-4.5 text-left w-full flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${colors.lightBg} ${colors.text} flex items-center justify-center border border-slate-200/60 dark:border-[#1E2E46]`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${colors.badge}`}>
            {subject.code}
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1 group-hover:text-[#315E8C] dark:group-hover:text-[#3B76B2] transition-colors">
          {subject.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#9AA9BC] line-clamp-2 leading-relaxed mb-4">
          {subject.description}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#9AA9BC] font-medium mb-1.5">
          <span>{completedCount} of {subject.totalChapters} Chapters</span>
          <span>{progressPercent}%</span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-[#08111F] h-1.5 rounded-full overflow-hidden mb-3 border border-slate-200/40 dark:border-[#1E2E46]/60">
          <div 
            className={`h-full ${colors.bg} transition-all duration-300`} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-[#1E2E46]">
          <span>Explore Chapters</span>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  );
}

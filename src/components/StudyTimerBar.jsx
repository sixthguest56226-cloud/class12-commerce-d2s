import React from 'react';
import { Play, Pause, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export default function StudyTimerBar() {
  const { 
    todaySeconds, 
    todayMinutes, 
    dailyGoalMinutes, 
    todayGoalCompleted, 
    isTimerRunning, 
    toggleTimer 
  } = useStudy();

  const progressPercent = Math.min(100, Math.round((todaySeconds / 1800) * 100));

  const formatTimerDisplay = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="academic-card p-4.5 shadow-xs mb-5 border border-slate-200 dark:border-[#1E2E46]">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTimer}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-xs font-medium text-sm ${
              isTimerRunning
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-[#315E8C] dark:bg-[#3B76B2] text-white hover:bg-[#25496F] dark:hover:bg-[#25496F]'
            }`}
            title={isTimerRunning ? 'Pause Study Session' : 'Start Study Session'}
          >
            {isTimerRunning ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {formatTimerDisplay(todaySeconds)}
              </span>
              {isTimerRunning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9AA9BC] font-medium">
              {isTimerRunning ? 'Session active' : 'Click play to start 30m daily goal'}
            </p>
          </div>
        </div>

        {/* Goal Badge */}
        <div className="text-right">
          {todayGoalCompleted ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>30m Goal Done!</span>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-700 dark:text-[#9AA9BC] bg-slate-100 dark:bg-[#142238] px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-[#1E2E46]">
              {todayMinutes} / {dailyGoalMinutes} mins
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-[#08111F] h-2 rounded-full overflow-hidden border border-slate-200/40 dark:border-[#1E2E46]/60">
        <div 
          className={`h-full transition-all duration-300 ${
            todayGoalCompleted ? 'bg-[#3E7C78] dark:bg-[#4FA19B]' : 'bg-[#315E8C] dark:bg-[#3B76B2]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

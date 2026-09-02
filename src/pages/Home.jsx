import React from 'react';
import { Flame, ArrowRight, Award } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import StudyTimerBar from '../components/StudyTimerBar';
import SubjectCard from '../components/SubjectCard';
import subjectsData from '../data/subjects.json';
import chaptersData from '../data/chapters.json';

export default function Home({ onNavigate, onSelectSubject, onSelectChapter }) {
  const { 
    currentStreak, 
    longestStreak, 
    lastStudiedResource, 
    completedLectures 
  } = useStudy();

  const getSubjectCompletedCount = (subjectId) => {
    const subjectChapters = chaptersData.filter((ch) => ch.subjectId === subjectId);
    let count = 0;
    subjectChapters.forEach((ch) => {
      if (completedLectures[ch.id]) count += 1;
    });
    return count;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-20 md:pb-10">
      {/* Desktop 2-Column Grid Layout for Hero & Study Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 items-start">
        
        {/* Left Column / Hero Overview (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-5">
          {/* Welcome Banner */}
          <div className="bg-[#101C2D] dark:bg-[#101C2D] text-white p-4 sm:p-6 rounded-2xl shadow-xs border border-[#1E2E46] relative overflow-hidden">
            <div className="relative z-10 space-y-1.5 sm:space-y-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4FA19B] uppercase tracking-wider">
                Class 12 Commerce
              </span>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                Welcome back, Scholar 👋
              </h2>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                Stay consistent with your 30-minute daily study goal to master your board exam topics.
              </p>
            </div>
          </div>

          {/* Daily Goal & Timer Bar */}
          <StudyTimerBar />
        </div>

        {/* Right Column / Quick Widgets (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-5">
          {/* Streak Summary */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="academic-card p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
                <Flame className="w-4 sm:w-5 h-4 sm:h-5 fill-amber-500" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#9AA9BC] font-medium block">Current Streak</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{currentStreak} Days</span>
              </div>
            </div>

            <div className="academic-card p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-[#3E7C78]/10 dark:bg-[#4FA19B]/10 text-[#3E7C78] dark:text-[#4FA19B] flex items-center justify-center shrink-0 border border-[#3E7C78]/20 dark:border-[#4FA19B]/20">
                <Award className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#9AA9BC] font-medium block">Longest Streak</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{longestStreak} Days</span>
              </div>
            </div>
          </div>

          {/* Continue Studying Card */}
          {lastStudiedResource && (
            <div className="academic-card p-3.5 sm:p-4 border-l-4 border-l-[#315E8C] dark:border-l-[#3B76B2] space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9AA9BC]">
                  Continue Studying
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#142238] text-[#315E8C] dark:text-[#4FA19B] uppercase border border-slate-200/60 dark:border-[#1E2E46]">
                  {lastStudiedResource.tab || 'Lecture'}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {lastStudiedResource.title}
                </h4>
              </div>

              <button
                onClick={() => onSelectChapter(lastStudiedResource.chapterId, lastStudiedResource.tab)}
                className="w-full py-2 sm:py-2.5 bg-[#315E8C] dark:bg-[#3B76B2] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#25496F] dark:hover:bg-[#25496F] transition-colors cursor-pointer"
              >
                <span>Resume Chapter</span>
                <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Core Commerce Subjects Section */}
      <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2E46] pb-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center">
            <span className="section-accent-line"></span>
            <span>Core Commerce Subjects</span>
          </h3>
          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-semibold text-[#315E8C] dark:text-[#4FA19B] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({subjectsData.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {subjectsData.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              completedCount={getSubjectCompletedCount(subject.id)}
              onSelect={onSelectSubject}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

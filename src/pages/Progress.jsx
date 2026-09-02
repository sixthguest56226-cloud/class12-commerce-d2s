import React from 'react';
import { Award, CheckCircle2, Clock, Flame, BarChart2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import subjectsData from '../data/subjects.json';
import chaptersData from '../data/chapters.json';

export default function Progress() {
  const { 
    currentStreak, 
    longestStreak, 
    todayMinutes, 
    todayGoalCompleted, 
    completedLectures, 
    testScores 
  } = useStudy();

  const totalChaptersCount = chaptersData.length;
  const completedChaptersCount = Object.keys(completedLectures).filter(
    (k) => completedLectures[k]
  ).length;

  const overallCompletionPercent = totalChaptersCount > 0 
    ? Math.round((completedChaptersCount / totalChaptersCount) * 100) 
    : 0;

  const testList = Object.values(testScores);
  const avgTestScore = testList.length > 0
    ? Math.round(testList.reduce((acc, t) => acc + t.score, 0) / testList.length)
    : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      <div className="border-b border-slate-200 dark:border-[#1E2E46] pb-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
          <span className="section-accent-line"></span>
          <span>Learning Progress & Analytics</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#9AA9BC] mt-1 ml-3">
          Real-time summary of study time, streaks, chapter completions, and test scores.
        </p>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="academic-card p-4 space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">Streak</span>
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{currentStreak}d</p>
          <p className="text-[11px] text-slate-400 dark:text-[#9AA9BC] font-medium">Best: {longestStreak} days</p>
        </div>

        <div className="academic-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-700 dark:text-[#9AA9BC]">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">Today's Time</span>
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{todayMinutes}m</p>
          <p className="text-[11px] text-slate-400 dark:text-[#9AA9BC] font-medium">
            {todayGoalCompleted ? '30m Goal Met' : `${30 - todayMinutes}m remaining`}
          </p>
        </div>

        <div className="academic-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#3E7C78] dark:text-[#4FA19B]">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">Completion</span>
            <CheckCircle2 className="w-4 h-4 text-[#3E7C78] dark:text-[#4FA19B]" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{overallCompletionPercent}%</p>
          <p className="text-[11px] text-slate-400 dark:text-[#9AA9BC] font-medium">{completedChaptersCount}/{totalChaptersCount} Chapters</p>
        </div>

        <div className="academic-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#315E8C] dark:text-[#3B76B2]">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">Avg Score</span>
            <Award className="w-4 h-4 text-[#315E8C] dark:text-[#3B76B2]" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{avgTestScore}%</p>
          <p className="text-[11px] text-slate-400 dark:text-[#9AA9BC] font-medium">{testList.length} Tests Taken</p>
        </div>
      </div>

      {/* Desktop 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Subject-Wise Progress Breakdown */}
        <div className="academic-card p-5 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#315E8C] dark:text-[#3B76B2]" /> Subject Progress Breakdown
          </h3>

          <div className="space-y-4">
            {subjectsData.map((subject) => {
              const subjectChapters = chaptersData.filter((ch) => ch.subjectId === subject.id);
              const doneCount = subjectChapters.filter((ch) => completedLectures[ch.id]).length;
              const percent = subjectChapters.length > 0 
                ? Math.round((doneCount / subjectChapters.length) * 100) 
                : 0;

              return (
                <div key={subject.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{subject.name}</span>
                    <span className="text-slate-500 dark:text-[#9AA9BC] font-medium">{doneCount}/{subjectChapters.length} Chapters ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#08111F] h-2 rounded-full overflow-hidden border border-slate-200/40 dark:border-[#1E2E46]">
                    <div
                      className="bg-[#315E8C] dark:bg-[#3B76B2] h-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Performance History Table */}
        <div className="academic-card p-5 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-[#3E7C78] dark:text-[#4FA19B]" /> Recent Test Performance
          </h3>

          {testList.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-[#9AA9BC] py-6 text-center">
              No tests taken yet. Open a chapter and complete a test to see your performance logs.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(testScores).map(([chId, test]) => {
                const chapterObj = chaptersData.find((ch) => ch.id === chId);

                return (
                  <div key={chId} className="p-3 bg-slate-50 dark:bg-[#08111F]/60 rounded-xl border border-slate-200/60 dark:border-[#1E2E46] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{chapterObj?.title || chId}</p>
                      <p className="text-slate-500 dark:text-[#9AA9BC] text-[11px]">{test.date || 'Today'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${test.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {test.score}%
                      </span>
                      <span className={`block text-[10px] font-semibold ${test.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {test.passed ? 'PASSED' : 'RETRY NEEDED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

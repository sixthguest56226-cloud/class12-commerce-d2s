import React from 'react';
import { CheckCircle2, Clock, Award, ChevronRight, Sparkles } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

function formatMinutes(totalMins) {
  if (!totalMins || totalMins <= 0) return '';
  if (totalMins >= 60) {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${totalMins} mins`;
}

export default function ChapterCard({ chapter, onSelect }) {
  const { completedLectures, testScores } = useStudy();

  const isLectureDone = !!completedLectures[chapter.id];
  const testResult = testScores[chapter.id];

  let statusBadge = (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#142238] text-slate-500 dark:text-[#9AA9BC] border border-slate-200/60 dark:border-[#1E2E46]">
      Not Started
    </span>
  );

  if (isLectureDone) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        Lecture Done
      </span>
    );
  }

  const isPoem = chapter.type === 'poem';
  const badgeText = isPoem
    ? `POEM ${String(chapter.chapterNumber).padStart(2, '0')}`
    : chapter.unitNumber
    ? `UNIT ${String(chapter.unitNumber).padStart(2, '0')}`
    : `CH ${String(chapter.chapterNumber).padStart(2, '0')}`;

  return (
    <button
      onClick={() => onSelect(chapter.id)}
      className="academic-card academic-card-hover p-4.5 text-left w-full group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
              isPoem
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
                : 'bg-slate-100 dark:bg-[#142238] text-[#315E8C] dark:text-[#4FA19B] border-slate-200 dark:border-[#1E2E46]'
            }`}>
              {badgeText}
            </span>

            {chapter.category && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#142238] text-slate-600 dark:text-[#9AA9BC] border border-slate-200/60 dark:border-[#1E2E46]">
                {chapter.category}
              </span>
            )}
          </div>
          {statusBadge}
        </div>

        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1 group-hover:text-[#315E8C] dark:group-hover:text-[#3B76B2] transition-colors leading-snug">
          {chapter.title}
        </h4>

        <p className="text-xs text-slate-500 dark:text-[#9AA9BC] line-clamp-2 leading-relaxed mb-3">
          {chapter.description}
        </p>

        {/* Sub-sections Pills (e.g. for Memories of Childhood) */}
        {chapter.subSections && chapter.subSections.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {chapter.subSections.map((sub, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#08111F] text-slate-700 dark:text-[#9AA9BC] border border-slate-200 dark:border-[#1E2E46] flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                <span>{sub}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9AA9BC] border-t border-slate-100 dark:border-[#1E2E46] pt-3 mt-auto">
        <div className="flex items-center gap-3">
          {chapter.estimatedMinutes > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{formatMinutes(chapter.estimatedMinutes)}</span>
            </div>
          )}

          {testResult && (
            <div className={`flex items-center gap-1 font-semibold ${
              testResult.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
            }`}>
              <Award className="w-3.5 h-3.5" />
              <span>Test: {testResult.score}%</span>
            </div>
          )}
        </div>

        <span className="inline-flex items-center text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:translate-x-0.5 transition-transform group-hover:text-[#315E8C] dark:group-hover:text-[#3B76B2]">
          Study <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </button>
  );
}

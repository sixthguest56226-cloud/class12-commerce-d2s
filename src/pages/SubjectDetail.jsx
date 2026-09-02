import React from 'react';
import { ArrowLeft, BookOpen, Feather, Library, TrendingUp, Globe } from 'lucide-react';
import ChapterCard from '../components/ChapterCard';
import subjectsData from '../data/subjects.json';
import chaptersData from '../data/chapters.json';

export default function SubjectDetail({ subjectId, onBack, onSelectChapter }) {
  const subject = subjectsData.find((s) => s.id === subjectId) || subjectsData[0];
  const subjectChapters = chaptersData.filter((ch) => ch.subjectId === subjectId);

  const isEnglish = subjectId === 'english';
  const isEconomics = subjectId === 'economics';

  // English Categories
  const flamingoProse = subjectChapters.filter(
    (ch) => ch.book === 'Flamingo' && ch.category === 'Prose'
  );
  const flamingoPoetry = subjectChapters.filter(
    (ch) => ch.book === 'Flamingo' && ch.category === 'Poetry'
  );
  const vistasSupplementary = subjectChapters.filter(
    (ch) => ch.book === 'Vistas' || ch.category === 'Supplementary'
  );

  // Economics Parts
  const ecoPartA = subjectChapters.filter(
    (ch) => ch.part?.includes('Part A') || (ch.unitNumber && ch.unitNumber <= 5) || (ch.chapterNumber && ch.chapterNumber <= 5)
  );
  const ecoPartB = subjectChapters.filter(
    (ch) => ch.part?.includes('Part B') || (ch.unitNumber && ch.unitNumber > 5) || (ch.chapterNumber && ch.chapterNumber > 5)
  );

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-slate-200 dark:border-[#1E2E46] text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-100 dark:hover:bg-[#142238] transition-colors"
          title="Back to Subjects"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#142238] text-[#315E8C] dark:text-[#4FA19B] border border-slate-200/60 dark:border-[#1E2E46] uppercase">
            {subject.code}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {subject.name}
          </h2>
        </div>
      </div>

      {/* Description Banner */}
      <div className="academic-card p-4 sm:p-5 bg-[#101C2D] dark:bg-[#101C2D] border border-[#1E2E46] text-white space-y-1">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          {subject.description}
        </p>
        <p className="text-[11px] text-[#4FA19B] font-semibold pt-1">
          {subjectChapters.length} {isEconomics ? 'Syllabus Units' : isEnglish ? 'Literature Items & Chapters' : 'Chapters'} Available
        </p>
      </div>

      {/* English View */}
      {isEnglish ? (
        <div className="space-y-8">
          {/* FLAMINGO — PROSE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2E46] pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#315E8C] dark:text-[#3B76B2]" />
                <span>Flamingo — Prose</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">
                {flamingoProse.length} Chapters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flamingoProse.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  onSelect={onSelectChapter}
                />
              ))}
            </div>
          </div>

          {/* FLAMINGO — POETRY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2E46] pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Feather className="w-4 h-4 text-purple-500" />
                <span>Flamingo — Poetry</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">
                {flamingoPoetry.length} Poems
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flamingoPoetry.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  onSelect={onSelectChapter}
                />
              ))}
            </div>
          </div>

          {/* VISTAS — SUPPLEMENTARY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2E46] pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Library className="w-4 h-4 text-[#3E7C78] dark:text-[#4FA19B]" />
                <span>Vistas — Supplementary Reader</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">
                {vistasSupplementary.length} Chapters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vistasSupplementary.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  onSelect={onSelectChapter}
                />
              ))}
            </div>
          </div>
        </div>
      ) : isEconomics ? (
        /* Economics View */
        <div className="space-y-8">
          {/* PART A — INTRODUCTORY MACROECONOMICS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2E46] pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#315E8C] dark:text-[#3B76B2]" />
                <span>Part A — Introductory Macroeconomics</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">
                {ecoPartA.length} Units
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ecoPartA.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  onSelect={onSelectChapter}
                />
              ))}
            </div>
          </div>

          {/* PART B — INDIAN ECONOMIC DEVELOPMENT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2E46] pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3E7C78] dark:text-[#4FA19B]" />
                <span>Part B — Indian Economic Development</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">
                {ecoPartB.length} Units
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ecoPartB.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  onSelect={onSelectChapter}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Standard Subject View */
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2E46] pb-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center">
              <span className="section-accent-line"></span>
              <span>Chapters Overview</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">
              {subjectChapters.length} Total Chapters
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectChapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                onSelect={onSelectChapter}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

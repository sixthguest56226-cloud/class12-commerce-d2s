import React from 'react';
import SubjectCard from '../components/SubjectCard';
import subjectsData from '../data/subjects.json';
import chaptersData from '../data/chapters.json';
import { useStudy } from '../context/StudyContext';

export default function Subjects({ onSelectSubject }) {
  const { completedLectures } = useStudy();

  const getSubjectCompletedCount = (subjectId) => {
    const subjectChapters = chaptersData.filter((ch) => ch.subjectId === subjectId);
    let count = 0;
    subjectChapters.forEach((ch) => {
      if (completedLectures[ch.id]) count += 1;
    });
    return count;
  };

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      <div className="border-b border-slate-200 dark:border-[#1E2E46] pb-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
          <span className="section-accent-line"></span>
          <span>Subjects Directory</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#9AA9BC] mt-1 ml-3">
          Select a subject to access video lectures, chapter notes, e-books, and practice tests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Video, FileText, Book, Award, PenTool } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import chaptersData from '../data/chapters.json';
import subjectsData from '../data/subjects.json';
import { getChapterContent } from '../data/sampleContent';

import LectureViewer from '../components/LectureViewer';
import NotesViewer from '../components/NotesViewer';
import EbookReader from '../components/EbookReader';
import MyNotesViewer from '../components/MyNotesViewer';
import TestEngine from '../components/TestEngine';

export default function ChapterView({ chapterId, initialTab = 'lecture', onBack }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { updateLastStudiedResource } = useStudy();

  const chapter = chaptersData.find((ch) => ch.id === chapterId) || chaptersData[0];
  const subject = subjectsData.find((s) => s.id === chapter.subjectId) || subjectsData[0];

  const content = getChapterContent(chapter.id, subject.name, chapter.title);

  useEffect(() => {
    updateLastStudiedResource({
      subjectId: subject.id,
      chapterId: chapter.id,
      tab: activeTab,
      title: chapter.title
    });
  }, [chapter.id, activeTab]);

  const tabs = [
    { id: 'lecture', label: 'Lecture', icon: Video },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'ebook', label: 'E-Book', icon: Book },
    { id: 'mynotes', label: 'My Notes', icon: PenTool },
    { id: 'test', label: 'Test', icon: Award }
  ];

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      {/* Chapter Workspace Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-slate-200 dark:border-[#1E2E46] text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-100 dark:hover:bg-[#142238] transition-colors"
          title="Back to Subject"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#142238] text-[#315E8C] dark:text-[#4FA19B] border border-slate-200/60 dark:border-[#1E2E46] uppercase">
              {subject.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9AA9BC]">
              CH {String(chapter.chapterNumber).padStart(2, '0')}
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {chapter.title}
          </h2>
        </div>
      </div>

      {/* 5 Feature Module Tabs */}
      <div className="academic-card p-1.5 flex items-center justify-around gap-1 bg-slate-100 dark:bg-[#08111F] border-slate-200 dark:border-[#1E2E46] overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 min-w-[72px] py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#101C2D] text-[#315E8C] dark:text-[#4FA19B] shadow-2xs border border-slate-200/80 dark:border-[#1E2E46]'
                  : 'text-slate-600 dark:text-[#9AA9BC] hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#315E8C] dark:text-[#4FA19B]' : ''}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View Render */}
      <div>
        {activeTab === 'lecture' && (
          <LectureViewer chapterId={chapter.id} lectureData={content.lecture} />
        )}

        {activeTab === 'notes' && (
          <NotesViewer notesData={content.notes} />
        )}

        {activeTab === 'ebook' && (
          <EbookReader ebookData={content.ebook} />
        )}

        {activeTab === 'mynotes' && (
          <MyNotesViewer chapterId={chapter.id} chapterTitle={chapter.title} />
        )}

        {activeTab === 'test' && (
          <TestEngine chapterId={chapter.id} testData={content.test} />
        )}
      </div>
    </div>
  );
}

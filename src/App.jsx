import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { AuthProvider } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import UpdateNotification from './components/UpdateNotification';

import Home from './pages/Home';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import ChapterView from './pages/ChapterView';
import Progress from './pages/Progress';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'subjects' | 'subject-detail' | 'chapter-view' | 'progress'
  const [selectedSubjectId, setSelectedSubjectId] = useState('accountancy');
  const [selectedChapterId, setSelectedChapterId] = useState('acc-ch1');
  const [initialChapterTab, setInitialChapterTab] = useState('lecture');

  useEffect(() => {
    let backListener = null;

    const setupBackListener = async () => {
      try {
        backListener = await CapApp.addListener('backButton', () => {
          setCurrentView((prevView) => {
            if (prevView === 'chapter-view') {
              window.scrollTo(0, 0);
              return 'subject-detail';
            }
            if (prevView === 'subject-detail') {
              window.scrollTo(0, 0);
              return 'subjects';
            }
            if (prevView === 'progress') {
              window.scrollTo(0, 0);
              return 'subjects';
            }
            if (prevView === 'subjects') {
              window.scrollTo(0, 0);
              return 'home';
            }
            if (prevView === 'home') {
              return 'home';
            }
            return 'home';
          });
        });
      } catch (err) {
        // Silent catch for desktop/web environment
      }
    };

    setupBackListener();

    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
    };
  }, []);

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    window.scrollTo(0, 0);
  };

  const handleSelectSubject = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setCurrentView('subject-detail');
    window.scrollTo(0, 0);
  };

  const handleSelectChapter = (chapterId, tab = 'lecture') => {
    setSelectedChapterId(chapterId);
    setInitialChapterTab(tab);
    setCurrentView('chapter-view');
    window.scrollTo(0, 0);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <StudyProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
            <Header currentView={currentView} onNavigate={handleNavigate} />

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-24 md:pb-8">
              {currentView === 'home' && (
                <Home
                  onNavigate={handleNavigate}
                  onSelectSubject={handleSelectSubject}
                  onSelectChapter={handleSelectChapter}
                />
              )}

              {currentView === 'subjects' && (
                <Subjects onSelectSubject={handleSelectSubject} />
              )}

              {currentView === 'subject-detail' && (
                <SubjectDetail
                  subjectId={selectedSubjectId}
                  onBack={() => handleNavigate('subjects')}
                  onSelectChapter={handleSelectChapter}
                />
              )}

              {currentView === 'chapter-view' && (
                <ChapterView
                  chapterId={selectedChapterId}
                  initialTab={initialChapterTab}
                  onBack={() => handleNavigate('subject-detail')}
                />
              )}

              {currentView === 'progress' && (
                <Progress />
              )}
            </main>

            <BottomNav currentView={currentView} onNavigate={handleNavigate} />
            <UpdateNotification />
          </div>
        </StudyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

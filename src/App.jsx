import React, { useState, useEffect, useRef } from 'react';
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

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Android System Back Button Navigation Hierarchy
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
              // Stay on Home - DO NOT EXIT APP
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

  // Horizontal Swipe Navigation between 3 Main Sections ONLY (Home, Subjects, Progress)
  const handleTouchStart = (e) => {
    if (currentView !== 'home' && currentView !== 'subjects' && currentView !== 'progress') {
      return;
    }
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (currentView !== 'home' && currentView !== 'subjects' && currentView !== 'progress') {
      return;
    }
    if (!touchStartRef.current.time) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Reset touch tracker
    touchStartRef.current = { x: 0, y: 0, time: 0 };

    // Ignore gestures that are too slow or too rapid
    if (deltaTime > 500 || deltaTime < 50) return;

    // Require meaningful horizontal movement (at least 60px)
    if (Math.abs(deltaX) < 60) return;

    // Ignore mostly vertical gestures - horizontal distance must dominate vertical distance
    if (Math.abs(deltaX) < Math.abs(deltaY) * 1.75) return;

    // Do not interfere with interactive targets (buttons, links, inputs, media)
    const target = e.target;
    if (target && target.closest('button, a, input, textarea, select, [role="button"], audio, video, .no-swipe')) {
      return;
    }

    // SWIPE LEFT (advance forward)
    if (deltaX < -60) {
      if (currentView === 'home') {
        handleNavigate('subjects');
      } else if (currentView === 'subjects') {
        handleNavigate('progress');
      }
      // If progress -> stay on progress
    }
    // SWIPE RIGHT (navigate backward)
    else if (deltaX > 60) {
      if (currentView === 'progress') {
        handleNavigate('subjects');
      } else if (currentView === 'subjects') {
        handleNavigate('home');
      }
      // If home -> stay on home
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <StudyProvider>
          <div
            className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Header currentView={currentView} onNavigate={handleNavigate} />

            <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 md:px-6 pt-2.5 sm:pt-4 md:pt-8 pb-20 md:pb-8">
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

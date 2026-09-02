import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadInitialStorageState, saveStorageState, getTodayDateString, getYesterdayDateString } from '../utils/storage';
import { deleteFileLocally } from '../utils/localDB';

const StudyContext = createContext();

export function StudyProvider({ children }) {
  const [state, setState] = useState(() => loadInitialStorageState());
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveStorageState(state);
  }, [state]);

  // Active Timer Interval Hook
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setState((prev) => {
          const newTodaySeconds = prev.todaySeconds + 1;
          const todayStr = getTodayDateString();
          const yesterdayStr = getYesterdayDateString();

          let newGoalCompleted = prev.todayGoalCompleted;
          let newCurrentStreak = prev.currentStreak;
          let newLongestStreak = prev.longestStreak;
          let newLastStudyDate = prev.lastStudyDate;

          // Check if 30 minutes (1800 seconds) target reached
          if (newTodaySeconds >= 1800 && !newGoalCompleted) {
            newGoalCompleted = true;

            if (prev.lastStudyDate === yesterdayStr) {
              newCurrentStreak = prev.currentStreak + 1;
            } else if (prev.lastStudyDate !== todayStr) {
              newCurrentStreak = 1;
            }

            newLastStudyDate = todayStr;
            newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
          }

          return {
            ...prev,
            todayDate: todayStr,
            todaySeconds: newTodaySeconds,
            todayGoalCompleted: newGoalCompleted,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastStudyDate: newLastStudyDate
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const markLectureCompleted = (chapterId, isCompleted = true) => {
    setState((prev) => ({
      ...prev,
      completedLectures: {
        ...prev.completedLectures,
        [chapterId]: isCompleted
      }
    }));
  };

  const recordTestResult = (chapterId, testResult) => {
    setState((prev) => ({
      ...prev,
      testScores: {
        ...prev.testScores,
        [chapterId]: {
          ...testResult,
          date: new Date().toLocaleDateString()
        }
      }
    }));
  };

  const saveUserNote = (chapterId, newNoteObj) => {
    setState((prev) => {
      const existingChapterNotes = prev.userNotes[chapterId] || [];
      return {
        ...prev,
        userNotes: {
          ...prev.userNotes,
          [chapterId]: [newNoteObj, ...existingChapterNotes]
        }
      };
    });
  };

  const deleteUserNote = (chapterId, noteId) => {
    deleteFileLocally(noteId).catch(console.error);

    setState((prev) => {
      const existingChapterNotes = prev.userNotes[chapterId] || [];
      const updatedNotes = existingChapterNotes.filter((n) => n.id !== noteId);
      return {
        ...prev,
        userNotes: {
          ...prev.userNotes,
          [chapterId]: updatedNotes
        }
      };
    });
  };

  const renameUserNote = (chapterId, noteId, newDisplayName) => {
    setState((prev) => {
      const existingChapterNotes = prev.userNotes[chapterId] || [];
      const updatedNotes = existingChapterNotes.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            displayName: newDisplayName
          };
        }
        return n;
      });
      return {
        ...prev,
        userNotes: {
          ...prev.userNotes,
          [chapterId]: updatedNotes
        }
      };
    });
  };

  const updateLastStudiedResource = (resource) => {
    setState((prev) => ({
      ...prev,
      lastStudiedResource: resource
    }));
  };

  const todayMinutes = Math.floor(state.todaySeconds / 60);

  return (
    <StudyContext.Provider
      value={{
        todaySeconds: state.todaySeconds,
        todayMinutes,
        dailyGoalMinutes: 30,
        todayGoalCompleted: state.todayGoalCompleted,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        isTimerRunning,
        toggleTimer,
        completedLectures: state.completedLectures,
        markLectureCompleted,
        testScores: state.testScores,
        recordTestResult,
        userNotes: state.userNotes || {},
        saveUserNote,
        deleteUserNote,
        renameUserNote,
        lastStudiedResource: state.lastStudiedResource,
        updateLastStudiedResource
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}

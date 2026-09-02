import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadInitialStorageState, saveStorageState, getTodayDateString, getYesterdayDateString } from '../utils/storage';
import { deleteFileLocally } from '../utils/localDB';
import { useAuth } from './AuthContext';
import {
  syncUserData,
  uploadNoteToDrive,
  deleteNoteFromDrive,
  renameNoteOnDrive,
} from '../utils/cloudSync';

const StudyContext = createContext();

export function StudyProvider({ children }) {
  const [state, setState] = useState(() => loadInitialStorageState());
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { user, accessToken, setSyncStatus } = useAuth();

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveStorageState(state);
  }, [state]);

  // Sync with Firestore & Google Drive when user logs in or accessToken updates
  useEffect(() => {
    if (user) {
      setSyncStatus('syncing');
      syncUserData(user, state, (newState) => {
        setState(newState);
        setSyncStatus('synced');
      }, accessToken).catch((err) => {
        console.warn('Cloud sync error:', err);
        setSyncStatus('error');
      });
    } else {
      setSyncStatus('idle');
    }
  }, [user, accessToken]);

  // Auto-sync when internet connection returns
  useEffect(() => {
    const handleOnline = () => {
      if (user) {
        setSyncStatus('syncing');
        syncUserData(user, state, (newState) => {
          setState(newState);
          setSyncStatus('synced');
        }, accessToken).catch(() => setSyncStatus('error'));
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, state, accessToken]);

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
            lastStudyDate: newLastStudyDate,
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
    setState((prev) => {
      const newState = {
        ...prev,
        completedLectures: {
          ...prev.completedLectures,
          [chapterId]: isCompleted,
        },
      };
      if (user) syncUserData(user, newState, null, accessToken);
      return newState;
    });
  };

  const recordTestResult = (chapterId, testResult) => {
    setState((prev) => {
      const newState = {
        ...prev,
        testScores: {
          ...prev.testScores,
          [chapterId]: {
            ...testResult,
            date: new Date().toLocaleDateString(),
          },
        },
      };
      if (user) syncUserData(user, newState, null, accessToken);
      return newState;
    });
  };

  const saveUserNote = (chapterId, newNoteObj, binaryPayload) => {
    setState((prev) => {
      const existingChapterNotes = prev.userNotes[chapterId] || [];
      const newState = {
        ...prev,
        userNotes: {
          ...prev.userNotes,
          [chapterId]: [newNoteObj, ...existingChapterNotes],
        },
      };

      if (user) {
        uploadNoteToDrive(
          user.uid,
          accessToken,
          newNoteObj.id,
          binaryPayload || newNoteObj.fileData,
          newNoteObj
        );
      }

      return newState;
    });
  };

  const deleteUserNote = (chapterId, noteId) => {
    deleteFileLocally(noteId).catch(console.error);

    setState((prev) => {
      const existingChapterNotes = prev.userNotes[chapterId] || [];
      const targetNote = existingChapterNotes.find((n) => n.id === noteId);

      if (user) {
        deleteNoteFromDrive(
          user.uid,
          accessToken,
          chapterId,
          noteId,
          targetNote?.driveFileId
        ).catch(console.error);
      }

      const updatedNotes = existingChapterNotes.filter((n) => n.id !== noteId);
      return {
        ...prev,
        userNotes: {
          ...prev.userNotes,
          [chapterId]: updatedNotes,
        },
      };
    });
  };

  const renameUserNote = (chapterId, noteId, newDisplayName) => {
    setState((prev) => {
      const existingChapterNotes = prev.userNotes[chapterId] || [];
      const targetNote = existingChapterNotes.find((n) => n.id === noteId);

      if (user) {
        renameNoteOnDrive(
          user.uid,
          accessToken,
          chapterId,
          noteId,
          targetNote?.driveFileId,
          newDisplayName
        ).catch(console.error);
      }

      const updatedNotes = existingChapterNotes.map((n) => {
        if (n.id === noteId) {
          return { ...n, displayName: newDisplayName, updatedAt: Date.now() };
        }
        return n;
      });

      const newState = {
        ...prev,
        userNotes: {
          ...prev.userNotes,
          [chapterId]: updatedNotes,
        },
      };

      return newState;
    });
  };

  const updateLastStudiedResource = (resource) => {
    setState((prev) => {
      const newState = {
        ...prev,
        lastStudiedResource: resource,
      };
      if (user) syncUserData(user, newState, null, accessToken);
      return newState;
    });
  };

  const todayMinutes = Math.floor(state.todaySeconds / 60);

  return (
    <StudyContext.Provider
      value={{
        ...state,
        isTimerRunning,
        todayMinutes,
        toggleTimer,
        markLectureCompleted,
        recordTestResult,
        saveUserNote,
        deleteUserNote,
        renameUserNote,
        updateLastStudiedResource,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  return useContext(StudyContext);
}

const STORAGE_KEY = 'commerce_study_v1';

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadInitialStorageState() {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const defaultState = {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    todayDate: todayStr,
    todaySeconds: 0,
    todayGoalCompleted: false,
    completedLectures: {},
    testScores: {},
    userNotes: {}, // { [chapterId]: [ { id, chapterId, fileName, fileType, fileData, uploadedAt } ] }
    lastStudiedResource: {
      subjectId: 'accountancy',
      chapterId: 'acc-ch1',
      tab: 'lecture',
      title: 'Accounting for Partnership Firms - Fundamentals'
    }
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw);

    // Date check & Streak rollover evaluation
    let currentStreak = parsed.currentStreak || 0;
    let longestStreak = parsed.longestStreak || 0;
    let lastStudyDate = parsed.lastStudyDate || null;
    let todaySeconds = parsed.todaySeconds || 0;
    let todayGoalCompleted = parsed.todayGoalCompleted || false;

    if (parsed.todayDate !== todayStr) {
      // It's a new day! Check if streak broke.
      if (lastStudyDate !== yesterdayStr && lastStudyDate !== todayStr) {
        // Streak is broken if yesterday was missed
        currentStreak = 0;
      }
      todaySeconds = 0;
      todayGoalCompleted = false;
    }

    return {
      currentStreak,
      longestStreak,
      lastStudyDate,
      todayDate: todayStr,
      todaySeconds,
      todayGoalCompleted,
      completedLectures: parsed.completedLectures || {},
      testScores: parsed.testScores || {},
      userNotes: parsed.userNotes || {},
      lastStudiedResource: parsed.lastStudiedResource || defaultState.lastStudiedResource
    };
  } catch (e) {
    console.error('Failed to load storage state:', e);
    return defaultState;
  }
}

export function saveStorageState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save storage state:', e);
  }
}

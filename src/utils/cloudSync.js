import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { saveFileLocally, getFileLocally, deleteFileLocally } from './localDB';

export async function syncUserData(user, localState, updateStateCallback) {
  if (!user || !user.uid) return localState;

  const uid = user.uid;
  const progressDocRef = doc(db, 'users', uid, 'data', 'progress');
  const streakDocRef = doc(db, 'users', uid, 'data', 'streak');
  const notesMetaDocRef = doc(db, 'users', uid, 'data', 'notes_meta');

  try {
    // 1. Fetch existing cloud data
    const [progressSnap, streakSnap, notesMetaSnap] = await Promise.all([
      getDoc(progressDocRef),
      getDoc(streakDocRef),
      getDoc(notesMetaDocRef)
    ]);

    const cloudProgress = progressSnap.exists() ? progressSnap.data() : null;
    const cloudStreak = streakSnap.exists() ? streakSnap.data() : null;
    const cloudNotesMeta = notesMetaSnap.exists() ? notesMetaSnap.data() : null;

    // 2. Merge Progress & Lectures (Additive & Non-destructive)
    const mergedLectures = {
      ...(cloudProgress?.completedLectures || {}),
      ...(localState.completedLectures || {})
    };

    const mergedTestScores = {
      ...(cloudProgress?.testScores || {}),
      ...(localState.testScores || {})
    };

    // 3. Merge Streaks
    const mergedCurrentStreak = Math.max(cloudStreak?.currentStreak || 0, localState.currentStreak || 0);
    const mergedLongestStreak = Math.max(cloudStreak?.longestStreak || 0, localState.longestStreak || 0);

    // 4. Merge User Notes Metadata
    const localNotesMap = localState.userNotes || {};
    const cloudNotesMap = cloudNotesMeta?.userNotes || {};
    const mergedUserNotes = {};

    const allChapterIds = Array.from(new Set([...Object.keys(localNotesMap), ...Object.keys(cloudNotesMap)]));

    for (const chId of allChapterIds) {
      const localList = localNotesMap[chId] || [];
      const cloudList = cloudNotesMap[chId] || [];

      const notesById = {};
      cloudList.forEach(n => notesById[n.id] = { ...n, synced: true });
      localList.forEach(n => {
        if (!notesById[n.id] || (n.updatedAt && n.updatedAt > notesById[n.id].updatedAt)) {
          notesById[n.id] = n;
        }
      });

      mergedUserNotes[chId] = Object.values(notesById);
    }

    const newState = {
      ...localState,
      completedLectures: mergedLectures,
      testScores: mergedTestScores,
      currentStreak: mergedCurrentStreak,
      longestStreak: mergedLongestStreak,
      userNotes: mergedUserNotes
    };

    // 5. Update local React state
    if (updateStateCallback) {
      updateStateCallback(newState);
    }

    // 6. Push merged metadata to Firestore
    await Promise.all([
      setDoc(progressDocRef, {
        completedLectures: mergedLectures,
        testScores: mergedTestScores,
        lastStudiedResource: newState.lastStudiedResource,
        updatedAt: Date.now()
      }, { merge: true }),

      setDoc(streakDocRef, {
        currentStreak: mergedCurrentStreak,
        longestStreak: mergedLongestStreak,
        lastStudyDate: newState.lastStudyDate,
        todayDate: newState.todayDate,
        todaySeconds: newState.todaySeconds,
        todayGoalCompleted: newState.todayGoalCompleted,
        updatedAt: Date.now()
      }, { merge: true }),

      setDoc(notesMetaDocRef, {
        userNotes: mergedUserNotes,
        updatedAt: Date.now()
      }, { merge: true })
    ]);

    // 7. Synchronize Binary Files (Upload local unsynced files & Download missing cloud files)
    syncBinaryFiles(uid, mergedUserNotes).catch(err => console.warn('Background binary file sync warning:', err));

    return newState;
  } catch (err) {
    console.error('Cloud Sync failed, retaining local offline state:', err);
    return localState;
  }
}

/**
 * Background binary file sync for Cloud Storage & local IndexedDB
 */
export async function syncBinaryFiles(uid, userNotesMap) {
  if (!uid) return;

  for (const chapterId in userNotesMap) {
    const notes = userNotesMap[chapterId] || [];

    for (const note of notes) {
      try {
        const localFile = await getFileLocally(note.id);

        if (localFile) {
          // Upload local file to Cloud Storage if not uploaded yet
          const storageRef = ref(storage, `users/${uid}/notes/${note.id}`);
          let blob = localFile;

          if (typeof localFile === 'string' && localFile.startsWith('data:')) {
            const res = await fetch(localFile);
            blob = await res.blob();
          }

          await uploadBytes(storageRef, blob);
        } else {
          // File missing locally on this device, download from Cloud Storage!
          try {
            const storageRef = ref(storage, `users/${uid}/notes/${note.id}`);
            const downloadUrl = await getDownloadURL(storageRef);
            const res = await fetch(downloadUrl);
            const blob = await res.blob();
            await saveFileLocally(note.id, blob);
          } catch (e) {
            // Storage file might not exist yet
          }
        }
      } catch (err) {
        console.warn(`File sync skipped for note ${note.id}:`, err);
      }
    }
  }
}

/**
 * Upload single note file to Cloud Storage & update Firestore
 */
export async function uploadNoteToCloud(uid, noteId, fileBlobOrData, noteMeta) {
  if (!uid) return;
  try {
    const storageRef = ref(storage, `users/${uid}/notes/${noteId}`);
    let blob = fileBlobOrData;

    if (typeof fileBlobOrData === 'string' && fileBlobOrData.startsWith('data:')) {
      const res = await fetch(fileBlobOrData);
      blob = await res.blob();
    }

    await uploadBytes(storageRef, blob);

    // Update Firestore notes metadata
    const notesMetaDocRef = doc(db, 'users', uid, 'data', 'notes_meta');
    const snap = await getDoc(notesMetaDocRef);
    const existingMeta = snap.exists() ? snap.data().userNotes || {} : {};

    const chapterNotes = existingMeta[noteMeta.chapterId] || [];
    const updatedChapterNotes = [noteMeta, ...chapterNotes.filter(n => n.id !== noteId)];

    await setDoc(notesMetaDocRef, {
      userNotes: {
        ...existingMeta,
        [noteMeta.chapterId]: updatedChapterNotes
      },
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.error('Failed to upload note to cloud storage:', err);
  }
}

/**
 * Delete note file from Cloud Storage & Firestore
 */
export async function deleteNoteFromCloud(uid, chapterId, noteId) {
  if (!uid) return;
  try {
    const storageRef = ref(storage, `users/${uid}/notes/${noteId}`);
    await deleteObject(storageRef).catch(() => {});

    const notesMetaDocRef = doc(db, 'users', uid, 'data', 'notes_meta');
    const snap = await getDoc(notesMetaDocRef);
    if (snap.exists()) {
      const existingMeta = snap.data().userNotes || {};
      const chapterNotes = existingMeta[chapterId] || [];
      const updatedChapterNotes = chapterNotes.filter(n => n.id !== noteId);

      await setDoc(notesMetaDocRef, {
        userNotes: {
          ...existingMeta,
          [chapterId]: updatedChapterNotes
        },
        updatedAt: Date.now()
      }, { merge: true });
    }
  } catch (err) {
    console.error('Failed to delete note from cloud:', err);
  }
}

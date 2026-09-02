import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { saveFileLocally, getFileLocally, deleteFileLocally } from './localDB';
import {
  uploadFileToDrive,
  downloadFileFromDrive,
  renameFileOnDrive,
  deleteFileFromDrive,
  getStoredDriveToken,
} from './googleDrive';

/**
 * Synchronize user progress, streak, and notes metadata to Firestore,
 * and binary note attachments to the user's personal Google Drive.
 * 100% Free - Firebase Spark Plan + User's Own Google Drive (15 GB free).
 */
export async function syncUserData(user, localState, updateStateCallback, token) {
  if (!user || !user.uid) return localState;

  const uid = user.uid;
  const accessToken = token || getStoredDriveToken(uid);
  const progressDocRef = doc(db, 'users', uid, 'data', 'progress');
  const streakDocRef = doc(db, 'users', uid, 'data', 'streak');
  const notesMetaDocRef = doc(db, 'users', uid, 'data', 'notes_meta');

  try {
    // 1. Fetch existing cloud data from Firestore
    const [progressSnap, streakSnap, notesMetaSnap] = await Promise.all([
      getDoc(progressDocRef),
      getDoc(streakDocRef),
      getDoc(notesMetaDocRef),
    ]);

    const cloudProgress = progressSnap.exists() ? progressSnap.data() : null;
    const cloudStreak = streakSnap.exists() ? streakSnap.data() : null;
    const cloudNotesMeta = notesMetaSnap.exists() ? notesMetaSnap.data() : null;

    // 2. Merge Progress & Lectures (Additive & Non-destructive)
    const mergedLectures = {
      ...(cloudProgress?.completedLectures || {}),
      ...(localState.completedLectures || {}),
    };

    const mergedTestScores = {
      ...(cloudProgress?.testScores || {}),
      ...(localState.testScores || {}),
    };

    // 3. Merge Streaks deterministically
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
      cloudList.forEach((n) => (notesById[n.id] = { ...n, synced: true }));
      localList.forEach((n) => {
        if (!notesById[n.id] || (n.updatedAt && n.updatedAt > notesById[n.id].updatedAt)) {
          // Preserve local version with any existing driveFileId
          notesById[n.id] = {
            ...n,
            driveFileId: n.driveFileId || notesById[n.id]?.driveFileId,
            driveWebViewLink: n.driveWebViewLink || notesById[n.id]?.driveWebViewLink,
          };
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
      userNotes: mergedUserNotes,
    };

    // 5. Update local React state immediately
    if (updateStateCallback) {
      updateStateCallback(newState);
    }

    // 6. Push merged metadata to Firestore (free Spark plan)
    await Promise.all([
      setDoc(
        progressDocRef,
        {
          completedLectures: mergedLectures,
          testScores: mergedTestScores,
          lastStudiedResource: newState.lastStudiedResource,
          updatedAt: Date.now(),
        },
        { merge: true }
      ),

      setDoc(
        streakDocRef,
        {
          currentStreak: mergedCurrentStreak,
          longestStreak: mergedLongestStreak,
          lastStudyDate: newState.lastStudyDate,
          todayDate: newState.todayDate,
          todaySeconds: newState.todaySeconds,
          todayGoalCompleted: newState.todayGoalCompleted,
          updatedAt: Date.now(),
        },
        { merge: true }
      ),

      setDoc(
        notesMetaDocRef,
        {
          userNotes: mergedUserNotes,
          updatedAt: Date.now(),
        },
        { merge: true }
      ),
    ]);

    // 7. Background file sync with user's Google Drive
    if (accessToken) {
      syncDriveNotes(uid, accessToken, mergedUserNotes, updateStateCallback).catch((err) =>
        console.warn('Background Google Drive sync warning:', err)
      );
    }

    return newState;
  } catch (err) {
    console.error('Cloud Sync failed, retaining local offline state:', err);
    return localState;
  }
}

/**
 * Background note file sync between local IndexedDB and user's Google Drive
 */
export async function syncDriveNotes(uid, accessToken, userNotesMap, updateStateCallback) {
  if (!uid || !accessToken) return;

  let metadataChanged = false;
  const updatedMap = { ...userNotesMap };

  for (const chapterId in userNotesMap) {
    const notes = userNotesMap[chapterId] || [];

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      try {
        const localFile = await getFileLocally(note.id);

        if (localFile) {
          // File exists locally. If not yet on Google Drive, upload it!
          if (!note.driveFileId) {
            const driveRes = await uploadFileToDrive(accessToken, note.id, localFile, note);
            if (driveRes && driveRes.driveFileId) {
              notes[i] = {
                ...note,
                driveFileId: driveRes.driveFileId,
                driveWebViewLink: driveRes.driveWebViewLink,
                synced: true,
              };
              metadataChanged = true;
            }
          }
        } else if (note.driveFileId) {
          // File missing locally on this device (e.g. second device). Download from Google Drive!
          try {
            const blob = await downloadFileFromDrive(accessToken, note.driveFileId);
            if (blob) {
              await saveFileLocally(note.id, blob);
            }
          } catch (e) {
            console.warn(`Could not download note ${note.id} from Drive:`, e);
          }
        }
      } catch (err) {
        console.warn(`Drive sync skipped for note ${note.id}:`, err);
      }
    }
    updatedMap[chapterId] = notes;
  }

  if (metadataChanged) {
    // Save updated metadata with driveFileIds to Firestore
    const notesMetaDocRef = doc(db, 'users', uid, 'data', 'notes_meta');
    await setDoc(notesMetaDocRef, { userNotes: updatedMap, updatedAt: Date.now() }, { merge: true });

    if (updateStateCallback) {
      updateStateCallback((prev) => ({
        ...prev,
        userNotes: updatedMap,
      }));
    }
  }
}

/**
 * Upload single note file to Google Drive and save metadata in Firestore
 */
export async function uploadNoteToDrive(uid, accessToken, noteId, fileBlobOrData, noteMeta) {
  if (!uid) return null;

  try {
    let driveRes = null;
    if (accessToken) {
      driveRes = await uploadFileToDrive(accessToken, noteId, fileBlobOrData, noteMeta);
    }

    const updatedMeta = {
      ...noteMeta,
      driveFileId: driveRes?.driveFileId || null,
      driveWebViewLink: driveRes?.driveWebViewLink || null,
      synced: !!driveRes?.driveFileId,
    };

    // Update Firestore notes metadata
    const notesMetaDocRef = doc(db, 'users', uid, 'data', 'notes_meta');
    const snap = await getDoc(notesMetaDocRef);
    const existingMeta = snap.exists() ? snap.data().userNotes || {} : {};

    const chapterNotes = existingMeta[noteMeta.chapterId] || [];
    const updatedChapterNotes = [updatedMeta, ...chapterNotes.filter((n) => n.id !== noteId)];

    await setDoc(
      notesMetaDocRef,
      {
        userNotes: {
          ...existingMeta,
          [noteMeta.chapterId]: updatedChapterNotes,
        },
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    return updatedMeta;
  } catch (err) {
    console.error('Failed to upload note to Google Drive:', err);
    return noteMeta;
  }
}

/**
 * Delete note file from Google Drive and Firestore
 */
export async function deleteNoteFromDrive(uid, accessToken, chapterId, noteId, driveFileId) {
  if (!uid) return;

  try {
    if (accessToken && driveFileId) {
      await deleteFileFromDrive(accessToken, driveFileId).catch(() => {});
    }

    const notesMetaDocRef = doc(db, 'users', uid, 'data', 'notes_meta');
    const snap = await getDoc(notesMetaDocRef);
    if (snap.exists()) {
      const existingMeta = snap.data().userNotes || {};
      const chapterNotes = existingMeta[chapterId] || [];
      const updatedChapterNotes = chapterNotes.filter((n) => n.id !== noteId);

      await setDoc(
        notesMetaDocRef,
        {
          userNotes: {
            ...existingMeta,
            [chapterId]: updatedChapterNotes,
          },
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('Failed to delete note from Google Drive:', err);
  }
}

/**
 * Rename note file on Google Drive and update Firestore
 */
export async function renameNoteOnDrive(uid, accessToken, chapterId, noteId, driveFileId, newDisplayName) {
  if (!uid) return;

  try {
    if (accessToken && driveFileId) {
      await renameFileOnDrive(accessToken, driveFileId, newDisplayName).catch(() => {});
    }

    const notesMetaDocRef = doc(db, 'users', uid, 'data', 'notes_meta');
    const snap = await getDoc(notesMetaDocRef);
    if (snap.exists()) {
      const existingMeta = snap.data().userNotes || {};
      const chapterNotes = existingMeta[chapterId] || [];
      const updatedChapterNotes = chapterNotes.map((n) => {
        if (n.id === noteId) {
          return { ...n, displayName: newDisplayName, updatedAt: Date.now() };
        }
        return n;
      });

      await setDoc(
        notesMetaDocRef,
        {
          userNotes: {
            ...existingMeta,
            [chapterId]: updatedChapterNotes,
          },
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('Failed to rename note on Google Drive:', err);
  }
}

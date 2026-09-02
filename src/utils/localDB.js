/**
 * Device-Local Personal Note Storage using IndexedDB.
 * 100% Private, 0 Network Requests, 0 Cloud Storage.
 * Stores binary file blobs locally on the user's device.
 */

const DB_NAME = 'Class12Commerce_UserFilesDB';
const DB_VERSION = 1;
const STORE_NAME = 'user_note_files';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Save a note binary payload to IndexedDB.
 */
export async function saveFileLocally(noteId, fileBlobOrData) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put({ id: noteId, data: fileBlobOrData, updatedAt: Date.now() });

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to save file in local IndexedDB:', err);
    throw err;
  }
}

/**
 * Retrieve a note binary payload from IndexedDB.
 */
export async function getFileLocally(noteId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(noteId);

      request.onsuccess = (e) => {
        const result = e.target.result;
        resolve(result ? result.data : null);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to read file from local IndexedDB:', err);
    return null;
  }
}

/**
 * Delete a note binary payload from IndexedDB.
 */
export async function deleteFileLocally(noteId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(noteId);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to delete file from local IndexedDB:', err);
  }
}

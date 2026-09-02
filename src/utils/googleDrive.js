/**
 * Google Drive API v3 Client for User Personal Note Storage.
 * Uses OAuth 2.0 with least-privilege scope: 'https://www.googleapis.com/auth/drive.file'
 * Stores user note attachments (images, PDFs, audio, video) in a dedicated folder in the user's Google Drive.
 * 100% Free - Uses the user's own 15 GB Google Drive storage instead of paid Firebase Cloud Storage.
 */

const FOLDER_NAME = 'Class 12 Commerce Study - My Notes';
let cachedFolderId = null;

export function getStoredDriveToken(uid) {
  if (!uid) return null;
  return sessionStorage.getItem(`gdrive_token_${uid}`) || localStorage.getItem(`gdrive_token_${uid}`);
}

export function setStoredDriveToken(uid, token) {
  if (!uid || !token) return;
  sessionStorage.setItem(`gdrive_token_${uid}`, token);
  localStorage.setItem(`gdrive_token_${uid}`, token);
}

export function clearStoredDriveToken(uid) {
  if (uid) {
    sessionStorage.removeItem(`gdrive_token_${uid}`);
    localStorage.removeItem(`gdrive_token_${uid}`);
  }
}

/**
 * Finds or creates the dedicated app folder in the user's Google Drive
 */
export async function getOrCreateAppFolder(accessToken) {
  if (!accessToken) throw new Error('Missing Google Drive access token');
  if (cachedFolderId) return cachedFolderId;

  try {
    // 1. Search for existing folder
    const query = encodeURIComponent(`name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id,name)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        cachedFolderId = data.files[0].id;
        return cachedFolderId;
      }
    }

    // 2. Folder does not exist, create it
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Dedicated personal note storage for Class 12 Commerce Study app',
      }),
    });

    if (createRes.ok) {
      const folder = await createRes.json();
      cachedFolderId = folder.id;
      return cachedFolderId;
    } else {
      const errText = await createRes.text();
      console.warn('Could not create app folder in Google Drive:', errText);
      return null;
    }
  } catch (err) {
    console.error('Error finding/creating Google Drive folder:', err);
    return null;
  }
}

/**
 * Uploads a note attachment (blob or dataUrl) to Google Drive
 */
export async function uploadFileToDrive(accessToken, noteId, fileBlobOrData, noteMeta) {
  if (!accessToken) return null;

  try {
    const folderId = await getOrCreateAppFolder(accessToken);

    // Convert data: URL to Blob if needed
    let blob = fileBlobOrData;
    let mimeType = noteMeta?.fileType || 'application/octet-stream';

    if (typeof fileBlobOrData === 'string' && fileBlobOrData.startsWith('data:')) {
      const parts = fileBlobOrData.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
      const res = await fetch(fileBlobOrData);
      blob = await res.blob();
    } else if (fileBlobOrData instanceof Blob) {
      mimeType = fileBlobOrData.type || mimeType;
    }

    const metadata = {
      name: noteMeta.displayName || noteMeta.fileName || `note_${noteId}`,
      parents: folderId ? [folderId] : [],
      description: `NoteID: ${noteId}`,
      properties: {
        noteId: noteId,
        chapterId: noteMeta.chapterId || '',
      },
    };

    // Multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
    const mediaHeader = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;

    const multipartBlob = new Blob([metadataPart, mediaHeader, blob, closeDelimiter], {
      type: `multipart/related; boundary=${boundary}`,
    });

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBlob,
    });

    if (uploadRes.ok) {
      const data = await uploadRes.json();
      return {
        driveFileId: data.id,
        driveWebViewLink: data.webViewLink,
        synced: true,
      };
    } else {
      const errText = await uploadRes.text();
      console.warn('Google Drive file upload failed:', errText);
      return null;
    }
  } catch (err) {
    console.error('Failed to upload file to Google Drive:', err);
    return null;
  }
}

/**
 * Downloads a note binary file from Google Drive by driveFileId
 */
export async function downloadFileFromDrive(accessToken, driveFileId) {
  if (!accessToken || !driveFileId) return null;

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      const blob = await res.blob();
      return blob;
    } else {
      console.warn(`Could not download file ${driveFileId} from Google Drive: HTTP ${res.status}`);
      return null;
    }
  } catch (err) {
    console.error(`Error downloading file ${driveFileId} from Google Drive:`, err);
    return null;
  }
}

/**
 * Renames a note file on Google Drive
 */
export async function renameFileOnDrive(accessToken, driveFileId, newName) {
  if (!accessToken || !driveFileId) return false;

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    });

    return res.ok;
  } catch (err) {
    console.warn(`Could not rename file ${driveFileId} on Google Drive:`, err);
    return false;
  }
}

/**
 * Deletes a note file from Google Drive
 */
export async function deleteFileFromDrive(accessToken, driveFileId) {
  if (!accessToken || !driveFileId) return false;

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.ok;
  } catch (err) {
    console.warn(`Could not delete file ${driveFileId} from Google Drive:`, err);
    return false;
  }
}

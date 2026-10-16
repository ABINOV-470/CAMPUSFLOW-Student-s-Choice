/**
 * IndexedDB utility for persistent, quota-safe storage of student profile photos.
 * Ensures large cropped avatars survive page refreshes without hitting 5MB localStorage limits.
 */

const DB_NAME = 'CampusFlowDB';
const DB_VERSION = 1;
const STORE_NAME = 'profile_media';
const AVATAR_KEY = 'user_avatar_image';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Save cropped avatar dataUrl or blob to IndexedDB
 */
export async function saveAvatarToDb(dataUrl: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, AVATAR_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Failed to save avatar'));
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to localStorage if size permits', err);
    try {
      localStorage.setItem('campusflow_avatar_fallback', dataUrl);
    } catch {
      // quota exceeded fallback
    }
  }
}

/**
 * Retrieve saved avatar from IndexedDB
 */
export async function getAvatarFromDb(): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(AVATAR_KEY);

      req.onsuccess = () => {
        if (req.result && typeof req.result === 'string') {
          resolve(req.result);
        } else {
          // Check localStorage fallback
          const fb = localStorage.getItem('campusflow_avatar_fallback');
          resolve(fb || null);
        }
      };
      req.onerror = () => {
        const fb = localStorage.getItem('campusflow_avatar_fallback');
        resolve(fb || null);
      };
    });
  } catch (err) {
    console.warn('IndexedDB get failed, checking localStorage fallback', err);
    return localStorage.getItem('campusflow_avatar_fallback') || null;
  }
}

/**
 * Remove avatar from IndexedDB and fallback storage
 */
export async function deleteAvatarFromDb(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(AVATAR_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete error', err);
  }
  localStorage.removeItem('campusflow_avatar_fallback');
}

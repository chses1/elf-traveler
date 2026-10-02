import { initialPlayerState } from "../data/playerState.js?v=402";

const storageKey = "spirit-traveler-taoyuan-progress";
const activeAccountKey = `${storageKey}-active-account`;

function getAccountStorageKey(studentId) {
  return `${storageKey}-${studentId}`;
}

function getStudentIdFromAccountStorageKey(key) {
  if (!key.startsWith(`${storageKey}-`)) return "";
  const studentId = key.slice(`${storageKey}-`.length);
  return /^\d{5}$/.test(studentId) ? studentId : "";
}

export function loadProgress() {
  const studentId = localStorage.getItem(activeAccountKey);
  if (!studentId) return structuredClone(initialPlayerState);

  const saved = localStorage.getItem(getAccountStorageKey(studentId));
  if (!saved) {
    return {
      ...structuredClone(initialPlayerState),
      isLoggedIn: true,
      studentId,
    };
  }

  try {
    return {
      ...structuredClone(initialPlayerState),
      isLoggedIn: true,
      studentId,
      ...JSON.parse(saved),
    };
  } catch {
    return {
      ...structuredClone(initialPlayerState),
      isLoggedIn: true,
      studentId,
    };
  }
}

export function saveProgress(progress) {
  const studentId = progress.studentId || localStorage.getItem(activeAccountKey);
  if (!studentId) {
    localStorage.setItem(storageKey, JSON.stringify(progress));
    return;
  }

  localStorage.setItem(activeAccountKey, studentId);
  localStorage.setItem(getAccountStorageKey(studentId), JSON.stringify({
    ...progress,
    isLoggedIn: true,
    studentId,
  }));
}

export function loginProgress(studentId, selectedPlayerId, progressPatch = {}) {
  localStorage.setItem(activeAccountKey, studentId);
  const progress = {
    ...loadProgress(),
    ...progressPatch,
    isLoggedIn: true,
    studentId,
    selectedPlayerId,
  };
  saveProgress(progress);
  return progress;
}

export function loadAllStudentProgress(excludedStudentIds = []) {
  const excludedIds = new Set(excludedStudentIds);
  const storageKeys = Array.from(
    { length: localStorage.length },
    (_, index) => localStorage.key(index),
  ).filter(Boolean);

  return storageKeys
    .map((key) => getStudentIdFromAccountStorageKey(key))
    .filter((studentId) => studentId && !excludedIds.has(studentId))
    .map((studentId) => {
      const saved = localStorage.getItem(getAccountStorageKey(studentId));
      try {
        return {
          ...structuredClone(initialPlayerState),
          isLoggedIn: true,
          studentId,
          ...JSON.parse(saved),
        };
      } catch {
        return {
          ...structuredClone(initialPlayerState),
          isLoggedIn: true,
          studentId,
        };
      }
    });
}

export function logoutProgress() {
  localStorage.removeItem(activeAccountKey);
  return structuredClone(initialPlayerState);
}

export function resetProgress() {
  const studentId = localStorage.getItem(activeAccountKey);
  if (studentId) localStorage.removeItem(getAccountStorageKey(studentId));
  localStorage.removeItem(activeAccountKey);
  return structuredClone(initialPlayerState);
}

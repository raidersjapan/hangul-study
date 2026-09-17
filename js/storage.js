const STORAGE_KEY = 'hangul-app-progress-v1';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function persistProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // localStorageが使えない環境ではメモリ内動作のみ継続する
  }
}

let progressCache = loadProgress();

function recordAnswer(letterId, isCorrect) {
  const entry = progressCache[letterId] || { attempts: 0, correct: 0, lastSeen: 0 };
  entry.attempts += 1;
  if (isCorrect) {
    entry.correct += 1;
  }
  entry.lastSeen = Date.now();
  progressCache[letterId] = entry;
  persistProgress(progressCache);
  return entry;
}

function getLetterStats(letterId) {
  return progressCache[letterId] || { attempts: 0, correct: 0, lastSeen: 0 };
}

function getStageStats(letterIds) {
  return letterIds.reduce((totals, id) => {
    const stats = getLetterStats(id);
    totals.attempts += stats.attempts;
    totals.correct += stats.correct;
    return totals;
  }, { attempts: 0, correct: 0 });
}

function resetProgress() {
  progressCache = {};
  persistProgress(progressCache);
}

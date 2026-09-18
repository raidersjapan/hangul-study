let cachedVoices = [];

function isSpeechSupported() {
  return 'speechSynthesis' in window;
}

function loadVoices() {
  if (isSpeechSupported()) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
}

if (isSpeechSupported()) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

let currentUtterance = null;

function speakKorean(text) {
  if (!isSpeechSupported()) {
    return;
  }
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = 'ko-KR';
  const koreanVoices = cachedVoices.filter(voice => voice.lang === 'ko-KR');
  // 名前に「(言語)」が付く声はOS共通のノベルティ音声で、Chromeでは無音になることがある。
  // 単独名の専用音声（例: Yuna）があればそちらを優先する。
  const koreanVoice = koreanVoices.find(voice => !voice.name.includes('(')) || koreanVoices[0];
  if (koreanVoice) {
    currentUtterance.voice = koreanVoice;
  }
  window.speechSynthesis.speak(currentUtterance);
}

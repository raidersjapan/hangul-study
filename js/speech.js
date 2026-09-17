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
  const koreanVoice = cachedVoices.find(voice => voice.lang === 'ko-KR');
  if (koreanVoice) {
    currentUtterance.voice = koreanVoice;
  }
  window.speechSynthesis.speak(currentUtterance);
}

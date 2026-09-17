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

function speakKorean(text) {
  if (!isSpeechSupported()) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  const koreanVoice = cachedVoices.find(voice => voice.lang === 'ko-KR');
  if (koreanVoice) {
    utterance.voice = koreanVoice;
  }
  window.speechSynthesis.speak(utterance);
}

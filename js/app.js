function initTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  const sections = document.querySelectorAll('.tab-section');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      buttons.forEach(b => b.classList.toggle('active', b === button));
      sections.forEach(section => {
        section.hidden = section.getAttribute('data-tab-section') !== targetTab;
      });

      if (targetTab === 'chart') {
        renderChartTab();
      }
      if (targetTab === 'kana') {
        renderKanaTab();
      }
      if (targetTab === 'quiz') {
        renderQuizTab();
      }
      if (targetTab === 'writing') {
        renderWritingTab();
      }
      if (targetTab === 'progress') {
        renderProgressTab();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderStudyTab();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}

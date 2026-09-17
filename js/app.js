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

      if (targetTab === 'quiz') {
        renderQuizTab();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderStudyTab();
});

function renderProgressTab() {
  const list = document.getElementById('progress-list');
  list.innerHTML = '';

  STAGES.forEach(stage => {
    const letters = getLettersByStage(stage.id);
    const stats = getStageStats(letters.map(l => l.id));
    const accuracy = stats.attempts === 0 ? 0 : Math.round((stats.correct / stats.attempts) * 100);

    const row = document.createElement('div');
    row.className = 'progress-row';

    const label = document.createElement('div');
    label.className = 'progress-label';
    label.textContent = stage.label;

    const detail = document.createElement('div');
    detail.className = 'progress-detail';
    detail.textContent = `${stats.correct}/${stats.attempts} 問正解（正答率 ${accuracy}%）`;

    row.appendChild(label);
    row.appendChild(detail);
    list.appendChild(row);
  });

  bindResetButton();
}

let resetButtonBound = false;

function bindResetButton() {
  if (resetButtonBound) return;
  resetButtonBound = true;

  document.getElementById('reset-progress-button').addEventListener('click', () => {
    if (confirm('進捗をすべてリセットします。よろしいですか？')) {
      resetProgress();
      renderProgressTab();
    }
  });
}

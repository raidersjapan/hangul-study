let currentStudyStage = STAGES[0].id;

function renderStudyTab() {
  renderStudyStageSelector();
  renderStudyLetterGrid();
}

function renderStudyStageSelector() {
  const container = document.getElementById('study-stage-selector');
  container.innerHTML = '';

  STAGES.forEach(stage => {
    const button = document.createElement('button');
    button.textContent = stage.label;
    button.className = 'stage-button' + (stage.id === currentStudyStage ? ' active' : '');
    button.addEventListener('click', () => {
      currentStudyStage = stage.id;
      renderStudyTab();
    });
    container.appendChild(button);
  });
}

function renderStudyLetterGrid() {
  const grid = document.getElementById('study-letter-grid');
  grid.innerHTML = '';

  const letters = getLettersByStage(currentStudyStage);

  letters.forEach(letter => {
    const card = document.createElement('div');
    card.className = 'letter-card';

    const charEl = document.createElement('div');
    charEl.className = 'letter-char';
    charEl.textContent = letter.char;

    const romEl = document.createElement('div');
    romEl.className = 'letter-romanization';
    romEl.textContent = letter.romanization;

    card.appendChild(charEl);
    card.appendChild(romEl);

    if (letter.name) {
      const nameEl = document.createElement('div');
      nameEl.className = 'letter-name';
      nameEl.textContent = letter.name;
      card.appendChild(nameEl);
    }

    const descEl = document.createElement('div');
    descEl.className = 'letter-desc';
    descEl.textContent = letter.desc;
    card.appendChild(descEl);

    if (isSpeechSupported()) {
      card.addEventListener('click', () => speakKorean(letter.char));
      card.classList.add('speakable');
    }

    grid.appendChild(card);
  });
}

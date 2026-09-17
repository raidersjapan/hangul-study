let currentQuizStage = STAGES[0].id;
let currentQuestion = null;

function renderQuizTab() {
  renderQuizStageSelector();
  nextQuestion();
}

function renderQuizStageSelector() {
  const container = document.getElementById('quiz-stage-selector');
  container.innerHTML = '';

  const buttons = STAGES.map(stage => {
    const button = document.createElement('button');
    button.textContent = stage.label;
    button.className = 'stage-button' + (stage.id === currentQuizStage ? ' active' : '');
    button.addEventListener('click', () => {
      currentQuizStage = stage.id;
      buttons.forEach(btn => btn.classList.toggle('active', btn === button));
      nextQuestion();
    });
    container.appendChild(button);
    return button;
  });
}

function weightedPickLetter(letters) {
  const weighted = letters.map(letter => {
    const stats = getLetterStats(letter.id);
    const accuracy = stats.attempts === 0 ? 0.5 : stats.correct / stats.attempts;
    return { letter, weight: 1.1 - accuracy }; // 正答率が低いほど重みが大きい
  });
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * totalWeight;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) return w.letter;
  }
  return weighted[weighted.length - 1].letter;
}

function buildOptions(correctLetter, pool, labelFn) {
  const others = pool.filter(l => l.id !== correctLetter.id);
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = shuffled.concat([correctLetter]).map(labelFn);
  return options.sort(() => Math.random() - 0.5);
}

function nextQuestion() {
  const stageLetters = getLettersByStage(currentQuizStage);
  const pool = stageLetters.length >= 4 ? stageLetters : ALL_LETTERS;
  const correctLetter = weightedPickLetter(stageLetters);
  const mode = Math.random() < 0.5 ? 'char-to-sound' : 'sound-to-char';

  currentQuestion = { correctLetter, mode };

  if (mode === 'char-to-sound') {
    const options = buildOptions(correctLetter, pool, l => l.romanization);
    renderQuestion({
      prompt: correctLetter.char,
      promptType: 'char',
      options,
      correctAnswer: correctLetter.romanization,
    });
  } else {
    const options = buildOptions(correctLetter, pool, l => l.char);
    renderQuestion({
      prompt: correctLetter.char,
      promptType: 'sound',
      options,
      correctAnswer: correctLetter.char,
    });
  }
}

function renderQuestion(question) {
  const card = document.getElementById('quiz-card');
  card.innerHTML = '';

  const promptEl = document.createElement('div');
  promptEl.className = 'quiz-prompt';

  if (question.promptType === 'char') {
    promptEl.textContent = question.prompt;
  } else {
    promptEl.textContent = '🔊 発音を聞いて選んでください';
    if (isSpeechSupported()) {
      speakKorean(question.prompt);
    }
  }
  card.appendChild(promptEl);

  if (question.promptType === 'sound' && isSpeechSupported()) {
    const replayButton = document.createElement('button');
    replayButton.textContent = 'もう一度再生';
    replayButton.className = 'replay-button';
    replayButton.addEventListener('click', () => speakKorean(question.prompt));
    card.appendChild(replayButton);
  }

  const optionsEl = document.createElement('div');
  optionsEl.className = 'quiz-options';

  question.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.className = 'quiz-option';
    button.addEventListener('click', () => handleAnswer(option, question.correctAnswer, button));
    optionsEl.appendChild(button);
  });

  card.appendChild(optionsEl);

  const feedbackEl = document.createElement('div');
  feedbackEl.className = 'quiz-feedback';
  feedbackEl.id = 'quiz-feedback';
  card.appendChild(feedbackEl);
}

function handleAnswer(selected, correctAnswer, buttonEl) {
  const isCorrect = selected === correctAnswer;
  recordAnswer(currentQuestion.correctLetter.id, isCorrect);

  const feedbackEl = document.getElementById('quiz-feedback');
  feedbackEl.textContent = isCorrect ? '正解！' : `不正解。正解は 「${correctAnswer}」`;
  feedbackEl.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');

  document.querySelectorAll('.quiz-option').forEach(btn => btn.disabled = true);

  const nextButton = document.createElement('button');
  nextButton.textContent = '次の問題へ';
  nextButton.className = 'next-question-button';
  nextButton.addEventListener('click', nextQuestion);
  document.getElementById('quiz-card').appendChild(nextButton);
}

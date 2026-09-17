let currentWritingStage = STAGES[0].id;
let currentWritingLetter = null;
let writingCanvasCtx = null;
let isDrawing = false;

function renderWritingTab() {
  renderWritingStageSelector();
  pickWritingLetter();
  setupCanvasIfNeeded();
  drawGuide();
  bindWritingControls();
}

function renderWritingStageSelector() {
  const container = document.getElementById('writing-stage-selector');
  container.innerHTML = '';

  STAGES.forEach(stage => {
    const button = document.createElement('button');
    button.textContent = stage.label;
    button.className = 'stage-button' + (stage.id === currentWritingStage ? ' active' : '');
    button.addEventListener('click', () => {
      currentWritingStage = stage.id;
      pickWritingLetter();
      clearCanvas();
      drawGuide();
    });
    container.appendChild(button);
  });
}

function pickWritingLetter() {
  const letters = getLettersByStage(currentWritingStage);
  currentWritingLetter = letters[Math.floor(Math.random() * letters.length)];
  document.getElementById('writing-target').textContent =
    currentWritingLetter.char + '  (' + currentWritingLetter.romanization + ')';
}

function setupCanvasIfNeeded() {
  const canvas = document.getElementById('writing-canvas');
  if (writingCanvasCtx) return;

  if (!canvas.getContext) {
    canvas.replaceWith(document.createTextNode('お使いのブラウザは手書き練習に対応していません。'));
    return;
  }

  writingCanvasCtx = canvas.getContext('2d');
  writingCanvasCtx.lineWidth = 6;
  writingCanvasCtx.lineCap = 'round';
  writingCanvasCtx.strokeStyle = '#1c1c1e';

  const getPos = (evt) => {
    const rect = canvas.getBoundingClientRect();
    const point = evt.touches ? evt.touches[0] : evt;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const start = (evt) => {
    isDrawing = true;
    const pos = getPos(evt);
    writingCanvasCtx.beginPath();
    writingCanvasCtx.moveTo(pos.x, pos.y);
    evt.preventDefault();
  };

  const move = (evt) => {
    if (!isDrawing) return;
    const pos = getPos(evt);
    writingCanvasCtx.lineTo(pos.x, pos.y);
    writingCanvasCtx.stroke();
    evt.preventDefault();
  };

  const end = () => {
    isDrawing = false;
  };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);

  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);
}

function drawGuide() {
  if (!writingCanvasCtx || !currentWritingLetter) return;
  const guideEnabled = document.getElementById('guide-toggle').checked;

  clearCanvasOnly();

  if (!guideEnabled) return;

  writingCanvasCtx.save();
  writingCanvasCtx.globalAlpha = 0.2;
  writingCanvasCtx.font = '220px sans-serif';
  writingCanvasCtx.textAlign = 'center';
  writingCanvasCtx.textBaseline = 'middle';
  writingCanvasCtx.fillStyle = '#1c1c1e';
  writingCanvasCtx.fillText(currentWritingLetter.char, 150, 150);
  writingCanvasCtx.restore();
}

function clearCanvasOnly() {
  if (!writingCanvasCtx) return;
  writingCanvasCtx.clearRect(0, 0, 300, 300);
}

function clearCanvas() {
  clearCanvasOnly();
  drawGuide();
}

let writingControlsBound = false;

function bindWritingControls() {
  if (writingControlsBound) return;
  writingControlsBound = true;

  document.getElementById('guide-toggle').addEventListener('change', drawGuide);
  document.getElementById('clear-canvas-button').addEventListener('click', () => {
    clearCanvasOnly();
    drawGuide();
  });
  document.getElementById('next-letter-button').addEventListener('click', () => {
    pickWritingLetter();
    clearCanvasOnly();
    drawGuide();
  });
}

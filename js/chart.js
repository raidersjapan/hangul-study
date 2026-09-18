// index は Unicode のハングル音節ブロックにおける初声・中声の並び順（U+AC00 = 가）
const CHART_CONSONANTS = [
  { char: 'ㄱ', romanization: 'g', index: 0 },
  { char: 'ㄴ', romanization: 'n', index: 2 },
  { char: 'ㄷ', romanization: 'd', index: 3 },
  { char: 'ㄹ', romanization: 'r', index: 5 },
  { char: 'ㅁ', romanization: 'm', index: 6 },
  { char: 'ㅂ', romanization: 'b', index: 7 },
  { char: 'ㅅ', romanization: 's', index: 9 },
  { char: 'ㅇ', romanization: '', index: 11 },
  { char: 'ㅈ', romanization: 'j', index: 12 },
  { char: 'ㅊ', romanization: 'ch', index: 14 },
  { char: 'ㅋ', romanization: 'k', index: 15 },
  { char: 'ㅌ', romanization: 't', index: 16 },
  { char: 'ㅍ', romanization: 'p', index: 17 },
  { char: 'ㅎ', romanization: 'h', index: 18 },
  { char: 'ㄲ', romanization: 'kk', index: 1, tense: true },
  { char: 'ㄸ', romanization: 'tt', index: 4, tense: true },
  { char: 'ㅃ', romanization: 'pp', index: 8, tense: true },
  { char: 'ㅆ', romanization: 'ss', index: 10, tense: true },
  { char: 'ㅉ', romanization: 'jj', index: 13, tense: true },
];

const CHART_VOWELS = [
  { char: 'ㅏ', romanization: 'a', index: 0 },
  { char: 'ㅑ', romanization: 'ya', index: 2 },
  { char: 'ㅓ', romanization: 'eo', index: 4 },
  { char: 'ㅕ', romanization: 'yeo', index: 6 },
  { char: 'ㅗ', romanization: 'o', index: 8 },
  { char: 'ㅛ', romanization: 'yo', index: 12 },
  { char: 'ㅜ', romanization: 'u', index: 13 },
  { char: 'ㅠ', romanization: 'yu', index: 17 },
  { char: 'ㅡ', romanization: 'eu', index: 18 },
  { char: 'ㅣ', romanization: 'i', index: 20 },
];

function composeSyllable(consonant, vowel) {
  return String.fromCharCode(0xAC00 + consonant.index * 588 + vowel.index * 28);
}

function renderChartTab() {
  const wrapper = document.getElementById('chart-table-wrapper');
  wrapper.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'chart-table';

  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th'));
  CHART_VOWELS.forEach(vowel => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = vowel.char;
    headRow.appendChild(th);
  });
  const thead = document.createElement('thead');
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const speakable = isSpeechSupported();
  let previousWasTense = false;

  CHART_CONSONANTS.forEach(consonant => {
    const row = document.createElement('tr');
    if (consonant.tense && !previousWasTense) {
      row.className = 'chart-tense-start';
    }
    previousWasTense = Boolean(consonant.tense);

    const rowHead = document.createElement('th');
    rowHead.scope = 'row';
    rowHead.textContent = consonant.char;
    row.appendChild(rowHead);

    CHART_VOWELS.forEach(vowel => {
      const syllable = composeSyllable(consonant, vowel);
      const cell = document.createElement('td');
      cell.className = 'chart-cell' + (speakable ? ' speakable' : '');

      const charEl = document.createElement('div');
      charEl.className = 'chart-syllable';
      charEl.textContent = syllable;

      const romEl = document.createElement('div');
      romEl.className = 'chart-romanization';
      romEl.textContent = consonant.romanization + vowel.romanization;

      cell.appendChild(charEl);
      cell.appendChild(romEl);

      if (speakable) {
        cell.addEventListener('click', () => speakKorean(syllable));
      }

      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
}

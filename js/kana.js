// 50音表の各かなに対応するハングル表記。null は該当する音がない空欄。
// か行・た行などは、学習用の50音表で一般的な激音表記（카・타…）に統一している。
const KANA_COLUMNS = [
  { char: 'あ', romanization: 'a' },
  { char: 'い', romanization: 'i' },
  { char: 'う', romanization: 'u' },
  { char: 'え', romanization: 'e' },
  { char: 'お', romanization: 'o' },
];

const KANA_ROWS = [
  { label: 'あ', cells: [['あ', '아', 'a'], ['い', '이', 'i'], ['う', '우', 'u'], ['え', '에', 'e'], ['お', '오', 'o']] },
  { label: 'か', cells: [['か', '카', 'ka'], ['き', '키', 'ki'], ['く', '쿠', 'ku'], ['け', '케', 'ke'], ['こ', '코', 'ko']] },
  { label: 'さ', cells: [['さ', '사', 'sa'], ['し', '시', 'shi'], ['す', '스', 'su'], ['せ', '세', 'se'], ['そ', '소', 'so']] },
  { label: 'た', cells: [['た', '타', 'ta'], ['ち', '치', 'chi'], ['つ', '츠', 'tsu'], ['て', '테', 'te'], ['と', '토', 'to']] },
  { label: 'な', cells: [['な', '나', 'na'], ['に', '니', 'ni'], ['ぬ', '누', 'nu'], ['ね', '네', 'ne'], ['の', '노', 'no']] },
  { label: 'は', cells: [['は', '하', 'ha'], ['ひ', '히', 'hi'], ['ふ', '후', 'fu'], ['へ', '헤', 'he'], ['ほ', '호', 'ho']] },
  { label: 'ま', cells: [['ま', '마', 'ma'], ['み', '미', 'mi'], ['む', '무', 'mu'], ['め', '메', 'me'], ['も', '모', 'mo']] },
  { label: 'や', cells: [['や', '야', 'ya'], null, ['ゆ', '유', 'yu'], null, ['よ', '요', 'yo']] },
  { label: 'ら', cells: [['ら', '라', 'ra'], ['り', '리', 'ri'], ['る', '루', 'ru'], ['れ', '레', 're'], ['ろ', '로', 'ro']] },
  { label: 'わ', cells: [['わ', '와', 'wa'], null, null, null, ['を', '오', 'wo']] },
  { label: 'ん', cells: [['ん', '응', 'n'], null, null, null, null] },
];

function createKanaHeaderCell(char, subText, scope) {
  const th = document.createElement('th');
  th.scope = scope;

  const charEl = document.createElement('div');
  charEl.className = 'chart-header-char';
  charEl.textContent = char;

  const subEl = document.createElement('div');
  subEl.className = 'chart-header-romanization';
  subEl.textContent = subText;

  th.appendChild(charEl);
  th.appendChild(subEl);
  return th;
}

function renderKanaTab() {
  const wrapper = document.getElementById('kana-table-wrapper');
  wrapper.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'chart-table';

  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th'));
  KANA_COLUMNS.forEach(column => {
    headRow.appendChild(createKanaHeaderCell(column.char, column.romanization, 'col'));
  });
  const thead = document.createElement('thead');
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const speakable = isSpeechSupported();

  KANA_ROWS.forEach(rowData => {
    const row = document.createElement('tr');
    row.appendChild(createKanaHeaderCell(rowData.label, rowData.label === 'ん' ? '' : '行', 'row'));

    rowData.cells.forEach(entry => {
      const cell = document.createElement('td');

      if (!entry) {
        cell.className = 'chart-cell chart-cell-empty';
        row.appendChild(cell);
        return;
      }

      const [kana, hangul, romanization] = entry;
      cell.className = 'chart-cell' + (speakable ? ' speakable' : '');

      const charEl = document.createElement('div');
      charEl.className = 'chart-syllable';
      charEl.textContent = hangul;

      const subEl = document.createElement('div');
      subEl.className = 'chart-romanization';
      subEl.textContent = kana + ' ' + romanization;

      cell.appendChild(charEl);
      cell.appendChild(subEl);

      if (speakable) {
        cell.addEventListener('click', () => speakKorean(hangul));
      }

      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
}

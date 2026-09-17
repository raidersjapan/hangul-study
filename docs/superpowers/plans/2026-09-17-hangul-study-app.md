# ハングル学習アプリ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ハングル未学習の初心者向けに、字母の一覧・解説、クイズ、手書き練習、発音再生、進捗保存を備えたモバイル向けWebアプリを作る。

**Architecture:** 素のHTML/CSS/JavaScriptによる単一ページアプリ。`<script>`タグでグローバル関数を読み込む方式（ESモジュール不使用）とし、`file://`で直接開いても動作するようにする。画面下部のタブバーでJSにより表示を切り替える。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES2017+), Web Speech API (`SpeechSynthesisUtterance`), Canvas API, localStorage。ビルドツール・フレームワーク・パッケージマネージャは使用しない。

**Spec:** `docs/superpowers/specs/2026-09-17-hangul-study-app-design.md`

## Global Constraints

- ビルドツール・フレームワークは使用しない（素のHTML/CSS/JS）
- ESモジュール(`import`/`export`)は使わず、`<script>`タグの読み込み順でグローバル関数を共有する（`file://`で直接開けるようにするため）
- 自動テストのビルド環境は導入しない。各タスクの検証はブラウザでの手動確認で行う（デザインスペックの「テスト方針」に準拠）
- 学習段階は4つ: `vowel_basic`（基本母音10字）→ `consonant_basic`（基本子音14字）→ `consonant_tense`（濃音5字）→ `vowel_compound`（複合母音11字）
- 進捗データは `localStorage` キー `hangul-app-progress-v1` に保存し、利用不可の場合はメモリ内動作にフォールバックする
- 書き取り練習は正誤判定を行わない自己練習ツールとする

---

## Task 1: プロジェクト雛形とタブ切り替え

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `js/app.js`

**Interfaces:**
- Produces: `initTabs()` — 呼び出すとタブバーのクリックイベントを設定し、対応する `<section>` の表示/非表示を切り替える。`data-tab` 属性でタブボタンとセクションを対応付ける（値: `study` / `quiz` / `writing` / `progress`）。

- [ ] **Step 1: `index.html` を作成する**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ハングル学習</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="app-header">
    <h1>ハングル学習</h1>
  </header>

  <main>
    <section id="tab-study" class="tab-section" data-tab-section="study">
      <p>学習タブ（Task 5で実装）</p>
    </section>
    <section id="tab-quiz" class="tab-section" data-tab-section="quiz" hidden>
      <p>クイズタブ（Task 6で実装）</p>
    </section>
    <section id="tab-writing" class="tab-section" data-tab-section="writing" hidden>
      <p>書き取りタブ（Task 7で実装）</p>
    </section>
    <section id="tab-progress" class="tab-section" data-tab-section="progress" hidden>
      <p>進捗タブ（Task 8で実装）</p>
    </section>
  </main>

  <nav class="tab-bar">
    <button class="tab-button active" data-tab="study">学習</button>
    <button class="tab-button" data-tab="quiz">クイズ</button>
    <button class="tab-button" data-tab="writing">書き取り</button>
    <button class="tab-button" data-tab="progress">進捗</button>
  </nav>

  <script src="js/data.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/speech.js"></script>
  <script src="js/study.js"></script>
  <script src="js/quiz.js"></script>
  <script src="js/writing.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

Note: `js/data.js`, `js/storage.js`, `js/speech.js`, `js/study.js`, `js/quiz.js`, `js/writing.js` はこのタスクではまだ存在しない。ブラウザのコンソールに404が出るのは想定内（Task 2以降で作成する）。ローカルで確認する際は該当ファイルを空ファイルとして仮作成してもよいが、Task 2以降で正式に作成するため、ここでは作成しない。

- [ ] **Step 2: `style.css` を作成する**

```css
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif;
  background: #f5f5f7;
  color: #1c1c1e;
}

.app-header {
  padding: 16px;
  text-align: center;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.app-header h1 {
  margin: 0;
  font-size: 1.2rem;
}

main {
  padding: 16px;
  padding-bottom: 80px; /* タブバーの高さ分の余白 */
}

.tab-section[hidden] {
  display: none;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.tab-button {
  flex: 1;
  padding: 14px 0;
  border: none;
  background: none;
  font-size: 0.95rem;
  color: #666;
}

.tab-button.active {
  color: #007aff;
  font-weight: bold;
}
```

- [ ] **Step 3: `js/app.js` を作成する**

```js
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
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
});
```

- [ ] **Step 4: ブラウザで手動確認する**

`index.html` をブラウザで直接開く（ダブルクリックまたは `open index.html`）。

確認項目:
- 「学習」「クイズ」「書き取り」「進捗」の4つのタブボタンが画面下部に表示される
- 「クイズ」をタップすると、下部のプレースホルダーテキストが「クイズタブ（Task 6で実装）」に切り替わり、他のタブの内容が隠れる
- 各タブを順にタップして、すべて正しく切り替わることを確認する
- ブラウザの開発者ツールでウィンドウ幅を375px程度に狭めても、レイアウトが崩れないことを確認する

- [ ] **Step 5: コミットする**

```bash
git add index.html style.css js/app.js
git commit -m "feat: add app shell with tab navigation"
```

---

## Task 2: ハングル字母データ

**Files:**
- Create: `js/data.js`

**Interfaces:**
- Produces:
  - `STAGES` — `[{ id: string, label: string }]` の配列（学習段階のメタ情報）
  - `ALL_LETTERS` — 全40字母の配列。各要素は `{ id: string, char: string, romanization: string, name?: string, stage: string, desc: string }`
  - `getLettersByStage(stageId: string)` — 指定した `stage` の字母配列を返す関数

- [ ] **Step 1: `js/data.js` を作成する**

```js
const STAGES = [
  { id: 'vowel_basic', label: '基本母音' },
  { id: 'consonant_basic', label: '基本子音' },
  { id: 'consonant_tense', label: '濃音' },
  { id: 'vowel_compound', label: '複合母音' },
];

const VOWELS_BASIC = [
  { id: 'v-a', char: 'ㅏ', romanization: 'a', stage: 'vowel_basic', desc: '日本語の「ア」とほぼ同じ音。' },
  { id: 'v-ya', char: 'ㅑ', romanization: 'ya', stage: 'vowel_basic', desc: '日本語の「ヤ」とほぼ同じ音。' },
  { id: 'v-eo', char: 'ㅓ', romanization: 'eo', stage: 'vowel_basic', desc: '「ア」と「オ」の中間のような音。口を軽く開けて喉の奥から出す。' },
  { id: 'v-yeo', char: 'ㅕ', romanization: 'yeo', stage: 'vowel_basic', desc: '「ヨ」に近いが「ア」寄りの音。' },
  { id: 'v-o', char: 'ㅗ', romanization: 'o', stage: 'vowel_basic', desc: '日本語の「オ」に近いが、唇を丸めて突き出す。' },
  { id: 'v-yo', char: 'ㅛ', romanization: 'yo', stage: 'vowel_basic', desc: '日本語の「ヨ」に近い音。' },
  { id: 'v-u', char: 'ㅜ', romanization: 'u', stage: 'vowel_basic', desc: '日本語の「ウ」に近いが、唇を強く丸める。' },
  { id: 'v-yu', char: 'ㅠ', romanization: 'yu', stage: 'vowel_basic', desc: '日本語の「ユ」に近い音。' },
  { id: 'v-eu', char: 'ㅡ', romanization: 'eu', stage: 'vowel_basic', desc: '「ウ」に近いが、唇を横に引いて「イ」の口の形で発音する。' },
  { id: 'v-i', char: 'ㅣ', romanization: 'i', stage: 'vowel_basic', desc: '日本語の「イ」とほぼ同じ音。' },
];

const CONSONANTS_BASIC = [
  { id: 'c-g', char: 'ㄱ', romanization: 'g/k', name: '기역(キヨク)', stage: 'consonant_basic', desc: '語頭では弱い「k」、語中では「g」に近い音になる。' },
  { id: 'c-n', char: 'ㄴ', romanization: 'n', name: '니은(ニウン)', stage: 'consonant_basic', desc: '日本語の「ナ行」の子音とほぼ同じ。' },
  { id: 'c-d', char: 'ㄷ', romanization: 'd/t', name: '디귿(ティグッ)', stage: 'consonant_basic', desc: '語頭では弱い「t」、語中では「d」に近い音になる。' },
  { id: 'c-r', char: 'ㄹ', romanization: 'r/l', name: '리을(リウル)', stage: 'consonant_basic', desc: '「ラ行」と「L」の中間のような音。' },
  { id: 'c-m', char: 'ㅁ', romanization: 'm', name: '미음(ミウム)', stage: 'consonant_basic', desc: '日本語の「マ行」の子音とほぼ同じ。' },
  { id: 'c-b', char: 'ㅂ', romanization: 'b/p', name: '비읍(ピウプ)', stage: 'consonant_basic', desc: '語頭では弱い「p」、語中では「b」に近い音になる。' },
  { id: 'c-s', char: 'ㅅ', romanization: 's', name: '시옷(シオッ)', stage: 'consonant_basic', desc: '日本語の「サ行」に近いが、「シ」の前ではさらに柔らかい音になる。' },
  { id: 'c-ng', char: 'ㅇ', romanization: 'ng/silent', name: '이응(イウン)', stage: 'consonant_basic', desc: '語頭（初声）では発音せず、パッチム（末子音）に来ると「ng」の音になる。' },
  { id: 'c-j', char: 'ㅈ', romanization: 'j', name: '지읒(ジウッ)', stage: 'consonant_basic', desc: '「ジャ行」と「チャ行」の中間のような音。' },
  { id: 'c-ch', char: 'ㅊ', romanization: 'ch', name: '치읓(チウッ)', stage: 'consonant_basic', desc: '息を強く出す「チャ行」の音。' },
  { id: 'c-k', char: 'ㅋ', romanization: 'k', name: '키읔(キウク)', stage: 'consonant_basic', desc: '息を強く出す「カ行」の音。' },
  { id: 'c-t', char: 'ㅌ', romanization: 't', name: '티읕(ティウッ)', stage: 'consonant_basic', desc: '息を強く出す「タ行」の音。' },
  { id: 'c-p', char: 'ㅍ', romanization: 'p', name: '피읖(ピウプ)', stage: 'consonant_basic', desc: '息を強く出す「パ行」の音。' },
  { id: 'c-h', char: 'ㅎ', romanization: 'h', name: '히읗(ヒウッ)', stage: 'consonant_basic', desc: '日本語の「ハ行」の子音とほぼ同じ。' },
];

const CONSONANTS_TENSE = [
  { id: 'c-kk', char: 'ㄲ', romanization: 'kk', name: '쌍기역(サンギヨク)', stage: 'consonant_tense', desc: 'ㄱを強く、喉を締めるように発音する。' },
  { id: 'c-tt', char: 'ㄸ', romanization: 'tt', name: '쌍디귿(サンディグッ)', stage: 'consonant_tense', desc: 'ㄷを強く、喉を締めるように発音する。' },
  { id: 'c-pp', char: 'ㅃ', romanization: 'pp', name: '쌍비읍(サンビウプ)', stage: 'consonant_tense', desc: 'ㅂを強く、喉を締めるように発音する。' },
  { id: 'c-ss', char: 'ㅆ', romanization: 'ss', name: '쌍시옷(サンシオッ)', stage: 'consonant_tense', desc: 'ㅅを強く、喉を締めるように発音する。' },
  { id: 'c-jj', char: 'ㅉ', romanization: 'jj', name: '쌍지읒(サンジウッ)', stage: 'consonant_tense', desc: 'ㅈを強く、喉を締めるように発音する。' },
];

const VOWELS_COMPOUND = [
  { id: 'v-ae', char: 'ㅐ', romanization: 'ae', stage: 'vowel_compound', desc: '日本語の「エ」に近い音（ㅔとほぼ同じ発音）。' },
  { id: 'v-yae', char: 'ㅒ', romanization: 'yae', stage: 'vowel_compound', desc: '「イェ」に近い音。' },
  { id: 'v-e', char: 'ㅔ', romanization: 'e', stage: 'vowel_compound', desc: '日本語の「エ」に近い音（ㅐとほぼ同じ発音）。' },
  { id: 'v-ye', char: 'ㅖ', romanization: 'ye', stage: 'vowel_compound', desc: '「イェ」に近い音。' },
  { id: 'v-wa', char: 'ㅘ', romanization: 'wa', stage: 'vowel_compound', desc: '日本語の「ワ」に近い音。' },
  { id: 'v-wae', char: 'ㅙ', romanization: 'wae', stage: 'vowel_compound', desc: '「ウェ」に近い音。' },
  { id: 'v-oe', char: 'ㅚ', romanization: 'oe', stage: 'vowel_compound', desc: '「ウェ」に近い音（現代韓国語ではㅙとほぼ同じ発音）。' },
  { id: 'v-wo', char: 'ㅝ', romanization: 'wo', stage: 'vowel_compound', desc: '「ウォ」に近い音。' },
  { id: 'v-we', char: 'ㅞ', romanization: 'we', stage: 'vowel_compound', desc: '「ウェ」に近い音。' },
  { id: 'v-wi', char: 'ㅟ', romanization: 'wi', stage: 'vowel_compound', desc: '「ウィ」に近い音。' },
  { id: 'v-ui', char: 'ㅢ', romanization: 'ui', stage: 'vowel_compound', desc: '「ウィ」と「ウ」の中間のような音（位置により発音が変わる）。' },
];

const ALL_LETTERS = [].concat(VOWELS_BASIC, CONSONANTS_BASIC, CONSONANTS_TENSE, VOWELS_COMPOUND);

function getLettersByStage(stageId) {
  return ALL_LETTERS.filter(letter => letter.stage === stageId);
}
```

- [ ] **Step 2: ブラウザのコンソールで手動確認する**

`index.html` をブラウザで開き、開発者ツールのコンソールで以下を実行する。

```js
ALL_LETTERS.length
// => 40

getLettersByStage('vowel_basic').length
// => 10

getLettersByStage('consonant_basic').length
// => 14

getLettersByStage('consonant_tense').length
// => 5

getLettersByStage('vowel_compound').length
// => 11

new Set(ALL_LETTERS.map(l => l.id)).size
// => 40 (idの重複がないことを確認)
```

すべて期待通りの値が返ることを確認する。

- [ ] **Step 3: コミットする**

```bash
git add js/data.js
git commit -m "feat: add hangul letter data"
```

---

## Task 3: 進捗保存モジュール（localStorage）

**Files:**
- Create: `js/storage.js`

**Interfaces:**
- Consumes: なし（`data.js` の型を前提にするが直接参照はしない）
- Produces:
  - `recordAnswer(letterId: string, isCorrect: boolean)` — 回答結果を記録し、更新後の `{ attempts, correct, lastSeen }` を返す
  - `getLetterStats(letterId: string)` — `{ attempts: number, correct: number, lastSeen: number }` を返す（未回答なら `{attempts:0, correct:0, lastSeen:0}`）
  - `getStageStats(letterIds: string[])` — `{ attempts: number, correct: number }` を返す（複数字母の合算）
  - `resetProgress()` — 全進捗をクリアする

- [ ] **Step 1: `js/storage.js` を作成する**

```js
const STORAGE_KEY = 'hangul-app-progress-v1';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function persistProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // localStorageが使えない環境ではメモリ内動作のみ継続する
  }
}

let progressCache = loadProgress();

function recordAnswer(letterId, isCorrect) {
  const entry = progressCache[letterId] || { attempts: 0, correct: 0, lastSeen: 0 };
  entry.attempts += 1;
  if (isCorrect) {
    entry.correct += 1;
  }
  entry.lastSeen = Date.now();
  progressCache[letterId] = entry;
  persistProgress(progressCache);
  return entry;
}

function getLetterStats(letterId) {
  return progressCache[letterId] || { attempts: 0, correct: 0, lastSeen: 0 };
}

function getStageStats(letterIds) {
  return letterIds.reduce((totals, id) => {
    const stats = getLetterStats(id);
    totals.attempts += stats.attempts;
    totals.correct += stats.correct;
    return totals;
  }, { attempts: 0, correct: 0 });
}

function resetProgress() {
  progressCache = {};
  persistProgress(progressCache);
}
```

- [ ] **Step 2: ブラウザのコンソールで手動確認する**

`index.html` を開き、コンソールで以下を実行する。

```js
resetProgress();
getLetterStats('v-a');
// => { attempts: 0, correct: 0, lastSeen: 0 }

recordAnswer('v-a', true);
recordAnswer('v-a', false);
getLetterStats('v-a');
// => { attempts: 2, correct: 1, lastSeen: <timestamp> }

getStageStats(['v-a', 'v-ya']);
// => { attempts: 2, correct: 1 }
```

ページをリロードしてから再度 `getLetterStats('v-a')` を実行し、`{ attempts: 2, correct: 1, ... }` が保持されている（localStorageに永続化されている）ことを確認する。最後に `resetProgress()` を実行してテストデータをクリアする。

- [ ] **Step 3: コミットする**

```bash
git add js/storage.js
git commit -m "feat: add progress storage module"
```

---

## Task 4: 発音音声モジュール（Web Speech API）

**Files:**
- Create: `js/speech.js`

**Interfaces:**
- Produces:
  - `isSpeechSupported()` — `boolean` を返す
  - `speakKorean(text: string)` — 韓国語音声で `text` を読み上げる。非対応環境では何もしない

- [ ] **Step 1: `js/speech.js` を作成する**

```js
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
```

- [ ] **Step 2: ブラウザのコンソールで手動確認する**

`index.html` を開き、コンソールで以下を実行する（音量をオンにしておく）。

```js
isSpeechSupported();
// => true (対応ブラウザの場合)

speakKorean('안녕하세요');
// スピーカーから韓国語の読み上げ音声が再生されることを確認する
```

音声が再生されない場合は、OS/ブラウザに韓国語の音声パックが入っているか確認する（機能自体は正常でも音声資源がない場合がある点は許容する）。

- [ ] **Step 3: コミットする**

```bash
git add js/speech.js
git commit -m "feat: add speech synthesis module"
```

---

## Task 5: 学習タブ（字母一覧・解説）

**Files:**
- Modify: `index.html` (`#tab-study` セクションの中身)
- Create: `js/study.js`
- Modify: `js/app.js` (初期化時に `renderStudyTab()` を呼ぶ)

**Interfaces:**
- Consumes: `STAGES`, `getLettersByStage(stageId)` (Task 2), `speakKorean(text)`, `isSpeechSupported()` (Task 4)
- Produces: `renderStudyTab()` — 学習タブのDOMを構築し、段階セレクタとカード一覧のイベントを設定する

- [ ] **Step 1: `index.html` の `#tab-study` を書き換える**

```html
<section id="tab-study" class="tab-section" data-tab-section="study">
  <div class="stage-selector" id="study-stage-selector"></div>
  <div class="letter-grid" id="study-letter-grid"></div>
</section>
```

- [ ] **Step 2: `js/study.js` を作成する**

```js
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
```

- [ ] **Step 3: `js/app.js` を修正して初期化時に呼び出す**

```js
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderStudyTab();
});
```

- [ ] **Step 4: `style.css` にカードのスタイルを追加する**

```css
.stage-selector {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.stage-button {
  flex-shrink: 0;
  padding: 8px 14px;
  border: 1px solid #ccc;
  border-radius: 16px;
  background: #fff;
  font-size: 0.9rem;
}

.stage-button.active {
  background: #007aff;
  color: #fff;
  border-color: #007aff;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.letter-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.letter-card.speakable {
  cursor: pointer;
}

.letter-char {
  font-size: 2.2rem;
}

.letter-romanization {
  color: #666;
  margin-top: 4px;
}

.letter-name {
  font-size: 0.8rem;
  color: #999;
  margin-top: 2px;
}

.letter-desc {
  font-size: 0.75rem;
  color: #444;
  margin-top: 8px;
}
```

- [ ] **Step 5: ブラウザで手動確認する**

`index.html` を開き、以下を確認する。
- 「学習」タブに「基本母音」「基本子音」「濃音」「複合母音」の段階ボタンが表示される
- 初期表示で基本母音10字のカードが表示される
- 「基本子音」ボタンをタップすると14字のカードに切り替わり、各カードに文字・ローマ字・ハングルの名称・解説が表示される
- いずれかのカードをタップすると音声が再生される

- [ ] **Step 6: コミットする**

```bash
git add index.html js/study.js js/app.js style.css
git commit -m "feat: implement study tab with letter cards"
```

---

## Task 6: クイズタブ

**Files:**
- Modify: `index.html` (`#tab-quiz` セクションの中身)
- Create: `js/quiz.js`
- Modify: `js/app.js` (タブ切り替え時に `renderQuizTab()` を呼ぶ)

**Interfaces:**
- Consumes: `STAGES`, `getLettersByStage(stageId)`, `ALL_LETTERS` (Task 2), `speakKorean`, `isSpeechSupported` (Task 4), `recordAnswer`, `getLetterStats` (Task 3)
- Produces: `renderQuizTab()` — クイズタブのDOMを構築し、出題・採点のイベントを設定する

出題ロジック:
- 出題範囲は選択中の学習段階の字母
- 出題形式を2種類ランダムにミックス: `char-to-sound`（字母を見せてローマ字/名称を4択）、`sound-to-char`（音声を聞かせて字母を4択）
- 誤答選択肢は同じ段階の他の字母からランダムに3つ選ぶ（段階の字母数が4未満の場合は他段階から補う）
- 出題する字母は、正答率が低い字母を優先的に選ぶ簡易ロジック（`attempts === 0` の字母は正答率50%相当として扱う）

- [ ] **Step 1: `index.html` の `#tab-quiz` を書き換える**

```html
<section id="tab-quiz" class="tab-section" data-tab-section="quiz" hidden>
  <div class="stage-selector" id="quiz-stage-selector"></div>
  <div class="quiz-card" id="quiz-card"></div>
</section>
```

- [ ] **Step 2: `js/quiz.js` を作成する**

```js
let currentQuizStage = STAGES[0].id;
let currentQuestion = null;

function renderQuizTab() {
  renderQuizStageSelector();
  nextQuestion();
}

function renderQuizStageSelector() {
  const container = document.getElementById('quiz-stage-selector');
  container.innerHTML = '';

  STAGES.forEach(stage => {
    const button = document.createElement('button');
    button.textContent = stage.label;
    button.className = 'stage-button' + (stage.id === currentQuizStage ? ' active' : '');
    button.addEventListener('click', () => {
      currentQuizStage = stage.id;
      nextQuestion();
    });
    container.appendChild(button);
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
```

- [ ] **Step 3: `js/app.js` のタブ切り替えでクイズ描画を呼び出す**

`initTabs()` 内のクリックハンドラを修正し、クイズタブに切り替わったタイミングで `renderQuizTab()` を呼ぶ。

```js
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
```

- [ ] **Step 4: `style.css` にクイズ画面のスタイルを追加する**

```css
.quiz-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quiz-prompt {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.replay-button {
  margin-bottom: 16px;
  padding: 8px 14px;
  border-radius: 16px;
  border: 1px solid #ccc;
  background: #fff;
}

.quiz-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quiz-option {
  padding: 14px;
  font-size: 1.1rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: #fafafa;
}

.quiz-option:disabled {
  opacity: 0.6;
}

.quiz-feedback {
  margin-top: 16px;
  font-weight: bold;
}

.quiz-feedback.correct {
  color: #34c759;
}

.quiz-feedback.incorrect {
  color: #ff3b30;
}

.next-question-button {
  margin-top: 16px;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  background: #007aff;
  color: #fff;
}
```

- [ ] **Step 5: ブラウザで手動確認する**

`index.html` を開き、「クイズ」タブに切り替えて以下を確認する。
- 字母表示形式・音声出題形式の両方が出題されること（何度か「次の問題へ」を押して両方見られることを確認）
- 4択のうち1つを選ぶと正解/不正解のフィードバックが表示され、他の選択肢が無効化される
- 「次の問題へ」で新しい問題が出題される
- 段階ボタンを切り替えると、その段階の字母から出題される
- コンソールで `getLetterStats('v-a')` 等を実行し、回答結果が記録されていることを確認する

- [ ] **Step 6: コミットする**

```bash
git add index.html js/quiz.js js/app.js style.css
git commit -m "feat: implement quiz tab with weighted question selection"
```

---

## Task 7: 書き取りタブ（Canvas）

**Files:**
- Modify: `index.html` (`#tab-writing` セクションの中身)
- Create: `js/writing.js`
- Modify: `js/app.js` (タブ切り替え時に `renderWritingTab()` を呼ぶ)

**Interfaces:**
- Consumes: `STAGES`, `getLettersByStage(stageId)` (Task 2)
- Produces: `renderWritingTab()` — 書き取りタブのDOM構築とCanvas初期化を行う

- [ ] **Step 1: `index.html` の `#tab-writing` を書き換える**

```html
<section id="tab-writing" class="tab-section" data-tab-section="writing" hidden>
  <div class="stage-selector" id="writing-stage-selector"></div>
  <div class="writing-target" id="writing-target"></div>
  <div class="canvas-wrapper">
    <canvas id="writing-canvas" width="300" height="300"></canvas>
  </div>
  <div class="writing-controls">
    <label class="guide-toggle">
      <input type="checkbox" id="guide-toggle" checked>
      お手本を表示
    </label>
    <button id="clear-canvas-button">消す</button>
    <button id="next-letter-button">次の字母へ</button>
  </div>
</section>
```

- [ ] **Step 2: `js/writing.js` を作成する**

```js
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
```

- [ ] **Step 3: `js/app.js` のタブ切り替えで書き取り描画を呼び出す**

```js
if (targetTab === 'quiz') {
  renderQuizTab();
}
if (targetTab === 'writing') {
  renderWritingTab();
}
```

- [ ] **Step 4: `style.css` に書き取り画面のスタイルを追加する**

```css
.writing-target {
  text-align: center;
  font-size: 1.3rem;
  margin-bottom: 12px;
}

.canvas-wrapper {
  display: flex;
  justify-content: center;
}

#writing-canvas {
  border: 1px solid #ccc;
  border-radius: 12px;
  background: #fff;
  touch-action: none;
}

.writing-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.writing-controls button {
  padding: 10px 16px;
  border-radius: 16px;
  border: 1px solid #ccc;
  background: #fff;
}

.guide-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}
```

- [ ] **Step 5: ブラウザで手動確認する**

`index.html` を開き、「書き取り」タブに切り替えて以下を確認する。
- お手本の字母がキャンバスに薄く表示される
- マウス（またはタッチ）でキャンバス上をなぞると線が描ける
- 「お手本を表示」のチェックを外すとお手本が消え、再度チェックすると表示される
- 「消す」ボタンで描いた線が消え、お手本の表示状態は維持される
- 「次の字母へ」ボタンでランダムに別の字母に切り替わる
- 段階ボタンを切り替えると、その段階の字母からランダムに出題される

- [ ] **Step 6: コミットする**

```bash
git add index.html js/writing.js js/app.js style.css
git commit -m "feat: implement writing practice tab with canvas"
```

---

## Task 8: 進捗タブ

**Files:**
- Modify: `index.html` (`#tab-progress` セクションの中身)
- Create: `js/progress.js`
- Modify: `index.html` の `<script>` 読み込みに `js/progress.js` を追加
- Modify: `js/app.js` (タブ切り替え時に `renderProgressTab()` を呼ぶ)

**Interfaces:**
- Consumes: `STAGES`, `getLettersByStage(stageId)` (Task 2), `getStageStats(letterIds)`, `resetProgress()` (Task 3)
- Produces: `renderProgressTab()` — 進捗タブのDOM構築とリセットボタンのイベント設定を行う

- [ ] **Step 1: `index.html` の `#tab-progress` を書き換え、スクリプト読み込みを追加する**

```html
<section id="tab-progress" class="tab-section" data-tab-section="progress" hidden>
  <div class="progress-list" id="progress-list"></div>
  <button id="reset-progress-button" class="reset-button">進捗をリセット</button>
</section>
```

`<script src="js/writing.js"></script>` の直後に以下を追加する。

```html
<script src="js/progress.js"></script>
```

- [ ] **Step 2: `js/progress.js` を作成する**

```js
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
```

- [ ] **Step 3: `js/app.js` のタブ切り替えで進捗描画を呼び出す**

```js
if (targetTab === 'progress') {
  renderProgressTab();
}
```

- [ ] **Step 4: `style.css` に進捗画面のスタイルを追加する**

```css
.progress-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-row {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}

.progress-row:last-child {
  border-bottom: none;
}

.progress-label {
  font-weight: bold;
}

.progress-detail {
  color: #666;
  font-size: 0.85rem;
  margin-top: 4px;
}

.reset-button {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #ff3b30;
  color: #fff;
  font-size: 1rem;
}
```

- [ ] **Step 5: ブラウザで手動確認する**

`index.html` を開き、クイズタブでいくつか回答してから「進捗」タブに切り替えて以下を確認する。
- 4段階それぞれの正解数/回答数と正答率が表示される
- クイズで回答した内容が正しく反映されている
- 「進捗をリセット」を押すと確認ダイアログが出て、OKを押すとすべて0にリセットされる
- リセット後にページをリロードしても0のままである（localStorageからも消えていることの確認）

- [ ] **Step 6: コミットする**

```bash
git add index.html js/progress.js js/app.js style.css
git commit -m "feat: implement progress tab with stage stats and reset"
```

---

## Task 9: 全体の結合確認とモバイルレイアウト調整

**Files:**
- Modify: `style.css` (必要な微調整のみ)

**Interfaces:**
- Consumes: Task 1〜8で実装した全モジュール
- Produces: なし（結合確認と微調整のタスク）

- [ ] **Step 1: 一連の操作フローを手動確認する**

`index.html` をブラウザで開き（可能であればスマートフォン実機、またはPCブラウザの開発者ツールでデバイスモードにして375px幅程度で）、以下の流れを通しで確認する。

1. 学習タブで「基本母音」の字母カードをいくつかタップし、発音が再生されることを確認する
2. クイズタブに切り替え、「基本母音」で数問回答する（字母→発音、発音→字母の両方が出ることを確認）
3. 書き取りタブに切り替え、いくつかの字母をなぞり書きし、「次の字母へ」で切り替わることを確認する
4. 進捗タブに切り替え、クイズの回答結果が反映されていることを確認する
5. ブラウザをリロードし、進捗が保持されていることを確認する
6. 「基本子音」「濃音」「複合母音」についても学習タブとクイズタブで一通り確認する

- [ ] **Step 2: レイアウト崩れがあれば `style.css` を微調整する**

375px幅で以下を目視確認し、崩れがあれば該当箇所の `style.css` を調整する。
- タブバーの文字や余白が窮屈すぎないか
- クイズの4択ボタンが画面幅に収まっているか
- 書き取りタブのCanvas（300x300px）が画面幅に収まっているか（収まらない場合は `#writing-canvas` に `max-width: 100%; height: auto;` を追加する）
- 学習タブのカードグリッドが極端に小さくならないか

- [ ] **Step 3: 最終コミットする**

```bash
git add -A
git commit -m "chore: final integration check and mobile layout polish"
```

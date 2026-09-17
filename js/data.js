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
  { id: 'v-ae', char: 'ㅐ', romanization: 'ae', stage: 'vowel_compound', soundKey: 'e', desc: '日本語の「エ」に近い音（ㅔとほぼ同じ発音）。' },
  { id: 'v-yae', char: 'ㅒ', romanization: 'yae', stage: 'vowel_compound', soundKey: 'ye', desc: '「イェ」に近い音。' },
  { id: 'v-e', char: 'ㅔ', romanization: 'e', stage: 'vowel_compound', soundKey: 'e', desc: '日本語の「エ」に近い音（ㅐとほぼ同じ発音）。' },
  { id: 'v-ye', char: 'ㅖ', romanization: 'ye', stage: 'vowel_compound', soundKey: 'ye', desc: '「イェ」に近い音。' },
  { id: 'v-wa', char: 'ㅘ', romanization: 'wa', stage: 'vowel_compound', desc: '日本語の「ワ」に近い音。' },
  { id: 'v-wae', char: 'ㅙ', romanization: 'wae', stage: 'vowel_compound', soundKey: 'we', desc: '「ウェ」に近い音。' },
  { id: 'v-oe', char: 'ㅚ', romanization: 'oe', stage: 'vowel_compound', soundKey: 'we', desc: '「ウェ」に近い音（現代韓国語ではㅙとほぼ同じ発音）。' },
  { id: 'v-wo', char: 'ㅝ', romanization: 'wo', stage: 'vowel_compound', desc: '「ウォ」に近い音。' },
  { id: 'v-we', char: 'ㅞ', romanization: 'we', stage: 'vowel_compound', soundKey: 'we', desc: '「ウェ」に近い音。' },
  { id: 'v-wi', char: 'ㅟ', romanization: 'wi', stage: 'vowel_compound', desc: '「ウィ」に近い音。' },
  { id: 'v-ui', char: 'ㅢ', romanization: 'ui', stage: 'vowel_compound', desc: '「ウィ」と「ウ」の中間のような音（位置により発音が変わる）。' },
];

const ALL_LETTERS = [].concat(VOWELS_BASIC, CONSONANTS_BASIC, CONSONANTS_TENSE, VOWELS_COMPOUND);

function getLettersByStage(stageId) {
  return ALL_LETTERS.filter(letter => letter.stage === stageId);
}

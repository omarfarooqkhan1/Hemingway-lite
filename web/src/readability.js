import readability from "text-readability";

export function analyzeText(text) {
  const clean = text || "";
  let grade = "—";
  try {
    grade = readability.textStandard(clean);
  } catch (e) {
    grade = "—";
  }
  const wordCount = readability.lexiconCount(clean, true);
  const charCount = readability.charCount(clean, true);
  const wordsPerMinute = 200;
  const readTimeMinutes =
    wordCount === 0 ? 0 : Math.max(1, Math.round(wordCount / wordsPerMinute));

  return { grade, wordCount, charCount, readTimeMinutes };
}

const ADVERB_RE = /\b\w+ly\b/gi;
const PASSIVE_RE = /\b(?:is|was|were|be|been|being|are)\s+\w+(?:ed|ing)\b/gi;

export function computeHighlights(text) {
  const highlights = [];
  const src = text || "";

  let adverbMatches = [];
  ADVERB_RE.lastIndex = 0;
  let m;
  while ((m = ADVERB_RE.exec(src)) !== null) {
    adverbMatches.push({ from: m.index, to: m.index + m[0].length });
  }

  let passiveMatches = [];
  PASSIVE_RE.lastIndex = 0;
  while ((m = PASSIVE_RE.exec(src)) !== null) {
    passiveMatches.push({ from: m.index, to: m.index + m[0].length });
  }

  const sentences = src.split(/[.!?]+/).filter(s => s.trim().length > 10);
  let pos = 0;
  let sentenceMatches = [];
  
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    const wc = words.length;
    
    if (wc > 15 && wc <= 25) {
      sentenceMatches.push({ from: pos, to: pos + sentence.length + 1, type: "hard" });
    } else if (wc > 25) {
      sentenceMatches.push({ from: pos, to: pos + sentence.length + 1, type: "very-hard" });
    }
    pos += sentence.length + 1;
  }

  const allMatches = [...adverbMatches, ...passiveMatches, ...sentenceMatches];
  
  allMatches.sort((a, b) => a.from - b.from);
  
  for (const match of allMatches) {
    const existing = highlights.find(h => 
      h.from <= match.from && match.to <= h.to
    );
    if (!existing) {
      highlights.push({
        from: match.from,
        to: match.to,
        type: match.type || "adverb"
      });
    }
  }

  return highlights;
}
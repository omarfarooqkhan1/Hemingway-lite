import React, { useEffect, useState } from "react";
import { analyzeText, computeHighlights } from "./readability.js";

const isElectron = !!window.api;

function App() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    grade: "—",
    words: 0,
    chars: 0,
    readTime: 0
  });
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    const s = analyzeText(text);
    setStats({
      grade: s.grade,
      words: s.wordCount,
      chars: s.charCount,
      readTime: s.readTimeMinutes
    });
    setHighlights(computeHighlights(text));
  }, [text]);

  const handleNew = () => {
    setText("");
  };

  const handleOpen = async () => {
    if (!isElectron) {
      alert("Open file is only available in the desktop app.");
      return;
    }
    const res = await window.api.openFile();
    if (res) {
      setText(res.content);
    }
  };

  const handleSave = async () => {
    if (!isElectron) {
      // Web: download as .txt
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.txt";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    await window.api.saveAs({ content: text, defaultPath: "document.txt" });
  };

  const handleExportHtml = async () => {
    const html = `<html><body><pre>${escapeHtml(text)}</pre></body></html>`;
    if (!isElectron) {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.html";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    await window.api.saveAs({
      content: html,
      defaultPath: "document.html"
    });
  };

  const tokens = applyHighlightsToTokens(text, highlights);

  return (
    <div className="app">
      <header className="top-bar">
        <div className="left">
          <button onClick={handleNew}>New</button>
          <button onClick={handleOpen}>Open</button>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleExportHtml}>Export HTML</button>
        </div>
        <div className="right">
          <span>Grade: {stats.grade}</span>
          <span>Words: {stats.words}</span>
          <span>Chars: {stats.chars}</span>
          <span>Read time: {stats.readTime} min</span>
        </div>
      </header>
      <main className="editor-layout">
        <section className="editor-pane">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck="true"
          />
        </section>
        <section className="preview-pane">
          <div className="preview-content">
            {tokens.map((t, idx) => (
              <span key={idx} className={t.className || ""}>
                {t.text}
              </span>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer">
        <span>
          Hemingway‑style offline editor • Desktop app has full file access,
          web version keeps everything in your browser.
        </span>
      </footer>
    </div>
  );
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applyHighlightsToTokens(text, highlights) {
  if (!text || highlights.length === 0) {
    return [{ text, className: "" }];
  }

  const sortedHighlights = [...highlights].sort((a, b) => a.from - b.from);
  const parts = [];
  let lastEnd = 0;

  for (const highlight of sortedHighlights) {
    if (highlight.from > lastEnd) {
      parts.push({
        text: text.slice(lastEnd, highlight.from),
        className: ""
      });
    }
    
    const className = highlight.type === "adverb" 
      ? "hl-adverb"
      : highlight.type === "passive" 
      ? "hl-passive" 
      : highlight.type === "hard" 
      ? "hl-hard" 
      : "hl-very-hard";
      
    parts.push({
      text: text.slice(highlight.from, highlight.to),
      className
    });
    
    lastEnd = Math.max(lastEnd, highlight.to);
  }

  if (lastEnd < text.length) {
    parts.push({
      text: text.slice(lastEnd),
      className: ""
    });
  }

  return parts;
}

export default App;

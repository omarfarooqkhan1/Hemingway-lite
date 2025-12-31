import React, { useEffect, useState } from "react";
import { analyzeText, computeHighlights } from "./readability.js";

const isElectron = !!window.api;

function App() {
  const [text, setText] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState(null); // Track current file path
  const [stats, setStats] = useState({
    grade: "—",
    words: 0,
    chars: 0,
    readTime: 0
  });
  const [highlights, setHighlights] = useState([]);

  // Load text from localStorage on initial render
  useEffect(() => {
    const savedText = localStorage.getItem('hemingway-lite-text');
    if (savedText) {
      setText(savedText);
    }
  }, []);

  // Autosave text to localStorage every 30 seconds
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      localStorage.setItem('hemingway-lite-text', text);
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(autosaveInterval);
  }, [text]);

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
    // Clear autosaved text from localStorage
    localStorage.removeItem('hemingway-lite-text');
  };

  const handleManualSave = () => {
    // Manually save the current text to localStorage
    localStorage.setItem('hemingway-lite-text', text);
    // Show a confirmation message
    alert('Document saved to browser storage!');
  };

  const handleSaveToFile = async () => {
    if (!isElectron) {
      // For web version, just trigger the download
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFilePath ? currentFilePath.split('/').pop() : "document.txt";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    
    // If we have a current file path, save to that path; otherwise prompt for save as
    if (currentFilePath) {
      await window.api.saveFile({ content: text, filePath: currentFilePath });
      alert(`Saved to: ${currentFilePath}`);
    } else {
      const result = await window.api.saveAs({ content: text, defaultPath: "document.txt" });
      if (result) {
        setCurrentFilePath(result); // Set the current file path after saving
        alert(`Saved as: ${result}`);
      }
    }
  };

  const handleOpen = async () => {
    if (!isElectron) {
      alert("Open file is only available in the desktop app.");
      return;
    }
    const res = await window.api.openFile();
    if (res) {
      setText(res.content);
      setCurrentFilePath(res.filePath); // Set the current file path
    }
  };

  // Old save function - removing since we now have specific Save and Save As functions

  const handleSaveAs = async () => {
    if (!isElectron) {
      // Web: download as .txt (same as before)
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.txt";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    
    const result = await window.api.saveAs({ content: text, defaultPath: "document.txt" });
    if (result) {
      setCurrentFilePath(result); // Set the current file path after saving
    }
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
          <button onClick={handleManualSave}>Save Now</button>
          <button onClick={handleOpen}>Open</button>
          <button onClick={handleSaveToFile}>Save</button>
          <button onClick={handleSaveAs}>Save As</button>
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
          Hemingway‑style offline editor • Desktop app has full file access (Save/Save As),
          web version keeps everything in your browser. Your work is autosaved every 30 seconds.
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

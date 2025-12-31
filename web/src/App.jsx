import React, { useEffect, useState } from "react";
import { analyzeText, computeHighlights } from "./readability.js";
import { escapeHtml } from "./utils/helpers.js";
import Toolbar from "./components/Toolbar.jsx";
import EditorArea from "./components/EditorArea.jsx";
import Footer from "./components/Footer.jsx";
import { useFileOperations } from "./hooks/useFileOperations.js";

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

  const { handleNew, handleOpen, handleSaveToFile, handleSaveAs, handleExportHtml: createHandleExportHtml } = useFileOperations(
    text,
    setText,
    isElectron,
    currentFilePath,
    setCurrentFilePath
  );
  
  const handleExportHtml = () => createHandleExportHtml(escapeHtml);

  return (
    <div className="app">
      <Toolbar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSaveToFile}
        onSaveAs={handleSaveAs}
        onExportHtml={handleExportHtml}
        stats={stats}
      />
      <EditorArea
        text={text}
        onChange={(e) => setText(e.target.value)}
        highlights={highlights}
      />
      <Footer />
    </div>
  );
}

export default App;

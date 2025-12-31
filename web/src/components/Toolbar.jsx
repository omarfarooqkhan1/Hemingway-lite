import React from "react";

const Toolbar = ({ 
  onNew, 
  onOpen, 
  onSave, 
  onSaveAs, 
  onExportHtml,
  stats
}) => {
  return (
    <header className="top-bar">
      <div className="left">
        <button onClick={onNew}>New</button>
        <button onClick={onOpen}>Open</button>
        <button onClick={onSave}>Save</button>
        <button onClick={onSaveAs}>Save As</button>
        <button onClick={onExportHtml}>Export HTML</button>
      </div>
      <div className="right">
        <span>Grade: {stats.grade}</span>
        <span>Words: {stats.words}</span>
        <span>Chars: {stats.chars}</span>
        <span>Read time: {stats.readTime} min</span>
      </div>
    </header>
  );
};

export default Toolbar;
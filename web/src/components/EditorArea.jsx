import React from "react";
import { applyHighlightsToTokens } from "../utils/helpers.js";

const EditorArea = ({ text, onChange, highlights }) => {
  const tokens = applyHighlightsToTokens(text, highlights);

  return (
    <main className="editor-layout">
      <section className="editor-pane">
        <textarea
          value={text}
          onChange={onChange}
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
  );
};

export default EditorArea;
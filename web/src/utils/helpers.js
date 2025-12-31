// Utility functions for the application

export function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Helper function to apply highlights to tokens
export function applyHighlightsToTokens(text, highlights) {
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
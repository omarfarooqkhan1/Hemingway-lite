// Custom hook for file operations
export const useFileOperations = (text, setText, isElectron, currentFilePath, setCurrentFilePath) => {
  const handleNew = () => {
    setText("");
    // Clear autosaved text from localStorage
    localStorage.removeItem('hemingway-lite-text');
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

  const handleExportHtml = async (escapeHtmlFunc) => {
    const html = `<html><body><pre>${escapeHtmlFunc(text)}</pre></body></html>`;
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

  return {
    handleNew,
    handleOpen,
    handleSaveToFile,
    handleSaveAs,
    handleExportHtml: (escapeHtml) => handleExportHtml(escapeHtml)
  };
};
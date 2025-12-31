const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../web/dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// File operations
ipcMain.handle("file:open", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      { name: "Text/Markdown/HTML", extensions: ["txt", "md", "html"] }
    ],
    properties: ["openFile"]
  });

  if (canceled || !filePaths[0]) return null;
  const filePath = filePaths[0];
  const content = fs.readFileSync(filePath, "utf8");
  return { filePath, content };
});

ipcMain.handle("file:saveAs", async (_event, { content, defaultPath }) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    defaultPath: defaultPath || "untitled.txt",
    filters: [
      { name: "Text", extensions: ["txt"] },
      { name: "Markdown", extensions: ["md"] },
      { name: "HTML", extensions: ["html"] }
    ]
  });

  if (canceled || !filePath) return null;

  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
});

ipcMain.handle("file:save", async (_event, { content, filePath }) => {
  if (!filePath) return null;

  try {
    fs.writeFileSync(filePath, content, "utf8");
    return filePath;
  } catch (error) {
    console.error("Error saving file:", error);
    return null;
  }
});
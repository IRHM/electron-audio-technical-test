const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Register ipc listener for get-displays
  ipcMain.handle("get-displays", async () => {
    return screen.getAllDisplays();
  });

  // Move app to another display
  ipcMain.on("change-display", async (_, id) => {
    const disp = screen.getAllDisplays().filter((e) => e.id === Number(id))[0];

    if (disp) {
      // Set window to middle of display
      const winBounds = win.getBounds();
      win.setBounds({
        x: disp.bounds.x + disp.bounds.width / 2 - winBounds.width / 2,
        y: disp.bounds.y + disp.bounds.height / 2 - winBounds.height / 2,
      });
    } else {
      console.error("Couldn't find display");
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

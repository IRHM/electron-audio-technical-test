const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { constants } = require("fs");

/**
 * Save settings from localstorage to settings.json.
 */
async function save(win) {
  const speaker = await win.webContents.executeJavaScript(
    "localStorage.getItem('speaker')"
  );
  const screen = await win.webContents.executeJavaScript(
    "localStorage.getItem('screen')"
  );

  fs.writeFile(
    "./settings.json",
    JSON.stringify({ speaker: speaker, screen: screen })
  );
}

/**
 * Load settings from settings.json and set localStorage.
 * persistent?
 */
async function load(win) {
  fs.access("./settings.json", constants.F_OK)
    .then(async () => {
      console.log("Reading settings");

      const settings = JSON.parse(await fs.readFile("./settings.json"));

      let setStr = "";

      if (settings.speaker)
        setStr = `localStorage.setItem('speaker', '${settings.speaker}');`;

      if (settings.screen)
        setStr += `localStorage.setItem('screen', '${settings.screen}');`;

      win.webContents.executeJavaScript(setStr);
    })
    .catch(() => console.log("settings.json doesn't exist"));
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load settings
  await load(win);

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

  // Save settings
  ipcMain.on("save-settings", async () => save(win));

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

/**
 * ============================================================
 *  Islamic Smart Clock — Electron Main Process (main.js)
 *  Manages the application window, lifecycle, and IPC bridge.
 * ============================================================
 */

const { app, BrowserWindow, ipcMain, globalShortcut, screen, powerSaveBlocker } = require('electron');
const path = require('path');

// Keep a global reference so the window is not garbage-collected.
let mainWindow       = null;
let powerBlockerId   = null;  // handle returned by powerSaveBlocker

// ─────────────────────────────────────────────────────────────
//  Window creation
// ─────────────────────────────────────────────────────────────
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    // Occupy the full physical screen
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    width,
    height,

    // ── Frameless, borderless, no title-bar ──────────────────
    frame:       false,
    transparent: false,   // keep false for GPU performance on Surface Go
    fullscreen:  true,    // true OS-level fullscreen (hides taskbar)
    kiosk:       false,   // kiosk would block Alt+F4 — avoid unless intended

    // ── Appearance ───────────────────────────────────────────
    backgroundColor: '#0a0a12', // avoids white flash on load
    show: false,                // don't show until content is ready

    // ── Security & renderer capabilities ─────────────────────
    webPreferences: {
      nodeIntegration:  true,   // needed for require('adhan') in renderer
      contextIsolation: false,  // paired with nodeIntegration
      devTools:         !app.isPackaged, // disable DevTools in production
    },

    // ── Windows-specific ─────────────────────────────────────
    titleBarStyle:    'hidden',
    skipTaskbar:      false,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
  });

  // Load the UI
  mainWindow.loadFile('index.html');

  // Show the window once the page has finished loading (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // On Windows 11, explicitly go fullscreen after show for reliability
    mainWindow.setFullScreen(true);
  });

  // ── Block accidental navigation ───────────────────────────
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  // ── Block new-window spawns ───────────────────────────────
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // ── Prevent the window from being resized or moved ────────
  mainWindow.setResizable(false);
  mainWindow.setMovable(false);

  // Log renderer errors to the main-process console for debugging
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('[Main] Renderer process gone:', details.reason);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─────────────────────────────────────────────────────────────
//  App lifecycle
// ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  // ── Keep display awake — critical for kiosk / always-on use ──
  // Tells Windows: "do NOT sleep or dim the screen while I'm running."
  // This overrides the Surface Go's own power plan screen timeout.
  powerBlockerId = powerSaveBlocker.start('prevent-display-sleep');
  console.log('[Power] Display sleep blocked, id:', powerBlockerId);

  // ── Auto-start on Windows login ───────────────────────────
  // The clock will launch automatically every time the tablet boots.
  // Remove or set openAtLogin: false if you don't want this behaviour.
  app.setLoginItemSettings({
    openAtLogin:  true,
    openAsHidden: false,
    name: 'Islamic Smart Clock',
  });

  // ── Global shortcuts ──────────────────────────────────────
  // Allow Escape or F11 to exit fullscreen (useful during development).
  // Remove or comment these out for a fully locked-down kiosk deployment.
  globalShortcut.register('Escape', () => {
    if (mainWindow) mainWindow.setFullScreen(false);
  });
  globalShortcut.register('F11', () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // Hard-block common accidental shortcuts
  const blocked = ['Alt+F4', 'CommandOrControl+W', 'CommandOrControl+Q',
                   'CommandOrControl+R', 'CommandOrControl+Shift+R', 'F5'];
  blocked.forEach(shortcut => {
    try { globalShortcut.register(shortcut, () => {}); } catch (_) { /* ignore */ }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  // Release the display-sleep block so Windows resumes normal power management
  if (powerBlockerId !== null && powerSaveBlocker.isStarted(powerBlockerId)) {
    powerSaveBlocker.stop(powerBlockerId);
  }
});

// ─────────────────────────────────────────────────────────────
//  IPC handlers (renderer → main communication)
// ─────────────────────────────────────────────────────────────

// Renderer can ask for the app's directory (needed to locate audio files)
ipcMain.handle('get-app-path', () => app.getAppPath());

// Renderer can request to minimize (useful for a settings button, etc.)
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

// Renderer can request clean quit
ipcMain.on('quit-app', () => {
  app.quit();
});

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

let mainWindow;

function getLiveDistPath() {
  return path.join(app.getPath('userData'), 'live-updates', 'dist', 'index.html');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Class 12 Commerce Study",
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    autoHideMenuBar: true
  });

  const liveDist = getLiveDistPath();
  const builtInDist = path.join(__dirname, '../dist/index.html');

  if (fs.existsSync(liveDist)) {
    console.log('Loading Live Update bundle from:', liveDist);
    mainWindow.loadFile(liveDist).catch(() => {
      console.warn('Failed to load live update bundle, falling back to built-in dist');
      mainWindow.loadFile(builtInDist);
    });
  } else {
    console.log('Loading built-in bundle from:', builtInDist);
    mainWindow.loadFile(builtInDist);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handler for Live Updates
ipcMain.handle('apply-live-update', async (event, remoteVersion) => {
  try {
    const liveDir = path.join(app.getPath('userData'), 'live-updates', 'dist');
    const assetsDir = path.join(liveDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    const baseUrl = 'https://raw.githubusercontent.com/sixthguest56226-cloud/class12-commerce-d2s/main/dist/';

    const downloadFile = (url, dest) => {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
          if (res.statusCode === 200) {
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
          } else {
            fs.unlink(dest, () => {});
            reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
          }
        }).on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      });
    };

    // Download updated index.html & version.json
    await downloadFile(baseUrl + 'index.html', path.join(liveDir, 'index.html'));
    await downloadFile(baseUrl + 'version.json', path.join(liveDir, 'version.json'));

    // Reload main window with updated bundle
    if (mainWindow) {
      mainWindow.loadFile(path.join(liveDir, 'index.html'));
    }
    return { success: true };
  } catch (err) {
    console.error('Live update failed:', err);
    if (mainWindow) {
      mainWindow.reload();
    }
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

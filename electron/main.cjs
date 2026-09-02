const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

let mainWindow;

function getLiveDistDir() {
  return path.join(app.getPath('userData'), 'live-updates', 'dist');
}

function getLiveDistPath() {
  return path.join(getLiveDistDir(), 'index.html');
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
    mainWindow.loadFile(liveDist).catch((err) => {
      console.warn('Failed to load live update bundle, falling back to built-in dist:', err);
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

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      } else {
        fs.unlink(dest, () => {});
        reject(new Error(`Failed ${url}: status ${res.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

// IPC Handler for Live OTA Bundle Updates
ipcMain.handle('apply-live-update', async (event, remoteVersion) => {
  try {
    const liveDir = getLiveDistDir();
    const assetsDir = path.join(liveDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    const baseUrl = 'https://sixthguest56226-cloud.github.io/class12-commerce-d2s/';

    // 1. Fetch latest index.html
    const htmlContent = await fetchText(baseUrl + 'index.html');
    
    // 2. Parse JS/CSS asset filenames inside index.html
    const assetMatches = Array.from(htmlContent.matchAll(/(?:href|src)=["']\.\/assets\/([^"']+)["']/g)).map(m => m[1]);

    // 3. Download all referenced asset files into live-updates/dist/assets/
    for (const assetFile of assetMatches) {
      const assetUrl = baseUrl + 'assets/' + assetFile;
      const assetDest = path.join(assetsDir, assetFile);
      await downloadUrl(assetUrl, assetDest);
    }

    // 4. Save updated index.html and version.json
    fs.writeFileSync(path.join(liveDir, 'index.html'), htmlContent, 'utf8');
    await downloadUrl(baseUrl + 'version.json', path.join(liveDir, 'version.json'));

    // 5. Activate the new bundle in BrowserWindow
    if (mainWindow) {
      await mainWindow.loadFile(path.join(liveDir, 'index.html'));
    }
    return { success: true };
  } catch (err) {
    console.error('Electron OTA Live update failed:', err);
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

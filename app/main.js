import i18n from './configs/i18next.config';
import { app, BrowserWindow, ipcMain, Menu, webContents } from 'electron';
import { installExtensions } from '../gui-common/debug';
import { setupMainWindow } from '../gui-common/windows';
import { rebuildMenus } from './main/menus';
import settings from './shared/settings';
import {
  closeWebsocket,
  runWebSocket,
  sendKeys,
  sendTouch,
  SAUCE_IPC_TYPES,
} from './main/sauce';

let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  require('electron-debug')(); // eslint-disable-line global-require
}

app.on('window-all-closed', () => {
  app.quit();
});

/**
 * Sauce Labs Websocket for live testing
 */
ipcMain.on(SAUCE_IPC_TYPES.RUN_WS, runWebSocket);
ipcMain.on(SAUCE_IPC_TYPES.CLOSE_WS, closeWebsocket);
ipcMain.on(SAUCE_IPC_TYPES.WS_SEND_KEY, sendKeys);
ipcMain.on(SAUCE_IPC_TYPES.WS_SEND_TOUCH, sendTouch);

app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 800,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  const splashWindow = new BrowserWindow({
    width: 300,
    height: 300,
    minWidth: 300,
    minHeight: 300,
    frame: false,
  });

  setupMainWindow({
    mainWindow,
    splashWindow,
    mainUrl: `file://${__dirname}/index.html`,
    splashUrl: `file://${__dirname}/splash.html`,
    isDev,
    Menu,
    i18n,
    rebuildMenus,
    settings,
    webContents,
  });
});

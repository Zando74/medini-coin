const {
  app,
  BrowserWindow
} = require('electron')
const url = require("url");
const path = require("path");
let appWindow
function initWindow() {
  appWindow = new BrowserWindow({
    width: 1450,
    height: 900,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, `/dist/favicon.ico`),
  })
  // Electron Build Path
  appWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  appWindow.removeMenu()
  // Initialize the DevTools.
  appWindow.on('closed', function () {
    appWindow = null
  })
}
app.on('ready', initWindow)
// Close when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  if (win === null) {
    initWindow()
  }
})
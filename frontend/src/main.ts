import { app, BrowserWindow, Menu } from "electron";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from "electron-devtools-installer";
import isDev from "electron-is-dev";
import { ipcMain } from "electron";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:4000";
const isMac = process.platform === "darwin" ? true : false;
let mainWindow: BrowserWindow | null;
const createMainWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadURL(
    isDev ? "http://localhost:9000" : `file://${app.getAppPath()}/index.html`
  );
  // mainWindow.loadURL(`file://${app.getAppPath()}/index.html`);
  if (isDev)
    installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]).catch((err) =>
      console.log("Error loading React DevTools: ", err)
    ); //install devtools
  // menu
  const mainMenu = Menu.buildFromTemplate(menu as any);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => (mainWindow = null));
};
const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    role: "fileMenu",
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

app.on("ready", createMainWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Stop error
app.allowRendererProcessReuse = true;

// events
ipcMain.on("auth:signup", async (data) => {
  try {
    await axios.post("/api/users/signup", data);
  } catch (error) {
    alert(`Error:${error}`);
  }
  ipcMain.emit("auth:signup", null, null);
});

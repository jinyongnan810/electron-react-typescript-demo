import { app, BrowserWindow, Menu, Notification } from "electron";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from "electron-devtools-installer";
import isDev from "electron-is-dev";
import { ipcMain } from "electron";
import axios from "axios";
import * as url from "url"
import path from "path"
axios.defaults.baseURL = "http://localhost:5000";
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
    isDev ? "http://localhost:4000" : url.format({
      pathname: path.join(__dirname, 'renderer/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );
  if (isDev)
    installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]).catch((err) =>
      console.log("Error loading React DevTools: ", err)
    ); //install devtools
  // menu
  const mainMenu = Menu.buildFromTemplate(menu as any);
  Menu.setApplicationMenu(mainMenu);
  new Notification({
    title: "Welcome",
    body: "App started."
  }).show()
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


const jsonConfig = {
  headers: {
    'Content-Type': 'application/json'
  }
}
// events
ipcMain.on("auth:signup", async (event,arg) => {
  try {
    const res = await axios.post("/api/users/signup", arg, jsonConfig);
    // ipcMain.emit("auth:signup", null, res.data);
    event.reply("auth:signup",{error:null,data:res.data})
  } catch (error) {
    console.log(`Error:${JSON.stringify(error)}`);
    // ipcMain.emit("auth:signup", error, null);
    event.reply("auth:signup",{error:error,data:null})
  }

});

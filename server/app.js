const {app, BrowserWindow, Menu, globalShortcut} = require('electron');
// const database = require('./database.js');
const CWD = 'file://' + process.cwd();
let window;

app.on('ready', createWindow);
// database.connect();
// app.on('will-quit', database.close);

// Create the browser window.
function createWindow(){
    Menu.setApplicationMenu(null);

    window = new BrowserWindow({
        title: 'TrainGod',
        backgroundColor: '#84290A',
        show: false,
        width: 1024,
        height: 768,
        minWidth: 320,
        minHeight: 240,
        webPreferences: {devTools: true},
        icon: CWD + '/img/icon.ico'
    });

    globalShortcut.register('F12', () => window.toggleDevTools());
    window.loadURL(CWD + '/html/index.html');
    window.once('ready-to-show', () =>{
        // window.maximize();
        window.show();
        window.focus();
    });

    window.on('closed', () => window = null);
}

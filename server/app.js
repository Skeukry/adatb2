const {app, BrowserWindow, Menu, globalShortcut} = require('electron');
const database = require('./database');
const CWD = 'file://' + process.cwd();
let window;

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());
database.connect();

// Create the browser window.
function createWindow(){
    console.log(CWD);
    Menu.setApplicationMenu(null);

    window = new BrowserWindow({
        title: 'TrainGod',
        backgroundColor: '#94312c',
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

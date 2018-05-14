const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const database = require('./database.js');
const CLIENT = process.cwd() + '/client';
let window;


database.connect();
app.on('ready', createWindow);
app.on('window-all-closed', () => database.close(err =>{
    if(!err) app.quit();
}));
ipcMain.on('update', database.update);


// Create the browser window.
function createWindow(){
    Menu.setApplicationMenu(null);
    app.setName('TrainGod');

    window = new BrowserWindow({
        title: 'TrainGod',
        backgroundColor: '#842907',
        show: false,
        width: 1024,
        height: 768,
        minWidth: 640,
        minHeight: 480,
        webPreferences: {devTools: true},
        icon: `${CLIENT}/img/icon.png`
    });

    window.loadURL(`file://${CLIENT}/html/index.html`);

    window.once('ready-to-show', () =>{
        // window.maximize();
        window.show();
        window.focus();
    });

    window.on('closed', () => window = null);
}

const {app, BrowserWindow, Menu, globalShortcut, ipcMain} = require('electron');
const database = require('child_process').fork('server/database.js');
const CWD = process.cwd();
const FILE_PATH = 'file://' + CWD;
let window;

database.send('connect');
app.on('ready', createWindow);
app.on('window-all-closed', handleClose);

ipcMain.on('update', ()=>{
    console.log('BUTTON CLICKED');
});


// Create the browser window.
function createWindow(){
    Menu.setApplicationMenu(null);
    app.setName('TrainGod');

    window = new BrowserWindow({
        title: 'TrainGod',
        backgroundColor: '#84290A',
        show: false,
        width: 1024,
        height: 768,
        minWidth: 640,
        minHeight: 480,
        webPreferences: {devTools: true},
        nodeIntegration: false,
        icon: CWD + '/img/icon.png'
    });

    window.loadURL(FILE_PATH + '/html/index.html');
    globalShortcut.register('F12', () => window.toggleDevTools());

    window.once('ready-to-show', () =>{
        // window.maximize();
        window.show();
        window.focus();
    });

    window.on('closed', () => window = null);
}

function handleClose(){
    let force = null;
    database.send('close');

    Promise.race([
        new Promise(res => database.on('exit', res)),
        new Promise(res =>{
            force = setTimeout(() =>{
                database.kill('SIGTERM');
                res();
            }, 1000);
        }).then(() => new Promise(res =>{
            force = setTimeout(() =>{
                database.kill('SIGINT');
                res();
            }, 1000);
        })).then(() => new Promise((res, rej) =>{
            force = setTimeout(rej, 1000);
        }))
    ]).then(() =>{
        clearTimeout(force);
        app.quit();
    }).catch(() =>{
        console.log('Failed to quit automatically.');
    });
}

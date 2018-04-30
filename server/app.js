const {app, BrowserWindow, Menu, globalShortcut} = require('electron');
const database = require('child_process').fork('server/database.js');
const CWD = 'file://' + process.cwd();
let window;

app.on('ready', createWindow);

database.send('connect');
app.on('window-all-closed', () =>{
    let force = null;
    console.log('PEACEFUL');
    database.send('close');

    // FUCK THIS SHIT ~Feca at 5.32AM
    Promise.race([
        new Promise(res => database.on('exit', res)),
        new Promise(res =>{
            force = setTimeout(() =>{
                console.log('HARSH');
                database.kill('SIGTERM');
                res();
            }, 1000);
        }).then(() => new Promise(res =>{
            force = setTimeout(() =>{
                console.log('BRUTAL');
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
});


// Create the browser window.
function createWindow(){
    Menu.setApplicationMenu(null);
    app.setName("TrainGod");

    window = new BrowserWindow({
        title: 'TrainGod',
        backgroundColor: '#84290A',
        show: false,
        width: 1024,
        height: 768,
        minWidth: 320,
        minHeight: 240,
        webPreferences: {devTools: true},
        icon: __dirname + '/train.png'
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

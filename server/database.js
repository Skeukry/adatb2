const crypto = require('crypto');
const fs = require('fs');
const config = require('./config.json');
let client;


module.exports = {
    connect: () =>{
        client = require('child_process').fork('server/oracle_client.js');
        client.send({
            type: 'connect', config: {
                user: config.user,
                password: config.pass,
                connectString: `${config.host}:${config.port}/XE`
            }
        });
    },

    close: handleClose,

    onData: cb => client.on('message', cb),
    sendData: data => client.send({type: 'data', data: data})
};

// Force closes the database client if needed
function handleClose(cb){
    let force = null;

    client.send('close');

    new Promise(res =>{
        force = setTimeout(() =>{
            client.kill('SIGTERM');
            res();
        }, 1000);
    }).then(() => new Promise(res =>{
        force = setTimeout(() =>{
            client.kill('SIGINT');
            res();
        }, 1000);
    })).then(() =>{
        force = setTimeout(() =>{
            console.log('Failed to quit automatically.');
            cb(true);
        }, 1000);
    });

    client.on('exit', () =>{
        clearTimeout(force);
        cb(false);
    });
}

// function createLog(name, data){
//     fs.mkdir('log', err =>{
//         if(err && err.code !== 'EEXIST') return;
//         fs.writeFile('log/' + name, data, err =>{});
//     });
// }

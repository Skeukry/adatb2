const crypto = require('crypto');
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

    close: handleClose
};


// Generates a v4 UUID
function UUID(){
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.randomBytes(1)[0] & 15>>c / 4).toString(16)
    );
}

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

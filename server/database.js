const oracledb = require('oracledb');
const crypto = require('crypto');
const config = require('./config.json');

const dbConfig = {
    user: config.user,
    password: config.pass,
    connectString: `${config.host}:${config.port}/XE`
};
const FG_GREEN = '\x1b[32m%s\x1b[0m';
let connection;


process.on('message', msg =>{
    switch(msg){
        case 'connect':
            oracledb.getConnection(dbConfig).then(c =>{
                connection = c;
                console.log(FG_GREEN, 'Connected to Oracle database');
            }).catch(console.log);
            break;

        case 'close':
            if(connection) connection.close();
            connection = null;
            process.disconnect();
            break;
    }
});

function UUID(){
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.randomBytes(1)[0] & 15>>c / 4).toString(16)
    );
}

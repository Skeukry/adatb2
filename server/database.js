const oracledb = require('oracledb');
const config = require('./config.json');

const dbConfig = {
    user: config.user,
    password: config.pass,
    connectString: `${config.host}:${config.port}/XE`
};
const FG_GREEN = "\x1b[32m%s\x1b[0m";
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

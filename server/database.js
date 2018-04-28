const oracledb = require('oracledb');
const config = require('./config.json');
const dbConfig = {
    user: config.user,
    password: config.pass,
    connectString: `${config.host}:${config.port}/XE`
};
let connection;
let FgGreen = "\x1b[32m%s\x1b[0m";

module.exports = {
    connect(){
        oracledb.getConnection(dbConfig).then(c =>{
            connection = c;
            console.log(FgGreen, 'Connected to Oracle database');
        }).catch(console.log);
    },

    close(){
        if(connection) connection.close();
        connection = null;
    }
};

const oracledb = require('oracledb');
const config = require('./config.json');
let connection;

module.exports = {
    connect(){
        oracledb.getConnection(config).then(c =>{
            connection = c;
            console.log('Connected to Oracle database');
        }).catch(console.log);
    },

    close(){
        if(connection) connection.close();
        connection = null;
    }
};

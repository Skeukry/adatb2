const oracledb = require('oracledb');
const config = require('./config.json');

let connection = null;
const err = e => console.log('Error: ' + e);

module.exports = {
    connect(){
        oracledb.getConnection(config).then(c =>{
            connection = c;
            console.log('Connected to Oracle database');
        }).catch(err);
    },

    close(){
        if(connection) connection.close();
        console.log('Shutting down...');
    }
};

const oracledb = require('oracledb');
const config = require('./config.json');

const log = v => console.log(v);
const err = v => log('Error: ' + v);

module.exports.connect = () =>{
    oracledb.getConnection(config).then(log);
};

const oracledb = require('oracledb');
const FG_GREEN = '\x1b[32m%s\x1b[0m';
let connection;


process.on('message', msg =>{
    switch(msg.type){
        case 'connect':
            oracledb.getConnection(msg.config).then(c =>{
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

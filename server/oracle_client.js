const oracledb = require('oracledb');
const sql = require('./sql.json');

const FG_GREEN = '\x1b[32m%s\x1b[0m';
let connection;


process.on('message', msg =>{
    switch(msg.type){
        case 'connect':
            oracledb.autoCommit = true;
            oracledb.getConnection(msg.config).then(c =>{
                connection = c;
                console.log(FG_GREEN, 'Connected to Oracle database');
            }).catch(console.log);
            break;

        case 'data':
            handleData(msg.data);
            break;

        case 'close':
            if(connection) connection.close();
            connection = null;
            process.disconnect();
            break;
    }
});

function handleData(data){
    switch(data.type){
        case 'search':
            connection.execute(sql.getJourneys, [data.from, data.to, new Date(data.time)]).then(res =>{
                process.send({type: data.type, data: res.rows});
            });
            break;

        case 'suggestion':
            connection.execute(sql.getSuggestion, [data.value]).then(res =>{
                process.send({type: data.type, value: res.rows});
            });
            break;

        case 'statistics':
            connection.execute(sql.getStatistics).then(res =>{
                process.send({type: data.type, value: res.rows[0]});
            });
            break;
    }
}

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
                process.send({type: data.type, list: res.rows});
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

        case 'ticket':
            connection.execute(sql.createTicket, [UUID(), data.name, data.osztaly, data.jarat, data.kedv]);
            break;

        case 'kedvezemny':
            connection.execute(sql.getKedvezmeny).then(res =>{
                process.send({type: data.type, value: res.rows});
            });
            break;

        case 'kocsiosztaly':
            connection.execute(sql.getOsztaly, [data.value]).then(res =>{
                process.send({type: data.type, value: res.rows});
            });
            break;
    }
}

// Generates a v4 UUID
function UUID(){
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.randomBytes(1)[0] & 15>>c / 4).toString(16)
    );
}

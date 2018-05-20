const {ipcRenderer, remote} = require('electron');
const links = document.getElementsByTagName('a');
const inputs = document.getElementsByTagName('input');


// F12 opens DevTools
window.addEventListener('keydown', e =>{
    if(e.key === 'F12') remote.getCurrentWindow().toggleDevTools();
});

// Open first page
loadPage(links[0]);

// Make named links clickable
window.addEventListener('click', e =>{
    const node = e.target;
    if(node.tagName !== 'A' || !node.name) return;

    loadPage(node);
    e.preventDefault();
});


// Handle incoming data
let paymentInfo = null;

ipcRenderer.on('message', (e, data) =>{
    switch(data.type){
        case 'search':
            let tb = document.getElementById('results').getElementsByTagName('tbody')[0];
            while(tb.lastChild) tb.removeChild(tb.lastChild);

            for(let jarat of data.list){
                // Convert date
                const toTime = d => d.toLocaleTimeString().slice(0, -3);
                const from = new Date(jarat[2]);
                const to = new Date(jarat[3]);
                const long = (to.getTime() - from.getTime()) / 1000 / 60;

                jarat[2] = toTime(from);
                jarat[3] = toTime(to);
                jarat.push(Math.floor(long / 60) + ':' + (Math.floor(long) % 60).toString().padStart(2, '0'));

                const tr = document.createElement('tr');
                for(let attr of jarat){
                    const td = document.createElement('td');
                    td.innerText = attr;
                    tr.appendChild(td);
                }

                const btnTD = document.createElement('td');
                const btn = document.createElement('input');
                btn.type = 'button';
                btn.value = 'Jegyvásárlás';
                btn.addEventListener('click', () =>{
                    paymentInfo = jarat;
                    loadPage('payment');
                });

                btnTD.appendChild(btn);
                tr.appendChild(btnTD);
                tb.appendChild(tr);
            }
            document.getElementById('hidden').removeAttribute('hidden');
            document.getElementById('hidden').scrollIntoView({behavior: "smooth"});

            break;

        case 'suggestion':
            if(suggInfo && suggInfo.i.value !== suggInfo.v){
                const inp = suggInfo.i;
                suggInfo = null;
                getSuggestion(inp);
            }else suggInfo = null;

            suggList = document.getElementById('suggestions');
            if(!suggList) break;

            while(suggList.lastChild) suggList.removeChild(suggList.lastChild);
            for(let s of data.value){
                const opt = document.createElement('option');
                opt.value = s;
                suggList.appendChild(opt);
            }
            break;

        case 'statistics':
            document.getElementById('spare').innerText = Math.floor(data.value) + ' Ft';
            // document.getElementById('spare').innerText = Math.floor(data.value / 1000) + ' ezer Ft';
            break;

        case 'kedvezemny':
            const k = document.getElementById('carriage_class');
            for(let v of data.value){
                const o = document.createElement('option');
                o.innerText = v[2];
                o.value = v[0];
                k.appendChild(o);
            }
            break;

        case 'kocsiosztaly':
            const k2 = document.getElementById('kedvezmeny');
            for(let v of data.value){
                const o = document.createElement('option');
                o.innerText = v[1];
                o.value = v[0];
                k2.appendChild(o);
            }
            break;
    }
});

// Handle suggestions
let suggList, suggInfo = null;

function getSuggestion(inp){
    if(suggInfo || inp.value.length < 3) return;

    suggInfo = {
        i: inp,
        v: inp.value
    };

    ipcRenderer.send('message', {
        type: 'suggestion',
        value: suggInfo.v
    });
}

// Request journeys
function getJourneys(e){
    const data = e.target.elements;
    ipcRenderer.send('message', {
        type: 'search',
        from: data.from.value,
        to: data.to.value,
        time: data.time.value
    });
    e.preventDefault();
}

function getStatistics(){
    ipcRenderer.send('message', {type: 'statistics'});
}

function getPayment(){
    ipcRenderer.send('message', {type: 'kedvezemny'});
    ipcRenderer.send('message', {
        type: 'kocsiosztaly',
        value: paymentInfo[0]
    });
}

function createTicket(e){
    const data = e.target.elements;
    ipcRenderer.send('message', {
        type: 'statistics',
        name: data.passenger_name.value,
        osztaly: data.carriage_class.value,
        jarat: paymentInfo[0],
        kedv: data.kedvezmeny.value
    });
    e.preventDefault();
}


function loadPage(link){
    const xhttp = new XMLHttpRequest();
    if(typeof link === 'string') link = {name: link};

    xhttp.addEventListener('load', function(){
        // Insert new html data
        document.getElementById('section').innerHTML = this.responseText;

        // Update date inputs
        for(let inp of inputs){
            if(inp.type !== 'date') continue;

            let now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            now = now.toJSON().slice(0, 10);

            inp.value = now;
            // inp.min = now;
        }

        if(link.name === 'statistics') getStatistics();
        if(link.name === 'payment') getPayment();
    });

    // Request html data
    xhttp.open('GET', link.name + '.html');
    xhttp.send();

    // Update active_menu
    for(let l of links) l.parentNode.classList.remove('active_menu');
    if(link.parentNode) link.parentNode.classList.add('active_menu');

    // Update title and load css
    document.title = 'TrainGod - ' + link.innerText;
    document.getElementById('pageStyle').href = `../css/${link.name}.css`;
}

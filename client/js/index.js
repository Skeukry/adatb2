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
            for(let jarat of data.list){
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
                document.getElementById('results').appendChild(tr);
            }
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

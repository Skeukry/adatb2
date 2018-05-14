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


function loadPage(link){
    const xhttp = new XMLHttpRequest();

    xhttp.addEventListener('load', function(){
        // Insert new html data
        document.getElementById('section').innerHTML = this.responseText;

        // Update date inputs
        for(let inp of inputs){
            if(inp.type !== 'date') continue;

            let now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            now = now.toJSON().slice(0,10);

            inp.value = now;
            inp.min = now;
        }
    });

    // Request html data
    xhttp.open('GET', link.name + '.html');
    xhttp.send();

    // Update active_menu
    for(let l of links) l.parentNode.classList.remove('active_menu');
    link.parentNode.classList.add('active_menu');

    // Update tite and load css
    document.title = 'TrainGod - ' + link.innerText;
    document.getElementById('pageStyle').href = `../css/${link.name}.css`;
}

const {ipcRenderer, remote} = require('electron');
const links = document.getElementsByTagName('a');


// F12 opens DevTools
window.addEventListener('keydown', e =>{
    if(e.key === 'F12') remote.getCurrentWindow().toggleDevTools();
});

// Open first page
loadPage(links[0]);

// Make named links clickable
window.addEventListener('click', e =>{
    const node = e.target;
    console.log(node.tagName);
    if(node.tagName !== 'A' || !node.name) return;

    loadPage(node);
    e.preventDefault();
});


function loadPage(link){
    fetch(link.name + '.html').then(res => res.text()).then(html =>{
        document.getElementById('section').innerHTML = html;
    });

    for(let l of links) l.parentNode.classList.remove('active_menu');
    link.parentNode.classList.add('active_menu');

    document.title = 'TrainGod - ' + link.innerText;
    document.getElementById('pageStyle').href = `../css/${link.name}.css`;
}

function sendUpdate(e){
    ipcRenderer.send('update');
    console.log('SENT');
    e.preventDefault();
}

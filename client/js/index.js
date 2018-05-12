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
    console.log('tagName: ' + node.tagName);
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

    //TODO Feca pls use magic and remove the timeout
    setTimeout(function(){
        setMinDate()
    }, 50);
}

function sendUpdate(e){
    ipcRenderer.send('update');
    console.log('SENT');
    e.preventDefault();
}

function setMinDate(){
    let today = new Date();
    const offset = today.getTimezoneOffset()/-60;

    today.setHours(today.getHours() + offset);
    today = today.toISOString().substr(0, 10);

    const date = document.querySelector("#date");

    if (date != null){          // when html contains date element
        date.min = today;
        date.value = today;
    }
}
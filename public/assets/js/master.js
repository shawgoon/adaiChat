// toutes mes variables globales
const socket = io();
let monSocketClients = [];
let mesMessages = [];
let monId;
const clients = document.getElementById("inLineClients");
const messagesFrame = document.getElementById("messages");
const private = document.getElementById('private');
const sendPrivate = document.getElementById('sendPrivate');
const privateReponse = document.getElementById('privateMessage');
const privateReponseInner = document.getElementById('privateMessageInner');
const closePrivateMessage = document.getElementById('closePrivateMessage');
const closePrivate = document.getElementById('closePrivate');
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const pseudo = urlParams.get('pseudo');

//  déclaration de fonction
function displayClients(monSocketClients){
    let clientsTmp = "";
    monSocketClients.forEach(element => {
        if (monId !== element.id){
            clientsTmp += `<div class="pseudo" onclick="privateMessage
            ('${element.id}');">${element.pseudo}</div>`;
        }
    });
    clients.innerHTML = clientsTmp;
}
// envoie d'un message privé au serveur pour qui'il la renvoi au client 
function privateMessage(idContact){
    // j'ouvre une modale qui contient un textarea tinymce
    // et un bouton "envoi privé"
    private.classList.remove('hide');
    private.classList.add('show');
    // console.log(idContact);
    tinymce.init({

        selector: '#myprivate', height:245,
    
        plugins: [
    
          'a11ychecker','advlist','advcode','advtable','autolink','checklist','export','emoticons',
    
          'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
    
          'powerpaste','fullscreen','formatpainter','insertdatetime','media','table','help','wordcount'
    
        ],
    
        toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor emoticons| ' +
    
          'alignleft aligncenter alignright alignjustify | ' +
    
          'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'   
    });

    //  envoie d'un message privé à un client sur le serveur
    function fuckingFunction() {
        
            let monMessage = tinyMCE.get("myprivate").getContent();
            let date = new Date;
            // je possède déjà mon ID et pseudo
            //   idContact, monId, pseudo
            socket.emit("newPrivateMessage",{
                privateMessages: monMessage,
                date: date,
                idContact: idContact,
                id: monId,
                pseudo: pseudo
            })
            private.classList.remove('show');
            private.classList.add('hide');
            tinyMCE.get("myprivate").setContent('');
            // je retire l'event click du button
            sendPrivate.removeEventListener('click', fuckingFunction)
    }
    sendPrivate.addEventListener('click', fuckingFunction);
    closePrivate.addEventListener('click',()=>{
        private.classList.remove('show');
        private.classList.add('hide');
    })
}

// afficher les message dans la fenêtre dédiée
function displayMessages(mesMessages){
    let messagesTmp = "";
    mesMessages.forEach(element => {
        messagesTmp += 
        element.date + "<br>" +
        element.pseudo + "<br>" +
        element.message + "<br><hr>";
        
    });
    messagesFrame.innerHTML = messagesTmp;
}


socket.on("init",(init)=>{
    // console.log(monMessage);
    // console.log(init.message);
    // console.log(init.id);
    monId = init.id;
    monSocketClients = init.socketClients;
    mesMessages = init.messages;
    // pseudo = prompt("veuillez vous identifier");
    // console.dir(monSocketClients);
    // j'ajoute mon pseudo au tableau des clients
    for (let i= 0; i < monSocketClients.length; i++){
        if (monSocketClients[i].id === monId){
            monSocketClients[i].pseudo = pseudo;
        }
    };
    // je dois mtn renvoyer au serveur le tableau de client modifié
    socket.emit('initReponse', {
        socketClients:monSocketClients
    });
    // display client
    displayClients(monSocketClients);
     // display message
    displayMessages(mesMessages);
})

socket.on('newClient', (newClient)=>{
    monSocketClients = newClient.socketClients;
    // display client
    displayClients(monSocketClients);
     // display message
    displayMessages(mesMessages);
})

// reception d'un message commun par le serveur
socket.on('newMessageReponse', (newMessageReponse)=>{
    mesMessages = newMessageReponse.messages;
    // display message
    displayMessages(mesMessages); console.log(mesMessages);
})

// réception d'un message privé par le serveur
socket.on('newPrivateReponse', (newPrivateReponse)=>{ 
    console.dir(newPrivateReponse);
    for (const [key, value] of Object.entries(newPrivateReponse)){
        let pseudo = value.pseudo;
        let message = value.privateMessages;
        let date = value.date;
        let privateReponseCard = document.createElement('div')
        privateReponseCard.innerHTML = date + "<br>" +
        pseudo + "<br>" + message + "<br><hr>";
        privateReponseInner.append(privateReponseCard);
        closePrivateMessage.addEventListener('click',()=>{
            privateReponseCard.remove();
            privateReponse.classList.remove('show');
            privateReponse.classList.add('hide');
        })
        // privateReponse.onclick = function(){
        //     privateReponseCard.remove();
        //     privateReponse.classList.toggle('hide');
        //     privateReponse.classList.toggle('show');
        // }
    // pour faire apparaitre et disparaitre la fenêtre durant un temps donné
        // setTimeout(()=>{
        //     privateReponse.classList.toggle('hide');
        //     privateReponse.classList.toggle('show'); 
        // },10000)
    }
    privateReponse.classList.remove('hide');
    privateReponse.classList.add('show');
})


// je retire l'affichage du pseudo déco
socket.on('clientDeco', (clientDeco)=>{
    monSocketClients = clientDeco.socketClients;
    // console.dir(monSocketClients);
    // display client
    displayClients(monSocketClients);
})
// j'envoi le message au serveur pour qu'il le retourne aux clients
document.getElementById('sendMessage').addEventListener("click",()=>{
    let monMessage = tinyMCE.get("mytextarea").getContent();
    let date = new Date;
    // je possède déjà mon ID et pseudo
    mesMessages.push({
        id: monId,
        pseudo: pseudo,
        message: monMessage,
        date: date
    }) 
    // console.dir(mesMessages);
    socket.emit("newMessage", { messages:mesMessages })
    displayMessages(mesMessages);
    tinyMCE.get("mytextarea").setContent('');
})


tinymce.init({

    selector: '#mytextarea', height:245, 
    

    plugins: [

      'a11ychecker','advlist','advcode','advtable','autolink','checklist','export','emoticons',

      'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',

      'powerpaste','fullscreen','formatpainter','insertdatetime','media','table','help','wordcount'

    ],

    toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor emoticons| ' +

      'alignleft aligncenter alignright alignjustify | ' +

      'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'   });
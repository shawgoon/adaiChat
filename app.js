const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);
const hostname = '127.0.0.1';
const port = 8080;
const io = require('socket.io')(server);
// tableau des clients connectés
let socketClients = [];
// tableau des messages en ligne
let messages = [];



app.use(express.static('public'));
app.get('/', function (req, res) {
  res.sendFile('index.html', {
    root: __dirname
  });
})

// communication entre les clients et le serveur
io.on('connection', (socket) => {
    // console.dir(socket.id);
    socketClients.push({
      id: socket.id
    })

// le serveur initie la connexion
    socket.emit("init", {
      welcome: "bienvenue nouveau client",
      id: socket.id,
      socketClients: socketClients,
      messages: messages,
    });

// le serveur reçoit la connexion d'un client et renvoi à tout les clients la co du nouveau client
    socket.on('initReponse', (initReponse) => {
      socketClients = initReponse.socketClients;
      // console.dir(socketClients);
      // partager aux clients déjà co
      socket.broadcast.emit('newClient', {socketClients:socketClients})
    })

// le serveur reçoit et renvoi le message à tous les clients
    socket.on('newMessage', (newMessage) => {
      messages = newMessage.messages;
      // console.dir(messages);
      // partager aux clients déjà co
      socket.broadcast.emit('newMessageReponse', {messages:messages})
    })

// le serveur reçoit et renvoi le message au client défini
    socket.on("newPrivateMessage",(newPrivateMessage) => {
      socket.broadcast.to(newPrivateMessage.idContact).emit('newPrivateReponse', {
        newPrivateReponse:newPrivateMessage});
    })

// déconnexion d'un client
    if (socketClients.length > 0) {
      socket.on('disconnect', () => {
        // socket.id = client déconnecté
        for (let i = 0; i < socketClients.length; i++) {
          if (socketClients[i].id === socket.id) {
            socketClients.splice(i, 1);  
          }
        }
          // console.log(socket.id)
          // console.dir(socketClients);
// je renvoie à tout les clients que quelqu'un s'est déco
          socket.broadcast.emit('clientDeco', {
            socketClients: socketClients
          });
      })
    }

})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
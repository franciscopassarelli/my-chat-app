const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Conexión cuando un cliente se conecta al WebSocket
wss.on('connection', (ws) => {
  console.log('Nuevo cliente conectado');

  // Recibir mensajes desde el cliente
  ws.on('message', (message) => {
    console.log('Mensaje recibido: ' + message);

    // Reenviar el mensaje a todos los clientes conectados
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Enviar mensaje de bienvenida al nuevo cliente
  ws.send('¡Bienvenido al chat!');
});

// Servir los archivos estáticos de la aplicación React
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Enviar el index.html para cualquier otra ruta (importante para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Iniciar el servidor WebSocket y HTTP en el puerto 4000
server.listen(4000, () => {
  console.log('Servidor WebSocket escuchando en ws://localhost:4000');
});

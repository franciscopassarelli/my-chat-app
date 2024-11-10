import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false); // Para verificar si el nombre se ha ingresado
  const socketRef = useRef(null);

  // Conectar al servidor WebSocket cuando el componente se monte
  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:4000');
    
    socketRef.current.onopen = () => {
      console.log('Conectado al servidor WebSocket');
    };

    socketRef.current.onmessage = (event) => {
      const messageData = event.data;
      
      // Si el mensaje es un Blob, necesitamos leerlo como texto
      if (messageData instanceof Blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            // Parseamos el texto como JSON
            const message = JSON.parse(reader.result);
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: message.text, isSent: false, userName: message.userName }
            ]);
          } catch (error) {
            console.error("Error al parsear el mensaje recibido:", error);
          }
        };
        reader.readAsText(messageData);
      } else {
        // Si el mensaje no es un Blob, asumimos que es JSON
        try {
          const message = JSON.parse(messageData);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: message.text, isSent: false, userName: message.userName }
          ]);
        } catch (error) {
          console.error("Error al parsear el mensaje recibido:", error);
        }
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    socketRef.current.onclose = () => {
      console.log('Desconectado del servidor WebSocket');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Enviar un mensaje al servidor WebSocket
  const handleSendMessage = () => {
    if (message.trim()) {
      // Añadir el mensaje al estado local como enviado
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, isSent: true, userName }
      ]);
      
      // Enviar el mensaje al servidor WebSocket con el nombre de usuario
      socketRef.current.send(JSON.stringify({ text: message, userName }));
      
      // Limpiar el campo de texto
      setMessage('');
    }
  };

  // Manejo de nombre de usuario
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsNameSet(true);
    }
  };

  return (
    <div className="App">
      {!isNameSet ? (
        <div className="name-input">
          <h2>Ingresa tu nombre</h2>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
            <button type="submit">Iniciar Chat</button>
          </form>
        </div>
      ) : (
        <>
          <h1>Chat en tiempo real</h1>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.isSent ? 'sent' : 'received'}`}
              >
                <div className="user-name">{msg.isSent ? 'Tú' : msg.userName}</div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="input-box">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={handleSendMessage}>Enviar</button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;

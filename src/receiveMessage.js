// Outro componente onde as mensagens são enviadas
import React from 'react';
import Chat from './Chat';

const AnotherComponent = () => {
  // Função para enviar mensagens
  const sendMessage = () => {
    const message = {
      text: 'Olá, esta é uma mensagem de exemplo!',
      recipient_id: 'ID_DO_RECIPIENTE',
      key: 'CHAVE_UNICA',
    };

    // Chama a função para receber a mensagem no componente Chat
    Chat.receiveMessage(message);
  };

  return (
    <div>
      {/* Botão para enviar mensagem de exemplo */}
      <button onClick={sendMessage}>Enviar Mensagem</button>

      {/* Renderização do componente Chat */}
      <Chat />
    </div>
  );
};

export default AnotherComponent;

import React, { useState,  useEffect, useRef} from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Input,
  Typography,
} from "@mui/material";
import CustomAppBar from "./foundation/CustomAppBar/CustomAppBar.jsx";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";
import { io } from 'socket.io-client';
import camellia from './camellia.js'
import RSAHandler from './rsaKeyGeneration.js'
import { useUser } from './hook/useUser.js';
import { useChat } from './hook/useChat.js';
import {useCurrentUser} from './hook/usersContactList.js';

console.log('Imported camellia', camellia);


const Chat = () => {
  const globalIconStyle = {
    color: "#8696a1",
    height: "28px",
    width: "28px",
  };

  // Pega daqui
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const SERVER_URL = 'http://localhost:8000';
  const socketRef = useRef(null);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);/// Lista de usuários que vai sendo atualizada para exibir na tela
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [privateKey, setPrivateKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [sid, setSid] = useState('');
  const [userSessions, setUserSessions] = useState({});
  const [currentSession, setCurrentSession] = useState('')
  const [myIdUser, setMyIdUser] = useState('')
  const [CurrentSymmetricKey, setSymmetricKey] = useState('') 
  const [UserPublicKey, setUserPublicKey] = useState('')
  const [CurrentUserPublic, setCurrentUserPublic] = useState('')
  // CurrentUserPublic é a chave do usuário que eu vou enviar a mensagem

  const { messages: contextMessage, setMessages: setContextList} = useChat()
  const { CurrentUserPUblicKey, setCurrentUserPublicKey} = useUser()

  const {CurrentUser, setCurrentUser} = useCurrentUser()
  console.log('Current User Public Key:', CurrentUserPUblicKey);
  useEffect(() => {
    socketRef.current = io(SERVER_URL, {
        transports: ["websocket"],
        rejectUnauthorized: false
    });

    async function decryptMessages(text, key) {
      const keyBuffer = base64ToArrayBuffer(key);
      const privateKey = sessionStorage.getItem('privateKey');
  
      const privateKeyObject = JSON.parse(privateKey);
  
  // Import the key back into a CryptoKey
      const importedPrivateKey = await window.crypto.subtle.importKey(
                "jwk",
                privateKeyObject,
                { name: "RSA-OAEP", hash: { name: "SHA-256" } },
                false,
                ["decrypt"]
            );
  
      const decryptedKey = await RSAHandler.rsaDecrypt(importedPrivateKey, keyBuffer);
      console.log('Decripted key:')
      console.log(decryptedKey)
      // Assuming 'text' is the encrypted message
      const textBuffer = base64ToArrayBuffer(text);
      const plainTextBuffer = camellia.decrypt(textBuffer, decryptedKey, "cbc", "\x05");
      console.log('Camellia been executed successfully')
      console.log("Decrypted Message:", plainTextBuffer);
      return plainTextBuffer
  } 

    // Essa função é a de cadastro 
    // Eu preciso do username
    // Preciso que as chaves rsa sejam geradas no login ou no cadastro
    function exportKey(key) {
      return window.crypto.subtle.exportKey('jwk', key);
      
    }
    const publishPublicKey = async () => {
    const storedUsername = sessionStorage.getItem('username');
    setUsername(storedUsername);
    console.log('Username:')
    console.log(storedUsername);
    const NewSid = sessionStorage.getItem('Sid');
    setSid(NewSid)

    if (storedUsername && NewSid !== '');{
          setUsername(storedUsername);
  
          try {
            // Essas chaves precisam ser geradas todas as vezes que o usuário entrar no chat
            const keyPair = await RSAHandler.generateRsaKeys();

            setPrivateKey(keyPair.privateKey);
            setPublicKey(keyPair.publicKey);

            // Export the key to a storable format (e.g., JWK)
            const exportedKeyPrivatekey = await exportKey(keyPair.privateKey);

            // Store the exported key as a string
              sessionStorage.setItem('privateKey', JSON.stringify(exportedKeyPrivatekey));
              const user_id = sessionStorage.getItem('userId');
              const ExportedPublicKey = await exportKey(keyPair.publicKey)
              setUserPublicKey(ExportedPublicKey)
              // sessionStorage.setItem('', JSON.stringify(exportedKeyPrivatekey));
              // Preparing data to send
              const userRegisterData = JSON.stringify({
                  user_id: user_id,
                  public_key: ExportedPublicKey, // Exporting publicKey in a usable format
                  sid: NewSid
              });
              console.log(userRegisterData);
              const response = await fetch(`http://localhost:8000/update-public-key/${user_id}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: userRegisterData
              });
            }
            catch (error) {
              console.error("error in publish public key:", error);
          }
          }
        }
  function base64ToArrayBuffer(base64) {
    try {
        // base64 = base64.replace(/\s/g, ''); // Clean the base64 string
        console.log("raw base64")
        console.log(base64)
        const cleanedBase64 = base64.trim().replace(/\s/g, '');
        console.log("Cleaned base64")
        console.log(cleanedBase64)
        const binaryString = window.atob(cleanedBase64);
        if (binaryString != null) {
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;

          // ... rest of your code ...
      } else {
          console.error('binaryString is undefined');
          console.log(binaryString)
      }
        
    } catch (error) {
        console.error('Error decoding Base64 string:', error);
        // Handle error or return a fallback
    }
}   
    //Esse aqui é o evento que recebe as mensagens de algum usuário 
    socketRef.current.on('clientMessage', async (incomingMessages) => {
      const decryptedMessages = await Promise.all(incomingMessages.map(async (message) => {
          const { text, key, recipient_sid, sender, sessionId,  } = message;
          setUserSessions(prevSessions => ({
            ...prevSessions,
            [sender]: sessionId
        }));
          console.log('received symmetric key')
          console.log(key)
          const plainText = decryptMessages(text, key)
      
          return { ...message, text: plainText };
      }));
  
      setMessages(prevMessages => [...prevMessages, ...decryptedMessages]);
      
  });
    
    socketRef.current.on('messageHistory', (history) => {
        setMessages(history); // Assume history is an array of message objects
    });

    // Evento para listar usuários
    socketRef.current.on('usersList', (usersList) => {
      // Filter out the current user's data from the list
      console.log('received user list');
      console.log(usersList)
      const storedUsername = sessionStorage.getItem('username');
      const otherUsers = usersList.filter(user => user.username !== storedUsername);
      // Update the state with the list of other users
      setUsers(otherUsers);
      // socketRef.current.off('userList');

  });
    // Evento para receber o Sid
    socketRef.current.on('getSid', async (receivedSid) => {
      console.log('Received sid: ' + receivedSid);
      sessionStorage.setItem('Sid', receivedSid);
      setSid(receivedSid);
      // UserPublicKey()
      await publishPublicKey()
    });
    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };

}, []);

  function generateSymmetricKey() {
    return window.crypto.getRandomValues(new Uint8Array(32));
  }
  function generateSessionId() {

    return crypto.randomUUID();
  }
  const doesSessionExist = (username) => {
    return userSessions.hasOwnProperty(username);
};
  //Essa função é para importar a chave criptografada no formato CryptoKey
  async function importRsaKey(jwkKey, keyType) {
    let algorithm;
    let usages;

    if (keyType === 'public') {
        algorithm = {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}
        };
        usages = ["encrypt"];  // or other usages for a public key
    } else if (keyType === 'private') {
        algorithm = {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}
        };
        usages = ["decrypt"];  // or other usages for a private key
    } else {
        throw new Error("Invalid key type. Must be 'public' or 'private'.");
    }

    const cryptoKey = await window.crypto.subtle.importKey(
        "jwk",
        jwkKey,
        algorithm,
        true,
        usages
    );

    return cryptoKey;
  }
  const sendMessage = async()  => {
    if (newMessage.trim() === '') {
      return;
    }  
   
    function bufferToBase64(buffer) {
      const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
      return window.btoa(binary);
  }

    const SymmetricKey = generateSymmetricKey()
    const symmetricKeyBuffer = SymmetricKey.buffer; 
    setSymmetricKey(symmetricKeyBuffer);
    const Iv = camellia.mkIV()
    const myHash = {
      data    : newMessage,
      key     : SymmetricKey,
      mode    : "cbc",
      iv      : Iv,
      pchar   : "\x05"
  };
    console.log('CurrentUserPublic')
    console.log(CurrentUserPublic)
    console.log(CurrentUserPUblicKey)
    const ImportedKey = await importRsaKey(CurrentUserPUblicKey, 'public')
    const encrypted_public_key = await RSAHandler.rsaEncrypt(ImportedKey,symmetricKeyBuffer)
    const encryptedPublicKeyBase64 = bufferToBase64(encrypted_public_key);
    const encryptedMessage = camellia.encrypt( myHash );
    const messageData = {
      text: encryptedMessage,
      from: myIdUser,
      to: CurrentUser, // Replace with logic to determine the target user
      key: encryptedPublicKeyBase64,
      iv: Iv,
      session_id: currentSession
  };
  
  if (socketRef.current) {
      socketRef.current.emit("message", messageData);
  }

    const updatedMessages = [...messages, { text: newMessage, sender: 'user' }];
    setMessages(updatedMessages);
    setNewMessage('');

  };

  const getSessionIdById = (userId) => {
    return userSessions[userId] 
  }
  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;

}   
  async function decryptMessages(text, key) {
    const keyBuffer = base64ToArrayBuffer(key);
    const privateKey = sessionStorage.getItem('privateKey');

    const privateKeyObject = JSON.parse(privateKey);

// Import the key back into a CryptoKey
    const importedPrivateKey = await window.crypto.subtle.importKey(
              "jwk",
              privateKeyObject,
              { name: "RSA-OAEP", hash: { name: "SHA-256" } },
              false,
              ["decrypt"]
          );

    const decryptedKey = await RSAHandler.rsaDecrypt(importedPrivateKey, keyBuffer);
    console.log('Decripted key:')
    console.log(decryptedKey)
    // Assuming 'text' is the encrypted message
    // const textBuffer = base64ToArrayBuffer(text);
    const plainTextBuffer = camellia.decrypt(text, decryptedKey, "cbc", "\x05");
    console.log('Camellia been executed successfully')
    console.log("Decrypted Message:", plainTextBuffer);
    return plainTextBuffer
} 
  // Essa função aqui é quando o usuário clica em um dos usuários da lista de contatos
  const handleUserClick = async (user) => {
    setCurrentChatUser(user.id_);

    if (!doesSessionExist(user.id_)) {
      const sessionId = generateSessionId(); // Your session ID generation logic
      setUserSessions(prevSessions => ({
          ...prevSessions,
          [user.id_]: sessionId
      }));
      setCurrentSession(sessionId);
      console.log('Session')
      console.log(sessionId);
  } else {
      const sessionId = getSessionIdById(user.id_);
      setCurrentSession(sessionId);
  }
    try {
      const getSessionIdById = (userId) => {
        return userSessions[userId] 
      }
      const sessionId = getSessionIdById(user.id_);
      const response = await fetch(`https://localhost:8000/history/${sessionId}`);
      if (response.ok) {
          const data = await response.json();
          const decryptedMessages = await Promise.all(data.map(async (message) => {
            const decryptedText = await decryptMessages(message.text, message.key);
            return {
                ...message,
                text: decryptedText
            };
          }));
          setMessages(decryptedMessages);

          // You can now use this publicKey for further operations
      } else {
          console.error("History:", response.status);
      }
  } catch (error) {
      console.error("Error fetching history:", error);
  }

    try {
      const response = await fetch(`http://localhost:8000/public-key/${user.id_}`);
      if (response.ok) {
          const data = await response.json();
          const publicKey = data;
          setCurrentUserPublic(user.public_key)
          console.log("Public key changed")
          console.log(publicKey?.n)
           // Assuming the response contains the public key
          // You can now use this publicKey for further operations
          console.log("Public Key for", user, ":", user.public_key);
      } else {
          console.error("Failed to fetch public key:", response.status);
      }
  } catch (error) {
      console.error("Error fetching public key:", error);
  }

};// até aquii
  function logoutUser() {
    // Clear all local storage
    localStorage.clear();

    // ... additional logout logic
  }



  return (
    <Box height="100%" display="flex" flexDirection="column">
    
     <button onClick={logoutUser}>Logout</button>
     <button onClick={username}></button>
      <CustomAppBar>
        {/* ... (seu código existente para exibir informações do usuário) */}
      </CustomAppBar>
      {/* <Box width="25%" bgcolor="#2b3943" overflowY="auto" minWidth="240px">
        <Typography variant="h6" sx={{ color: "white", padding: "10px" }}>Users</Typography>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((user, index) => (
            <li key={index} style={{
              padding: "10px",
              backgroundColor: user === user.id_? "#394b59" : "transparent",
              color: "white",
              cursor: "pointer"
            }} onClick={() => handleUserClick(user)}>
              {user.username}
            </li>
          ))}
        </ul>
      </Box> */}
      <Box display="flex" flexDirection="column" flexGrow={1}>
      <Box flex={1} overflowY="auto">
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            alignItems="flex-end"
            mb={1}
          >
            {message.sender === 'user' ? null : <Avatar />}
            <Box
              bgcolor={message.sender === 'user' ? '#2b3943' : '#394b59'}
              color="white"
              borderRadius="6px"
              p={1}
              maxWidth="70%"
            >
              <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
                {message.text}
              </Typography>
            </Box>
            {message.sender === 'user' ? (
              <Avatar sx={{ ml: 1 }} />
            ) : null}
          </Box>
        ))}
      </Box>
      </Box>
      <Box
           alignItems="center"
           display="flex"
           sx={{
             background: "#1C1D21",
             padding: "0px 15px",
             borderTop: "1px solid #394b59" // Added a border for separation
           }}
         >
           <IconButton onClick={() => {}}>
             <AttachFileIcon
               sx={{
                 ...globalIconStyle,
                 transform: "rotateY(0deg) rotate(45deg)",
               }}
             />
           </IconButton>
           <Box flex={1} pl="5px" pr="5px">
             <Input
               fullWidth
               disableUnderline
               placeholder="Type a message"
               sx={{
                 background: "#2b3943",
                 height:"42px",
     borderRadius: "6px",
     color: "white",
     padding: "0px 10px",
     }}
     value={newMessage}
     onChange={(e) => setNewMessage(e.target.value)}
     onKeyDown={(e) => {
     if (e.key === 'Enter') {
     sendMessage();
     }
     }}
     />
     </Box>
     <IconButton onClick={sendMessage}>
     <MicIcon sx={globalIconStyle} />
     </IconButton>
     </Box>
     </Box>
  );
};

export default Chat;
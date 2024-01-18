import Box from '@mui/material/Box'
import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import camellia from './camellia.js'
import RSAHandler from './rsaKeyGeneration.js'
import { Typography } from '@mui/material'
import { useUser } from './hook/useUser.js';
import {useCurrentUser} from './hook/usersContactList.js';
import { useChat } from './hook/useChat.js';
import {useSession} from './hook/useSession.js';
import ContactsIcon from '@mui/icons-material/Contacts';

const SERVER_URL = 'http://localhost:8000'
export default function ContactList() {
    const [localChats, setLocalChats] = useState([])
    const [newUsername, setNewUsername] = useState('')
    const [users, setUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState(null) // State to track selected user ID
    const [userSessions, setUserSessions] = useState({}) // State to manage user sessions
    // const [currentSession, setCurrentSession] = useState(null)
    // const [currentUserPublicKey, setCurrentUserPublic] = useState(null)
    // const [messages, setMessages] = useState([])
    const [currentChatUser, setCurrentChatUser] = useState(null)
    const {CurrentUser, setCurrentUser}= useCurrentUser()

    const socketRef = useRef()
    const { CurrentUserPUblicKey, setCurrentUserPublicKey} = useUser()
    const {currentSession, setCurrentSession} = useSession()

    const { messages, setMessages} = useChat()
    
    useEffect(() => {
        socketRef.current = io(SERVER_URL, {
            transports: ['websocket'],
            rejectUnauthorized: false,
        })

        socketRef.current.on('connect', () => {
          console.log('Connect');
        });

        socketRef.current.on('usersList', async (usersList) => {
          console.log('USER LIST', usersList);
            const storedUsername = sessionStorage.getItem('username');
            console.log('STORED USER', storedUsername);
            const otherUsers = usersList.filter(
                (user) => user.username !== storedUsername
            )
            setUsers(otherUsers)
        })

        return () => {
            socketRef.current.disconnect()
        }
    }, [])
    const doesSessionExist = (username) => {
        return userSessions.hasOwnProperty(username)
    }
    function generateSessionId() {
        return crypto.randomUUID()
    }
    const getSessionIdById = (userId) => {
        return userSessions[userId]
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
    async function decryptMessages(text, key) {
        const keyBuffer = base64ToArrayBuffer(key)
        console.log('key buffer', keyBuffer)
        const privateKey = sessionStorage.getItem('privateKey')
        console.log('decrypted private key', privateKey)
        const privateKeyObject = JSON.parse(privateKey)

        // Import the key back into a CryptoKey
        const importedPrivateKey = await window.crypto.subtle.importKey(
            'jwk',
            privateKeyObject,
            { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
            false,
            ['decrypt']
        )
        console.log('Imported key:')
        console.log(importedPrivateKey)
        const decryptedKey = await RSAHandler.rsaDecrypt(
            importedPrivateKey,
            keyBuffer
        )
        // console.log(decryptedKey)
        console.log('Decripted key:')
        console.log(decryptedKey)
    

        // Assuming 'text' is the encrypted message
        // const textBuffer = base64ToArrayBuffer(text)
        const plainTextBuffer = camellia.decrypt(
            text,
            decryptedKey,
            'cbc',
            '\x05'
        )
        console.log('Camellia been executed successfully')
        console.log('Decrypted Message:', plainTextBuffer)
        return plainTextBuffer
    }

    const handleUserClick = async (user) => {
        setCurrentUser(user.id_)

        if (!doesSessionExist(user.id_)) {
            const sessionId = generateSessionId() // Your session ID generation logic
            setUserSessions((prevSessions) => ({
                ...prevSessions,
                [user.id_]: sessionId,
            }))
            setCurrentSession(sessionId)
            console.log('Session')
            console.log(sessionId)
        } else {
            const sessionId = getSessionIdById(user.id_)
            setCurrentSession(sessionId)
        }
        try {
            const getSessionIdById = (userId) => {
                return userSessions[userId]
            }
            const sessionId = getSessionIdById(user.id_)
            setCurrentSession(sessionId)
            console.log('Session id')
            console.log(sessionId)
            const response = await fetch(
                `http://localhost:8000/history/${sessionId}`
            )
            if (response.ok) {
                const data = await response.json()
                
                if (data.length > 0) {
                const decryptedMessages = await Promise.all(
                    data.map(async (message) => {
                        const decryptedText = await decryptMessages(
                            message.text,
                            message.key
                        )
                        console.log('decryption function was executed')
                        console.log(decryptedText)
                        return {
                            ...message,
                            text: decryptedText,
                        }
                    })
                )
                console.log("Messages from history")
                console.log(decryptedMessages)
                setMessages(prevMessages => [...prevMessages, ...decryptedMessages]);

                // setMessages(decryptedMessages)
                }
                else{
                    setMessages([]);
                }
                // You can now use this publicKey for further operations
            } else {
                console.error('History:', response.status)
            }
        } catch (error) {
           
            console.error('Error fetching history:', error)
        }

        try {
            const response = await fetch(
                `http://localhost:8000/public-key/${user.id_}`
            )
            if (response.ok) {
                const data = await response.json()
                const publicKey = data.public_key
                setCurrentUser(data.id_)
                setCurrentUserPublicKey(publicKey)
                console.log('Public key changed')
       
                console.log('Public Key for', user, ':', user.public_key)
            } else {
                console.error('Failed to fetch public key:', response.status)
            }
        } catch (error) {
            console.error('Error fetching public key:', error)
        }
    }
    // ...rest of your component logic...

    return (
        <Box height="100%" width="30%" overflow="hidden">
            <Box
                bgcolor="#9c6fe487"
                overflowY="auto"
                minWidth="240px"
                borderRadius= "0px 0px 0px 8px"
            >
                
                <Typography
                    
                    variant="h4"
                    sx={{ color: "white", padding: '10px', fontFamily:'Poppins', alignItems:'center'}}
                    
                >
                    <ContactsIcon sx={{ fontSize: 40, color: 'white' }} />  {/* Adiciona o ícone */}
                       Contacts Online
                </Typography>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {users.map((user, index) => (
                        <li
                            key={index}
                            style={{
                                padding: '10px',
                                backgroundColor:
                                    selectedUserId === user.id
                                        ? '#FFF'
                                        : 'transparent',
                                color: 'grey',
                                cursor: 'pointer',
                                borderTop: 'none',
                                borderRight: 'none',
                                borderColor: "#9c6fe487", 
                            }}
                            onClick={() => handleUserClick(user)}
                        >
                            {user.username}
                        </li>
                    ))}
                </ul>
            </Box>
        </Box>
    )
}

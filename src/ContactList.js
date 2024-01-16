import Box from '@mui/material/Box'
import CustomAppBar from './foundation/CustomAppBar/CustomAppBar.jsx'
import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import camellia from './camellia.js'
import RSAHandler from './rsaKeyGeneration.js'
import { Typography } from '@mui/material'

const SERVER_URL = 'http://localhost:8000'
export default function ContactList() {
    const [localChats, setLocalChats] = useState([])
    const [newUsername, setNewUsername] = useState('')
    const [users, setUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState(null) // State to track selected user ID
    const [userSessions, setUserSessions] = useState({}) // State to manage user sessions
    const [currentSession, setCurrentSession] = useState(null)
    const [currentUserPublic, setCurrentUserPublic] = useState(null)
    const [messages, setMessages] = useState([])
    const [currentChatUser, setCurrentChatUser] = useState(null)

    const socketRef = useRef()

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
    async function decryptMessages(text, key) {
        const keyBuffer = base64ToArrayBuffer(key)
        const privateKey = sessionStorage.getItem('privateKey')

        const privateKeyObject = JSON.parse(privateKey)

        // Import the key back into a CryptoKey
        const importedPrivateKey = await window.crypto.subtle.importKey(
            'jwk',
            privateKeyObject,
            { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
            false,
            ['decrypt']
        )

        const decryptedKey = await RSAHandler.rsaDecrypt(
            importedPrivateKey,
            keyBuffer
        )
        console.log('Decripted key:')
        console.log(decryptedKey)
        function base64ToArrayBuffer(base64) {
            const binaryString = window.atob(base64)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
            return bytes.buffer
        }
        // Assuming 'text' is the encrypted message
        const textBuffer = base64ToArrayBuffer(text)
        const plainTextBuffer = camellia.decrypt(
            textBuffer,
            decryptedKey,
            'cbc',
            '\x05'
        )
        console.log('Camellia been executed successfully')
        console.log('Decrypted Message:', plainTextBuffer)
        return plainTextBuffer
    }

    const handleUserClick = async (user) => {
        setCurrentChatUser(user.id_)

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
            const response = await fetch(
                `https://localhost:8000/history/${sessionId}`
            )
            if (response.ok) {
                const data = await response.json()
                const decryptedMessages = await Promise.all(
                    data.map(async (message) => {
                        const decryptedText = await decryptMessages(
                            message.text,
                            message.key
                        )
                        return {
                            ...message,
                            text: decryptedText,
                        }
                    })
                )
                setMessages(decryptedMessages)

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
                const publicKey = data
                setCurrentUserPublic(user.public_key)
                console.log('Public key changed')
                console.log(publicKey.n)
                // Assuming the response contains the public key
                // You can now use this publicKey for further operations
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
            <CustomAppBar>{/* ... (the rest of your code) */}</CustomAppBar>
            <Box
                width="25%"
                bgcolor="#2b3943"
                overflowY="auto"
                minWidth="240px"
            >
                <Typography
                    variant="h6"
                    sx={{ color: 'white', padding: '10px' }}
                >
                    Users
                </Typography>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {users.map((user, index) => (
                        <li
                            key={index}
                            style={{
                                padding: '10px',
                                backgroundColor:
                                    selectedUserId === user.id
                                        ? '#394b59'
                                        : 'transparent',
                                color: 'white',
                                cursor: 'pointer',
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

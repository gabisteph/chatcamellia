import Box from '@mui/material/Box'
import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import camellia from './camellia.js'
import RSAHandler from './rsaKeyGeneration.js'
import { Typography } from '@mui/material'
import { useUser } from './hook/useUser.js'
import { useCurrentUser } from './hook/usersContactList.js'
import { useChat } from './hook/useChat.js'
import { useSession } from './hook/useSession.js'
import ContactsIcon from '@mui/icons-material/Contacts'

import { useUserChat } from './contexts/useUserChat.js'

const SERVER_URL = 'http://localhost:8000'
export default function ContactList() {
    const [localChats, setLocalChats] = useState([])
    const [newUsername, setNewUsername] = useState('')
    const [users, setUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState(null) // State to track selected user ID
    const [currentChatUser, setCurrentChatUser] = useState(null)
    const { CurrentUser, setCurrentUser } = useCurrentUser()

    const socketRef = useRef()
    const { CurrentUserPUblicKey, setCurrentUserPublicKey } = useUser()
    // const {currentSession, setCurrentSession} = useSession()
    const { currentSession, setCurrentSession, userSessions, setUserSessions } =
        useSession()

    const { messages, setMessages } = useChat()

    const { changeUsername } = useUserChat()

    useEffect(() => {
        socketRef.current = io(SERVER_URL, {
            transports: ['websocket'],
            rejectUnauthorized: false,
        })

        socketRef.current.on('connect', () => {
            console.log('Connect')
        })

        socketRef.current.on('usersList', async (usersList) => {
            console.log('USER LIST', usersList)
            const storedUsername = sessionStorage.getItem('username')
            console.log('STORED USER', storedUsername)
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
            console.log('raw base64')
            console.log(base64)
            const cleanedBase64 = base64.trim().replace(/\s/g, '')
            console.log('Cleaned base64')
            console.log(cleanedBase64)
            const binaryString = window.atob(cleanedBase64)
            if (binaryString != null) {
                const len = binaryString.length
                const bytes = new Uint8Array(len)
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i)
                }
                return bytes.buffer

                // ... rest of your code ...
            } else {
                console.error('binaryString is undefined')
                console.log(binaryString)
            }
        } catch (error) {
            console.error('Error decoding Base64 string:', error)
            // Handle error or return a fallback
        }
    }
    async function decryptMessages(text, key) {
        const keyBuffer = base64ToArrayBuffer(key)
        const privateKey = sessionStorage.getItem('privateKey')
        const privateKeyObject = JSON.parse(privateKey)
        console.log('Chave privada', privateKeyObject)
        // Import the key back into a CryptoKey
        const importedPrivateKey = await window.crypto.subtle.importKey(
            'jwk',
            privateKeyObject,
            { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
            false,
            ['decrypt']
        )
        try {
            const decryptedKey = await RSAHandler.rsaDecrypt(
                importedPrivateKey,
                keyBuffer
            )

            const plainTextBuffer = camellia.decrypt(
                text,
                decryptedKey,
                'cbc',
                '\x05'
            )
            console.log('Camellia been executed successfully')
            console.log('Decrypted Message:', plainTextBuffer)
            return plainTextBuffer
        } catch (error) {
            console.error('Error decrypting the key:', error)
            // return "Error: " + error
            // Handle error or return a fallback
        }
        // Assuming 'text' is the encrypted message
        // const textBuffer = base64ToArrayBuffer(text)
    }

    const handleUserClick = async (user) => {
        setCurrentUser(user.id_)
        console.log('User clicked')
        console.log(doesSessionExist(user.id_))
        if (!doesSessionExist(user.id_)) {
            console.error('Session does not exist')
            const sessionId = generateSessionId() // Your session ID generation logic
            userSessions[user.id_] = sessionId
            // setUserSessions((prevSessions) => ({
            //     ...prevSessions,
            //     [user.id_]: sessionId,
            // }))
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
            console.log(user.id_)
            console.log(userSessions)
            const sessionId = getSessionIdById(user.id_)
            console.log(sessionId)
            setCurrentSession(sessionId)
            console.log('Session id')
            console.log(currentSession)
            const response = await fetch(
                `http://localhost:8000/history/${sessionId}`
            )
            if (response.ok) {
                const data = await response.json()

                if (data.length > 0) {
                    const decryptedMessages = await Promise.all(
                        data.map(async (message) => {
                            console.log('mensagem do historico:')
                            console.log(message.text)
                            console.log('Chave simétrica criptografada')
                            console.log(message.key)
                            const { text, key, sender } = message
                            if (sender == user.id_) {
                                const decryptedText = await decryptMessages(
                                    text,
                                    key
                                )
                                console.log('decryption function was executed')
                                console.log(decryptedText)
                                const depryptedMessage = {
                                    text: decryptedText,
                                    sender: sender,
                                }
                                return depryptedMessage
                            } else {
                                const { text, key, sender, sender_key } =
                                    message
                                const decryptedText = await decryptMessages(
                                    text,
                                    sender_key
                                )
                                console.log('decryption function was executed')
                                console.log(decryptedText)
                                const depryptedMessage = {
                                    text: decryptedText,
                                    sender: sender,
                                }
                                return depryptedMessage
                            }
                        })
                    )
                    console.log('Messages from history')
                    console.log(decryptedMessages)
                    setMessages(decryptedMessages)

                    // setMessages(decryptedMessages)
                } else {
                    setMessages([])
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
                changeUsername(user.username)
            } else {
                console.error('Failed to fetch public key:', response.status)
            }
        } catch (error) {
            console.error('Error fetching public key:', error)
        }

        // setUsers([])
    }
    // ...rest of your component logic...

    return (
        <Box height="100%" width="30%" overflow="hidden">
            <Box
                bgcolor="#9c6fe487"
                overflowY="auto"
                minWidth="240px"
                borderRadius="0px 0px 0px 0px"
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '60px',
                        gap: '8px',
                        borderBottom: '1px solid #fff'
                    }}
                >
                    <ContactsIcon sx={{ fontSize: 38, color: 'white' }} />
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'white',
                            fontFamily: 'Poppins',
                        }}
                        lineHeight="10px"
                        fontSize="24px"
                    >
                        Contacts Online
                    </Typography>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
                                borderColor: '#9c6fe487',
                                fontFamily: 'Poppins',
                            }}
                            onClick={() => handleUserClick(user)}
                        >
                            <span
                                style={{
                                    color: 'white',
                                    fontSize: '16px',
                                }}
                            >
                                {user.username}
                            </span>
                        </li>
                    ))}
                </ul>
            </Box>
        </Box>
    )
}

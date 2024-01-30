import React, { useState, useEffect, useRef } from 'react'
import { Avatar, Box, Input, Typography } from '@mui/material'
import { io } from 'socket.io-client'
import camellia from './camellia.js'
import RSAHandler from './rsaKeyGeneration.js'
import { useUser } from './hook/useUser.js'
import { useChat } from './hook/useChat.js'
import { useCurrentUser } from './hook/usersContactList.js'
import { useSession } from './hook/useSession.js'
import { ChatHeader } from './components/Chat/chatHeader.js'

console.log('Imported camellia', camellia)

const Chat = () => {
    // Pega daqui
    // const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('')

    const SERVER_URL = 'http://localhost:8000'
    const socketRef = useRef(null)
    const [username, setUsername] = useState('')
    // const [users, setUsers] = useState([]) /// Lista de usuários que vai sendo atualizada para exibir na tela
    const [currentChatUser, setCurrentChatUser] = useState(null)
    const [privateKey, setPrivateKey] = useState('')
    const [publicKey, setPublicKey] = useState('')
    const [sid, setSid] = useState('')
    // const [userSessions, setUserSessions] = useState({});
    // const [currentSession, setCurrentSession] = useState('')
    const [myIdUser, setMyIdUser] = useState('')
    const [CurrentSymmetricKey, setSymmetricKey] = useState('')
    const [MyUserPublicKey, setUserPublicKey] = useState('')
    const [CurrentUserPublic, setCurrentUserPublic] = useState('')
    const [currentGroupPublicKeys, setCurrentGroupPublicKeys] = useState([])
    // const [groups, setGroups] = useState('')
    // CurrentUserPublic é a chave do usuário que eu vou enviar a mensagem

    const { messages, setMessages } = useChat()
    const { CurrentUserPUblicKey, setCurrentUserPublicKey } = useUser()
    const { CurrentUser, setCurrentUser, users, setUsers, groups, setGroups } = useCurrentUser()
    const {currentGroup, setCurrentGroup} = useState('')
    const { currentSession, setCurrentSession, userSessions, setUserSessions } =
        useSession()

    useEffect(() => {
        
        socketRef.current = io(SERVER_URL, {
            transports: ['websocket'],
            rejectUnauthorized: false,
        })
        const user_id = sessionStorage.getItem('userId')
        setMyIdUser(user_id)
        async function decryptMessages(text, key) {
            const keyBuffer = base64ToArrayBuffer(key)
            console.log('decrypted key buffer', keyBuffer)
            const privateKey = sessionStorage.getItem('privateKey')
            console.log('private key', privateKey)
            const privateKeyObject = JSON.parse(privateKey)
            console.log('private key object', privateKeyObject)

            // Import the key back into a CryptoKey
            console.log('recebendo a mensagem criptografada:', text)
            const importedPrivateKey = await window.crypto.subtle.importKey(
                'jwk',
                privateKeyObject,
                { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
                false,
                ['decrypt']
            )
            console.log('import key object', importedPrivateKey)
            const decryptedKey = await RSAHandler.rsaDecrypt(
                importedPrivateKey,
                keyBuffer
            )
            console.log('Chave simetrica descriptografada')
            console.log(decryptedKey)
            // Assuming 'text' is the encrypted message
            // const textBuffer = base64ToArrayBuffer(text);
            const plainTextBuffer = camellia.decrypt(
                text,
                decryptedKey,
                'cbc',
                '\x05'
            )
            console.log('Camellia been executed successfully')
            console.log('Message descriptografada', plainTextBuffer)
            return plainTextBuffer
        }

        // Essa função é a de cadastro
        // Eu preciso do username
        // Preciso que as chaves rsa sejam geradas no login ou no cadastro
        function exportKey(key) {
            return window.crypto.subtle.exportKey('jwk', key)
        }
        const publishPublicKey = async () => {
            const storedUsername = sessionStorage.getItem('username')
            setUsername(storedUsername)
            console.log('Username:', storedUsername)
            const NewSid = sessionStorage.getItem('Sid')
            setSid(NewSid)

            if (storedUsername && NewSid !== '');
            {
                setUsername(storedUsername)

                try {
                    // Essas chaves precisam ser geradas todas as vezes que o usuário entrar no chat
                    const keyPair = await RSAHandler.generateRsaKeys()
                    console.log('Gerando as chaves')
                    setPrivateKey(keyPair.privateKey)
                    setPublicKey(keyPair.publicKey)
                    console.log('Chave pública ->>>', keyPair.publicKey)
                    console.log('Chave privada ->>>', keyPair.privateKey)
                    // Export the key to a storable format (e.g., JWK)
                    const exportedKeyPrivatekey = await exportKey(
                        keyPair.privateKey
                    )

                    // Store the exported key as a string
                    sessionStorage.setItem(
                        'privateKey',
                        JSON.stringify(exportedKeyPrivatekey)
                    )
                    const user_id = sessionStorage.getItem('userId')
                    console.log('userId: ', user_id)
                    console.log(user_id)
                    const ExportedPublicKey = await exportKey(keyPair.publicKey)
                    setUserPublicKey(ExportedPublicKey)
                    // sessionStorage.setItem('', JSON.stringify(exportedKeyPrivatekey));
                    // Preparing data to send
                    const userRegisterData = JSON.stringify({
                        user_id: user_id,
                        public_key: ExportedPublicKey, // Exporting publicKey in a usable format
                        sid: NewSid,
                    })
                    console.log(userRegisterData);
                    const response = await fetch(`http://localhost:8000/update-public-key/${user_id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: userRegisterData
                    });
                } catch (error) {
                    console.error('error in publish public key:', error)
                }
            }
        }
        function base64ToArrayBuffer(base64) {
            try {
                // base64 = base64.replace(/\s/g, ''); // Clean the base64 string
                console.log('Transformando de base64 para arrayBuffer')
                const cleanedBase64 = base64.trim().replace(/\s/g, '')
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

    

        //Esse aqui é o evento que recebe as mensagens de algum usuário
        socketRef.current.on('clientMessage', async (incomingMessages) => {
            const decryptedMessages = await Promise.all(
                incomingMessages.map(async (message) => {
                    const { text, key, sender, session_id } = message
                    setUserSessions((prevSessions) => ({
                        ...prevSessions,
                        [sender]: session_id,
                    }))

                    userSessions[sender] = session_id
                    console.log('Recebendo menssage')
                    setCurrentSession(session_id)
                    console.log('Chave simetrica recebida')
                    console.log(key)
                    setCurrentUser(sender)
                    const plainText = await decryptMessages(text, key)
                    const response = await fetch(
                        `http://localhost:8000/public-key/${sender}`
                    )
                    if (response.ok) {
                        const data = await response.json()
                        const publicKey = data.public_key
                        setCurrentUser(data.id_)
                        setCurrentUserPublicKey(publicKey)
                        setCurrentUserPublicKey(publicKey)

                    } else {
                        console.error(
                            'Failed to fetch public key:',
                            response.status
                        )
                    }
                    console.log('Decrypted message:')
                    console.log(plainText)

                    return { ...message, text: plainText }
                })
            )

            setMessages((prevMessages) => [
                ...prevMessages,
                ...decryptedMessages,
            ])
        })

        socketRef.current.on('groupMessage', async (incomingMessages) => {
            const decryptedMessages = await Promise.all(
                incomingMessages.map(async (message) => {
                    // const { text, key, sender, session_id } = message
                    const {group_id, text, receivedkeys, session_id} = message
                    const myEncryptedKey = receivedkeys[myIdUser]
                    setUserSessions((prevSessions) => ({
                        ...prevSessions,
                        [group_id]: session_id,
                    }))
                    userSessions[group_id] = session_id
                    setCurrentUser(group_id)
                    console.log('Recebendo menssage')
                    // setCurrentSession(session_id)
                    console.log('Chave simetrica recebida')
                    // console.log(key)
                    // setCurrentGroup(sender)
                    const plainText = await decryptMessages(text, myEncryptedKey)
                    const response = await fetch(
                        `http://localhost:8000/group-public-keys/${group_id}`
                        
                    )
                    if (response.ok) {
                        const data = await response.json()
                        const publicKey = data.keys
                        setCurrentGroupPublicKeys(data)
                        setCurrentGroup(data.group_id)
                        setCurrentUserPublicKey(publicKey)
                    } else {
                        console.error(
                            'Failed to fetch public key:',
                            response.status
                        )
                    }
                    console.log('Decrypted message:')
                    console.log(plainText)

                    return { ...message, text: plainText }
                })
            )

            setMessages((prevMessages) => [
                ...prevMessages,
                ...decryptedMessages,
            ])
        })

        socketRef.current.on('messageHistory', (history) => {
            setMessages(history) // Assume history is an array of message objects
        })

        // Evento para listar usuários
        socketRef.current.on('usersList', (usersList) => {
            // Filter out the current user's data from the list
            console.log('Recebendo a lista de usuários no chat:')
            console.log(usersList)
            const storedUsername = sessionStorage.getItem('username')
            const otherUsers = usersList.filter(
                (user) => user.username !== storedUsername
            )
            // Update the state with the list of other users
            setUsers(otherUsers)
            // socketRef.current.off('userList');
        })

        // Evento para receber o Sid
        socketRef.current.on('getSid', async (receivedSid) => {
            console.log('Received sid: ' + receivedSid)
            sessionStorage.setItem('Sid', receivedSid)
            setSid(receivedSid)
            await publishPublicKey()
        })
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                setUsers([])
            }
        }
    }, [])

    function generateSymmetricKey() {
        return window.crypto.getRandomValues(new Uint8Array(32))
    }
    // };
    //Essa função é para importar a chave criptografada no formato CryptoKey
    async function importRsaKey(jwkKey, keyType) {
        let algorithm
        let usages

        if (keyType === 'public') {
            algorithm = {
                name: 'RSA-OAEP',
                hash: { name: 'SHA-256' },
            }
            usages = ['encrypt'] // or other usages for a public key
        } else if (keyType === 'private') {
            algorithm = {
                name: 'RSA-OAEP',
                hash: { name: 'SHA-256' },
            }
            usages = ['decrypt'] // or other usages for a private key
        } else {
            throw new Error("Invalid key type. Must be 'public' or 'private'.")
        }

        const cryptoKey = await window.crypto.subtle.importKey(
            'jwk',
            jwkKey,
            algorithm,
            true,
            usages
        )

        return cryptoKey
    }
    const sendMessage = async () => {

        // if 
        const item = CurrentUser
        if (newMessage.trim() === '') {
            return
        }
        const isGroup = groups.some(group => group.id === item);
        if (isGroup){
        // if (item === currentGroup){
            // if (newMessage.trim() === '') {
            //     return
            // }
            console.log('Sending message to a group')
            const keys = currentGroupPublicKeys
    
            function bufferToBase64(buffer) {
                const binary = String.fromCharCode.apply(
                    null,
                    new Uint8Array(buffer)
                )
                return window.btoa(binary)
            }
    
            const SymmetricKey = generateSymmetricKey()
            console.log('Chave simetrica:')
            console.log(SymmetricKey)
            const symmetricKeyBuffer = SymmetricKey.buffer
            setSymmetricKey(symmetricKeyBuffer)
            console.log('Buffer da chave simetrica:')
            console.log(symmetricKeyBuffer)
            const Iv = camellia.mkIV()
            const myHash = {
                data: newMessage,
                key: SymmetricKey,
                mode: 'cbc',
                iv: Iv,
                pchar: '\x05',
            }
            console.log('Current User Public')
            console.log(CurrentUserPUblicKey)


            const encryptedKeysForGroup = {};

    // Encrypt the symmetric key for each group member
            for (const [memberId, publicKey] of Object.entries(keys)) {
                const importedKey = await importRsaKey(publicKey, 'public');
                const encryptedSymmetricKey = await RSAHandler.rsaEncrypt(importedKey, symmetricKeyBuffer);
                encryptedKeysForGroup[memberId] = bufferToBase64(encryptedSymmetricKey);
            }

            // Criando cópia da chave simetrica criptografada para descriptografar no historico mais tarde
            const senderImportedKey = await importRsaKey(MyUserPublicKey, 'public')
            const encryptedSymmetricKeyForSender = await RSAHandler.rsaEncrypt(
                senderImportedKey,
                symmetricKeyBuffer
            )
            const encryptedSymmetricKeyForSenderBase64 = bufferToBase64(
                encryptedSymmetricKeyForSender
            )
    
            const encryptedMessage = camellia.encrypt(myHash)
            const messageData = {
                text: encryptedMessage,
                from: myIdUser,
                to: CurrentUser, // Replace with logic to determine the target user
                keys: encryptedKeysForGroup,
                sender_key: encryptedSymmetricKeyForSenderBase64, // Key encrypted with sender's public key
                iv: Iv,
                session_id: currentSession,
                is_group_message: true,
                group_id: item,
                type: 'group'
            }
    
            if (socketRef.current) {
                socketRef.current.emit('message', messageData)
            }
    
            const updatedMessages = [
                ...messages,
                { text: newMessage, sender: myIdUser },
            ]
            setMessages(updatedMessages)
            setNewMessage('')
        }
        else{


        // if (newMessage.trim() === '') {
        //     return
        // }

        function bufferToBase64(buffer) {
            const binary = String.fromCharCode.apply(
                null,
                new Uint8Array(buffer)
            )
            return window.btoa(binary)
        }

        const SymmetricKey = generateSymmetricKey()
        console.log('Chave simetrica:')
        console.log(SymmetricKey)
        const symmetricKeyBuffer = SymmetricKey.buffer
        setSymmetricKey(symmetricKeyBuffer)
        console.log('Buffer da chave simetrica:')
        console.log(symmetricKeyBuffer)
        const Iv = camellia.mkIV()
        const myHash = {
            data: newMessage,
            key: SymmetricKey,
            mode: 'cbc',
            iv: Iv,
            pchar: '\x05',
        }
        console.log('Current User Public')
        console.log(CurrentUserPUblicKey)
        const ImportedKey = await importRsaKey(CurrentUserPUblicKey, 'public')
        const encrypted_public_key = await RSAHandler.rsaEncrypt(
            ImportedKey,
            symmetricKeyBuffer
        )
        const encryptedPublicKeyBase64 = bufferToBase64(encrypted_public_key)
        console.log('chave simetrica enviada')
        console.log(encryptedPublicKeyBase64)

        // Criando cópia da chave simetrica criptografada para descriptografar no historico mais tarde
        const senderImportedKey = await importRsaKey(MyUserPublicKey, 'public')
        const encryptedSymmetricKeyForSender = await RSAHandler.rsaEncrypt(
            senderImportedKey,
            symmetricKeyBuffer
        )
        const encryptedSymmetricKeyForSenderBase64 = bufferToBase64(
            encryptedSymmetricKeyForSender
        )

        const encryptedMessage = camellia.encrypt(myHash)
        const messageData = {
            text: encryptedMessage,
            from: myIdUser,
            to: CurrentUser, // Replace with logic to determine the target user
            key: encryptedPublicKeyBase64,
            sender_key: encryptedSymmetricKeyForSenderBase64, // Key encrypted with sender's public key
            iv: Iv,
            session_id: currentSession,
            type: 'individual'

        }

        if (socketRef.current) {
            socketRef.current.emit('message', messageData)
        }

        const updatedMessages = [
            ...messages,
            { text: newMessage, sender: myIdUser },
        ]
        setMessages(updatedMessages)
        setNewMessage('')
    }
}


    return (
        <Box height="100%" width="100%" display="flex" flexDirection="column">
            <ChatHeader />
            <Box display="flex" flexDirection="column" flexGrow={1}>
                <Box flex={1} overflowY="auto" paddingX="8px">
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            display="flex"
                            justifyContent={
                                message.sender === myIdUser
                                    ? 'flex-end'
                                    : 'flex-start'
                            }
                            alignItems="flex-end"
                            mb={1}
                        >
                            {message.sender === myIdUser ? null : <Avatar sx={{marginRight: '8px'}} />}
                            <Box
                                bgcolor={
                                    message.sender === myIdUser
                                        ? '#9c6fe487'
                                        : '#9C6FE4'
                                }
                                color="white"
                                borderRadius={message.sender === myIdUser ? "0px 6px 6px 6px" : "6px 0px 6px 6px"}
                                p={1}
                                maxWidth="70%"
                            >
                                <Typography
                                    variant="body1"
                                    sx={{ wordWrap: 'break-word' }}
                                >
                                    {message.text}
                                </Typography>
                                {/* <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
                {message.text instanceof Promise ? 'Loading...' : message.text}
            </Typography> */}
                            </Box>
                            {message.sender === myIdUser ? (
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
                    background: '#9c6fe487',
                    padding: '0px 15px',
                    borderTop: '1px solid #9c6fe487', // Added a border for separation
                }}
            >
                <Box flex={1} pl="5px" pr="5px">
                    <Input
                        fullWidth
                        disableUnderline
                        placeholder="Type a message"
                        sx={{
                            background: '#FFF',
                            height: '42px',
                            borderRadius: '6px',
                            color: 'black',
                            padding: '0px 10px',
                        }}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendMessage()
                            }
                        }}
                    />
                </Box>
            </Box>
        </Box>
    )
}


export default Chat

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
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, Checkbox, FormControlLabel } from '@mui/material';
import { useUserChat } from './contexts/useUserChat.js'
import TextField from '@mui/material/TextField';


const SERVER_URL = process.env.REACT_APP_BASE_URL
export default function ContactList() {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const [localChats, setLocalChats] = useState([])
    const [newUsername, setNewUsername] = useState('')
    const [selectedUserId, setSelectedUserId] = useState(null) // State to track selected user ID
    const [currentChatUser, setCurrentChatUser] = useState(null)
    const [groupName, setGroupName] = useState(''); // Add this state for holding the group name

    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState({});

    const handleCreateGroup = () => {
        setIsGroupDialogOpen(true); // Open the group creation dialog
    };

    const handleGroupDialogClose = () => {
        setIsGroupDialogOpen(false); // Close the group creation dialog
    };

    const socketRef = useRef()
    // const { CurrentUserPUblicKey, setCurrentUserPublicKey } = useUser()
    const { CurrentUserPUblicKey, setCurrentUserPublicKey, myIdUser, setMyIdUser } = useUser()

    // const {currentSession, setCurrentSession} = useSession()
    const { CurrentUser, setCurrentUser, users, setUsers, groups, setGroups } = useCurrentUser()

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
            // const storedUsername = sessionStorage.getItem('username')
            const storedUsername = localStorage.getItem('username')

            console.log('STORED USER', storedUsername)
            const otherUsers = usersList.filter(
                (user) => user.username !== storedUsername
            )
            setUsers(otherUsers)
            console.log('User id', myIdUser)
            // const user_id = sessionStorage.getItem('userId')
            const user_id = localStorage.getItem('userId')

            const groupsResponse = await fetch(
                `${baseUrl}/get-groups/${user_id}`
                
            )
            console.log(groupsResponse)
            if (groupsResponse.ok) {

                const groupsData = await groupsResponse.json();
            // Assuming groupsData is an array of group objects
                console.log('GROUPS', groupsData);

                // Combine users and groups data (adjust according to your needs and data structure)
                const combinedData = [...otherUsers, ...groupsData];

                // Update your state with the combined data
                setUsers(combinedData);
                setGroups(groupsData);
                
            }

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
        console.log('User ID:', userId); // Check the user ID
        console.log('User Sessions:', userSessions); // Inspect the entire userSessions object
        return userSessions[userId]
    }
    function base64ToArrayBuffer(base64) {
        try {
            // console.log('raw base64')
            // console.log(base64)
            const cleanedBase64 = base64.trim().replace(/\s/g, '')
            // console.log('Cleaned base64')
            // console.log(cleanedBase64)
            const binaryString = window.atob(cleanedBase64)
            if (binaryString != null) {
                const len = binaryString.length
                const bytes = new Uint8Array(len)
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i)
                }
                return bytes.buffer

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
        // localStorage.setItem("myPrivateKey", JSON.stringify(ExportedPrivateKey));

        const privateKey = localStorage.getItem('myPrivateKey')
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
            console.log('Camellia foi executado')
            console.log('Messagem descriptografada:', plainTextBuffer)
            return plainTextBuffer
        } catch (error) {
            console.error('Error decrypting the key:', error)
            
        }
       
    }

    const handleCloseGroupDialog = () => {
        setIsGroupDialogOpen(false);
    };

    const handleToggleUserSelection = (userId) => {
        setSelectedUsers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));

    };

    const handleGroupCreationConfirm = async () => {
        // Logic to create group with selected user IDs
        if (!groupName.trim()) {
            alert("Please enter a group name.");
            return;
        }
        const selectedUserIds = Object.keys(selectedUsers).filter(userId => selectedUsers[userId]);
        console.log('Criando grupo com os seguintes usuários:', selectedUserIds);
        selectedUserIds.push(myIdUser)
        // const groupName = "New Group";
        const sessionId = generateSessionId();
        const groupData = {
            group_name: groupName,
            members: selectedUserIds,
            session_id: sessionId
            // ... any other group info ...
        };
        
        // Define the URL of your FastAPI endpoint for group creation
        const url = '${baseUrl}/groups'; // Update with your actual endpoint
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include other headers like authorization if needed
                },
                body: JSON.stringify(groupData),
            });
    
            if (response.ok) {
                const data = await response.json();
                setGroups(prevGroups => [...prevGroups, data]);
                // setGroups(prevGroups => [...(prevGroups || []), data]);
                console.log('Groupo criado:', data);
                console.log("grupos disponível:", groups)
                // Perform actions based on response, if necessary
            } else {
                // Handle errors if the response is not ok (e.g., status code is not 2xx)
                console.error('Failed to create group:', response.status);
            }
        } catch (error) {
            // Handle network errors or other unexpected errors
            console.error('Error creating group:', error);
        }
        // TODO: Add your logic to create a group, such as an API call

        setIsGroupDialogOpen(false);
        setSelectedUsers({});

    };
    // async function decryptMessages
    async function createSessionID (user) {
        if (!doesSessionExist(user.id_)) {
            const sessionId = generateSessionId() // Your session ID generation logic
            userSessions[user.id_] = sessionId
            console.log('getting session for user', user)

            // setUserSessions((prevSessions) => ({
            //     ...prevSessions,
            //     [user.id_]: sessionId,
            // }))
            console.log('Criando uma sessão')
            setCurrentSession(sessionId)
            console.log('Session')
            console.log(sessionId)
            return sessionId
        } else {
            console.log('getting session for user', user)
            console.log(user)
            const sessionId = getSessionIdById(user.id_)
            console.log('Getting existing session', sessionId)
            setCurrentSession(sessionId)
            return sessionId
        }
       
    }

    const handleUserClick = async (item) => {
        console.log('handleUserClick');
        console.log(item)
        if (item.type === 'user'){
        const user = item
        setCurrentUser(user.id_)
        console.log('Session exists?')
        console.log(doesSessionExist(user.id_))
        try {
            // const getSessionIdById = (userId) => {
            //     return userSessions[userId]
            // }
            const sessionId = await createSessionID(user)
            console.log('Got session id from function: ' + sessionId)
            console.log(sessionId)

            console.log('USER_ID')
            console.log(user.id_)
            // const sessionId = getSessionIdById(user.id_)
            setCurrentSession(sessionId)
            console.log('Session id')
            const response = await fetch(
                `${baseUrl}/history/${sessionId}`
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
                            const { text, key, sender, sender_key } = message
                            if (sender === user.id_) {
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
                            else {
                                const { text, key, sender, sender_key } = message
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
                `${baseUrl}/public-key/${user.id_}`
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
    else{
        if (item.type === 'group') {
            console.log("Iniciando conversa em grupo")
            setCurrentUser(item.id_)

            if (!doesSessionExist(item.id_)) {
                console.log('Session does not exist')
                const sessionId = generateSessionId() // Your session ID generation logic
                userSessions[item.id_] = sessionId
                setCurrentSession(sessionId)
                console.log('Session')
                console.log(sessionId)
            } else {
                const sessionId = getSessionIdById(item.id_)
                setCurrentSession(sessionId)
            }
            setCurrentUser(item.id_)
            console.log('Groupo:', item.id_)
            try {
                const getSessionIdById = (userId) => {
                    return userSessions[userId]
                }
                const sessionId = getSessionIdById(item.id_)
                const response = await fetch(
                    `${baseUrl}/history/${sessionId}`
                )
                if (response.ok) {
                    const data = await response.json()
                
                    if (data.length > 0) {
                        const decryptedMessages = await Promise.all(
                            data.map(async (message) => {
                                
                                const {group_id, text, keys, session_id, sender} = message
                                const myEncryptedKey = keys[myIdUser]
                                setUserSessions((prevSessions) => ({
                                    ...prevSessions,
                                    [group_id]: session_id,
                                }))
                                userSessions[group_id] = session_id
                                setCurrentUser(group_id)
                                console.log('Recebendo mensagem')
                                console.log('Chave simetrica criptografada recebida')
                                console.log(myEncryptedKey)
                                console.log("Texto criptografado")
                                console.log(text)
                                const decryptedText = await decryptMessages(
                                    text,
                                    myEncryptedKey
                                )
                                console.log('Função de descriptografia foi executada')
                                console.log(decryptedText)
                                const depryptedMessage = {
                                    text: decryptedText,
                                    sender: sender,
                                }
                                return depryptedMessage
        
                            })
                    )
                    setMessages(decryptedMessages)
                    }
                    else{
                        setMessages([])
                    }
                }
                else{
                    console.error('History:', response.status)
                }
                // setMessages(decryptedMessages)
            }
            catch (error) {
                console.error('Error fetching history:', error)
            }

            // You can now use this publicKey for further operations
        } 
    } 
    }
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
                        height: '50px',
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
                                    selectedUserId === user.id_
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
                <Button variant="contained" onClick={handleCreateGroup}>Create Group</Button>
            
            <Dialog open={isGroupDialogOpen} onClose={handleCloseGroupDialog}>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogContent>
                <TextField
                autoFocus
                margin="dense"
                id="group-name"
                label="Group Name"
                type="text"
                fullWidth
                variant="standard"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)} // Update the state when the input changes
            />
                    <List>
                        {users.map(user => (
                            <ListItem key={user.id_} button onClick={() => handleToggleUserSelection(user.id_)}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!selectedUsers[user.id_]}
                                            onChange={() => handleToggleUserSelection(user.id_)}
                                        />
                                    }
                                    label={user.username}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGroupDialog}>Cancel</Button>
                    <Button onClick={handleGroupCreationConfirm}>Create</Button>
                </DialogActions>
            </Dialog>
            </Box>
        </Box>    
    )
}

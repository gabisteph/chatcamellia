import { Box } from '@mui/material'
import React from 'react'
import ContactList from './ContactList'
import Chat from './Chat'
import { UserChatProvider } from './contexts/useUserChat'

const Home = () => {
    return (
        <UserChatProvider>
            <Box display="flex" width="100%" flexDirection="row" height="100vh">
                <ContactList />
                <Box
                    sx={{
                        border: '.05px solid #9c6fe433',
                    }}
                />
                <Chat />
            </Box>
        </UserChatProvider>
    )
}

export default Home

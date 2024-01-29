import { useState, createContext, useContext } from 'react'

const UserChatContext = createContext()

export const UserChatProvider = ({ children }) => {
    const [username, setUsername] = useState('')

    function changeUsername(username) {
        setUsername(username)
    }
    return (
        <UserChatContext.Provider value={{ username, changeUsername }}>
            {children}
        </UserChatContext.Provider>
    )
}

export const useUserChat = () => {
    return useContext(UserChatContext)
}

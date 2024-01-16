import { createContext, useContext, useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({children}) => {
    const [messages, setMessages] = useState([]);

    return <ChatContext.Provider value={{messages, setMessages}}>{children}</ChatContext.Provider>
}

export function useChat() {
    const context = useContext(ChatContext);
    return context
}
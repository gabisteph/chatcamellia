import { createContext, useContext, useState } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({children}) => {
    const [currentSession, setCurrentSession] = useState('');
    const [userSessions, setUserSessions] = useState({})

    return <SessionContext.Provider value={{currentSession, setCurrentSession, userSessions, setUserSessions}}>{children}</SessionContext.Provider>

}

export function useSession() {
    const context = useContext(SessionContext);
    return context
}
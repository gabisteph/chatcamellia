import { createContext, useContext, useState } from "react";

export const UsersContext = createContext();

export const CurrentUserProvider = ({children}) => {
    const [CurrentUser, setCurrentUser] = useState('');
    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    
    return <UsersContext.Provider value={{CurrentUser, setCurrentUser, users, setUsers, groups, setGroups}}>{children}</UsersContext.Provider>
}

export function useCurrentUser() {
    const context = useContext(UsersContext);
    return context
}
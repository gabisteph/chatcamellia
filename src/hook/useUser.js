import { createContext, useContext, useState } from "react";

export const UsersListContext = createContext();

export const ListProvider = ({children}) => {
    const [CurrentUserPUblicKey, setCurrentUserPublicKey] = useState('');
    

    return <UsersListContext.Provider value={{CurrentUserPUblicKey, setCurrentUserPublicKey}}>{children}</UsersListContext.Provider>
}

export function useUser() {
    const context = useContext(UsersListContext);
    return context
}
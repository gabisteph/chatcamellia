import { createContext, useContext, useState } from "react";

export const UsersContext = createContext();

export const CurrentUserProvider = ({children}) => {
    const [CurrentUser, setCurrentUser] = useState('');
    

    return <UsersContext.Provider value={{CurrentUser, setCurrentUser}}>{children}</UsersContext.Provider>
}

export function useCurrentUser() {
    const context = useContext(UsersContext);
    return context
}
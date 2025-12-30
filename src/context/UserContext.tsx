// contexts/UserContext.tsx
import {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';

interface User {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = Cookies.get('token');
        console.log("Token: ", token);
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                console.log("Get token from backend");
                console.log(decoded);
                setUser(
                    {
                        username: decoded.sub,
                        email: decoded.email,
                        firstName: decoded.firstName,
                        lastName: decoded.lastName,
                    }
                );
            } catch (err) {
                console.error('Invalid token', err);
            }
        }
    }, []);

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};

// Hook for components
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be inside UserProvider');
    return context;
};

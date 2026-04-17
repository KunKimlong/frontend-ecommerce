// contexts/UserContext.tsx
import {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import Cookies from 'js-cookie';
import {User} from "@/type/User";
import {AuthService} from "@/service/auth.service";

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            Cookies.remove('authToken');
            setUser(null);
            window.location.href = '/signin';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (token) {
            try {

                 AuthService.me().then((user) =>{
                    setUser(user);
                }).catch((err) => {
                    console.error('Failed to fetch user', err);
                    setUser(null);
                });
            } catch (err) {
                console.error('Invalid token', err);
            }
        }
    }, []);

    return (
        <UserContext.Provider value={{user, setUser, logout}}>
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

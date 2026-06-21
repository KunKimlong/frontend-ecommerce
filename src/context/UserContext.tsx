import {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import Cookies from 'js-cookie';
import {MeResponse} from "@/type/Auth";
import {AuthService} from "@/service/auth.service";

interface UserContextType {
    user: MeResponse | null;
    setUser: (user: MeResponse | null) => void;
    logout: () => Promise<void>;
    can: (permission: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<MeResponse | null>(null);

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
            AuthService.me().then((user) =>{
                setUser(user);
            }).catch((err) => {
                console.error('Failed to fetch user', err);
                setUser(null);
            });
        }
    }, []);

    const can = (permission: string): boolean => {
        return user?.permissions?.includes(permission) ?? false;
    };

    return (
        <UserContext.Provider value={{user, setUser, logout, can}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be inside UserProvider');
    return context;
};
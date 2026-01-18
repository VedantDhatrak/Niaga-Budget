import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // In a real app, check for stored token on mount
    // useEffect(() => { ... }, []);

    const login = (token, user) => {
        setUserToken(token);
        setUserInfo(user);
        // AsyncStorage.setItem('userToken', token);
        // AsyncStorage.setItem('userInfo', JSON.stringify(user));
    };

    const logout = () => {
        setUserToken(null);
        setUserInfo(null);
        // AsyncStorage.removeItem('userToken');
        // AsyncStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{
            login,
            logout,
            userToken,
            userInfo,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

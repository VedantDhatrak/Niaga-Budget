import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = async () => {
        try {
            setLoading(true);
            let userToken = await AsyncStorage.getItem('userToken');
            let userInfo = await AsyncStorage.getItem('userInfo');

            if (userToken) {
                setUserToken(userToken);
                setUserInfo(JSON.parse(userInfo));
            }
        } catch (e) {
            console.log(`isLogged in error ${e}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        isLoggedIn();
    }, []);

    const login = (token, user) => {
        setLoading(true);
        setUserToken(token);
        setUserInfo(user);
        AsyncStorage.setItem('userToken', token);
        AsyncStorage.setItem('userInfo', JSON.stringify(user));
        setLoading(false);
    };

    const logout = () => {
        setLoading(true);
        setUserToken(null);
        setUserInfo(null);
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('userInfo');
        setLoading(false);
    };

    const refreshUserData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const res = await client.get('/user/me', {
                headers: { 'x-auth-token': token }
            });

            console.log('Refreshed User Data:', res.data);
            setUserInfo(res.data);
            await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        } catch (e) {
            console.log(`refreshUserData error ${e}`);
            if (e.response && e.response.status === 401) {
                console.log('Token expired/invalid, logging out...');
                logout();
            }
        }
    };

    return (
        <AuthContext.Provider value={{
            login,
            logout,
            refreshUserData,
            userToken,
            userInfo,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

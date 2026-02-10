import React, { createContext, useState, useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { setServerCallbacks } from '../api/client';

export const ServerStatusContext = createContext();

export const ServerStatusProvider = ({ children }) => {
    const [isWakingUp, setIsWakingUp] = useState(false);

    useEffect(() => {
        setServerCallbacks(
            () => setIsWakingUp(true),   // onSlow
            () => setIsWakingUp(false)   // onResponded
        );
    }, []);

    return (
        <ServerStatusContext.Provider value={{ isWakingUp }}>
            {children}
            {isWakingUp && (
                <Modal visible={true} transparent animationType="fade">
                    <View style={styles.overlay}>
                        <View style={styles.content}>
                            <ActivityIndicator size="large" color="#FF7043" />
                            <Text style={styles.title}>Connecting to Server...</Text>
                            <Text style={styles.message}>
                                The server is waking up from sleep mode. This may take up to a minute. Please wait.
                            </Text>
                        </View>
                    </View>
                </Modal>
            )}
        </ServerStatusContext.Provider>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5,
        maxWidth: 300
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 8,
        color: '#333'
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    }
});

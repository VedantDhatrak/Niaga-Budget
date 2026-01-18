import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, useColorScheme } from 'react-native';
import { Colors } from '../theme/colors';

const SplashScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];

    useEffect(() => {
        // Simulate loading or wait for seconds then navigate
        const timer = setTimeout(() => {
            navigation.replace('Welcome');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.logoText, { color: colors.primary }]}>NIAGA</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>Welcome</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    subtitle: {
        marginTop: 10,
        fontSize: 18,
    },
});

export default SplashScreen;

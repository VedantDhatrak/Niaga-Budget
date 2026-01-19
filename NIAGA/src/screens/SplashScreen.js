import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    useColorScheme,
    ImageBackground,
} from 'react-native';
import { Colors } from '../theme/colors';
import background from '../../assets/background.jpg';

const SplashScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Welcome');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <ImageBackground
            source={background}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.content}>
                <Text style={[styles.logoText, { color: colors.primary }]}>
                    NIAGA
                </Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>
                    Welcome
                </Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
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

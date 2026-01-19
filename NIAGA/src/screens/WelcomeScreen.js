import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    useColorScheme,
    ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { CustomButton } from '../components/Button';
import background from '../../assets/background.jpg';

const WelcomeScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];

    return (
        <ImageBackground
            source={background}
            style={styles.background}
            resizeMode="cover"
        >
            {/* Dark overlay */}
            <View style={styles.overlay} pointerEvents="none" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: '#fff' }]}>
                        NIAGA
                    </Text>

                    <Text style={[styles.subtitle, { color: '#fff' }]}>
                        The best place to manage your business.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <CustomButton
                            title="Log In"
                            onPress={() => navigation.navigate('Login')}
                            theme={theme}
                            type="primary"
                        />

                        <CustomButton
                            title="Registration"
                            onPress={() => navigation.navigate('Register')}
                            theme={theme}
                            type="secondary"
                            style={{
                                marginTop: 15,
                                backgroundColor: 'transparent',
                                borderColor: '#fff',
                                borderWidth: 1,
                            }}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 50,
        opacity: 0.9,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
});

export default WelcomeScreen;

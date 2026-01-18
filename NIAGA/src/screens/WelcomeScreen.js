import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { CustomButton } from '../components/Button';

const WelcomeScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.primary }]}>NIAGA</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>
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
                        type="secondary" // or just outline if we had it, but type impacts color logic in my Button
                        style={{ marginTop: 15, backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 1 }}
                    />
                    {/* Overriding style for outline effect manually since Button component logic was simple */}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        opacity: 0.8,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
});

export default WelcomeScreen;

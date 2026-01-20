import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    useColorScheme,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { CustomInput } from '../components/Input';
import { CustomButton } from '../components/Button';
import { AuthContext } from '../context/AuthContext';
import background from '../../assets/background.jpg';

import client from '../api/client';

const LoginScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const { login } = useContext(AuthContext);

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
        if (errors[key]) {
            setErrors({ ...errors, [key]: null });
        }
    };

    const validate = () => {
        let valid = true;
        let newErrors = {};

        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
            valid = false;
        }

        if (!form.password) {
            newErrors.password = 'Password is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleLogin = async () => {
        if (validate()) {
            setLoading(true);
            try {
                const response = await client.post('/auth/login', form);
                const { token, user, isPersonalized } = response.data;

                login(token, user);

                const targetScreen = isPersonalized ? 'Home' : 'Personalization';
                navigation.reset({
                    index: 0,
                    routes: [{ name: targetScreen }],
                });
            } catch (error) {
                const msg = error.response?.data?.message || 'Invalid credentials';
                Alert.alert('Login Failed', msg);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            'Forgot Password',
            'Reset password link has been sent to your email.'
        );
    };

    return (
        <ImageBackground
            source={background}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >

                    <Text style={[styles.title, { color: colors.primary }]}>
                        Welcome Back
                    </Text>

                    <CustomInput
                        label="Email Address"
                        placeholder="Enter email"
                        value={form.email}
                        onChangeText={(text) => handleChange('email', text)}
                        error={errors.email}
                        keyboardType="email-address"
                        theme={theme}
                    />

                    <CustomInput
                        label="Password"
                        placeholder="Enter password"
                        value={form.password}
                        onChangeText={(text) => handleChange('password', text)}
                        error={errors.password}
                        secureTextEntry
                        theme={theme}
                    />

                    <Text
                        style={[styles.forgotPassword, { color: colors.primary }]}
                        onPress={handleForgotPassword}
                    >
                        Forgot Password?
                    </Text>

                    <CustomButton
                        title="Log In"
                        onPress={handleLogin}
                        loading={loading}
                        theme={theme}
                        style={styles.button}
                    />

                    <Text style={[styles.registerLink, { color: colors.text }]}>
                        Don&apos;t have an account?{' '}
                        <Text
                            style={{ color: colors.primary, fontWeight: 'bold' }}
                            onPress={() => navigation.navigate('Register')}
                        >
                            Register
                        </Text>
                    </Text>
                    </ScrollView>
                </KeyboardAvoidingView>
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
    scrollContent: {
        padding: 20,
        justifyContent: 'center',
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    forgotPassword: {
        textAlign: 'right',
        marginTop: -10,
        marginBottom: 20,
        fontSize: 14,
    },
    button: {
        marginTop: 10,
    },
    registerLink: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 14,
    },
});

export default LoginScreen;

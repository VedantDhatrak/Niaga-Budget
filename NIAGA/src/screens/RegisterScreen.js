import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useColorScheme, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { CustomInput } from '../components/Input';
import { CustomButton } from '../components/Button';
import background from '../../assets/background.jpg';

import client from '../api/client';

const RegisterScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];

    const [form, setForm] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
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

        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
            valid = false;
        }

        if (!form.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
            valid = false;
        } else if (form.mobile.length < 10) {
            newErrors.mobile = 'Mobile number must be at least 10 digits';
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
            valid = false;
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = 'Invalid email format';
            valid = false;
        }

        if (!form.password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleRegister = async () => {
        if (validate()) {
            setLoading(true);
            try {
                await client.post('/auth/register', form);
                Alert.alert('Success', 'Registration successful! Please log in.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
            } catch (error) {
                console.log(error.response?.data);
                const msg = error.response?.data?.message || 'Something went wrong';
                Alert.alert('Error', msg);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <ImageBackground
            source={background}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={[styles.title, { color: colors.primary }]}>Create Account</Text>

                    <CustomInput
                        label="Full Name"
                        placeholder="Enter your name"
                        value={form.name}
                        onChangeText={(text) => handleChange('name', text)}
                        error={errors.name}
                        theme={theme}
                    />

                    <CustomInput
                        label="Mobile Number"
                        placeholder="Enter mobile number"
                        value={form.mobile}
                        onChangeText={(text) => handleChange('mobile', text)}
                        error={errors.mobile}
                        keyboardType="phone-pad"
                        maxLength={10}
                        theme={theme}
                    />

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
                        secureTextEntry={!showPassword}
                        isPassword={true}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        theme={theme}
                    />

                    <CustomButton
                        title="Register"
                        onPress={handleRegister}
                        loading={loading}
                        theme={theme}
                        style={styles.button}
                    />

                    <Text style={[styles.loginLink, { color: colors.text }]}>
                        Already have an account?{' '}
                        <Text style={{ color: colors.primary, fontWeight: 'bold' }} onPress={() => navigation.navigate('Login')}>
                            Log In
                        </Text>
                    </Text>
                </ScrollView>
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
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        marginTop: 20,
        textAlign: 'center',
    },
    button: {
        marginTop: 20,
    },
    loginLink: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 14,
    },
});


export default RegisterScreen;

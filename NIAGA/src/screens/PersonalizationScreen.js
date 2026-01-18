import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { CustomButton } from '../components/Button';
import { CustomInput } from '../components/Input';
import CustomDropdown from '../components/CustomDropdown';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';

const PersonalizationScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const { userToken } = useContext(AuthContext);

    const [form, setForm] = useState({
        spendingPreference: '',
        lifestyle: '',
        securityQuestion: '',
        securityAnswer: '',
        devNote: ''
    });
    const [loading, setLoading] = useState(false);

    const spendingOptions = ['🍔 Food & Dining', '🏠 Rent / Housing', '🛍 Shopping', '🚕 Travel / Transport', '🎮 Entertainment', '📚 Education', '💡 Others'];
    const lifestyleOptions = ['Student', 'Working Professional', 'Freelancer', 'Business Owner', 'Homemaker', 'Other'];
    const securityQuestions = ['A phrase only you know', 'Your best friend’s name', 'Your favorite song', 'Your favorite movie'];

    const handleSave = async () => {
        // console.log('handleSave called');
        // console.log('Current Form State:', form);

        let errorMsg = '';
        if (!form.spendingPreference) errorMsg = 'Please select a spending preference.';
        else if (!form.lifestyle) errorMsg = 'Please select your lifestyle.';
        else if (!form.securityQuestion) errorMsg = 'Please select a security question.';
        else if (!form.securityAnswer) errorMsg = 'Please provide an answer to the security question.';

        if (errorMsg) {
            Alert.alert('Missing Requirements', errorMsg);
            return;
        }

        setLoading(true);
        try {
            await client.post('/user/personalize', form, {
                headers: { 'x-auth-token': userToken }
            });
            Alert.alert('Success', 'Profile updated!', [
                { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }
            ]);
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to save profile.');
        } finally {
            setLoading(false);
        }
    };

    const isAnswerEnabled = !!form.securityQuestion;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: colors.primary }]}>Help Us Personalize Your Experience</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>Answer a few quick questions to get smarter insights.</Text>

                <View style={styles.card}>
                    <CustomDropdown
                        label="What do you spend most on?"
                        options={spendingOptions}
                        value={form.spendingPreference}
                        onSelect={(val) => setForm({ ...form, spendingPreference: val })}
                        theme={theme}
                        placeholder="Select Spending"
                    />

                    <CustomDropdown
                        label="Which best describes you?"
                        options={lifestyleOptions}
                        value={form.lifestyle}
                        onSelect={(val) => setForm({ ...form, lifestyle: val })}
                        theme={theme}
                        placeholder="Select Lifestyle"
                    />

                    <CustomDropdown
                        label="Account Recovery (Security Question)"
                        options={securityQuestions}
                        value={form.securityQuestion}
                        onSelect={(val) => setForm({ ...form, securityQuestion: val })}
                        theme={theme}
                        placeholder="Select Question"
                    />

                    <CustomInput
                        label="Answer"
                        placeholder={isAnswerEnabled ? "Your Answer" : "Select a question first"}
                        value={form.securityAnswer}
                        onChangeText={(text) => setForm({ ...form, securityAnswer: text })}
                        theme={theme}
                        editable={isAnswerEnabled}
                        highlight={isAnswerEnabled}
                    />

                    <CustomInput
                        label="Write a note for Developer"
                        placeholder="Hey dattebayou here I would love if you write something for me..."
                        value={form.devNote}
                        onChangeText={(text) => setForm({ ...form, devNote: text })}
                        theme={theme}
                        maxLength={50}
                    />

                    <CustomButton
                        title="Save & Continue"
                        onPress={handleSave}
                        loading={loading}
                        theme={theme}
                        style={{ marginTop: 20 }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    subtitle: { fontSize: 14, opacity: 0.7, textAlign: 'center', marginBottom: 30 },
    card: { width: '100%' }
});

export default PersonalizationScreen;

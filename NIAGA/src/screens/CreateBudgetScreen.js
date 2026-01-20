import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    useColorScheme,
    ImageBackground,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../theme/colors';
import { CustomInput } from '../components/Input';
import { CustomButton } from '../components/Button';
import { AuthContext } from '../context/AuthContext';
import background from '../../assets/background.jpg';
import client from '../api/client';

const CreateBudgetScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const { userToken } = useContext(AuthContext);

    const [totalBudget, setTotalBudget] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [dailyBudget, setDailyBudget] = useState('');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // Ensure endDate is at least startDate
    useEffect(() => {
        if (endDate < startDate) {
            setEndDate(new Date(startDate));
        }
    }, [startDate]);

    // Calculate daily budget whenever relevant fields change
    useEffect(() => {
        calculateDailyBudget();
    }, [totalBudget, startDate, endDate]);

    const calculateDailyBudget = () => {
        if (!totalBudget || isNaN(totalBudget)) {
            setDailyBudget('');
            return;
        }

        // Calculate difference in days
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start date

        if (diffDays > 0) {
            const daily = (parseFloat(totalBudget) / diffDays).toFixed(2);
            setDailyBudget(daily);
        }
    };

    const onChangeStart = (event, selectedDate) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) setStartDate(selectedDate);
    };

    const onChangeEnd = (event, selectedDate) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) setEndDate(selectedDate);
    };

    const handleSave = async () => {
        if (!totalBudget) {
            Alert.alert('Missing Input', 'Please enter your total budget.');
            return;
        }

        setLoading(true);
        try {
            await client.post(
                '/user/budget',
                {
                    totalBudget: parseFloat(totalBudget),
                    budgetStartDate: startDate,
                    budgetEndDate: endDate,
                    dailyBudget: parseFloat(dailyBudget)
                },
                { headers: { 'x-auth-token': userToken } }
            );

            Alert.alert('Success', 'Budget set successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                    }),
                },
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save budget.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString();
    };

    return (
        <ImageBackground
            source={background}
            style={styles.background}
            resizeMode="cover"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.container}>
                        <Text style={[styles.title, { color: colors.primary }]}>
                            Set Your Budget
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.text }]}>
                            Plan your expenses for a specific period.
                        </Text>

                        <CustomInput
                            label="Total Budget"
                            placeholder="Enter amount (e.g. 5000)"
                            value={totalBudget}
                            onChangeText={setTotalBudget}
                            keyboardType="numeric"
                            theme={theme}
                        />

                        {/* Date Selection */}
                        <View style={styles.dateContainer}>
                            <View style={styles.dateField}>
                                <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
                                <TouchableOpacity
                                    onPress={() => setShowStartPicker(true)}
                                    style={[styles.dateButton, { borderColor: colors.border }]}
                                >
                                    <Text style={{ color: colors.text }}>{formatDate(startDate)}</Text>
                                </TouchableOpacity>
                                {showStartPicker && (
                                    <DateTimePicker
                                        value={startDate}
                                        mode="date"
                                        display="default"
                                        minimumDate={new Date()}
                                        onChange={onChangeStart}
                                    />
                                )}
                            </View>

                            <View style={styles.dateField}>
                                <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
                                <TouchableOpacity
                                    onPress={() => setShowEndPicker(true)}
                                    style={[styles.dateButton, { borderColor: colors.border }]}
                                >
                                    <Text style={{ color: colors.text }}>{formatDate(endDate)}</Text>
                                </TouchableOpacity>
                                {showEndPicker && (
                                    <DateTimePicker
                                        value={endDate}
                                        mode="date"
                                        display="default"
                                        minimumDate={startDate}
                                        onChange={onChangeEnd}
                                    />
                                )}
                            </View>
                        </View>

                        {/* Daily Budget Display (Read Only) */}
                        <CustomInput
                            label="Daily Budget (Auto-calculated)"
                            value={dailyBudget}
                            editable={false}
                            theme={theme}
                        />

                        <CustomButton
                            title="Set Budget"
                            onPress={handleSave}
                            loading={loading}
                            theme={theme}
                            style={{ marginTop: 20 }}
                        />
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        opacity: 0.8,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    dateField: {
        flex: 0.48,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    dateButton: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default CreateBudgetScreen;

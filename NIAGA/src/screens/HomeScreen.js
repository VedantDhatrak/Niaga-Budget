import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    useColorScheme,
    FlatList,
    Alert,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { CustomButton } from '../components/Button';

import background from '../../assets/background.jpg';

const HomeScreen = () => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];

    const { userInfo, userToken } = useContext(AuthContext);

    const [showBudgetSheet, setShowBudgetSheet] = useState(false);

    // 🔢 Spending Entry
    const [amountInput, setAmountInput] = useState('');
    const [labelInput, setLabelInput] = useState('');
    const [dailySpending, setDailySpending] = useState([]);

    // Init from userInfo
    useEffect(() => {
        if (userInfo?.dailySpending) {
            setDailySpending(userInfo.dailySpending);
        }
    }, [userInfo]);
    const isSameDay = (d1, d2) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
    
        if (isNaN(date1) || isNaN(date2)) return false;
    
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };
    

    const today = new Date();
    const todaySpending = React.useMemo(() => {
        const now = new Date();
        return dailySpending.filter(item =>
            isSameDay(item.date, now)
        );
    }, [dailySpending]);
    
    const spentToday = todaySpending.reduce(
        (sum, item) => sum + item.amount,
        0
    );
    
    

    const dailyBudget = userInfo?.dailyBudget ?? 0;
    const remainingBudget = Math.max(dailyBudget - spentToday, 0);

    // ➕ Add Spending
    const addSpending = async () => {
        if (!amountInput || !labelInput) {
            Alert.alert('Please enter amount and label');
            return;
        }

        const entry = {
            amount: Number(amountInput),
            label: labelInput,
        };

        try {
            const res = await client.post('/user/daily-spending', entry, {
                headers: { 'x-auth-token': userToken }
            });

            setDailySpending(res.data.dailySpending);
            setAmountInput('');
            setLabelInput('');
        } catch (err) {
            Alert.alert('Failed to save spending');
        }
    };




    // 🔢 Keypad Button
    const renderKey = (value) => (
        <TouchableOpacity
            key={value}
            style={styles.key}
            onPress={() => {
                if (value === '⌫') {
                    setAmountInput(prev => prev.slice(0, -1));
                } else {
                    setAmountInput(prev =>
                        prev === '0' ? value : prev + value
                    );
                }
            }}
            
        >
            <Text style={styles.keyText}>{value}</Text>
        </TouchableOpacity>
    );

    return (
        <ImageBackground source={background} style={styles.background}>
            <SafeAreaView style={styles.safeArea} >

                {/* 🔝 HEADER */}
                <View style={styles.topHeader}>
                    <TouchableOpacity
                        style={styles.budgetContainer}
                        onPress={() => setShowBudgetSheet(true)}
                    >
                        <View>
                            <Text style={styles.budgetLabel}>Today's Budget</Text>
                            <Text style={styles.budgetSub}>Remaining</Text>
                        </View>

                        <Text style={styles.budgetAmount}>
                            ₹{remainingBudget}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bellContainer}>
                        <Ionicons name="notifications-outline" size={22} />
                    </TouchableOpacity>
                </View>

                {/* 💰 AMOUNT DISPLAY */}
                <Text style={styles.amountDisplay}>
                    ₹{amountInput || 0}
                </Text>

                {/* 🏷 LABEL INPUT */}
                <TextInput
                    placeholder="What did you spend on?"
                    value={labelInput}
                    onChangeText={setLabelInput}
                    style={styles.labelInput}
                />

                {/* 🔢 KEYPAD */}
                <View style={styles.keypad}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'].map(renderKey)}
                </View>

                {/* ➕ ADD BUTTON */}
                <CustomButton
                    title="Add Spending"
                    onPress={addSpending}
                    theme={theme}
                />

                {/* 🧠 DAILY REFLECTION
                <Text style={styles.sectionTitle}>Today's Spending</Text>

                <FlatList
                    data={dailySpending.slice().reverse()}
                    keyExtractor={(_, i) => i.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.spendingItem}>
                            <Text style={styles.spendingLabel}>
                                {item.label}
                            </Text>
                            <Text style={styles.spendingAmount}>
                                -₹{item.amount}
                            </Text>
                        </View>
                    )}
                /> */}

                {/* 📊 BUDGET SHEET */}
                <Modal
                    visible={showBudgetSheet}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowBudgetSheet(false)}
                >
                    <TouchableOpacity
                        style={styles.sheetOverlay}
                        activeOpacity={1}
                        onPress={() => setShowBudgetSheet(false)}
                    />

                    <ImageBackground
                        source={background}
                        style={styles.bottomSheet}
                        imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                    >
                        <View style={styles.sheetInner}>
                            <View style={styles.sheetHandle} />

                            <Text style={styles.sheetTitle}>Today's Budget</Text>

                            <View style={styles.sheetRow}>
                                <Text style={styles.sheetLabel}>Daily Limit</Text>
                                <Text style={styles.sheetValue}>₹{dailyBudget}</Text>
                            </View>

                            <View style={styles.sheetRow}>
                                <Text style={styles.sheetLabel}>Spent</Text>
                                <Text style={[styles.sheetValue, { color: '#E53935' }]}>
                                    ₹{spentToday}
                                </Text>
                            </View>

                            <View style={styles.sheetRow}>
                                <Text style={styles.sheetLabel}>Remaining</Text>
                                <Text style={[styles.sheetValue, { color: '#2E7D32' }]}>
                                    ₹{remainingBudget}
                                </Text>
                            </View>

                            <CustomButton
                                title="Close"
                                onPress={() => setShowBudgetSheet(false)}
                                theme={theme}
                                style={{ marginTop: 20 }}
                            />
                        </View>
                    </ImageBackground>
                </Modal>

            </SafeAreaView>
        </ImageBackground>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    background: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 20 },

    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    budgetContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },

    budgetLabel: { fontSize: 14, fontWeight: '600' },
    budgetSub: { fontSize: 12, color: '#666' },
    budgetAmount: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },

    bellContainer: {
        width: 44,
        height: 44,
        marginLeft: 12,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    amountDisplay: {
        fontSize: 34,
        textAlign: 'center',
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#2E7D32',
    },

    labelInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },

    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 10,
    },

    key: {
        width: '30%',
        height: 60,
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: 'rgb(44, 41, 41)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    keyText: { fontSize: 20, fontWeight: 'bold' },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 14,
    },

    spendingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.85)',
        marginBottom: 8,
    },

    spendingLabel: { fontWeight: '600' },
    spendingAmount: { fontWeight: 'bold', color: '#E53935' },

    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },

    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },

    sheetInner: {
        flex: 1,
        padding: 20,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
    },

    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ccc',
        alignSelf: 'center',
        marginBottom: 10,
    },

    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#fff',
    },

    sheetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    sheetLabel: { color: 'rgba(255,255,255,0.8)' },
    sheetValue: { fontWeight: 'bold', color: '#fff' },
});

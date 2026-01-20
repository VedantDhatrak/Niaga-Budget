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
    const [showDetails, setShowDetails] = useState(false);
    const [showAnalyticsSheet, setShowAnalyticsSheet] = useState(false);



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

    const spentPercentage = dailyBudget
        ? Math.min((spentToday / dailyBudget) * 100, 100)
        : 0;

    const remainingPercentage = 100 - spentPercentage;

    const startDate = userInfo?.budgetStartDate
        ? new Date(userInfo.budgetStartDate)
        : null;

    const endDate = userInfo?.budgetEndDate
        ? new Date(userInfo.budgetEndDate)
        : null;

    const remainingDays =
        startDate && endDate
            ? Math.max(
                Math.ceil(
                    (endDate - new Date()) / (1000 * 60 * 60 * 24)
                ),
                0
            )
            : 0;

    const formatDate = (date) =>
        date
            ? date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
            })
            : '--';

            const daysPassed =
    startDate
        ? Math.max(
              Math.ceil(
                  (new Date() - startDate) / (1000 * 60 * 60 * 24)
              ),
              1
          )
        : 1;

const avgDailySpend = spentToday
    ? Math.round(spentToday / daysPassed)
    : 0;

const expectedSpendTillNow =
    dailyBudget && startDate && endDate
        ? Math.round(
              (dailyBudget / remainingDays + daysPassed) * daysPassed
          )
        : 0;

const isOverspending = spentToday > avgDailySpend * daysPassed;




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

                            <Text style={styles.sheetTitle}>Budget</Text>

                            <View style={styles.budgetCard}>

                                {/* 👆 TOGGLER ROW */}
                                <TouchableOpacity
                                    style={styles.budgetTopRow}
                                    activeOpacity={0.8}
                                    onPress={() => setShowDetails(prev => !prev)}
                                >
                                    {!showDetails ? (
                                        <>
                                            {/* SPENT VIEW */}
                                            <Text style={styles.budgetAmount}>₹{spentToday}</Text>
                                            <Text style={styles.budgetPercent}>
                                                {spentPercentage.toFixed(0)}% spent
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            {/* REMAINING VIEW */}
                                            <Text style={[styles.budgetAmount, { color: '#2E7D32' }]}>
                                                ₹{remainingBudget}
                                            </Text>
                                            <Text style={[styles.budgetPercent, { color: '#2E7D32' }]}>
                                                {remainingPercentage.toFixed(0)}% left
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* 📊 PROGRESS BAR (always visible) */}
                                {/* <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${spentPercentage}%` },
                                        ]}
                                    />
                                </View> */}

                                {/* 🧠 HINT */}
                                <Text style={styles.tapHint}>
                                    {showDetails ? 'Tap to view spent' : 'Tap to view remaining'}
                                </Text>

                            </View>

                            <View style={styles.budgetInfoRow}>

                                {/* 📦 LEFT BOX — STARTING BUDGET */}
                                <View style={styles.startBudgetBox}>
                                    <Text style={styles.infoAmount}>₹{dailyBudget}</Text>
                                    <Text style={styles.infoLabel}>Starting Budget</Text>
                                    <Text style={styles.infoSub}>
                                        {formatDate(startDate)} – {formatDate(endDate)}
                                    </Text>
                                </View>

                                {/* 📦 RIGHT BOX — DAYS LEFT */}
                                <View style={styles.daysLeftBox}>
                                    <Text style={styles.daysNumber}>{remainingDays}</Text>
                                    <Text style={styles.daysLabel}>Days Left</Text>
                                </View>

                            </View>

                            <TouchableOpacity
                                style={styles.analyticsButton}
                                activeOpacity={0.85}
                                onPress={() => setShowAnalyticsSheet(true)}
                            >
                                <Ionicons
                                    name="analytics-outline"
                                    size={20}
                                    color="#FFFFFF"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.analyticsText}>View Analytics</Text>
                            </TouchableOpacity>



                            <CustomButton
                                title="Close"
                                onPress={() => setShowBudgetSheet(false)}
                                theme={theme}
                                style={{ marginTop: 20 }}
                            />
                        </View>
                    </ImageBackground>
                </Modal>

                <Modal
    visible={showAnalyticsSheet}
    transparent
    animationType="slide"
    onRequestClose={() => setShowAnalyticsSheet(false)}
>
    <TouchableOpacity
        style={styles.sheetOverlay}
        activeOpacity={1}
        onPress={() => setShowAnalyticsSheet(false)}
    />

    <View style={styles.analyticsSheet}>
        <View style={styles.sheetHandle} />

        <Text style={styles.sheetTitle}>Analytics</Text>

        {/* 📊 Spent vs Remaining */}
        <View style={styles.analyticsRow}>
            <Text style={styles.analyticsLabel}>Spent</Text>
            <Text style={[styles.analyticsValue, { color: '#E53935' }]}>
                ₹{spentToday}
            </Text>
        </View>

        <View style={styles.analyticsRow}>
            <Text style={styles.analyticsLabel}>Remaining</Text>
            <Text style={[styles.analyticsValue, { color: '#2E7D32' }]}>
                ₹{remainingBudget}
            </Text>
        </View>

        {/* 📈 Usage */}
        <View style={styles.analyticsRow}>
            <Text style={styles.analyticsLabel}>Budget Used</Text>
            <Text style={styles.analyticsValue}>
                {spentPercentage.toFixed(0)}%
            </Text>
        </View>

        {/* 📅 Average */}
        <View style={styles.analyticsRow}>
            <Text style={styles.analyticsLabel}>Avg / Day</Text>
            <Text style={styles.analyticsValue}>
                ₹{avgDailySpend}
            </Text>
        </View>

        {/* ⚠️ Status */}
        <View style={styles.analyticsStatus}>
            <Text
                style={[
                    styles.statusText,
                    { color: isOverspending ? '#E53935' : '#2E7D32' },
                ]}
            >
                {isOverspending
                    ? 'You are overspending'
                    : 'You are on track'}
            </Text>
        </View>

        <CustomButton
            title="Close"
            onPress={() => setShowAnalyticsSheet(false)}
            theme={theme}
            style={{ marginTop: 20 }}
        />
    </View>
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
    budgetCard: {
        marginHorizontal: 0,
        marginTop: 12,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FF7043',
        elevation: 4,
    },

    budgetTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    budgetAmount: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000000',
    },

    budgetPercent: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '600',
    },

    progressBar: {
        height: 8,
        borderRadius: 8,
        backgroundColor: '#333',
        overflow: 'hidden',
        marginTop: 12,
    },

    progressFill: {
        height: '100%',
        backgroundColor: '#FF7043',
        borderRadius: 8,
    },

    tapHint: {
        marginTop: 10,
        fontSize: 12,
        color: '#000000',
        textAlign: 'center',
    },
    budgetInfoRow: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 10,
    },

    startBudgetBox: {
        flex: 7,
        padding: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(30,30,30,0.9)',
    },

    daysLeftBox: {
        flex: 3,
        padding: 14,
        borderRadius: 50,
        backgroundColor: 'rgba(30,30,30,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    infoAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    infoLabel: {
        fontSize: 12,
        color: '#AAAAAA',
        marginTop: 4,
    },

    infoSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },

    daysNumber: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FF7043',
    },

    daysLabel: {
        fontSize: 12,
        color: '#AAAAAA',
        marginTop: 4,
    },

    analyticsButton: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: '#FF7043',
    },
    
    analyticsText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    analyticsSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    
    analyticsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    
    analyticsLabel: {
        color: '#AAAAAA',
        fontSize: 14,
    },
    
    analyticsValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    
    analyticsStatus: {
        marginTop: 20,
        padding: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    
    statusText: {
        fontSize: 16,
        fontWeight: '700',
    },
    
    


});

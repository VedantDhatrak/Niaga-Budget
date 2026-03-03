import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    useColorScheme,
    Alert,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    Modal,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { CustomButton } from '../components/Button';
import { Keypad } from '../components/home/Keypad';
import { useBudgetCalculations } from '../hooks/useBudgetCalculations';

import background from '../../assets/background.jpg';

const HomeScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const hintAnim = React.useRef(new Animated.Value(0)).current;
    const { userInfo, userToken, refreshUserData } = useContext(AuthContext);

    const [showBudgetSheet, setShowBudgetSheet] = useState(false);
    const [amountInput, setAmountInput] = useState('');
    const [labelInput, setLabelInput] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [showAnalyticsSheet, setShowAnalyticsSheet] = useState(false);
    const [showTotalDetails, setShowTotalDetails] = useState(false);

    const budget = useBudgetCalculations(userInfo);
    const {
        dailySpending,
        spentToday,
        remainingBudget,
        spentPercentage,
        remainingPercentage,
        dailyBudget,
        startDate,
        endDate,
        remainingDays,
        formatDate,
        totalSpentTillNow,
        totalSpentPercentage,
        remainingTotalBudget,
        totalRemainingPercentage,
        avgDailySpend,
        isOverspending,
    } = budget;

    useEffect(() => {
        refreshUserData();
    }, []);

    const addSpending = async () => {
        if (!amountInput || !labelInput) {
            Alert.alert('Please enter amount and label');
            return;
        }
        const entry = { amount: Number(amountInput), label: labelInput };
        try {
            await client.post('/user/daily-spending', entry, {
                headers: { 'x-auth-token': userToken },
            });
            setAmountInput('');
            setLabelInput('');
            await refreshUserData();
        } catch (err) {
            Alert.alert('Failed to save spending');
        }
    };

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(hintAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(hintAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.delay(3000), // ⏳ wait 3 seconds
            ])
        );

        animation.start();

        return () => animation.stop(); // cleanup on unmount
    }, []);


    const animatedChevronStyle = {
        marginLeft: 6,
        transform: [
            {
                translateY: hintAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                }),
            },
        ],
        opacity: hintAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
        }),
    };



    // 🕰️ Expiration Check
    const [showExpirationModal, setShowExpirationModal] = useState(false);

    useEffect(() => {
        if (userInfo?.budgetEndDate) {
            const end = new Date(userInfo.budgetEndDate);
            const now = new Date();
            // Reset time to compare dates only or check if now is strictly after end date
            if (now > end) {
                setShowExpirationModal(true);
            }
        }
    }, [userInfo]);

    const handleArchiveBudget = async () => {
        try {
            await client.post('/user/archive-budget', {}, {
                headers: { 'x-auth-token': userToken }
            });
            await refreshUserData();
            setShowExpirationModal(false);

            // Navigate to CreateBudget logic
            // Resetting stack to ensure they can't go back to Home without a budget
            navigation.reset({
                index: 0,
                routes: [{ name: 'CreateBudget' }],
            });

        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to archive budget');
        }
    };


    return (
        <ImageBackground source={background} style={styles.background}>
            <SafeAreaView style={styles.safeArea} >

                {/* 🕰️ EXPIRATION MODAL */}
                <Modal
                    visible={showExpirationModal}
                    transparent
                    animationType="fade"
                >
                    <View style={styles.sheetOverlay}>
                        <View style={[styles.bottomSheet, { height: 'auto', padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E', margin: 20, borderRadius: 20, bottom: 'auto', top: '30%' }]}>
                            <Ionicons name="documents-outline" size={50} color={colors.primary} style={{ marginBottom: 10 }} />
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 }}>Budget Completed!</Text>
                            <Text style={{ fontSize: 16, color: '#ccc', textAlign: 'center', marginBottom: 20 }}>
                                Your budget period has ended. Great job tracking your expenses! Let's wrap this up and start fresh.
                            </Text>
                            <CustomButton
                                title="Archive & Start New"
                                onPress={handleArchiveBudget}
                                theme={theme}
                            />
                        </View>
                    </View>
                </Modal>

                {/* 🔝 HEADER */}
                <View style={styles.topHeader}>


                    {/* <TouchableOpacity
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
                        </TouchableOpacity> */}
                    <TouchableOpacity
                        style={styles.budgetContainer}
                        activeOpacity={0.85}
                        onPress={() => setShowBudgetSheet(true)}
                    >
                        <View>
                            <Text style={styles.budgetLabel}>Today's Budget</Text>
                            <Text style={styles.budgetSub}>Remaining</Text>
                        </View>

                        <View style={styles.amountRow}>
                            <Text style={styles.budgetAmount}>₹{remainingBudget}</Text>
                            <Animated.View style={animatedChevronStyle}>
                                <Ionicons
                                    name="chevron-up-outline"
                                    size={18}
                                    color="#fff"
                                />
                            </Animated.View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bellContainer}>
                        <Ionicons name="notifications-outline" size={22} />
                    </TouchableOpacity>
                </View>

                {/* Spacer to push content to bottom */}
                <View style={{ flex: 1 }} />

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
                <Keypad amountInput={amountInput} setAmountInput={setAmountInput} />

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

                    {/* <ImageBackground
                        source={background}
                        style={styles.bottomSheet}
                        imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                    > */}
                    <View style={styles.bottomSheet}>

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

                                <TouchableOpacity
                                    style={styles.budgetTopRow}
                                    activeOpacity={0.8}
                                    onPress={() => setShowTotalDetails(prev => !prev)}
                                >
                                    {!showTotalDetails ? (
                                        <>
                                            {/* SPENT VIEW */}
                                            <Text style={styles.budgetAmount}>
                                                ₹{totalSpentTillNow}
                                            </Text>
                                            <Text style={styles.budgetPercent}>
                                                {totalSpentPercentage.toFixed(0)}% spent
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            {/* REMAINING VIEW */}
                                            <Text style={[styles.budgetAmount, { color: '#2E7D32' }]}>
                                                ₹{remainingTotalBudget}
                                            </Text>
                                            <Text style={[styles.budgetPercent, { color: '#2E7D32' }]}>
                                                {totalRemainingPercentage.toFixed(0)}% left
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
                    </View>

                    {/* </ImageBackground> */}
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
        backgroundColor: '#00572A',
    },

    budgetLabel: { fontSize: 14, fontWeight: '600' },
    budgetSub: { fontSize: 12, color: '#000000' },
    budgetAmount: { fontSize: 20, fontWeight: 'bold', color: '#74FC9F' },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },


    bellContainer: {
        width: 44,
        height: 44,
        marginLeft: 12,
        borderRadius: 22,
        backgroundColor: '#304579',
        alignItems: 'center',
        justifyContent: 'center',
    },

    amountDisplay: {
        fontSize: 34,
        textAlign: 'center',
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#FFFFFF',
    },

    labelInput: {
        backgroundColor: '#2F3035',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },

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
        // backgroundColor: 'rgb(74, 74, 74)',   // 👈 white background
        backgroundColor: '#121318',   // 👈 white background
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },


    sheetInner: {
        flex: 1,
        padding: 20,
    },


    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#BBBBBB',
        alignSelf: 'center',
        marginBottom: 10,
    },


    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#FFFFFF',
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
        backgroundColor: '#904C01',
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
        backgroundColor: '#333439',
    },

    daysLeftBox: {
        flex: 3,
        padding: 14,
        borderRadius: 50,
        backgroundColor: '#333439',
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
        color: '#FFFFFF',
        marginTop: 4,
    },

    infoSub: {
        fontSize: 12,
        color: '#FFFFFF',
        marginTop: 2,
    },

    daysNumber: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    daysLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },

    analyticsButton: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: '#904C01',
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

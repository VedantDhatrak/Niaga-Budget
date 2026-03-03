import React, { useContext, useEffect, useMemo, useState } from 'react';
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
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { CustomButton } from '../components/Button';
import { Keypad } from '../components/home/Keypad';
import { DraggableBottomSheet } from '../components/DraggableBottomSheet';
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
    const [showNotificationsSheet, setShowNotificationsSheet] = useState(false);
    const [notificationsRead, setNotificationsRead] = useState(false);

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
        expectedSpendTillNow,
        isOverspending,
        topLabelsBySpend,
    } = budget;

    const analyticsDangerColor = theme === 'dark' ? colors.secondary : '#E53935';
    const analyticsSuccessColor = '#2E7D32';

    // In-app notifications derived from budget state
    const notifications = useMemo(() => {
        const list = [];
        if (isOverspending) {
            list.push({
                id: 'overspending',
                type: 'warning',
                title: 'Overspending',
                body: "You're overspending this period. Consider adjusting your spending.",
            });
        }
        if (spentPercentage >= 80 && dailyBudget > 0) {
            list.push({
                id: 'daily-80',
                type: 'warning',
                title: 'Daily budget alert',
                body: `You've used ${spentPercentage.toFixed(0)}% of today's budget. ₹${remainingBudget} left.`,
            });
        }
        if (remainingDays > 0 && remainingDays <= 3) {
            list.push({
                id: `period-${remainingDays}`,
                type: 'info',
                title: 'Period ending soon',
                body: `Budget period ends in ${remainingDays} day${remainingDays === 1 ? '' : 's'}. Plan to archive.`,
            });
        }
        if (spentPercentage < 50 && dailyBudget > 0 && !isOverspending) {
            list.push({
                id: 'on-track',
                type: 'success',
                title: "You're on track",
                body: `₹${remainingBudget} remaining today. Keep it up!`,
            });
        }
        return list;
    }, [isOverspending, spentPercentage, dailyBudget, remainingBudget, remainingDays]);

    const unreadCount = notificationsRead ? 0 : notifications.length;

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

                    <TouchableOpacity
                        style={styles.bellContainer}
                        onPress={() => {
                            setNotificationsRead(true);
                            setShowNotificationsSheet(true);
                        }}
                        activeOpacity={0.85}
                    >
                        {unreadCount > 0 && (
                            <View style={styles.bellBadge}>
                                <Text style={styles.bellBadgeText}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Text>
                            </View>
                        )}
                        <Ionicons
                            name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
                            size={22}
                            color="#FFFFFF"
                        />
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
                <DraggableBottomSheet
                    visible={showBudgetSheet}
                    onClose={() => setShowBudgetSheet(false)}
                    sheetStyle={{ backgroundColor: '#121318' }}
                >
                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        <Text style={styles.sheetTitle}>Budget</Text>

                        <View style={styles.budgetCard}>

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

                                <Text style={styles.tapHint}>
                                    {showDetails ? 'Tap to view spent' : 'Tap to view remaining'}
                                </Text>

                            </View>

                            <View style={styles.budgetInfoRow}>

                                <View style={styles.startBudgetBox}>
                                    <Text style={styles.infoAmount}>₹{dailyBudget}</Text>
                                    <Text style={styles.infoLabel}>Starting Budget</Text>
                                    <Text style={styles.infoSub}>
                                        {formatDate(startDate)} – {formatDate(endDate)}
                                    </Text>
                                </View>

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
                    </ScrollView>
                </DraggableBottomSheet>

                <DraggableBottomSheet
                    visible={showAnalyticsSheet}
                    onClose={() => setShowAnalyticsSheet(false)}
                    sheetStyle={{ backgroundColor: colors.surface || '#1E1E1E' }}
                >
                    <View style={{ flex: 1, minHeight: 0 }}>
                        <Text style={[styles.sheetTitle, { color: colors.text }]}>Analytics</Text>
                        <ScrollView
                            style={[styles.analyticsScroll, { flex: 1 }]}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        >
                            {/* Today */}
                            <Text style={[styles.analyticsSectionTitle, { color: colors.textMuted, marginTop: 0 }]}>Today</Text>
                            <View style={[styles.analyticsBlock, { backgroundColor: colors.card || '#2A2A2A' }]}>
                                <View style={styles.analyticsRow}>
                                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Spent</Text>
                                    <Text style={[styles.analyticsValue, { color: analyticsDangerColor }]}>
                                        ₹{spentToday}
                                    </Text>
                                </View>
                                <View style={styles.analyticsRow}>
                                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Remaining</Text>
                                    <Text style={[styles.analyticsValue, { color: analyticsSuccessColor }]}>
                                        ₹{remainingBudget}
                                    </Text>
                                </View>
                                <View style={styles.analyticsRow}>
                                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Daily budget used</Text>
                                    <Text style={[styles.analyticsValue, { color: colors.text }]}>
                                        {spentPercentage.toFixed(0)}%
                                    </Text>
                                </View>
                            </View>

                            {/* This period */}
                            <Text style={[styles.analyticsSectionTitle, { color: colors.textMuted }]}>
                                This period ({formatDate(startDate)} – {formatDate(endDate)})
                            </Text>
                            <View style={[styles.analyticsBlock, { backgroundColor: colors.card || '#2A2A2A' }]}>
                                <View style={styles.analyticsRow}>
                                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Total spent</Text>
                                    <Text style={[styles.analyticsValue, { color: analyticsDangerColor }]}>
                                        ₹{totalSpentTillNow}
                                    </Text>
                                </View>
                                <View style={styles.analyticsRow}>
                                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Total remaining</Text>
                                    <Text style={[styles.analyticsValue, { color: analyticsSuccessColor }]}>
                                        ₹{remainingTotalBudget}
                                    </Text>
                                </View>
                                <View style={styles.analyticsRow}>
                                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Budget used</Text>
                                    <Text style={[styles.analyticsValue, { color: colors.text }]}>
                                        {totalSpentPercentage.toFixed(0)}%
                                    </Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${Math.min(totalSpentPercentage, 100)}%`, backgroundColor: analyticsDangerColor },
                                        ]}
                                    />
                                </View>
                                <View style={styles.analyticsRow}>
                                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Avg per day</Text>
                                    <Text style={[styles.analyticsValue, { color: colors.text }]}>
                                        ₹{avgDailySpend}
                                    </Text>
                                </View>
                                <View style={styles.analyticsRow}>
                                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Expected so far</Text>
                                    <Text style={[styles.analyticsValue, { color: colors.text }]}>
                                        ₹{expectedSpendTillNow}
                                    </Text>
                                </View>
                            </View>

                            {/* Status */}
                            <View style={[styles.analyticsStatus, { backgroundColor: (colors.border || 'rgba(255,255,255,0.05)') }]}>
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: isOverspending ? analyticsDangerColor : analyticsSuccessColor },
                                    ]}
                                >
                                    {isOverspending
                                        ? 'You are overspending'
                                        : 'You are on track'}
                                </Text>
                            </View>

                            {/* Spending by label */}
                            {topLabelsBySpend.length > 0 && (
                                <>
                                    <Text style={[styles.analyticsSectionTitle, { color: colors.textMuted }]}>Spending by category</Text>
                                    <View style={[styles.analyticsBlock, { backgroundColor: colors.card || '#2A2A2A' }]}>
                                        {topLabelsBySpend.map(({ label, amount }) => (
                                            <View key={label} style={styles.analyticsRow}>
                                                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                                                    {label}
                                                </Text>
                                                <Text style={[styles.analyticsValue, { color: colors.text }]}>
                                                    ₹{amount}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}

                            <CustomButton
                                title="Close"
                                onPress={() => setShowAnalyticsSheet(false)}
                                theme={theme}
                                style={{ marginTop: 20, marginBottom: 24 }}
                            />
                        </ScrollView>
                    </View>
                </DraggableBottomSheet>

                {/* 🔔 NOTIFICATIONS SHEET */}
                <DraggableBottomSheet
                    visible={showNotificationsSheet}
                    onClose={() => setShowNotificationsSheet(false)}
                    sheetStyle={{ backgroundColor: '#121318' }}
                >
                    <View style={{ flex: 1, minHeight: 0 }}>
                        <Text style={styles.sheetTitle}>Notifications</Text>
                        <ScrollView
                            style={{ flex: 1 }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 24 }}
                        >
                            {notifications.length === 0 ? (
                                <View style={styles.notificationEmpty}>
                                    <Ionicons name="notifications-off-outline" size={48} color="#666" style={{ marginBottom: 12 }} />
                                    <Text style={styles.notificationEmptyText}>No notifications</Text>
                                    <Text style={styles.notificationEmptySub}>You're all set. Check back for budget alerts.</Text>
                                </View>
                            ) : (
                                notifications.map((item) => (
                                    <View key={item.id} style={styles.notificationItem}>
                                        <View style={[
                                            styles.notificationIconWrap,
                                            item.type === 'warning' && { backgroundColor: 'rgba(229,57,53,0.2)' },
                                            item.type === 'success' && { backgroundColor: 'rgba(46,125,50,0.2)' },
                                            item.type === 'info' && { backgroundColor: 'rgba(48,71,121,0.3)' },
                                        ]}>
                                            <Ionicons
                                                name={item.type === 'warning' ? 'warning' : item.type === 'success' ? 'checkmark-circle' : 'information-circle'}
                                                size={22}
                                                color={item.type === 'warning' ? '#E53935' : item.type === 'success' ? '#2E7D32' : '#7B9FD6'}
                                            />
                                        </View>
                                        <View style={styles.notificationContent}>
                                            <Text style={styles.notificationTitle}>{item.title}</Text>
                                            <Text style={styles.notificationBody}>{item.body}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                            <CustomButton
                                title="Close"
                                onPress={() => setShowNotificationsSheet(false)}
                                theme={theme}
                                style={{ marginTop: 20 }}
                            />
                        </ScrollView>
                    </View>
                </DraggableBottomSheet>

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
    bellBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#E53935',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    bellBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    notificationEmpty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    notificationEmptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    notificationEmptySub: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    notificationIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    notificationBody: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 20,
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
        maxHeight: '88%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },

    analyticsScroll: {
        minHeight: 0,
    },

    analyticsSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 16,
    },

    analyticsBlock: {
        borderRadius: 12,
        padding: 14,
        marginBottom: 4,
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

import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    useColorScheme,
    FlatList,
    ActivityIndicator,
    Alert,
    ImageBackground,
    TextInput,
    TouchableOpacity,Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { CustomButton } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import background from '../../assets/background.jpg';

const HomeScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const { userInfo, userToken } = useContext(AuthContext);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);
    const [showBudgetSheet, setShowBudgetSheet] = useState(false);


    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await client.get('/transactions', {
                headers: { 'x-auth-token': userToken },
            });
            setTransactions(res.data);
            calculateBalance(res.data);
        } catch (error) {
            console.log('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateBalance = (data) => {
        const total = data.reduce((acc, item) => {
            return item.type === 'income'
                ? acc + item.amount
                : acc - item.amount;
        }, 0);
        setBalance(total);
    };

    const addTestTransaction = async () => {
        try {
            await client.post(
                '/transactions',
                { title: 'Test Income', amount: 1000, type: 'income' },
                { headers: { 'x-auth-token': userToken } }
            );
            fetchTransactions();
        } catch (error) {
            Alert.alert('Error', 'Failed to add test transaction');
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const renderItem = ({ item }) => (
        <View style={[styles.transactionItem, { backgroundColor: colors.card }]}>
            <View>
                <Text style={[styles.transTitle, { color: colors.text }]}>
                    {item.title}
                </Text>
                <Text style={[styles.transDate, { color: colors.text }]}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <Text
                style={[
                    styles.transAmount,
                    {
                        color:
                            item.type === 'income'
                                ? '#4CAF50'
                                : colors.secondary,
                    },
                ]}
            >
                {item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
            </Text>
        </View>
    );

    return (
        <ImageBackground source={background} style={styles.background}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.topHeader}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.budgetContainer}
                        onPress={() => setShowBudgetSheet(true)}
                    >

                        <View>
                            <Text style={styles.budgetLabel}>Today's Budget</Text>
                            {/* <Text style={styles.budgetSub}>Daily spending limit</Text> */}
                        </View>

                        <View style={styles.budgetRight}>
                            <Text style={styles.budgetAmount}>₹1,200</Text>
                            {/* <Text style={styles.budgetCount}>3 left</Text> */}
                        </View>
                    </TouchableOpacity>


                    <TouchableOpacity style={styles.bellContainer}>
                        <Ionicons
                            name="notifications-outline"
                            size={22}
                            color="#333"
                        />
                    </TouchableOpacity>
                </View>



                {/* Welcome */}
                <View style={styles.header}>
                    <Text style={[styles.welcomeText, { color: colors.text }]}>
                        Hello, {userInfo?.name || 'User'}
                    </Text>
                    <Text style={[styles.dateText, { color: colors.text }]}>
                        {new Date().toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </Text>
                </View>

                {/* Balance Card */}
                <View style={[styles.card, { backgroundColor: colors.primary }]}>
                    <Text style={styles.cardLabel}>Total Balance</Text>
                    <Text style={styles.cardAmount}>
                        ₹{balance.toFixed(2)}
                    </Text>
                    <Text style={styles.cardFooter}>Tracked expenses</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <CustomButton
                        title="+ Test Income"
                        onPress={addTestTransaction}
                        theme={theme}
                        style={{ flex: 1, marginRight: 10 }}
                    />
                    <CustomButton
                        title="Refresh"
                        onPress={fetchTransactions}
                        theme={theme}
                        type="secondary"
                        style={{ width: 100 }}
                    />
                </View>

                <Text
                    style={[
                        styles.sectionTitle,
                        { color: colors.text, marginTop: 20 },
                    ]}
                >
                    Recent Transactions
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text
                                style={{
                                    color: colors.text,
                                    opacity: 0.5,
                                    textAlign: 'center',
                                    marginTop: 20,
                                }}
                            >
                                No transactions yet.
                            </Text>
                        }
                    />
                )}
                {/* 🧾 Budget Bottom Sheet */}
                <Modal
    visible={showBudgetSheet}
    transparent
    animationType="slide"
    onRequestClose={() => setShowBudgetSheet(false)}
>
    {/* Overlay */}
    <TouchableOpacity
        style={styles.sheetOverlay}
        activeOpacity={1}
        onPress={() => setShowBudgetSheet(false)}
    />

    {/* Sheet */}
    <ImageBackground
        source={background}   // 👈 your image
        resizeMode="cover"
        style={styles.bottomSheet}
        imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
    >
        <View style={styles.sheetInner}>
        {/* Drag Handle */}
        <View style={styles.sheetHandle} />

        <Text style={styles.sheetTitle}>Today's Budget</Text>

        <View style={styles.sheetRow}>
            <Text style={styles.sheetLabel}>Daily Limit</Text>
            <Text style={styles.sheetValue}>₹1,200</Text>
        </View>

        <View style={styles.sheetRow}>
            <Text style={styles.sheetLabel}>Spent Today</Text>
            <Text style={[styles.sheetValue, { color: '#E53935' }]}>
                ₹450
            </Text>
        </View>

        <View style={styles.sheetRow}>
            <Text style={styles.sheetLabel}>Remaining</Text>
            <Text style={[styles.sheetValue, { color: '#2E7D32' }]}>
                ₹750
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

const styles = StyleSheet.create({
    background: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 20 },

    /* 🔝 TOP HEADER */
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 16,
    },

    /* Budget Card (80%) */
    budgetContainer: {
        flex: 1,               // 👈 KEY FIX (instead of 0.8)
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        elevation: 4,
    },

    budgetLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },

    budgetSub: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },

    budgetRight: {
        alignItems: 'flex-end',
    },

    budgetAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
    },

    budgetCount: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },

    /* Bell (20%) */
    bellContainer: {
        width: 44,             // 👈 FIXED WIDTH (important)
        height: 44,
        marginLeft: 12,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },


    header: { marginBottom: 20 },
    welcomeText: { fontSize: 28, fontWeight: 'bold' },
    dateText: { fontSize: 16, opacity: 0.6 },

    card: {
        borderRadius: 16,
        padding: 25,
        marginBottom: 20,
        elevation: 5,
    },
    cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    cardAmount: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    cardFooter: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    listContent: { paddingBottom: 30 },

    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    transTitle: { fontSize: 16, fontWeight: '600' },
    transDate: { fontSize: 12, opacity: 0.6 },
    transAmount: { fontSize: 16, fontWeight: 'bold' },

    actions: { flexDirection: 'row', marginBottom: 10 },
    /* Bottom Sheet */
    sheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },

    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90%',  
        // padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // borderTopWidth: 1,                 // 👈 BORDER
    //     borderWidth:1,
    // borderColor: 'rgba(255,255,255,0.25)',
   
        elevation: 10,
        overflow: 'hidden',   // 👈 IMPORTANT for rounded corners
       
    },
    
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#fff',
    },
    
    sheetLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    
    sheetValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    sheetInner: {
        flex: 1,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.25)',
        padding: 20,
    },
    
    
    

});

export default HomeScreen;

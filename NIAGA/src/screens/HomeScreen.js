import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { CustomButton } from '../components/Button'; // Import button for test action

const HomeScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const { userInfo, userToken } = useContext(AuthContext);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await client.get('/transactions', {
                headers: { 'x-auth-token': userToken }
            });
            setTransactions(res.data);
            calculateBalance(res.data);
        } catch (error) {
            console.log('Error fetching transactions:', error);
            // Alert.alert('Error', 'Could not load transactions');
        } finally {
            setLoading(false);
        }
    };

    const calculateBalance = (data) => {
        const total = data.reduce((acc, item) => {
            return item.type === 'income' ? acc + item.amount : acc - item.amount;
        }, 0);
        setBalance(total);
    };

    // Temporary function to add a test transaction
    const addTestTransaction = async () => {
        try {
            await client.post('/transactions', {
                title: 'Test Income',
                amount: 1000,
                type: 'income'
            }, {
                headers: { 'x-auth-token': userToken }
            });
            fetchTransactions(); // Refresh
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
                <Text style={[styles.transTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.transDate, { color: colors.text }]}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <Text style={[
                styles.transAmount,
                { color: item.type === 'income' ? '#4CAF50' : colors.secondary }
            ]}>
                {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.welcomeText, { color: colors.text }]}>Hello, {userInfo?.name || 'User'}</Text>
                <Text style={[styles.dateText, { color: colors.text }]}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.primary }]}>
                <Text style={styles.cardLabel}>Total Balance</Text>
                <Text style={styles.cardAmount}>${balance.toFixed(2)}</Text>
                {/* Placeholder for now */}
                <Text style={styles.cardFooter}> tracked expenses</Text>
            </View>

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

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Recent Transactions</Text>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={{ color: colors.text, opacity: 0.5, textAlign: 'center', marginTop: 20 }}>
                            No transactions yet.
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    header: { marginTop: 20, marginBottom: 20 },
    welcomeText: { fontSize: 28, fontWeight: 'bold' },
    dateText: { fontSize: 16, opacity: 0.6 },
    card: {
        borderRadius: 16,
        padding: 25,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 5 },
    cardAmount: { color: 'white', fontSize: 36, fontWeight: 'bold', marginBottom: 10 },
    cardFooter: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    listContent: { paddingBottom: 20 },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    transTitle: { fontSize: 16, fontWeight: '600' },
    transDate: { fontSize: 12, opacity: 0.6, marginTop: 3 },
    transAmount: { fontSize: 16, fontWeight: 'bold' },
    actions: { flexDirection: 'row', justifyContent: 'space-between' }
});

export default HomeScreen;

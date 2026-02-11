// import React from 'react';
// import { View, Text, StyleSheet, useColorScheme } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Colors } from '../theme/colors';

// const ScratchScreen = () => {
//     const scheme = useColorScheme();
//     const theme = scheme === 'dark' ? 'dark' : 'light';
//     const colors = Colors[theme];

//     return (
//         <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//             <View style={styles.content}>
//                 <Text style={[styles.title, { color: colors.text }]}>Scratch</Text>
//                 <Text style={[styles.subtitle, { color: colors.text }]}>Quick notes or scratchpad area.</Text>
//             </View>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     title: { fontSize: 24, fontWeight: 'bold' },
//     subtitle: { marginTop: 10, opacity: 0.7 },
// });

// export default ScratchScreen;

import React, { useMemo, useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    useColorScheme,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext'; // adjust path if needed

const ScratchScreen = () => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];


    const { userInfo, refreshUserData } = useContext(AuthContext);
    const dailySpending = userInfo?.dailySpending ?? [];
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            await refreshUserData();
        } catch (error) {
            console.log("Refresh error:", error);
            const errorMessage = error.message || "Failed to refresh history.";
            Alert.alert("Error", errorMessage);
        } finally {
            setRefreshing(false);
        }
    };



    // Sort latest first
    const sortedSpending = useMemo(() => {
        return [...dailySpending].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );
    }, [dailySpending]);

    const renderItem = ({ item }) => {
        const dateObj = new Date(item.date);

        return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View>
                    <Text style={[styles.label, { color: colors.text }]}>
                        {item.label}
                    </Text>
                    <Text style={[styles.date, { color: colors.textMuted }]}>
                        {dateObj.toDateString()} • {dateObj.toLocaleTimeString()}
                    </Text>
                </View>

                <Text style={[styles.amount, { color: colors.primary }]}>
                    ₹{item.amount}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['left', 'right', 'top']} // avoid bottom tab gap
        >
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Spending History
                </Text>
                <TouchableOpacity disabled={refreshing} onPress={handleRefresh} style={styles.refreshButton}>
                    {refreshing ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Ionicons name="refresh" size={24} color={colors.primary} />
                    )}
                </TouchableOpacity>
            </View>

            {sortedSpending.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No spending records yet
                </Text>
            ) : (
                <FlatList
                    data={sortedSpending}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    refreshButton: {
        padding: 4,
    },
    list: {
        paddingBottom: 20,
        gap: 12,
    },
    card: {
        padding: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        marginTop: 4,
        fontSize: 12,
        opacity: 0.7,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
        opacity: 0.7,
    },
});

export default ScratchScreen;

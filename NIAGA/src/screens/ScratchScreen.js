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
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';

const ScratchScreen = () => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const { userInfo, userToken, refreshUserData } = useContext(AuthContext);
    const dailySpending = userInfo?.dailySpending ?? [];
    const [refreshing, setRefreshing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [saving, setSaving] = useState(false);

    const handleRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            await refreshUserData();
        } catch (error) {
            const errorMessage = error.message || 'Failed to refresh history.';
            Alert.alert('Error', errorMessage);
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Delete entry',
            `Remove "${item.label}" (₹${item.amount})?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!item._id) return;
                        try {
                            await client.delete(`/user/daily-spending/${item._id}`, {
                                headers: { 'x-auth-token': userToken },
                            });
                            await refreshUserData();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
                        }
                    },
                },
            ]
        );
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setEditLabel(item.label || '');
        setEditAmount(String(item.amount || ''));
    };

    const closeEdit = () => {
        setEditingItem(null);
        setEditLabel('');
        setEditAmount('');
    };

    const handleSaveEdit = async () => {
        if (!editingItem?._id) return;
        const amount = Number(editAmount);
        if (!editLabel.trim() || isNaN(amount)) {
            Alert.alert('Invalid', 'Enter a valid label and amount.');
            return;
        }
        setSaving(true);
        try {
            await client.patch(
                `/user/daily-spending/${editingItem._id}`,
                { label: editLabel.trim(), amount },
                { headers: { 'x-auth-token': userToken } }
            );
            await refreshUserData();
            closeEdit();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const sortedSpending = useMemo(() => {
        return [...dailySpending].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [dailySpending]);

    const getSpendingKey = (item, index) => {
        return item._id?.toString() ?? `spending-${String(item.date)}-${index}`;
    };

    const renderItem = ({ item }) => {
        const dateObj = new Date(item.date);
        return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={styles.cardLeft}>
                    <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.date, { color: colors.textMuted }]}>
                        {dateObj.toDateString()} • {dateObj.toLocaleTimeString()}
                    </Text>
                </View>
                <View style={styles.cardRight}>
                    <Text style={[styles.amount, { color: colors.primary }]}>₹{item.amount}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={() => openEdit(item)}
                            style={styles.actionBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="pencil" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDelete(item)}
                            style={styles.actionBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#E53935" />
                        </TouchableOpacity>
                    </View>
                </View>
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
                    keyExtractor={(item, index) => getSpendingKey(item, index)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Modal
                visible={!!editingItem}
                transparent
                animationType="fade"
                onRequestClose={closeEdit}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Edit entry</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Label"
                            placeholderTextColor={colors.textMuted}
                            value={editLabel}
                            onChangeText={setEditLabel}
                        />
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Amount"
                            placeholderTextColor={colors.textMuted}
                            value={editAmount}
                            onChangeText={setEditAmount}
                            keyboardType="numeric"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={closeEdit}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveEdit}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    cardLeft: { flex: 1 },
    cardRight: { alignItems: 'flex-end', gap: 6 },
    actions: { flexDirection: 'row', gap: 12 },
    actionBtn: { padding: 4 },
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
    modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#555' },
    cancelButtonText: { color: '#fff', fontWeight: '600' },
    saveButton: { backgroundColor: '#2E7D32' },
    saveButtonText: { color: '#fff', fontWeight: '600' },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
        opacity: 0.7,
    },
});

export default ScratchScreen;

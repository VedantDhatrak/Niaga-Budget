import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'];

export function Keypad({ amountInput, setAmountInput }) {
    const handlePress = (value) => {
        if (value === '⌫') {
            setAmountInput((prev) => prev.slice(0, -1));
        } else {
            setAmountInput((prev) => (prev === '0' ? value : prev + value));
        }
    };

    return (
        <View style={styles.keypad}>
            {KEYS.map((value) => (
                <TouchableOpacity
                    key={value}
                    style={styles.key}
                    onPress={() => handlePress(value)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.keyText}>{value}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: '#2F3035',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

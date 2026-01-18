import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';

export const CustomButton = ({ title, onPress, type = 'primary', style, loading = false, theme = 'light' }) => {
    const colors = Colors[theme];
    const isPrimary = type === 'primary';
    const backgroundColor = isPrimary ? colors.primary : 'transparent';
    const textColor = isPrimary ? '#FFFFFF' : colors.primary;
    const borderColor = isPrimary ? 'transparent' : colors.primary;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            style={[
                styles.button,
                { backgroundColor, borderColor, borderWidth: isPrimary ? 0 : 1 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        width: '100%',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const CustomDropdown = ({ label, options, value, onSelect, theme = 'light', placeholder = 'Select an option' }) => {
    const colors = Colors[theme];
    const [visible, setVisible] = useState(false);

    const handleSelect = (item) => {
        onSelect(item);
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setVisible(true)}
            >
                <Text style={[styles.buttonText, { color: value ? colors.text : colors.text + '80' }]}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.option, { borderBottomColor: colors.border }]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={[styles.optionText, { color: colors.text }]}>{item}</Text>
                                    {value === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
    },
    buttonText: { fontSize: 16 },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    optionText: { fontSize: 16 },
});

export default CustomDropdown;

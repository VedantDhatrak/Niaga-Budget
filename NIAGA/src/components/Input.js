import { TextInput, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';

export const CustomInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    onTogglePassword,
    isPassword,
    error,
    keyboardType,
    highlight,
    theme = 'light',
    ...props
}) => {
    const colors = Colors[theme];
    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.inputBackground,
                        borderColor: error ? colors.secondary : (highlight ? colors.primary : colors.border),
                        borderWidth: highlight ? 2 : 1, // Make it slightly thicker
                    },
                ]}
            >
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.text,
                            opacity: props.editable === false ? 0.5 : 1, // Visual feedback
                        },
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={props.editable === false ? colors.text + '40' : '#999'}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={onTogglePassword}>
                        <Text style={[styles.toggleText, { color: colors.primary }]}>
                            {secureTextEntry ? 'Show' : 'Hide'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={[styles.errorText, { color: colors.secondary }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        width: '100%',
    },
    label: {
        marginBottom: 5,
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 10,
    },
    errorText: {
        marginTop: 5,
        fontSize: 12,
    },
});

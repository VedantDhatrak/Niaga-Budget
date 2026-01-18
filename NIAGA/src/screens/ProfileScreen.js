import React, { useContext } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { CustomButton } from '../components/Button';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const { logout, userInfo } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <UserAvatar color={colors.primary} name={userInfo?.name || 'User'} />
                <Text style={[styles.title, { color: colors.text }]}>{userInfo?.name || 'Guest'}</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>{userInfo?.email || 'No Email'}</Text>

                <View style={styles.section}>
                    <CustomButton
                        title="Log Out"
                        onPress={handleLogout}
                        theme={theme}
                        type="secondary"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const UserAvatar = ({ color, name }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'JD';
    return (
        <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{initials}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 50 },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    subtitle: { fontSize: 16, opacity: 0.7, marginBottom: 40 },
    section: { width: '100%', maxWidth: 300 },
});

export default ProfileScreen;

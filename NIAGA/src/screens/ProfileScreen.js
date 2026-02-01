import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    useColorScheme,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { CustomButton } from '../components/Button';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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

    // ---- Mock derived insights (replace with real analytics later)
    const budgetDiscipline = 78;
    const spendingStyle = 'Balanced';
    const topCategory = 'Food & Transport';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ================= Profile Header ================= */}
                <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
                    <UserAvatar color={colors.primary} name={userInfo?.name || 'User'} />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.name, { color: colors.text }]}>
                            {userInfo?.name || 'Guest'}
                        </Text>
                        <Text style={[styles.email, { color: colors.textSecondary }]}>
                            {userInfo?.email || 'No email'}
                        </Text>
                        <Text style={[styles.lifestyle, { color: colors.primary }]}>
                            {userInfo?.lifestyle || 'Lifestyle not set'}
                        </Text>
                    </View>
                </View>

                {/* ================= Financial Snapshot ================= */}
                <View style={styles.row}>
                    <InfoCard
                        title="Budget Discipline"
                        value={`${budgetDiscipline}%`}
                        subtitle="Days within budget"
                        colors={colors}
                    />
                    <InfoCard
                        title="Spending Style"
                        value={spendingStyle}
                        subtitle="Based on behavior"
                        colors={colors}
                    />
                </View>

                {/* ================= Insight Card ================= */}
                <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.insightTitle, { color: colors.text }]}>
                        🧠 Spending Insight
                    </Text>
                    <Text style={[styles.insightText, { color: colors.textSecondary }]}>
                        You mostly spend on <Text style={{ color: colors.primary }}>{topCategory}</Text>.
                    </Text>
                </View>

                {/* ================= Preferences ================= */}
                <Section title="Preferences" colors={colors}>
                    <SettingRow label="Lifestyle" value={userInfo?.lifestyle || 'Not set'} />
                    <SettingRow label="Spending Preference" value={userInfo?.spendingPreference || 'Not set'} />
                    <SettingRow label="Budget Cycle" value="Monthly" />
                </Section>

                {/* ================= Security ================= */}
                <Section title="Security" colors={colors}>
                    <SettingRow label="Change Password" />
                    <SettingRow label="Security Question" />
                </Section>

                {/* ================= Danger Zone ================= */}
                <View style={[styles.dangerZone, { borderColor: colors.border }]}>
                    <CustomButton
                        title="Log Out"
                        onPress={handleLogout}
                        theme={theme}
                        type="secondary"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

/* ================= Reusable Components ================= */

const UserAvatar = ({ color, name }) => {
    const initials = name
        ? name
              .split(' ')
              .map(n => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()
        : 'JD';

    return (
        <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{initials}</Text>
        </View>
    );
};

const InfoCard = ({ title, value, subtitle, colors }) => (
    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
);

const Section = ({ title, children, colors }) => (
    <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {title}
        </Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            {children}
        </View>
    </View>
);

const SettingRow = ({ label, value }) => (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
        <View>
            <Text style={styles.settingLabel}>{label}</Text>
            {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
);

/* ================= Styles ================= */

const styles = StyleSheet.create({
    container: { flex: 1 },

    profileCard: {
        margin: 16,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
    },
    email: {
        fontSize: 14,
        marginTop: 2,
    },
    lifestyle: {
        fontSize: 13,
        marginTop: 6,
        fontWeight: '600',
    },

    row: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
    },
    infoCard: {
        flex: 1,
        borderRadius: 14,
        padding: 16,
    },
    infoTitle: {
        fontSize: 13,
    },
    infoValue: {
        fontSize: 20,
        fontWeight: '700',
        marginVertical: 6,
    },
    infoSubtitle: {
        fontSize: 12,
    },

    insightCard: {
        margin: 16,
        borderRadius: 14,
        padding: 16,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    insightText: {
        fontSize: 14,
        lineHeight: 20,
    },

    section: {
        marginHorizontal: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 13,
        marginBottom: 6,
    },
    sectionCard: {
        borderRadius: 14,
        paddingHorizontal: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    settingValue: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 2,
    },

    dangerZone: {
        margin: 20,
        paddingTop: 10,
    },
});

export default ProfileScreen;

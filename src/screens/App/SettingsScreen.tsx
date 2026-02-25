/**
 * Settings Screen.
 * Uygulama ayarları ve profil yönetimi ekranı.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import { SPACING, TYPOGRAPHY } from '@constants/theme';
import { formatName } from '@utils/formatters';
import { AppStackParamList, AppTabParamList } from '@/types/navigation';
import { Logger } from '@lib/logger';

const logger = new Logger('SettingsScreen');

// Components
import MemoizedButton from '@components/common/MemoizedButton';
import Icon from '@expo/vector-icons/MaterialIcons';

// ==================== TYPES ====================

type SettingsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Settings'>,
  NativeStackNavigationProp<AppStackParamList>
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

// ==================== COMPONENT ====================

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation: _navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;
  const { user, signOut } = useAuth();

  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(theme.isDark);

  const handleSignOut = async (): Promise<void> => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          const result = await signOut();
          if (result.success) {
            logger.info('Signed out successfully');
          }
        },
      },
    ]);
  };

  const handleThemeChange = (value: boolean): void => {
    setDarkMode(value);
    theme.setTheme(value ? 'dark' : 'light');
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, rightElement, showChevron = false }: SettingItemProps): React.ReactNode => (
    <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface }]} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingContent}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
        <View style={styles.settingAction}>
          {rightElement}
          {showChevron && <Icon name="chevron-right" size={20} color={colors.textSecondary} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profil</Text>
          <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
            <View style={styles.profileContent}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="person" size={32} color={colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {user?.user_metadata?.first_name && user?.user_metadata?.last_name
                    ? formatName(`${user.user_metadata.first_name} ${user.user_metadata.last_name}`)
                    : 'Kullanıcı'}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'E-posta yok'}</Text>
              </View>
            </View>
            <MemoizedButton title="Profili Düzenle" onPress={() => Alert.alert('Profil', 'Profil düzenleme özelliği yakında eklenecek')} variant="outline" style={styles.editProfileButton} />
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Genel Ayarlar</Text>
          {renderSettingItem({
            icon: 'notifications',
            title: 'Bildirimler',
            subtitle: 'Push bildirimlerini aç/kapat',
            rightElement: <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.border, true: colors.primary }} />,
          })}
          {renderSettingItem({
            icon: 'sync',
            title: 'Otomatik Senkronizasyon',
            subtitle: 'Verileri otomatik senkronize et',
            rightElement: <Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ false: colors.border, true: colors.primary }} />,
          })}
          {renderSettingItem({ icon: 'language', title: 'Dil', subtitle: 'Türkçe', showChevron: true, onPress: () => Alert.alert('Dil', 'Dil seçeneği yakında eklenecek') })}
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Görünüm</Text>
          {renderSettingItem({
            icon: 'dark-mode',
            title: 'Karanlık Mod',
            subtitle: 'Karanlık tema kullan',
            rightElement: <Switch value={darkMode} onValueChange={handleThemeChange} trackColor={{ false: colors.border, true: colors.primary }} />,
          })}
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Güvenlik</Text>
          {renderSettingItem({ icon: 'lock', title: 'Şifre Değiştir', showChevron: true, onPress: () => Alert.alert('Şifre', 'Şifre değiştirme özelliği yakında eklenecek') })}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
          {renderSettingItem({ icon: 'info', title: 'Uygulama Hakkında', subtitle: 'CardVault v1.0.0', showChevron: true, onPress: () => Alert.alert('Hakkında', 'CardVault v1.0.0\nDijital kartvizit yönetim uygulaması') })}
          {renderSettingItem({ icon: 'privacy-tip', title: 'Gizlilik Politikası', showChevron: true, onPress: () => Alert.alert('Gizlilik', 'Gizlilik politikası yakında eklenecek') })}
          {renderSettingItem({ icon: 'description', title: 'Kullanım Koşulları', showChevron: true, onPress: () => Alert.alert('Koşullar', 'Kullanım koşulları yakında eklenecek') })}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <MemoizedButton title="Çıkış Yap" onPress={handleSignOut} variant="danger" fullWidth={true} />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { paddingHorizontal: SPACING.md },
  header: { marginTop: SPACING.sm, marginBottom: SPACING.lg },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700' as '700' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '600' as '600', marginBottom: SPACING.md },
  profileCard: { padding: SPACING.md, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  profileContent: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { marginLeft: SPACING.md, flex: 1 },
  profileName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '600' as '600', marginBottom: 2 },
  profileEmail: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '400' as '400' },
  editProfileButton: { marginTop: SPACING.md },
  settingItem: { marginVertical: SPACING.xs, padding: SPACING.md, borderRadius: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  settingContent: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  settingInfo: { flex: 1, marginLeft: SPACING.md },
  settingTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '500' as '500', marginBottom: 2 },
  settingSubtitle: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '400' as '400' },
  settingAction: { flexDirection: 'row', alignItems: 'center' },
  bottomPadding: { height: SPACING.xl },
});

export default SettingsScreen;

/**
 * Home Screen.
 * Ana sayfa ekranı - kartvizit özetleri ve hızlı erişim.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { formatName } from '../../utils/formatters';

// Components
import Card from '../../components/common/Card';
import MemoizedButton from '../../components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Mock data - gerçek uygulamada API'den gelecek
const mockCards = [
  {
    id: '1',
    company_name: 'Teknoloji A.Ş.',
    position: 'Yazılım Geliştirici',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@teknoloji.com',
    phone: '+90 555 123 4567',
    website: 'https://teknoloji.com',
    profile_image: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    company_name: 'Dijital Çözümler',
    position: 'Proje Yöneticisi',
    name: 'Ayşe Kaya',
    email: 'ayse@dijital.com',
    phone: '+90 555 987 6543',
    website: 'https://dijitalcozumler.com',
    profile_image: null,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
  },
  {
    id: '3',
    company_name: 'Yaratıcı Ajans',
    position: 'Grafik Tasarımcı',
    name: 'Mehmet Öz',
    email: 'mehmet@yaratici.com',
    phone: '+90 555 456 7890',
    website: 'https://yaraticiajans.com',
    profile_image: null,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
  },
];

const mockCollections = [
  { id: '1', name: 'İş Bağlantıları', count: 15 },
  { id: '2', name: 'Müşteriler', count: 8 },
  { id: '3', name: 'Ortaklar', count: 12 },
];

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [cards, setCards] = useState(mockCards);
  const [collections, setCollections] = useState(mockCollections);
  const [stats, setStats] = useState({
    totalCards: mockCards.length,
    totalCollections: mockCollections.length,
    thisWeekCards: 2,
  });

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Burada API'den veri çekilecek
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Data refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Kartvizit tıklama
  const handleCardPress = (card) => {
    navigation.navigate('CardDetail', { card });
  };

  // Hızlı eylemler
  const handleQuickAction = (action) => {
    switch (action) {
      case 'create':
        navigation.navigate('CardCreate');
        break;
      case 'scan':
        navigation.navigate('QRScanner');
        break;
      case 'collections':
        navigation.navigate('Collections');
        break;
      default:
        break;
    }
  };

  // Koleksiyon tıklama
  const handleCollectionPress = (collection) => {
    navigation.navigate('Collections', { selectedCollection: collection });
  };

  // İletişim eylemleri
  const handleCall = (phone) => {
    Alert.alert('Arama', `Şu numarayı arayın: ${phone}`);
  };

  const handleEmail = (email) => {
    Alert.alert('E-posta', `Şu adrese e-posta gönderin: ${email}`);
  };

  const handleShare = (card) => {
    Alert.alert('Paylaş', `${card.company_name} kartvizitini paylaş`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Merhaba,
              </Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.user_metadata?.first_name 
                  ? formatName(user.user_metadata.first_name)
                  : 'Kullanıcı'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Icon name="person" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Icon name="business" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.totalCards}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Kartvizit
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Icon name="folder" size={24} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.totalCollections}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Koleksiyon
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Icon name="add-circle" size={24} color={colors.warning} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.thisWeekCards}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Bu Hafta
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hızlı Eylemler
          </Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.surface }]}
              onPress={() => handleQuickAction('create')}
            >
              <Icon name="add-business" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Kartvizit Oluştur
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.surface }]}
              onPress={() => handleQuickAction('scan')}
            >
              <Icon name="qr-code-scanner" size={32} color={colors.success} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                QR Tara
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Son Eklenenler
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cards')}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                Tümünü Gör
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardsContainer}>
            {cards.slice(0, 3).map((card) => (
              <Card
                key={card.id}
                card={card}
                onPress={() => handleCardPress(card)}
                onCall={() => handleCall(card.phone)}
                onEmail={() => handleEmail(card.email)}
                onShare={() => handleShare(card)}
                showActions={true}
                style={styles.card}
              />
            ))}
          </View>
        </View>

        {/* Collections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Koleksiyonlarım
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Collections')}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                Tümünü Gör
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.collectionsContainer}>
            {collections.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                style={[styles.collectionCard, { backgroundColor: colors.surface }]}
                onPress={() => handleCollectionPress(collection)}
              >
                <View style={styles.collectionContent}>
                  <Icon name="folder" size={24} color={colors.primary} />
                  <View style={styles.collectionInfo}>
                    <Text style={[styles.collectionName, { color: colors.text }]}>
                      {collection.name}
                    </Text>
                    <Text style={[styles.collectionCount, { color: colors.textSecondary }]}>
                      {collection.count} kartvizit
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: SPACING.md,
  },
  header: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    marginHorizontal: 4,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  cardsContainer: {
    marginHorizontal: -SPACING.sm,
  },
  card: {
    marginHorizontal: SPACING.xs,
  },
  collectionsContainer: {
    marginHorizontal: -SPACING.sm,
  },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collectionInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  collectionName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  collectionCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginTop: 2,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default HomeScreen;
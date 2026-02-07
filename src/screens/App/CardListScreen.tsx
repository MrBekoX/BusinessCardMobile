/**
 * Card List Screen.
 * Tüm kartvizitlerin listelendiği ekran.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import { SPACING, TYPOGRAPHY } from '@constants/theme';
import { AppStackParamList, AppTabParamList } from '@/types/navigation';
import { Card as CardType } from '@/types';

// Components
import Card from '@components/common/Card';
import MemoizedButton from '@components/common/MemoizedButton';
import CustomInput from '@components/common/CustomInput';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Services
import { getCards, searchCards } from '@services/cardService';

// ==================== TYPES ====================

type CardListScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Cards'>,
  NativeStackNavigationProp<AppStackParamList>
>;

interface CardListScreenProps {
  navigation: CardListScreenNavigationProp;
}

// ==================== COMPONENT ====================

const CardListScreen: React.FC<CardListScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const colors = theme.colors;

  const [cards, setCards] = useState<CardType[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadCards = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const result = await getCards(user.id);

      if (result.success && result.data) {
        setCards(result.data);
        setFilteredCards(result.data);
      } else {
        Alert.alert('Hata', result.error || 'Kartlar yüklenemedi');
      }
    } catch (error) {
      console.error('Load cards error:', error);
      Alert.alert('Hata', 'Kartlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user, loadCards]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, cards]);

  const handleSearch = async (): Promise<void> => {
    if (!user?.id) return;
    
    if (searchQuery.trim()) {
      try {
        const result = await searchCards(user.id, searchQuery);
        if (result.success && result.data) {
          setFilteredCards(result.data);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredCards(cards);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const handleCardPress = (card: CardType): void => {
    navigation.navigate('CardDetail', { cardId: card.id });
  };

  const handleCall = (phone: string): void => {
    Alert.alert('Arama', `Şu numarayı arayın: ${phone}`);
  };

  const handleEmail = (email: string): void => {
    Alert.alert('E-posta', `Şu adrese e-posta gönderin: ${email}`);
  };

  const handleShare = (card: CardType): void => {
    Alert.alert('Paylaş', `${card.company_name} kartvizitini paylaş`);
  };

  const renderCard: ListRenderItem<CardType> = ({ item }) => (
    <Card
      card={item}
      onPress={() => handleCardPress(item)}
      onCall={() => handleCall(item.phone || '')}
      onEmail={() => handleEmail(item.email || '')}
      onShare={() => handleShare(item)}
      showActions={true}
    />
  );

  const renderEmpty = (): React.ReactElement => (
    <View style={styles.emptyContainer}>
      <Icon name="business" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Henüz kartvizitiniz yok
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        İlk kartvizitinizi oluşturarak başlayın
      </Text>
      <MemoizedButton
        title="Yeni Kartvizit Oluştur"
        onPress={() => navigation.navigate('CardCreate')}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kartvizitlerim</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {filteredCards.length} kartvizit
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <CustomInput
          placeholder="Kartvizit ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Icon name="search" size={20} color={colors.textSecondary} />}
          style={styles.searchInput}
        />
      </View>

      {/* Card List */}
      <FlatList
        data={filteredCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CardCreate')}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700' as '700' },
  headerSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '400' as '400', marginTop: 2 },
  searchContainer: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
  searchInput: { marginBottom: 0 },
  listContainer: { paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  emptyTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '600' as '600', marginTop: SPACING.md, marginBottom: SPACING.xs },
  emptySubtitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '400' as '400', marginBottom: SPACING.lg },
  emptyButton: { marginTop: SPACING.md },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
});

export default CardListScreen;

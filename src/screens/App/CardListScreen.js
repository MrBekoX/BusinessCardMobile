/**
 * Card List Screen.
 * Tüm kartvizitlerin listelendiği ekran.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

// Components
import Card from '../../components/common/Card';
import MemoizedButton from '../../components/common/MemoizedButton';
import CustomInput from '../../components/common/CustomInput';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Services
import { getCards, searchCards, deleteCard, toggleCardFavorite } from '../../services/cardService';

const CardListScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const colors = theme.colors;

  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Kartları yükle
  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  // Arama filtresi
  useEffect(() => {
    handleSearch();
  }, [searchQuery, cards]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const result = await getCards(user.id);

      if (result.success) {
        setCards(result.data);
        setFilteredCards(result.data);
      } else {
        Alert.alert('Hata', result.error);
      }
    } catch (error) {
      console.error('Load cards error:', error);
      Alert.alert('Hata', 'Kartlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const result = await searchCards(user.id, searchQuery);
        if (result.success) {
          setFilteredCards(result.data);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredCards(cards);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const handleCardPress = (card) => {
    navigation.navigate('CardDetail', { card });
  };

  const handleCall = (phone) => {
    Alert.alert('Arama', `Şu numarayı arayın: ${phone}`);
  };

  const handleEmail = (email) => {
    Alert.alert('E-posta', `Şu adrese e-posta gönderin: ${email}`);
  };

  const handleShare = (card) => {
    Alert.alert('Paylaş', `${card.company_name} kartvizitini paylaş`);
  };

  const handleDeleteCard = async (cardId) => {
    Alert.alert(
      'Kartı Sil',
      'Bu kartviziti silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCard(cardId, user.id);
            if (result.success) {
              Alert.alert('Başarılı', result.message);
              loadCards();
            } else {
              Alert.alert('Hata', result.error);
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (cardId, currentStatus) => {
    const result = await toggleCardFavorite(cardId, !currentStatus, user.id);
    if (result.success) {
      // Kartları yeniden yükle
      loadCards();
    } else {
      Alert.alert('Hata', result.error);
    }
  };

  const renderCard = ({ item }) => (
    <Card
      card={item}
      onPress={() => handleCardPress(item)}
      onCall={() => handleCall(item.phone)}
      onEmail={() => handleEmail(item.email)}
      onShare={() => handleShare(item)}
      showActions={true}
    />
  );

  const renderEmpty = () => (
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Kartvizitlerim
        </Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
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
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchInput: {
    marginBottom: 0,
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default CardListScreen;
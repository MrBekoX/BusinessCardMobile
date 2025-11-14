/**
 * Collections Screen.
 * Koleksiyon yönetim ekranı.
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
import MemoizedButton from '../../components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Services
import { getCollections, deleteCollection } from '../../services/collectionService';

const CollectionsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const colors = theme.colors;

  const [collections, setCollections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const result = await getCollections(user.id, { includeCardCount: true });

      if (result.success) {
        setCollections(result.data);
      } else {
        Alert.alert('Hata', result.error);
      }
    } catch (error) {
      console.error('Load collections error:', error);
      Alert.alert('Hata', 'Koleksiyonlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  const handleCollectionPress = (collection) => {
    navigation.navigate('Cards', { collectionId: collection.id });
  };

  const handleCreateCollection = () => {
    Alert.alert('Yeni Koleksiyon', 'Yeni koleksiyon oluşturma özelliği yakında eklenecek');
  };

  const handleEditCollection = (collection) => {
    Alert.alert('Düzenle', `${collection.name} koleksiyonunu düzenle`);
  };

  const handleDeleteCollection = (collection) => {
    Alert.alert(
      'Koleksiyonu Sil',
      `${collection.name} koleksiyonunu silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCollection(collection.id, user.id);
            if (result.success) {
              Alert.alert('Başarılı', result.message);
              loadCollections();
            } else {
              Alert.alert('Hata', result.error);
            }
          },
        },
      ]
    );
  };

  const renderCollection = ({ item }) => (
    <TouchableOpacity
      style={[styles.collectionCard, { backgroundColor: colors.surface }]}
      onPress={() => handleCollectionPress(item)}
    >
      <View style={styles.collectionContent}>
        <View style={[styles.collectionIcon, { backgroundColor: item.color + '20' }]}>
          <Icon name="folder" size={24} color={item.color} />
        </View>
        
        <View style={styles.collectionInfo}>
          <Text style={[styles.collectionName, { color: colors.text }]}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={[styles.collectionDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          )}
          <Text style={[styles.collectionCount, { color: colors.textSecondary }]}>
            {item.card_count || 0} kartvizit
          </Text>
        </View>
        
        <View style={styles.collectionActions}>
          <TouchableOpacity
            onPress={() => handleEditCollection(item)}
            style={styles.actionButton}
          >
            <Icon name="edit" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteCollection(item)}
            style={styles.actionButton}
          >
            <Icon name="delete" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="folder-open" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Henüz koleksiyonunuz yok
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        İlk koleksiyonunuzu oluşturarak başlayın
      </Text>
      <MemoizedButton
        title="Yeni Koleksiyon Oluştur"
        onPress={handleCreateCollection}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Koleksiyonlarım
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {collections.length} koleksiyon
        </Text>
      </View>

      {/* Collections List */}
      <FlatList
        data={collections}
        renderItem={renderCollection}
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
        onPress={handleCreateCollection}
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
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  collectionCard: {
    marginVertical: SPACING.xs,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  collectionName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  collectionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginBottom: 2,
  },
  collectionCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  collectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
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

export default CollectionsScreen;
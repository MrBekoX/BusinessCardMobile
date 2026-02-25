/**
 * Database Setup Module
 * Supabase database'inin otomatik kurulumu ve test verilerinin eklenmesi
 */
import { supabase } from './supabaseClient';
import { ServiceResponse } from '@/types';
import { Logger } from './logger';

const logger = new Logger('DatabaseSetup');

// ==================== TYPES ====================

interface TableCheckResult {
  profiles: boolean;
  cards: boolean;
  collections: boolean;
  collection_cards: boolean;
}

interface SeedResult extends ServiceResponse<void> {
  stats?: {
    cards: number;
    collections: number;
  };
}

interface TestCard {
  user_id: string;
  company_name: string;
  position: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  instagram_url?: string;
  linkedin_url?: string;
  x_url?: string;
  youtube_url?: string;
  is_favorite: boolean;
  notes: string;
  tags: string[];
}

interface TestCollection {
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

// ==================== TABLE CHECK ====================

/**
 * Tabloların var olup olmadığını kontrol eder
 */
export const checkTablesExist = async (): Promise<boolean> => {
  try {
    // Profiles tablosunu kontrol et
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // Cards tablosunu kontrol et
    const { error: cardsError } = await supabase
      .from('cards')
      .select('id')
      .limit(1);

    // Collections tablosunu kontrol et
    const { error: collectionsError } = await supabase
      .from('collections')
      .select('id')
      .limit(1);

    // Collection_cards tablosunu kontrol et
    const { error: collectionCardsError } = await supabase
      .from('collection_cards')
      .select('id')
      .limit(1);

    // Eğer herhangi bir hata varsa (tablo yoksa), false döndür
    if (profilesError || cardsError || collectionsError || collectionCardsError) {
      logger.debug('Tables not yet created', {
        profiles: !!profilesError,
        cards: !!cardsError,
        collections: !!collectionsError,
        collection_cards: !!collectionCardsError,
      } as TableCheckResult);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Table check error', error);
    return false;
  }
};

// ==================== SEED DATA ====================

/**
 * Test verilerini ekler
 * Not: Bu fonksiyon sadece development ortamında çalışmalı
 */
export const seedTestData = async (userId: string): Promise<SeedResult> => {
  try {
    logger.info('Adding test data...');

    // Önce mevcut test verilerini kontrol et
    const { data: existingCards } = await supabase
      .from('cards')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingCards && existingCards.length > 0) {
      logger.info('Test data already exists');
      return { success: true, message: 'Test verileri zaten mevcut' };
    }

    // Test kartlarını ekle
    const testCards: TestCard[] = [
      {
        user_id: userId,
        company_name: 'Teknoloji A.Ş.',
        position: 'Yazılım Geliştirici',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@teknoloji.com',
        phone: '+90 555 123 4567',
        website: 'https://teknoloji.com',
        address: 'Maslak, İstanbul',
        instagram_url: 'https://instagram.com/ahmetyilmaz',
        linkedin_url: 'https://linkedin.com/in/ahmetyilmaz',
        x_url: 'https://x.com/ahmetyilmaz',
        is_favorite: true,
        notes: 'Çok yetenekli bir yazılımcı',
        tags: ['yazılım', 'teknoloji', 'fullstack'],
      },
      {
        user_id: userId,
        company_name: 'Dijital Çözümler Ltd.',
        position: 'Proje Yöneticisi',
        name: 'Ayşe Kaya',
        email: 'ayse@dijital.com',
        phone: '+90 555 987 6543',
        website: 'https://dijitalcozumler.com',
        address: 'Kadıköy, İstanbul',
        instagram_url: 'https://instagram.com/aysekaya',
        linkedin_url: 'https://linkedin.com/in/aysekaya',
        is_favorite: true,
        notes: 'Çok organize proje yöneticisi',
        tags: ['proje', 'yönetim', 'dijital'],
      },
      {
        user_id: userId,
        company_name: 'Yaratıcı Ajans',
        position: 'Grafik Tasarımcı',
        name: 'Mehmet Öz',
        email: 'mehmet@yaratici.com',
        phone: '+90 555 456 7890',
        website: 'https://yaraticiajans.com',
        address: 'Beşiktaş, İstanbul',
        instagram_url: 'https://instagram.com/mehmetoz',
        linkedin_url: 'https://linkedin.com/in/mehmetoz',
        x_url: 'https://x.com/mehmetoz',
        youtube_url: 'https://youtube.com/@mehmetoz',
        is_favorite: false,
        notes: 'Harika tasarımlar yapıyor',
        tags: ['tasarım', 'grafik', 'yaratıcılık'],
      },
    ];

    const { data: insertedCards, error: cardsError } = await supabase
      .from('cards')
      .insert(testCards)
      .select();

    if (cardsError) {
      logger.error('Error adding cards', cardsError);
      throw cardsError;
    }

    logger.info(`${insertedCards?.length || 0} test cards added`);

    // Test koleksiyonlarını ekle
    const testCollections: TestCollection[] = [
      {
        user_id: userId,
        name: 'İş Bağlantıları',
        description: 'İş ilişkileri ve network',
        color: '#007AFF',
        icon: 'work',
      },
      {
        user_id: userId,
        name: 'Müşteriler',
        description: 'Aktif müşteriler',
        color: '#34C759',
        icon: 'people',
      },
      {
        user_id: userId,
        name: 'Teknoloji',
        description: 'Teknoloji sektöründeki kişiler',
        color: '#5856D6',
        icon: 'computer',
      },
    ];

    const { data: insertedCollections, error: collectionsError } = await supabase
      .from('collections')
      .insert(testCollections)
      .select();

    if (collectionsError) {
      logger.error('Error adding collections', collectionsError);
      throw collectionsError;
    }

    logger.info(`${insertedCollections?.length || 0} test collections added`);

    return {
      success: true,
      message: 'Test verileri başarıyla eklendi',
      stats: {
        cards: insertedCards?.length || 0,
        collections: insertedCollections?.length || 0,
      },
    };
  } catch (error) {
    logger.error('Test data insertion error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== INITIALIZE ====================

/**
 * Database'i başlat ve gerekirse test verilerini ekle
 */
export const initializeDatabase = async (userId?: string): Promise<ServiceResponse<void>> => {
  try {
    logger.info('Initializing database...');

    // Tabloları kontrol et
    const tablesExist = await checkTablesExist();

    if (!tablesExist) {
      logger.warn(
        'Tables not yet created! Run migrations in order: 001_initial_schema_clean.sql, 002_security_policies.sql, 003_storage_policies.sql, 004_add_avatar_path.sql'
      );
      return {
        success: false,
        error: 'Tablolar oluşturulmamış. Migration dosyasını çalıştırın.',
      };
    }

    logger.info('Tables exist');

    // Kullanıcı ID'si varsa ve development modundaysak test verilerini ekle
    if (userId && __DEV__) {
      const seedResult = await seedTestData(userId);
      return seedResult;
    }

    return {
      success: true,
      message: 'Database hazır',
    };
  } catch (error) {
    logger.error('Database initialization error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export default {
  checkTablesExist,
  seedTestData,
  initializeDatabase,
};

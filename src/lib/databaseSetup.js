/**
 * Database Setup Module
 * Supabase database'inin otomatik kurulumu ve test verilerinin eklenmesi
 */
import { supabase } from './supabaseClient';

/**
 * Tabloların var olup olmadığını kontrol eder
 */
export const checkTablesExist = async () => {
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
      console.log('Tablolar henüz oluşturulmamış:', {
        profiles: !!profilesError,
        cards: !!cardsError,
        collections: !!collectionsError,
        collection_cards: !!collectionCardsError,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Tablo kontrolü hatası:', error);
    return false;
  }
};

/**
 * Test verilerini ekler
 * Not: Bu fonksiyon sadece development ortamında çalışmalı
 */
export const seedTestData = async (userId) => {
  try {
    console.log('Test verileri ekleniyor...');

    // Önce mevcut test verilerini kontrol et
    const { data: existingCards } = await supabase
      .from('cards')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingCards && existingCards.length > 0) {
      console.log('Test verileri zaten mevcut');
      return { success: true, message: 'Test verileri zaten mevcut' };
    }

    // Test kartlarını ekle
    const testCards = [
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
      {
        user_id: userId,
        company_name: 'Finans Danışmanlık',
        position: 'Mali Müşavir',
        name: 'Zeynep Demir',
        email: 'zeynep@finansdanismanlik.com',
        phone: '+90 555 111 2222',
        website: 'https://finansdanismanlik.com',
        address: 'Çankaya, Ankara',
        linkedin_url: 'https://linkedin.com/in/zeynepdemir',
        is_favorite: false,
        notes: 'Finans konularında uzman',
        tags: ['finans', 'muhasebe', 'danışmanlık'],
      },
      {
        user_id: userId,
        company_name: 'E-Ticaret A.Ş.',
        position: 'Pazarlama Müdürü',
        name: 'Can Arslan',
        email: 'can@eticaret.com',
        phone: '+90 555 333 4444',
        website: 'https://eticaret.com',
        address: 'Bornova, İzmir',
        instagram_url: 'https://instagram.com/canarslan',
        linkedin_url: 'https://linkedin.com/in/canarslan',
        x_url: 'https://x.com/canarslan',
        is_favorite: false,
        notes: 'E-ticaret stratejilerinde başarılı',
        tags: ['pazarlama', 'eticaret', 'dijital'],
      },
      {
        user_id: userId,
        company_name: 'Sağlık Teknolojileri',
        position: 'Ürün Müdürü',
        name: 'Elif Kara',
        email: 'elif@sagliktek.com',
        phone: '+90 555 555 6666',
        website: 'https://sagliktek.com',
        address: 'Çukurova, Adana',
        linkedin_url: 'https://linkedin.com/in/elifkara',
        is_favorite: true,
        notes: 'Sağlık sektöründe yenilikçi',
        tags: ['sağlık', 'teknoloji', 'ürün'],
      },
      {
        user_id: userId,
        company_name: 'Eğitim Platformu',
        position: 'İçerik Yöneticisi',
        name: 'Burak Şen',
        email: 'burak@egitimplatform.com',
        phone: '+90 555 777 8888',
        website: 'https://egitimplatform.com',
        address: 'Nilüfer, Bursa',
        instagram_url: 'https://instagram.com/buraksen',
        linkedin_url: 'https://linkedin.com/in/buraksen',
        youtube_url: 'https://youtube.com/@buraksen',
        is_favorite: false,
        notes: 'Eğitim içerikleri üretiyor',
        tags: ['eğitim', 'içerik', 'online'],
      },
      {
        user_id: userId,
        company_name: 'Mobil Uygulama Stüdyosu',
        position: 'UX/UI Tasarımcı',
        name: 'Selin Yıldız',
        email: 'selin@mobilstudio.com',
        phone: '+90 555 999 0000',
        website: 'https://mobilstudio.com',
        address: 'Konak, İzmir',
        instagram_url: 'https://instagram.com/selinyildiz',
        linkedin_url: 'https://linkedin.com/in/selinyildiz',
        x_url: 'https://x.com/selinyildiz',
        is_favorite: false,
        notes: 'Kullanıcı deneyimi konusunda uzman',
        tags: ['ux', 'ui', 'mobil', 'tasarım'],
      },
      {
        user_id: userId,
        company_name: 'Veri Analitik Şirketi',
        position: 'Veri Bilimci',
        name: 'Emre Koç',
        email: 'emre@verianalitik.com',
        phone: '+90 555 222 3333',
        website: 'https://verianalitik.com',
        address: 'Çankaya, Ankara',
        linkedin_url: 'https://linkedin.com/in/emrekoc',
        x_url: 'https://x.com/emrekoc',
        is_favorite: true,
        notes: 'Veri analizi ve makine öğrenmesi uzmanı',
        tags: ['veri', 'analitik', 'ai', 'makine öğrenmesi'],
      },
      {
        user_id: userId,
        company_name: 'Sosyal Medya Ajansı',
        position: 'Sosyal Medya Uzmanı',
        name: 'Deniz Çelik',
        email: 'deniz@sosyalmedya.com',
        phone: '+90 555 444 5555',
        website: 'https://sosyalmedya.com',
        address: 'Kadıköy, İstanbul',
        instagram_url: 'https://instagram.com/denizcelik',
        linkedin_url: 'https://linkedin.com/in/denizcelik',
        x_url: 'https://x.com/denizcelik',
        youtube_url: 'https://youtube.com/@denizcelik',
        is_favorite: false,
        notes: 'Sosyal medya stratejileri geliştiriyor',
        tags: ['sosyal medya', 'pazarlama', 'içerik'],
      },
    ];

    const { data: insertedCards, error: cardsError } = await supabase
      .from('cards')
      .insert(testCards)
      .select();

    if (cardsError) {
      console.error('Kartlar eklenirken hata:', cardsError);
      throw cardsError;
    }

    console.log(`${insertedCards.length} test kartı eklendi`);

    // Test koleksiyonlarını ekle
    const testCollections = [
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
        name: 'Ortaklar',
        description: 'İş ortakları ve partnerler',
        color: '#FF9500',
        icon: 'handshake',
      },
      {
        user_id: userId,
        name: 'Referanslar',
        description: 'Referans veren kişiler',
        color: '#FF3B30',
        icon: 'star',
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
      console.error('Koleksiyonlar eklenirken hata:', collectionsError);
      throw collectionsError;
    }

    console.log(`${insertedCollections.length} test koleksiyonu eklendi`);

    // Kartları koleksiyonlara ekle
    if (insertedCards.length > 0 && insertedCollections.length > 0) {
      const collectionCards = [];

      // İş Bağlantıları koleksiyonuna 5 kart ekle
      const isBaglantilari = insertedCollections.find(c => c.name === 'İş Bağlantıları');
      for (let i = 0; i < Math.min(5, insertedCards.length); i++) {
        collectionCards.push({
          collection_id: isBaglantilari.id,
          card_id: insertedCards[i].id,
          position: i + 1,
        });
      }

      // Müşteriler koleksiyonuna 3 kart ekle
      const musteriler = insertedCollections.find(c => c.name === 'Müşteriler');
      for (let i = 3; i < Math.min(6, insertedCards.length); i++) {
        collectionCards.push({
          collection_id: musteriler.id,
          card_id: insertedCards[i].id,
          position: i - 2,
        });
      }

      // Teknoloji koleksiyonuna 3 kart ekle
      const teknoloji = insertedCollections.find(c => c.name === 'Teknoloji');
      for (let i = 0; i < Math.min(3, insertedCards.length); i++) {
        if (insertedCards[i].tags && insertedCards[i].tags.some(tag =>
          ['yazılım', 'teknoloji', 'ux', 'ui', 'veri', 'analitik'].includes(tag)
        )) {
          collectionCards.push({
            collection_id: teknoloji.id,
            card_id: insertedCards[i].id,
            position: i + 1,
          });
        }
      }

      const { error: collectionCardsError } = await supabase
        .from('collection_cards')
        .insert(collectionCards);

      if (collectionCardsError) {
        console.error('Koleksiyon kartları eklenirken hata:', collectionCardsError);
        // Bu hata kritik değil, devam et
      } else {
        console.log(`${collectionCards.length} kart-koleksiyon ilişkisi eklendi`);
      }
    }

    return {
      success: true,
      message: 'Test verileri başarıyla eklendi',
      stats: {
        cards: insertedCards.length,
        collections: insertedCollections.length,
      },
    };
  } catch (error) {
    console.error('Test verileri ekleme hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Database'i başlat ve gerekirse test verilerini ekle
 */
export const initializeDatabase = async (userId) => {
  try {
    console.log('Database başlatılıyor...');

    // Tabloları kontrol et
    const tablesExist = await checkTablesExist();

    if (!tablesExist) {
      console.warn(
        '⚠️ UYARI: Tablolar henüz oluşturulmamış!\n' +
        'Lütfen Supabase SQL Editor\'ünde aşağıdaki dosyayı çalıştırın:\n' +
        'supabase/migrations/001_initial_schema.sql\n\n' +
        'Dosya yolu: D:\\BusinessCardProject\\cardvault\\supabase\\migrations\\001_initial_schema.sql'
      );
      return {
        success: false,
        error: 'Tablolar oluşturulmamış. Migration dosyasını çalıştırın.',
      };
    }

    console.log('✅ Tablolar mevcut');

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
    console.error('Database başlatma hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  checkTablesExist,
  seedTestData,
  initializeDatabase,
};

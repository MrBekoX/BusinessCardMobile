-- CardVault Test Data
-- Seed file for development and testing

-- =====================================================
-- TEST USER PROFILES
-- Not: Gerçek kullanıcılar auth.users tablosunda olmalı
-- Bu seed, test kullanıcısı için profil oluşturur
-- =====================================================

-- Test kullanıcısı için profil (UUID'yi kendi test kullanıcınızın ID'si ile değiştirin)
-- Bu sadece örnek, gerçek kullanıcı ID'si ile kullanın
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- İlk kullanıcıyı al (eğer varsa)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    -- Profil oluştur
    INSERT INTO profiles (id, first_name, last_name, display_name, phone, bio)
    VALUES (
      test_user_id,
      'Test',
      'Kullanıcı',
      'Test Kullanıcı',
      '+90 555 000 0000',
      'CardVault test kullanıcısı'
    )
    ON CONFLICT (id) DO UPDATE
    SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      display_name = EXCLUDED.display_name,
      phone = EXCLUDED.phone,
      bio = EXCLUDED.bio;

    -- =====================================================
    -- TEST CARDS
    -- Örnek kartvizitler
    -- =====================================================
    INSERT INTO cards (user_id, company_name, position, name, email, phone, website, address, instagram_url, linkedin_url, x_url, youtube_url, is_favorite, notes, tags)
    VALUES
      (
        test_user_id,
        'Teknoloji A.Ş.',
        'Yazılım Geliştirici',
        'Ahmet Yılmaz',
        'ahmet@teknoloji.com',
        '+90 555 123 4567',
        'https://teknoloji.com',
        'Maslak, İstanbul',
        'https://instagram.com/ahmetyilmaz',
        'https://linkedin.com/in/ahmetyilmaz',
        'https://x.com/ahmetyilmaz',
        NULL,
        TRUE,
        'Çok yetenekli bir yazılımcı',
        ARRAY['yazılım', 'teknoloji', 'fullstack']
      ),
      (
        test_user_id,
        'Dijital Çözümler Ltd.',
        'Proje Yöneticisi',
        'Ayşe Kaya',
        'ayse@dijital.com',
        '+90 555 987 6543',
        'https://dijitalcozumler.com',
        'Kadıköy, İstanbul',
        'https://instagram.com/aysekaya',
        'https://linkedin.com/in/aysekaya',
        NULL,
        NULL,
        TRUE,
        'Çok organize proje yöneticisi',
        ARRAY['proje', 'yönetim', 'dijital']
      ),
      (
        test_user_id,
        'Yaratıcı Ajans',
        'Grafik Tasarımcı',
        'Mehmet Öz',
        'mehmet@yaratici.com',
        '+90 555 456 7890',
        'https://yaraticiajans.com',
        'Beşiktaş, İstanbul',
        'https://instagram.com/mehmetoz',
        'https://linkedin.com/in/mehmetoz',
        'https://x.com/mehmetoz',
        'https://youtube.com/@mehmetoz',
        FALSE,
        'Harika tasarımlar yapıyor',
        ARRAY['tasarım', 'grafik', 'yaratıcılık']
      ),
      (
        test_user_id,
        'Finans Danışmanlık',
        'Mali Müşavir',
        'Zeynep Demir',
        'zeynep@finansdanismanlik.com',
        '+90 555 111 2222',
        'https://finansdanismanlik.com',
        'Çankaya, Ankara',
        NULL,
        'https://linkedin.com/in/zeynepdemir',
        NULL,
        NULL,
        FALSE,
        'Finans konularında uzman',
        ARRAY['finans', 'muhasebe', 'danışmanlık']
      ),
      (
        test_user_id,
        'E-Ticaret A.Ş.',
        'Pazarlama Müdürü',
        'Can Arslan',
        'can@eticaret.com',
        '+90 555 333 4444',
        'https://eticaret.com',
        'Bornova, İzmir',
        'https://instagram.com/canarslan',
        'https://linkedin.com/in/canarslan',
        'https://x.com/canarslan',
        NULL,
        FALSE,
        'E-ticaret stratejilerinde başarılı',
        ARRAY['pazarlama', 'eticaret', 'dijital']
      ),
      (
        test_user_id,
        'Sağlık Teknolojileri',
        'Ürün Müdürü',
        'Elif Kara',
        'elif@sagliktek.com',
        '+90 555 555 6666',
        'https://sagliktek.com',
        'Çukurova, Adana',
        NULL,
        'https://linkedin.com/in/elifkara',
        NULL,
        NULL,
        TRUE,
        'Sağlık sektöründe yenilikçi',
        ARRAY['sağlık', 'teknoloji', 'ürün']
      ),
      (
        test_user_id,
        'Eğitim Platformu',
        'İçerik Yöneticisi',
        'Burak Şen',
        'burak@egitimplatform.com',
        '+90 555 777 8888',
        'https://egitimplatform.com',
        'Nilüfer, Bursa',
        'https://instagram.com/buraksen',
        'https://linkedin.com/in/buraksen',
        NULL,
        'https://youtube.com/@buraksen',
        FALSE,
        'Eğitim içerikleri üretiyor',
        ARRAY['eğitim', 'içerik', 'online']
      ),
      (
        test_user_id,
        'Mobil Uygulama Stüdyosu',
        'UX/UI Tasarımcı',
        'Selin Yıldız',
        'selin@mobilstudio.com',
        '+90 555 999 0000',
        'https://mobilstudio.com',
        'Konak, İzmir',
        'https://instagram.com/selinyildiz',
        'https://linkedin.com/in/selinyildiz',
        'https://x.com/selinyildiz',
        NULL,
        FALSE,
        'Kullanıcı deneyimi konusunda uzman',
        ARRAY['ux', 'ui', 'mobil', 'tasarım']
      ),
      (
        test_user_id,
        'Veri Analitik Şirketi',
        'Veri Bilimci',
        'Emre Koç',
        'emre@verianalitik.com',
        '+90 555 222 3333',
        'https://verianalitik.com',
        'Çankaya, Ankara',
        NULL,
        'https://linkedin.com/in/emrekoc',
        'https://x.com/emrekoc',
        NULL,
        TRUE,
        'Veri analizi ve makine öğrenmesi uzmanı',
        ARRAY['veri', 'analitik', 'ai', 'makine öğrenmesi']
      ),
      (
        test_user_id,
        'Sosyal Medya Ajansı',
        'Sosyal Medya Uzmanı',
        'Deniz Çelik',
        'deniz@sosyalmedya.com',
        '+90 555 444 5555',
        'https://sosyalmedya.com',
        'Kadıköy, İstanbul',
        'https://instagram.com/denizcelik',
        'https://linkedin.com/in/denizcelik',
        'https://x.com/denizcelik',
        'https://youtube.com/@denizcelik',
        FALSE,
        'Sosyal medya stratejileri geliştiriyor',
        ARRAY['sosyal medya', 'pazarlama', 'içerik']
      );

    -- =====================================================
    -- TEST COLLECTIONS
    -- Örnek koleksiyonlar
    -- =====================================================
    INSERT INTO collections (user_id, name, description, color, icon)
    VALUES
      (test_user_id, 'İş Bağlantıları', 'İş ilişkileri ve network', '#007AFF', 'work'),
      (test_user_id, 'Müşteriler', 'Aktif müşteriler', '#34C759', 'people'),
      (test_user_id, 'Ortaklar', 'İş ortakları ve partnerler', '#FF9500', 'handshake'),
      (test_user_id, 'Referanslar', 'Referans veren kişiler', '#FF3B30', 'star'),
      (test_user_id, 'Teknoloji', 'Teknoloji sektöründeki kişiler', '#5856D6', 'computer');

    -- =====================================================
    -- COLLECTION_CARDS RELATIONSHIPS
    -- Kartları koleksiyonlara ekle
    -- =====================================================
    DO $$
    DECLARE
      collection_is_baglantilari_id UUID;
      collection_musteriler_id UUID;
      collection_ortaklar_id UUID;
      collection_teknoloji_id UUID;

      card_ahmet_id UUID;
      card_ayse_id UUID;
      card_mehmet_id UUID;
      card_zeynep_id UUID;
      card_can_id UUID;
      card_elif_id UUID;
      card_selin_id UUID;
      card_emre_id UUID;
    BEGIN
      -- Koleksiyon ID'lerini al
      SELECT id INTO collection_is_baglantilari_id FROM collections WHERE name = 'İş Bağlantıları' LIMIT 1;
      SELECT id INTO collection_musteriler_id FROM collections WHERE name = 'Müşteriler' LIMIT 1;
      SELECT id INTO collection_ortaklar_id FROM collections WHERE name = 'Ortaklar' LIMIT 1;
      SELECT id INTO collection_teknoloji_id FROM collections WHERE name = 'Teknoloji' LIMIT 1;

      -- Kart ID'lerini al
      SELECT id INTO card_ahmet_id FROM cards WHERE email = 'ahmet@teknoloji.com' LIMIT 1;
      SELECT id INTO card_ayse_id FROM cards WHERE email = 'ayse@dijital.com' LIMIT 1;
      SELECT id INTO card_mehmet_id FROM cards WHERE email = 'mehmet@yaratici.com' LIMIT 1;
      SELECT id INTO card_zeynep_id FROM cards WHERE email = 'zeynep@finansdanismanlik.com' LIMIT 1;
      SELECT id INTO card_can_id FROM cards WHERE email = 'can@eticaret.com' LIMIT 1;
      SELECT id INTO card_elif_id FROM cards WHERE email = 'elif@sagliktek.com' LIMIT 1;
      SELECT id INTO card_selin_id FROM cards WHERE email = 'selin@mobilstudio.com' LIMIT 1;
      SELECT id INTO card_emre_id FROM cards WHERE email = 'emre@verianalitik.com' LIMIT 1;

      -- Kartları koleksiyonlara ekle
      -- İş Bağlantıları
      INSERT INTO collection_cards (collection_id, card_id, position)
      VALUES
        (collection_is_baglantilari_id, card_ahmet_id, 1),
        (collection_is_baglantilari_id, card_ayse_id, 2),
        (collection_is_baglantilari_id, card_mehmet_id, 3),
        (collection_is_baglantilari_id, card_selin_id, 4),
        (collection_is_baglantilari_id, card_emre_id, 5);

      -- Müşteriler
      INSERT INTO collection_cards (collection_id, card_id, position)
      VALUES
        (collection_musteriler_id, card_zeynep_id, 1),
        (collection_musteriler_id, card_can_id, 2),
        (collection_musteriler_id, card_elif_id, 3);

      -- Ortaklar
      INSERT INTO collection_cards (collection_id, card_id, position)
      VALUES
        (collection_ortaklar_id, card_ayse_id, 1),
        (collection_ortaklar_id, card_mehmet_id, 2);

      -- Teknoloji
      INSERT INTO collection_cards (collection_id, card_id, position)
      VALUES
        (collection_teknoloji_id, card_ahmet_id, 1),
        (collection_teknoloji_id, card_selin_id, 2),
        (collection_teknoloji_id, card_emre_id, 3);
    END $$;

    RAISE NOTICE 'Test verileri başarıyla eklendi!';
  ELSE
    RAISE NOTICE 'Henüz kullanıcı yok. Önce kayıt olun.';
  END IF;
END $$;

/**
 * QR Scanner Screen.
 * QR kod tarama ekranı.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@context/ThemeContext';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants/theme';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { AppStackParamList, AppTabParamList } from '@/types/navigation';

// Components
import MemoizedButton from '@components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ==================== TYPES ====================

type QRScannerScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'QRScanner'>,
  NativeStackNavigationProp<AppStackParamList>
>;

interface QRScannerScreenProps {
  navigation: QRScannerScreenNavigationProp;
}

const { width } = Dimensions.get('window');

// ==================== COMPONENT ====================

const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const handleBarCodeScanned = (result: BarcodeScanningResult): void => {
    if (scanned) return;
    
    setScanned(true);
    setIsScanning(false);
    
    const { data } = result;
    console.log('QR Code scanned:', data);
    
    Alert.alert('QR Kod Tarandı', `Veri: ${data}`, [
      {
        text: 'Kapat',
        onPress: () => {
          setScanned(false);
          setIsScanning(true);
        },
      },
      {
        text: 'Kartvizit Ekle',
        onPress: () => {
          navigation.navigate('CardCreate');
        },
      },
    ]);
  };

  const toggleFlashlight = (): void => {
    Alert.alert('Flaş', 'Flaş özelliği yakında eklenecek');
  };

  const openGallery = (): void => {
    Alert.alert('Galeri', 'Galeriden QR kod seçme özelliği yakında eklenecek');
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            Kamera izni kontrol ediliyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={64} color={colors.textSecondary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Kamera İzni Gerekli
          </Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            QR kod taramak için kamera izni vermeniz gerekiyor.
          </Text>
          <MemoizedButton title="İzin Ver" onPress={requestPermission} style={styles.permissionButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>QR Kod Tara</Text>
        <TouchableOpacity style={styles.flashButton} onPress={toggleFlashlight}>
          <Icon name="flash-on" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        {isScanning && (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
        )}
        
        <View style={styles.scannerFrame}>
          <View style={[styles.scannerCorner, styles.topLeft]} />
          <View style={[styles.scannerCorner, styles.topRight]} />
          <View style={[styles.scannerCorner, styles.bottomLeft]} />
          <View style={[styles.scannerCorner, styles.bottomRight]} />
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsText, { color: colors.text }]}>
            QR kodu kare içine yerleştirin
          </Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.surface }]} onPress={openGallery}>
          <Icon name="photo-library" size={24} color={colors.primary} />
          <Text style={[styles.controlButtonText, { color: colors.text }]}>Galeri</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={() => { setScanned(false); setIsScanning(true); }}
        >
          <Icon name="refresh" size={24} color={colors.primary} />
          <Text style={[styles.controlButtonText, { color: colors.text }]}>Yeniden Tara</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  backButton: { padding: SPACING.xs },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '600' as '600' },
  flashButton: { padding: SPACING.xs },
  cameraContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: width * 0.7, height: width * 0.7, borderRadius: 12, position: 'relative' },
  scannerCorner: { position: 'absolute', width: 20, height: 20, borderColor: COLORS.primary, borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  instructionsContainer: { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center' },
  instructionsText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '400' as '400', textAlign: 'center' },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.lg, paddingHorizontal: SPACING.md },
  controlButton: { alignItems: 'center', padding: SPACING.md, borderRadius: 12, minWidth: 80 },
  controlButtonText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '500' as '500', marginTop: SPACING.xs },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg },
  permissionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '600' as '600', marginTop: SPACING.md, marginBottom: SPACING.xs, textAlign: 'center' },
  permissionText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '400' as '400', textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 24 },
  permissionButton: { marginTop: SPACING.md },
});

export default QRScannerScreen;

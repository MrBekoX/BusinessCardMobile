/**
 * QR Scanner Screen.
 * QR kod tarama ekranı.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Camera } from 'expo-camera';

// Components
import MemoizedButton from '../../components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const QRScannerScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    setIsScanning(false);
    
    // QR kod verisini işle
    console.log('QR Code scanned:', { type, data });
    
    Alert.alert(
      'QR Kod Tarandı',
      `Veri: ${data}`,
      [
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
            // Kartvizit ekleme işlemi
            navigation.navigate('CardCreate', { qrData: data });
          },
        },
      ]
    );
  };

  const toggleFlashlight = () => {
    // Flaş açma/kapama
    Alert.alert('Flaş', 'Flaş özelliği yakında eklenecek');
  };

  const openGallery = () => {
    // Galeriden QR kod seçme
    Alert.alert('Galeri', 'Galeriden QR kod seçme özelliği yakında eklenecek');
  };

  if (hasPermission === null) {
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

  if (hasPermission === false) {
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
          <MemoizedButton
            title="İzin Ver"
            onPress={() => Camera.requestCameraPermissionsAsync()}
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          QR Kod Tara
        </Text>
        
        <TouchableOpacity
          style={styles.flashButton}
          onPress={toggleFlashlight}
        >
          <Icon name="flash-on" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {isScanning && (
          <Camera
            style={StyleSheet.absoluteFillObject}
            type={Camera.Constants.Type.back}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            barCodeScannerSettings={{
              barCodeTypes: [Camera.Constants.BarCodeType.qr],
            }}
          />
        )}
        
        {/* Scanner Frame */}
        <View style={styles.scannerFrame}>
          <View style={styles.scannerCorner} />
          <View style={styles.scannerCorner} />
          <View style={styles.scannerCorner} />
          <View style={styles.scannerCorner} />
        </View>
        
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsText, { color: colors.text }]}>
            QR kodu kare içine yerleştirin
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={openGallery}
        >
          <Icon name="photo-library" size={24} color={colors.primary} />
          <Text style={[styles.controlButtonText, { color: colors.text }]}>
            Galeri
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={() => {
            setScanned(false);
            setIsScanning(true);
          }}
        >
          <Icon name="refresh" size={24} color={colors.primary} />
          <Text style={[styles.controlButtonText, { color: colors.text }]}>
            Yeniden Tara
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  flashButton: {
    padding: SPACING.xs,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 12,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  controlButton: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    minWidth: 80,
  },
  controlButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.xs,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  permissionButton: {
    marginTop: SPACING.md,
  },
});

export default QRScannerScreen;
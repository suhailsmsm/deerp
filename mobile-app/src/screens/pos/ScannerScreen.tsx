/**
 * DerpX POS - Barcode Scanner Screen
 * Camera-based barcode scanning for products
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { usePosStore } from '../../store/posStore';
import { useSettingsStore } from '../../store/settingsStore';
import { darkColors, spacing, borderRadius, typography } from '../../constants/theme';

export default function ScannerScreen() {
  const navigation = useNavigation();

  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { addToCart, products } = usePosStore();

  useEffect(() => {
    (async () => {
      const { granted } = await Camera.requestCameraPermissionsAsync();
      setPermission(granted);
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    // Find product by barcode
    const product = products.find((p) => p.barcode === data || p.sku === data);

    if (product) {
      addToCart(product, 1);
      Alert.alert(
        'Product Added',
        `${product.name} added to cart`,
        [
          {
            text: 'Scan Another',
            onPress: () => setScanned(false),
          },
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('Cart' as never),
          },
        ]
      );
    } else {
      Alert.alert(
        'Product Not Found',
        `No product found with barcode: ${data}`,
        [
          {
            text: 'Try Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Manual Entry',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  if (permission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color={darkColors.textMuted} />
        <Text style={styles.text}>Camera permission is required for barcode scanning</Text>
        <TouchableOpacity style={styles.button} onPress={async () => {
          const { granted } = await Camera.requestCameraPermissionsAsync();
          setPermission(granted);
        }}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a', 'code128', 'code39', 'code93', 'qr', 'datamatrix'],
        }}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Barcode</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Scan Frame */}
        <View style={styles.scanFrame}>
          <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
          <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
          <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
          <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Align the barcode within the frame
          </Text>
          <Text style={styles.instructionsSubtext}>
            Supports EAN-13, EAN-8, UPC, Code128, Code39, QR
          </Text>
        </View>

        {/* Manual Entry Button */}
        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="keypad-outline" size={20} color="#fff" />
          <Text style={styles.manualButtonText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
  placeholder: {
    width: 44,
  },
  scanFrame: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.lg,
  },
  scanCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    
    borderWidth: 4,
  },
  scanCornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: borderRadius.md,
  },
  scanCornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: borderRadius.md,
  },
  scanCornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: borderRadius.md,
  },
  scanCornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: borderRadius.md,
  },
  instructions: {
    alignItems: 'center',
    paddingBottom: spacing.xl * 2,
  },
  instructionsText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  instructionsSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  text: {
    
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  button: {
    
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

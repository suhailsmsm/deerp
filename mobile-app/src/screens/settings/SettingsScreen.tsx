/**
 * DerpX POS - Settings Screen
 * Full settings with payment gateway integration, business profile
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { darkColors, lightColors, spacing, borderRadius, typography } from '../../constants/theme';
import { PAYMENT_METHODS, UAE_PAYMENT_GATEWAYS, HARDWARE_CONFIG } from '../../constants';

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogoContainer: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: { width: 55, height: 55, borderRadius: 10 },
  headerBranding: { flexDirection: 'column', marginLeft: spacing.md },
  brandingRow1: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.accent },
  brandingRow2: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  profileAvatar: { width: 60, height: 60, borderRadius: borderRadius.full, backgroundColor: colors.accent + '20', justifyContent: 'center', alignItems: 'center' },
  profileInitials: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.accent },
  profileInfo: { flex: 1, marginLeft: spacing.md },
  profileName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text },
  profileEmail: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  profileRole: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: spacing.xs, textTransform: 'uppercase' },
  editProfileButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md, marginLeft: spacing.sm },
  sectionContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingItemLast: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  settingLabel: { fontSize: typography.fontSize.md, color: colors.text, fontWeight: typography.fontWeight.medium },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  settingValue: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  logoSection: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  logoPreviewContainer: { width: 80, height: 80, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg },
  logoPreview: { width: '80%', height: '80%' },
  logoPlaceholder: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  logoActions: { flex: 1, gap: spacing.sm },
  uploadLogoButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  uploadLogoText: { color: '#fff', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  removeLogoButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  removeLogoText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.error },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error + '10', borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.xl },
  logoutText: { color: colors.error, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
  footer: { alignItems: 'center', paddingBottom: spacing.xl },
  footerText: { fontSize: typography.fontSize.sm, color: colors.textMuted },
  footerSubtext: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
  footerCopyright: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: spacing.sm },
  gatewayChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
  gatewayChipActive: { borderColor: colors.accent, backgroundColor: colors.accent + '15' },
  gatewayChipText: { fontSize: typography.fontSize.xs, color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%' },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  input: { backgroundColor: colors.input, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typography.fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalButton: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  modalCancel: { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text },
  modalSave: { backgroundColor: colors.accent },
  modalSaveText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: '#fff' },
  gatewayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  gatewayInfo: { flex: 1 },
  gatewayName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text },
  gatewayDesc: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  addGatewayButton: { backgroundColor: colors.success + '10', borderColor: colors.success + '30' },
});

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuthStore();
  const { theme, setTheme, language, setLanguage, notifications, toggleNotifications, sound, toggleSound, vibration, toggleVibration, businessLogo, setBusinessLogo, clearBusinessLogo, merchantPhone, setMerchantPhone, businessTrn, setBusinessTrn, businessName, setBusinessName, vatEnabled, setVatEnabled, vatInclusive, toggleVatInclusive, discountEnabled, setDiscountEnabled } = useSettingsStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const [gatewayConfigs, setGatewayConfigs] = useState<Record<string, { apiKey: string; secret: string; enabled: boolean; merchantId: string }>>({});
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [gatewayForm, setGatewayForm] = useState({ apiKey: '', secret: '', merchantId: '' });

  const handleBusinessNamePress = () => {
    Alert.prompt(
      'Business Name',
      'Enter your business name',
      (name) => {
        if (name) setBusinessName(name);
      },
      'plain-text',
      businessName || ''
    );
  };

  const handleTRNPress = () => {
    Alert.prompt(
      'TRN Number',
      'Enter your TRN (Tax Registration Number)',
      (trn) => {
        if (trn) setBusinessTrn(trn);
      },
      'plain-text',
      businessTrn || ''
    );
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) { Alert.alert('Permission Required', 'Please grant permission.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) { setBusinessLogo(result.assets[0].uri); Alert.alert('Success', 'Business logo updated!'); }
    } catch { Alert.alert('Error', 'Failed to upload logo.'); }
  };

  const handleRemoveLogo = () => {
    Alert.alert('Remove Logo', 'Remove business logo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => clearBusinessLogo() },
    ]);
  };

  const handleEditProfile = () => {
    if (!user) return;
    Alert.prompt(
      'Edit Name',
      'Enter your new name',
      (newName) => {
        if (newName && user.id) {
          updateUser({ name: newName });
          Alert.alert('Success', 'Profile updated!');
        }
      },
      'plain-text',
      user.name || ''
    );
  };

  const openGatewayConfig = (id: string) => {
    setSelectedGateway(id);
    const existing = gatewayConfigs[id] || { apiKey: '', secret: '', merchantId: '', enabled: false };
    setGatewayForm({ apiKey: existing.apiKey, secret: existing.secret, merchantId: existing.merchantId });
    setShowGatewayModal(true);
  };

  const saveGatewayConfig = () => {
    if (!selectedGateway) return;
    setGatewayConfigs({
      ...gatewayConfigs,
      [selectedGateway]: { ...gatewayConfigs[selectedGateway], apiKey: gatewayForm.apiKey, secret: gatewayForm.secret, merchantId: gatewayForm.merchantId, enabled: true },
    });
    setShowGatewayModal(false);
    Alert.alert('Saved', `${UAE_PAYMENT_GATEWAYS.find(g => g.id === selectedGateway)?.name} configured successfully`);
  };

  const toggleGateway = (id: string) => {
    setGatewayConfigs({ ...gatewayConfigs, [id]: { ...(gatewayConfigs[id] || { apiKey: '', secret: '', merchantId: '', enabled: false }), enabled: !(gatewayConfigs[id]?.enabled) } });
  };

  const settingsSections = [
    { title: 'Appearance', items: [
      { icon: 'moon', label: 'Dark Mode', type: 'toggle', value: theme === 'dark', onPress: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
      { icon: 'language', label: 'Language', type: 'navigate', value: language === 'en' ? 'English' : 'العربية', onPress: () => setLanguage(language === 'en' ? 'ar' : 'en') },
    ]},
    { title: 'Payment Gateways', items: [
      { icon: 'add-circle', label: '+ Add Payment Gateway', type: 'add-gateway' as const, onPress: () => setShowGatewayModal(true) },
      ...Object.entries(gatewayConfigs).filter(([_, config]) => config.enabled).map(([id, config]) => ({
        icon: 'globe-outline',
        label: UAE_PAYMENT_GATEWAYS.find(g => g.id === id)?.name || id,
        type: 'gateway' as const,
        gatewayId: id,
        value: 'Enabled',
        onPress: () => openGatewayConfig(id),
        onToggle: () => toggleGateway(id),
        isEnabled: true,
      })),
    ]},
    { title: 'Notifications', items: [
      { icon: 'notifications', label: 'Push Notifications', type: 'toggle', value: notifications, onPress: toggleNotifications },
      { icon: 'volume-high', label: 'Sound', type: 'toggle', value: sound, onPress: toggleSound },
      { icon: 'phone-portrait', label: 'Vibration', type: 'toggle', value: vibration, onPress: toggleVibration },
    ]},
    { title: 'Hardware', items: [
      { icon: 'print', label: 'Bluetooth Printer', type: 'info', value: HARDWARE_CONFIG.thermalPrinterSupport ? 'Supported' : 'N/A' },
      { icon: 'code-scan', label: 'Barcode Scanner', type: 'info', value: HARDWARE_CONFIG.bluetoothBarcodeScanner ? 'Supported' : 'N/A' },
      { icon: 'cash', label: 'Cash Drawer', type: 'info', value: HARDWARE_CONFIG.cashDrawerSupport ? 'Supported' : 'N/A' },
      { icon: 'card', label: 'Card Terminal', type: 'info', value: HARDWARE_CONFIG.cardTerminalIntegration ? 'Supported' : 'N/A' },
    ]},
    { title: 'Business', items: [
      { icon: 'storefront', label: 'Business Name', type: 'input', value: businessName || '', placeholder: 'Enter business name', onPress: handleBusinessNamePress },
      { icon: 'receipt', label: 'TRN Number', type: 'input', value: businessTrn || '', placeholder: 'Enter TRN', onPress: handleTRNPress },
      { icon: 'checkmark-circle', label: 'Enable VAT (5%)', type: 'toggle', value: vatEnabled === true, onPress: () => setVatEnabled(!(vatEnabled === true)) },
      { icon: 'swap-horizontal', label: 'VAT Inclusive Pricing', type: 'toggle', value: vatInclusive === true, onPress: toggleVatInclusive },
      { icon: 'pricetag', label: 'Enable Discounts', type: 'toggle', value: discountEnabled === true, onPress: () => setDiscountEnabled(!(discountEnabled === true)) },
      { icon: 'print', label: 'Receipt Settings', type: 'navigate', onPress: () => {} },
      { icon: 'people', label: 'Staff & Permissions', type: 'navigate', onPress: () => {} },
    ]},
    { title: 'About', items: [
      { icon: 'information-circle', label: 'App Version', type: 'info', value: '1.0.0' },
      { icon: 'document-text', label: 'Terms of Service', type: 'navigate', onPress: () => {} },
      { icon: 'shield-checkmark', label: 'Privacy Policy', type: 'navigate', onPress: () => {} },
      { icon: 'help-circle', label: 'Help & Support', type: 'navigate', onPress: () => {} },
    ]},
  ];

  const renderSettingItem = (item: any, index: number) => {
    if (item.type === 'gateway') {
      return (
        <TouchableOpacity key={index} style={styles.gatewayRow} onPress={item.onPress}>
          <View style={styles.gatewayInfo}>
            <Text style={styles.gatewayName}>{item.label}</Text>
            <Text style={styles.gatewayDesc}>{item.value}</Text>
          </View>
          <Switch value={item.isEnabled} onValueChange={item.onToggle} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
        </TouchableOpacity>
      );
    }
    if (item.type === 'add-gateway') {
      return (
        <TouchableOpacity key={index} style={[styles.settingItem, styles.addGatewayButton]} onPress={item.onPress}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.success + '20' }]}><Ionicons name={item.icon} size={20} color={colors.success} /></View>
            <Text style={[styles.settingLabel, { color: colors.success, fontWeight: typography.fontWeight.semibold }]}>{item.label}</Text>
          </View>
          <Ionicons name="add-circle" size={20} color={colors.success} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity key={index} style={[styles.settingItem, item.type === 'info' && { opacity: 0.7 }]} onPress={item.onPress} disabled={item.type === 'info' || item.type === 'input'}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}><Ionicons name={item.icon} size={20} color={colors.primary} /></View>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        <View style={styles.settingRight}>
          {item.type === 'toggle' ? (
            <Switch value={item.value} onValueChange={item.onPress} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
          ) : item.type === 'input' ? (
            <Text style={[styles.settingValue, { color: item.value ? colors.text : colors.textMuted }]}>{item.value || item.placeholder}</Text>
          ) : item.type === 'info' ? (
            <Text style={styles.settingValue}>{item.value}</Text>
          ) : (
            <><Text style={styles.settingValue}>{item.value}</Text><Ionicons name="chevron-forward" size={20} color={colors.textMuted} /></>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoContainer}>
            {businessLogo ? (
              <Image source={{ uri: businessLogo }} style={styles.headerLogo} resizeMode="contain" />
            ) : (
              <Ionicons name="cube" size={28} color={colors.accent} />
            )}
          </View>
          <View style={styles.headerBranding}>
            <Text style={styles.brandingRow1}>DerpX Ai</Text>
            <Text style={styles.brandingRow2}>MOBILE</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}><Text style={styles.profileInitials}>{user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}</Text></View>
        <View style={styles.profileInfo}><Text style={styles.profileName}>{user?.name || 'User'}</Text><Text style={styles.profileEmail}>{user?.email || ''}</Text><Text style={styles.profileRole}>{user?.role || 'User'}</Text></View>
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}><Ionicons name="pencil" size={18} color={colors.primary} /></TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Branding</Text>
        <View style={styles.sectionContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoPreviewContainer}>
              {businessLogo ? <Image source={{ uri: businessLogo }} style={styles.logoPreview} resizeMode="contain" /> : <View style={styles.logoPlaceholder}><Ionicons name="storefront" size={48} color={colors.textMuted} /></View>}
            </View>
            <View style={styles.logoActions}>
              <TouchableOpacity style={styles.uploadLogoButton} onPress={pickImage}><Ionicons name="image-outline" size={20} color="#fff" /><Text style={styles.uploadLogoText}>{businessLogo ? 'Change Logo' : 'Upload Logo'}</Text></TouchableOpacity>
              {businessLogo && <TouchableOpacity style={styles.removeLogoButton} onPress={handleRemoveLogo}><Ionicons name="trash-outline" size={20} color={colors.error} /><Text style={styles.removeLogoText}>Remove</Text></TouchableOpacity>}
            </View>
          </View>
          <View style={{ padding: spacing.md }}>
            <TextInput
              style={styles.input}
              placeholder="Merchant Phone (for WhatsApp notifications)"
              placeholderTextColor={colors.textMuted}
              value={merchantPhone || ''}
              onChangeText={setMerchantPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="TRN Number"
              placeholderTextColor={colors.textMuted}
              value={businessTrn || ''}
              onChangeText={setBusinessTrn}
            />
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>
              Example: +971501234567 (include country code)
            </Text>
          </View>
        </View>
      </View>

      {settingsSections.map((section, si) => (
        <View key={si} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>{section.items.map((item, ii) => renderSettingItem(item, ii))}</View>
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={() => { logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] }); }}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} /><Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}><Text style={styles.footerText}>DerpX POS v1.0.0</Text><Text style={styles.footerSubtext}>UAE VAT Compliant • TRN Ready</Text><Text style={styles.footerCopyright}>© 2026 DerpX</Text></View>

      <Modal visible={showGatewayModal} transparent animationType="slide" onRequestClose={() => setShowGatewayModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure {UAE_PAYMENT_GATEWAYS.find(g => g.id === selectedGateway)?.name}</Text>
            <TextInput style={styles.input} placeholder="API Key" placeholderTextColor={colors.textMuted} value={gatewayForm.apiKey} onChangeText={(v) => setGatewayForm({ ...gatewayForm, apiKey: v })} />
            <TextInput style={styles.input} placeholder="API Secret" placeholderTextColor={colors.textMuted} value={gatewayForm.secret} onChangeText={(v) => setGatewayForm({ ...gatewayForm, secret: v })} secureTextEntry />
            <TextInput style={styles.input} placeholder="Merchant ID" placeholderTextColor={colors.textMuted} value={gatewayForm.merchantId} onChangeText={(v) => setGatewayForm({ ...gatewayForm, merchantId: v })} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setShowGatewayModal(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalSave]} onPress={saveGatewayConfig}><Text style={styles.modalSaveText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
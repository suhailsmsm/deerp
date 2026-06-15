/**
 * DerpX POS - Login Screen
 * Modern, clean authentication screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { darkColors, spacing, borderRadius, typography } from '../../constants/theme';

const useThemeColors = () => {
  
  return 
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isLoading } = useAuthStore();
  const { businessLogo } = useSettingsStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      await login({ email, password });
      // Navigation is handled by the store/index
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {businessLogo ? (
              <Image 
                source={{ uri: businessLogo }} 
                style={styles.businessLogo}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="storefront" size={64} color={darkColors.highlight} />
            )}
          </View>
          <Text style={styles.title}>DerpX POS</Text>
          <Text style={styles.subtitle}>Enterprise Business Management</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={darkColors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={darkColors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={darkColors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={darkColors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={darkColors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Demo Credentials */}
          <View style={styles.demoCredentials}>
            <Text style={styles.demoLabel}>Demo Credentials:</Text>
            <Text style={styles.demoText}>Email: admin@derpx.com</Text>
            <Text style={styles.demoText}>Password: admin123</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 DerpX. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>UAE VAT Compliant POS System</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['5xl'],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: darkColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: darkColors.border,
    overflow: 'hidden',
  },
  businessLogo: {
    width: '80%',
    height: '80%',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkColors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: darkColors.textSecondary,
  },
  form: {
    gap: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkColors.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkColors.inputBorder,
    paddingHorizontal: spacing.lg,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: typography.fontSize.lg,
    color: darkColors.text,
  },
  passwordToggle: {
    padding: spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: darkColors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkColors.accent,
    borderRadius: borderRadius.lg,
    height: 56,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  demoCredentials: {
    backgroundColor: darkColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  demoLabel: {
    color: darkColors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  demoText: {
    color: darkColors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing['4xl'],
  },
  footerText: {
    color: darkColors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  footerSubtext: {
    color: darkColors.textMuted,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});

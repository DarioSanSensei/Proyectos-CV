import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator, Animated, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors, gradients } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { shake(); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Login error:', err.message, err.response?.data);
      Alert.alert('Error de conexión', err.response?.data?.error || err.message || 'No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1a0005', colors.bg, colors.surface]} style={StyleSheet.absoluteFill} />
      <View style={[styles.glow, { top: -100, left: -80 }]} />
      <View style={[styles.glow, { bottom: 50, right: -60, backgroundColor: 'rgba(212,175,55,0.1)', width: 280, height: 280 }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.logoSection}>
          <View style={styles.logoIconWrap}>
            <Text style={styles.logoIcon}>🎬</Text>
          </View>
          <Text style={styles.logoText}>CINE<Text style={styles.logoSub}>SANZA</Text></Text>
          <Text style={styles.logoTagline}>La experiencia VIP en tus manos</Text>
        </View>

        <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>
          <Text style={styles.formSubtitle}>Bienvenido de regreso a tu mundo de cine</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholder="tu@correo.com" placeholderTextColor={colors.textMuted}
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>CONTRASEÑA</Text>
            <View style={styles.passwordRow}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={password} onChangeText={setPassword}
                placeholder="••••••••" placeholderTextColor={colors.textMuted} secureTextEntry={!showPass} />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.showBtn}>
                <Text style={styles.showBtnText}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.loginBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginBtnText}>ENTRAR AL CINE 🎟️</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate gratis</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', width: 350, height: 350, borderRadius: 200, backgroundColor: colors.primaryGlow, opacity: 0.4 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  logoIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoIcon: { fontSize: 40 },
  logoText: { fontSize: 32, fontWeight: '900', color: 'white', letterSpacing: 2 },
  logoSub: { fontWeight: '300', fontSize: 28, letterSpacing: 4 },
  logoTagline: { color: colors.textMuted, fontSize: 13, marginTop: 6, letterSpacing: 1 },
  formCard: { backgroundColor: colors.card, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: colors.cardBorder },
  formTitle: { fontSize: 24, fontWeight: '800', color: 'white', marginBottom: 6 },
  formSubtitle: { color: colors.textMuted, fontSize: 14, marginBottom: 28 },
  inputWrap: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: 'white', fontSize: 16 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  showBtn: { padding: 14, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder },
  showBtnText: { fontSize: 18 },
  loginBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  loginBtnText: { color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: colors.textMuted, fontSize: 14 },
  registerLink: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});

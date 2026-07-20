import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors, gradients } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirm) { Alert.alert('Campos incompletos', 'Llena todos los campos.'); return; }
    if (password !== confirm) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); Alert.alert('Error', 'Las contraseñas no coinciden.'); return; }
    if (password.length < 6) { Alert.alert('Contraseña débil', 'Mínimo 6 caracteres.'); return; }
    setLoading(true);
    try {
      await authApi.post('/register', { email: email.trim(), password });
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Error al registrar', err.response?.data?.error || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#001a12', colors.bg, colors.surface]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <View style={styles.logoIconWrap}><Text style={styles.logoIcon}>✨</Text></View>
            <Text style={styles.logoText}>CINE<Text style={styles.logoSub}>SANZA</Text></Text>
            <Text style={styles.logoTagline}>Únete al Club CinePuntos VIP</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Crear Cuenta</Text>
            <Text style={styles.formSubtitle}>¡Empieza a ganar CinePuntos desde hoy!</Text>

            {[
              { label: 'CORREO ELECTRÓNICO', value: email, setter: setEmail, keyboard: 'email-address', placeholder: 'tu@correo.com', secure: false },
              { label: 'CONTRASEÑA', value: password, setter: setPassword, keyboard: 'default', placeholder: 'Mínimo 6 caracteres', secure: true },
              { label: 'CONFIRMAR CONTRASEÑA', value: confirm, setter: setConfirm, keyboard: 'default', placeholder: 'Repite tu contraseña', secure: true },
            ].map(field => (
              <View key={field.label} style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput style={styles.input} value={field.value} onChangeText={field.setter}
                  placeholder={field.placeholder} placeholderTextColor={colors.textMuted}
                  keyboardType={field.keyboard} autoCapitalize="none" secureTextEntry={field.secure} />
              </View>
            ))}

            <View style={styles.perksBox}>
              {['🎟️ Compra boletos en segundos', '⭐ Gana CinePuntos por cada compra', '💎 Accede al Club VIP exclusivo'].map(p => (
                <Text key={p} style={styles.perkText}>{p}</Text>
              ))}
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>CREAR MI CUENTA 🚀</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
              <Text style={styles.backText}>← Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoIconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoIcon: { fontSize: 36 },
  logoText: { fontSize: 30, fontWeight: '900', color: 'white', letterSpacing: 2 },
  logoSub: { fontWeight: '300', fontSize: 26, letterSpacing: 4 },
  logoTagline: { color: colors.success, fontSize: 13, marginTop: 4 },
  formCard: { backgroundColor: colors.card, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: colors.cardBorder },
  formTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  formSubtitle: { color: colors.textMuted, fontSize: 14, marginBottom: 24 },
  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: 'white', fontSize: 16 },
  perksBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 20, gap: 8 },
  perkText: { color: colors.textSecondary, fontSize: 13 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  btnText: { color: 'white', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  backRow: { alignItems: 'center' },
  backText: { color: colors.textMuted, fontSize: 14 },
});

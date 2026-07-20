import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  RefreshControl, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients } from '../theme/colors';
import { authApi, bookingApi, catalogApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const TIERS = [
  { name: 'Bronce', min: 0, max: 199, color: '#CD7F32', emoji: '🥉', perks: 'Acceso básico, acumula puntos' },
  { name: 'Plata', min: 200, max: 499, color: '#C0C0C0', emoji: '🥈', perks: 'Prioridad en compras, descuentos' },
  { name: 'Oro', min: 500, max: 999, color: '#FFD700', emoji: '🥇', perks: 'Sala VIP gratis en tu cumpleaños' },
  { name: 'Diamante', min: 1000, max: Infinity, color: '#B9F2FF', emoji: '💎', perks: 'Boleto gratis mensual + acceso VIP' },
];
const getTier = (pts) => TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];

export default function WalletScreen({ navigation }) {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const [pRes, tRes, mRes] = await Promise.all([
        authApi.get('/me'),
        bookingApi.get('/mis-boletos'),
        catalogApi.get('/'),
      ]);
      setProfile(pRes.data.user);
      setTickets(tRes.data);
      setMovies(mRes.data);
    } catch (e) {
      console.error('Wallet error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchAll(); }, [token]);
  const getMovie = (id) => movies.find(m => m._id === id) || {};

  if (!token) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#1a0510', colors.bg]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.unauth}>
          <Text style={{ fontSize: 72, marginBottom: 20 }}>🎟️</Text>
          <Text style={styles.unauthTitle}>Tu Billetera VIP</Text>
          <Text style={styles.unauthSub}>Inicia sesión para ver tus boletos y CinePuntos acumulados.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.unauthBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Iniciar Sesión</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.textMuted, marginTop: 16, fontSize: 14 }}>Cargando billetera...</Text>
      </View>
    );
  }

  const pts = profile?.points || 0;
  const tier = getTier(pts);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const progress = nextTier ? Math.min(100, ((pts - tier.min) / (nextTier.min - tier.min)) * 100) : 100;
  const totalSpent = tickets.reduce((s, t) => s + (t.totalPrice || t.price || 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <SafeAreaView>

          <View style={styles.cardWrap}>
            <LinearGradient colors={['#1a0005', tier.color + '22', '#0a0010']} style={styles.vipCard}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={[styles.cardGlow, { backgroundColor: tier.color + '20' }]} />
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.cardBrand}>CINESANZA · CLUB VIP</Text>
                  <Text style={styles.cardEmail} numberOfLines={1}>{profile?.email}</Text>
                </View>
                <View style={styles.tierBadge}>
                  <Text style={{ fontSize: 22, marginBottom: 2 }}>{tier.emoji}</Text>
                  <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                </View>
              </View>
              <Text style={[styles.ptsNum, { color: tier.color }]}>{pts.toLocaleString()}</Text>
              <Text style={styles.ptsLabel}>CinePuntos</Text>
              {nextTier && (
                <View style={{ marginTop: 16, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{tier.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{nextTier.name} ({nextTier.min} pts)</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: tier.color }]} />
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6, textAlign: 'right' }}>{nextTier.min - pts} pts para {nextTier.name}</Text>
                </View>
              )}
              <Text style={{ color: colors.textMuted, fontSize: 12, fontStyle: 'italic' }}>{tier.emoji} {tier.perks}</Text>
            </LinearGradient>
          </View>

          <View style={styles.statsRow}>
            {[{ l: 'Boletos', v: tickets.length, i: '🎟️' }, { l: 'Gastado', v: `$${totalSpent.toFixed(0)}`, i: '💰' }, { l: 'Combos', v: tickets.reduce((s, t) => s + (t.concessions?.length || 0), 0), i: '🍿' }].map(s => (
              <View key={s.l} style={styles.statCard}>
                <Text style={{ fontSize: 22, marginBottom: 6 }}>{s.i}</Text>
                <Text style={styles.statVal}>{s.v}</Text>
                <Text style={styles.statLbl}>{s.l}</Text>
              </View>
            ))}
          </View>

          <View style={styles.promo}>
            <LinearGradient colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.05)']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            <Text style={{ fontSize: 28 }}>💎</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.gold, fontWeight: '700', fontSize: 14, marginBottom: 2 }}>Canjea tus CinePuntos</Text>
              <Text style={{ color: 'rgba(212,175,55,0.6)', fontSize: 12 }}>Acumula 500 y obtén un boleto gratis</Text>
            </View>
            <View style={styles.promoBadge}><Text style={{ color: colors.gold, fontSize: 11, fontWeight: '700' }}>Próximo</Text></View>
          </View>

          <View style={styles.histSection}>
            <Text style={styles.histTitle}>Mis Boletos</Text>
            <Text style={styles.histSub}>Tu historial cinematográfico</Text>
          </View>

          {tickets.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 56, marginBottom: 16 }}>🎬</Text>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>Aún no tienes boletos</Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>Descubre los últimos estrenos y asegura tu lugar.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
                <LinearGradient colors={gradients.primary} style={{ borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Ver Cartelera</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ticketsList}>
              {tickets.map(t => {
                const mv = getMovie(t.movieId);
                return (
                  <View key={t._id} style={styles.ticketRow}>
                    <Image source={{ uri: mv.posterUrl || 'https://placehold.co/80x120/111/FFF?text=?' }}
                      style={styles.ticketPoster} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ticketMovieTitle} numberOfLines={2}>{mv.title || 'Película'}</Text>
                      <Text style={styles.ticketSeat}>Asiento: <Text style={{ color: colors.primary, fontWeight: '800' }}>{t.seatNumber}</Text></Text>
                      <Text style={styles.ticketMeta}>{t.room} · {t.showtime}h</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={styles.ticketPrice}>${(t.totalPrice || t.price || 0).toFixed(2)}</Text>
                        {t.pointsEarned > 0 && <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '700' }}>⭐ +{t.pointsEarned}</Text>}
                      </View>
                      {t.concessions?.length > 0 && <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>🍿 {t.concessions.map(c => c.name).join(', ')}</Text>}
                    </View>
                    <Image source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${t._id}&bgcolor=111111&color=FFFFFF` }}
                      style={{ width: 52, height: 52, borderRadius: 8, alignSelf: 'center' }} />
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 14 }}>Cerrar Sesión</Text>
          </TouchableOpacity>
          <View style={{ height: 120 }} />
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  unauth: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  unauthTitle: { color: 'white', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  unauthSub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  unauthBtn: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40 },
  cardWrap: { margin: 20 },
  vipCard: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  cardGlow: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardBrand: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 4 },
  cardEmail: { color: 'white', fontWeight: '700', fontSize: 14, maxWidth: 200 },
  tierBadge: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  tierName: { fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  ptsNum: { fontSize: 48, fontWeight: '900', lineHeight: 52 },
  ptsLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginTop: 2 },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.glassBorder },
  statVal: { color: 'white', fontWeight: '900', fontSize: 18, marginBottom: 2 },
  statLbl: { color: colors.textMuted, fontSize: 11 },
  promo: { marginHorizontal: 20, marginBottom: 24, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', overflow: 'hidden' },
  promoBadge: { backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  histSection: { paddingHorizontal: 20, marginBottom: 16 },
  histTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  histSub: { color: colors.textMuted, fontSize: 13 },
  ticketsList: { paddingHorizontal: 20, gap: 12 },
  ticketRow: { backgroundColor: colors.card, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 14, borderWidth: 1, borderColor: colors.glassBorder },
  ticketPoster: { width: 60, height: 88, borderRadius: 8 },
  ticketMovieTitle: { color: 'white', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  ticketSeat: { color: colors.textSecondary, fontSize: 13, marginBottom: 2 },
  ticketMeta: { color: colors.textMuted, fontSize: 11, marginBottom: 6 },
  ticketPrice: { color: 'white', fontWeight: '800', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  logoutBtn: { marginHorizontal: 20, marginTop: 24, padding: 16, borderRadius: 14, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center' },
});

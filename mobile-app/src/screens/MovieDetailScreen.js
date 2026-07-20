import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Dimensions, Modal, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { colors, gradients } from '../theme/colors';
import { bookingApi, roomApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function MovieDetailScreen({ route, navigation }) {
  const { movie } = route.params;
  const { user, token } = useAuth();
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [step, setStep] = useState('info');

  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    if (!selectedShowtime) return;
    setLoadingSeats(true);
    setOccupiedSeats([]);
    setSelectedSeat(null);
    Promise.all([
      roomApi.get(`/name/${selectedShowtime.room}`),
      bookingApi.get(`/movie/${movie._id}/showtime/${selectedShowtime.time}/room/${selectedShowtime.room}`),
    ]).then(([roomRes, seatsRes]) => {
      setRoomInfo(roomRes.data);
      setOccupiedSeats(seatsRes.data.map(t => t.seatNumber));
    }).catch(() => Alert.alert('Error', 'No se pudo cargar la sala.')).finally(() => setLoadingSeats(false));
  }, [selectedShowtime]);

  const handleBuy = () => {
    if (!token) {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta para comprar.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    setStep('seats');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSeatSelected = (seatId) => {
    Haptics.selectionAsync();
    setSelectedSeat(seatId);
  };

  const handleProceed = () => {
    if (!selectedSeat || !selectedShowtime) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate('Checkout', { movie, selectedSeat, selectedShowtime, roomInfo });
  };

  const youtubeId = getYoutubeId(movie.trailerUrl);

  if (step === 'seats') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.seatsHeader}>
            <TouchableOpacity onPress={() => { setStep('info'); setSelectedShowtime(null); }} style={styles.backBtn}>
              <Text style={styles.backBtnTxt}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.seatsTitle} numberOfLines={1}>{movie.title}</Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={styles.showtimeSection}>
              <Text style={styles.showtimeLabel}>SELECCIONA FUNCIÓN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}>
                {movie.showtimes?.map((st, i) => {
                  const active = selectedShowtime?.time === st.time && selectedShowtime?.room === st.room;
                  return (
                    <TouchableOpacity key={i} onPress={() => setSelectedShowtime(st)}
                      style={[styles.showtimeBtn, active && styles.showtimeBtnActive]}>
                      <Text style={[styles.showtimeBtnTime, active && { color: colors.primary }]}>{st.time}</Text>
                      <Text style={[styles.showtimeBtnRoom, active && { color: colors.primary }]}>{st.room}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            {selectedShowtime && (
              <View style={styles.seatMapWrap}>
                <View style={styles.screenWrap}>
                  <View style={styles.screenLine} />
                  <Text style={styles.screenTxt}>PANTALLA</Text>
                </View>
                {loadingSeats || !roomInfo ? (
                  <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
                ) : (
                  <View style={styles.seatGrid}>
                    {Array.from({ length: roomInfo.rows }).map((_, rI) => {
                      const row = String.fromCharCode(65 + rI);
                      return (
                        <View key={row} style={styles.seatRow}>
                          <Text style={styles.rowLabel}>{row}</Text>
                          {Array.from({ length: roomInfo.cols }).map((_, cI) => {
                            const id = `${row}${cI + 1}`;
                            if (roomInfo.disabledSeats?.includes(id)) return <View key={id} style={styles.seatBlank} />;
                            const occupied = occupiedSeats.includes(id);
                            const sel = selectedSeat === id;
                            return (
                              <TouchableOpacity key={id} onPress={() => !occupied && handleSeatSelected(id)} disabled={occupied}
                                style={[styles.seat, occupied && styles.seatOcc, sel && styles.seatSel]} />
                            );
                          })}
                        </View>
                      );
                    })}
                  </View>
                )}
                <View style={styles.legend}>
                  {[{ l: 'Libre', s: styles.seat }, { l: 'Tu lugar', s: styles.seatSel }, { l: 'Ocupado', s: styles.seatOcc }].map(({ l, s }) => (
                    <View key={l} style={styles.legendItem}><View style={[styles.legendDot, s]} /><Text style={styles.legendTxt}>{l}</Text></View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          {selectedSeat && (
            <View style={styles.seatCta}>
              <View><Text style={styles.seatCtaLbl}>Asiento</Text><Text style={styles.seatCtaVal}>{selectedSeat} · {selectedShowtime?.room}</Text></View>
              <TouchableOpacity onPress={handleProceed} activeOpacity={0.85}>
                <LinearGradient colors={gradients.primary} style={styles.seatCtaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.seatCtaBtnTxt}>Continuar 🍿</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: height * 0.55 }}>
          <Image source={{ uri: movie.backdropUrl || movie.posterUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient colors={gradients.hero} style={StyleSheet.absoluteFill} />
          <SafeAreaView>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnTxt}>← Cartelera</Text>
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.posterFloatWrap}>
            <Image source={{ uri: movie.posterUrl }} style={styles.posterFloat} resizeMode="cover" />
          </View>
        </View>

        <View style={styles.detailBody}>
          <Text style={styles.detailTitle}>{movie.title}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.ratingPill, { backgroundColor: colors.primary }]}>
              <Text style={styles.ratingPillTxt}>{movie.rating}</Text>
            </View>
            <Text style={styles.metaTxt}>★ {movie.imdbRating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.metaTxt}>· {movie.year}</Text>
            <Text style={styles.metaTxt}>· {movie.duration} min</Text>
          </View>
          <View style={styles.genreRow}>
            {movie.genres?.slice(0, 4).map((g, i) => (
              <View key={i} style={styles.genreChip}><Text style={styles.genreChipTxt}>{g}</Text></View>
            ))}
          </View>
          <Text style={styles.director}>Dir. {movie.director}</Text>
          <Text style={styles.desc}>{movie.description}</Text>

          {movie.showtimes?.length > 0 && (
            <View style={styles.showtimesCard}>
              <Text style={styles.showtimesCardLabel}>HORARIOS DISPONIBLES</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {movie.showtimes.slice(0, 4).map((st, i) => (
                  <View key={i} style={styles.showtimeChip}>
                    <Text style={styles.showtimeChipTime}>{st.time}</Text>
                    <Text style={styles.showtimeChipRoom}>{st.room}</Text>
                  </View>
                ))}
                {movie.showtimes.length > 4 && <Text style={{ color: colors.textMuted, alignSelf: 'center', fontSize: 12 }}>+{movie.showtimes.length - 4} más</Text>}
              </View>
            </View>
          )}

          <View style={styles.pointsCard}>
            <Text style={{ fontSize: 28 }}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.gold, fontWeight: '700', fontSize: 14, marginBottom: 4 }}>Gana CinePuntos</Text>
              <Text style={{ color: 'rgba(212,175,55,0.6)', fontSize: 12 }}>1 punto por cada $10 · Acúmalos para premios VIP</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleBuy} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient colors={gradients.primary} style={styles.buyBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.buyBtnTxt}>🎟️ COMPRAR BOLETO</Text>
              </LinearGradient>
            </TouchableOpacity>
            {youtubeId && (
              <TouchableOpacity onPress={() => setShowTrailer(true)} style={styles.trailerBtn} activeOpacity={0.8}>
                <Text style={styles.trailerBtnTxt}>▶ Tráiler</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      <Modal visible={showTrailer} animationType="slide" onRequestClose={() => setShowTrailer(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <StatusBar style="light" />
          <TouchableOpacity onPress={() => setShowTrailer(false)} style={{ padding: 20, paddingTop: 50 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>✕ Cerrar</Text>
          </TouchableOpacity>
          <WebView source={{ uri: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0` }}
            allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} style={{ flex: 1 }} />
        </View>
      </Modal>
    </View>
  );
}

const SEAT_SIZE = Math.min(26, (width - 60) / 12);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  backBtn: { margin: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignSelf: 'flex-start', borderRadius: 50, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: colors.glassBorder },
  backBtnTxt: { color: 'white', fontWeight: '700', fontSize: 14 },
  ratingPill: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  ratingPillTxt: { color: 'white', fontWeight: '900', fontSize: 11 },
  posterFloatWrap: { position: 'absolute', bottom: -40, left: 24, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: colors.glassBorder, elevation: 15 },
  posterFloat: { width: 110, height: 165 },
  detailBody: { paddingHorizontal: 24, paddingTop: 56 },
  detailTitle: { color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  metaTxt: { color: colors.textSecondary, fontSize: 13 },
  genreRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  genreChip: { backgroundColor: colors.glass, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.glassBorder },
  genreChipTxt: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  director: { color: colors.primary, fontWeight: '700', fontSize: 13, marginBottom: 12 },
  desc: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  showtimesCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.glassBorder },
  showtimesCardLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  showtimeChip: { backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center' },
  showtimeChipTime: { color: 'white', fontWeight: '800', fontSize: 14 },
  showtimeChipRoom: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  pointsCard: { backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: 14, padding: 16, marginBottom: 24, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  buyBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buyBtnTxt: { color: 'white', fontWeight: '800', fontSize: 15 },
  trailerBtn: { backgroundColor: colors.glass, borderRadius: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.glassBorder },
  trailerBtnTxt: { color: 'white', fontWeight: '700', fontSize: 14 },
  // Seat map
  seatsHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
  seatsTitle: { flex: 1, color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center', marginRight: 80 },
  showtimeSection: { padding: 20 },
  showtimeLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  showtimeBtn: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center', minWidth: 80 },
  showtimeBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  showtimeBtnTime: { color: 'white', fontWeight: '800', fontSize: 14 },
  showtimeBtnRoom: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  seatMapWrap: { paddingHorizontal: 16 },
  screenWrap: { alignItems: 'center', marginBottom: 24 },
  screenLine: { width: width * 0.65, height: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 8 },
  screenTxt: { color: colors.textMuted, fontSize: 11, letterSpacing: 4, fontWeight: '700' },
  seatGrid: { alignItems: 'center', gap: 6 },
  seatRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  rowLabel: { color: colors.textMuted, fontSize: 10, width: 14, textAlign: 'center', fontWeight: '700' },
  seat: { width: SEAT_SIZE, height: SEAT_SIZE - 4, borderRadius: 5, backgroundColor: colors.seatAvailable, borderWidth: 1, borderColor: colors.seatBorderAvailable },
  seatOcc: { backgroundColor: colors.seatOccupied, borderColor: colors.seatBorderOccupied },
  seatSel: { backgroundColor: colors.seatSelected, borderColor: colors.seatSelected, elevation: 8 },
  seatBlank: { width: SEAT_SIZE, height: SEAT_SIZE - 4 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 16, height: 16, borderRadius: 4 },
  legendTxt: { color: colors.textMuted, fontSize: 12 },
  seatCta: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, padding: 20, paddingBottom: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.glassBorder },
  seatCtaLbl: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  seatCtaVal: { color: 'white', fontWeight: '800', fontSize: 16 },
  seatCtaBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  seatCtaBtnTxt: { color: 'white', fontWeight: '800', fontSize: 15 },
});

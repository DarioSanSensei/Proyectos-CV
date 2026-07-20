import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients } from '../theme/colors';
import { bookingApi, concessionsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const STEPS = ['Dulcería', 'Pago', 'Boleto'];

export default function CheckoutScreen({ route, navigation }) {
  const { movie, selectedSeat, selectedShowtime, roomInfo } = route.params;
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [concessions, setConcessions] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [ticket, setTicket] = useState(null);

  const ticketPrice = roomInfo?.basePrice || 75;
  const concessionsTotal = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
  const total = ticketPrice + concessionsTotal;
  const pts = Math.floor(total / 10);

  useEffect(() => {
    if (step === 0) {
      concessionsApi.get('/').then(res => setConcessions(res.data.filter(c => c.available))).catch(() => setConcessions([])).finally(() => setLoading(false));
    }
  }, [step]);

  const adjustQty = (item, delta) => {
    Haptics.selectionAsync();
    setCart(prev => {
      const cur = prev[item._id] || { ...item, qty: 0 };
      const qty = Math.max(0, cur.qty + delta);
      if (qty === 0) { const u = { ...prev }; delete u[item._id]; return u; }
      return { ...prev, [item._id]: { ...cur, qty } };
    });
  };

  const executeBooking = async () => {
    setProcessing(true);
    try {
      const res = await bookingApi.post('/', {
        movieId: movie._id, seatNumber: selectedSeat, showtime: selectedShowtime.time, room: selectedShowtime.room,
        concessions: Object.values(cart).map(c => ({ itemId: c._id, name: c.name, price: c.price, qty: c.qty })),
      });
      setTicket(res.data.ticket);
      await refreshUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(2);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err.response?.data?.message || 'No se pudo procesar el boleto.');
    } finally {
      setProcessing(false);
    }
  };

  const renderDulceria = () => (
    <>
      <Text style={styles.stepEye}>PASO 1 DE 3</Text>
      <Text style={styles.stepTitle}>🍿 Dulcería</Text>
      <Text style={styles.stepSub}>Agrega tus snacks favoritos a tu pedido</Text>
      {loading ? <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} /> : (
        <>
          {['COMBO', 'SNACK', 'BEBIDA', 'ESPECIAL'].map(cat => {
            const items = concessions.filter(c => c.category === cat);
            if (!items.length) return null;
            const label = { COMBO: '🎁 Combos', SNACK: '🍿 Snacks', BEBIDA: '🥤 Bebidas', ESPECIAL: '🍫 Especiales' }[cat];
            return (
              <View key={cat}>
                <Text style={styles.catLabel}>{label}</Text>
                {items.map(item => {
                  const qty = cart[item._id]?.qty || 0;
                  return (
                    <View key={item._id} style={styles.concessionItem}>
                      <Text style={styles.concessionEmoji}>{item.emoji}</Text>
                      <View style={styles.concessionInfo}>
                        <Text style={styles.concessionName}>{item.name}</Text>
                        <Text style={styles.concessionDesc} numberOfLines={1}>{item.description}</Text>
                        <Text style={styles.concessionPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                      <View style={styles.qtyRow}>
                        {qty > 0 && <>
                          <TouchableOpacity onPress={() => adjustQty(item, -1)} style={styles.qtyBtn}><Text style={styles.qtyBtnTxt}>−</Text></TouchableOpacity>
                          <Text style={styles.qtyVal}>{qty}</Text>
                        </>}
                        <TouchableOpacity onPress={() => adjustQty(item, 1)} style={[styles.qtyBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                          <Text style={[styles.qtyBtnTxt, { color: 'white' }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </>
      )}
    </>
  );

  const renderPayment = () => (
    <>
      <Text style={styles.stepEye}>PASO 2 DE 3</Text>
      <Text style={styles.stepTitle}>💳 Resumen y Pago</Text>
      <Text style={styles.stepSub}>Revisa tu orden antes de confirmar</Text>
      <View style={styles.orderCard}>
        <View style={{ flexDirection: 'row', gap: 14, marginBottom: 16 }}>
          <Image source={{ uri: movie.posterUrl }} style={{ width: 64, height: 96, borderRadius: 10 }} resizeMode="cover" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 15, marginBottom: 6 }} numberOfLines={2}>{movie.title}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>{selectedShowtime.room} · {selectedShowtime.time}h</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Asiento: <Text style={{ color: colors.primary, fontWeight: '900' }}>{selectedSeat}</Text></Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}><Text style={styles.priceLbl}>Boleto</Text><Text style={styles.priceVal}>${ticketPrice.toFixed(2)}</Text></View>
        {Object.values(cart).map(c => (
          <View key={c._id} style={styles.priceRow}>
            <Text style={styles.priceLbl}>{c.emoji} {c.name} ×{c.qty}</Text>
            <Text style={styles.priceVal}>${(c.price * c.qty).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={[styles.priceLbl, { color: 'white', fontWeight: '800', fontSize: 16 }]}>TOTAL</Text>
          <Text style={[styles.priceVal, { color: colors.primary, fontWeight: '900', fontSize: 20 }]}>${total.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.pointsEarnCard}>
        <Text style={{ fontSize: 28 }}>⭐</Text>
        <View><Text style={{ color: colors.gold, fontWeight: '700', fontSize: 14, marginBottom: 3 }}>Ganarás {pts} CinePuntos</Text>
          <Text style={{ color: 'rgba(212,175,55,0.6)', fontSize: 11 }}>1 punto por cada $10 · Inmediatos</Text></View>
      </View>
      <View style={styles.payCard}>
        <Text style={styles.payCardLabel}>MÉTODO DE PAGO (DEMO)</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 28 }}>💳</Text>
          <View style={{ flex: 1 }}><Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>•••• •••• •••• 4242</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Tarjeta de prueba · Exp 12/27</Text></View>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.successLight, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.success }}>✓</Text></View>
        </View>
      </View>
    </>
  );

  const renderTicket = () => (
    <>
      <View style={styles.ticketHero}>
        <LinearGradient colors={gradients.primary} style={StyleSheet.absoluteFill} />
        <Text style={{ fontSize: 56, marginBottom: 12 }}>🎟️</Text>
        <Text style={{ color: 'white', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 }}>¡Boleto Confirmado!</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center' }}>Tu experiencia cinematográfica está asegurada</Text>
      </View>
      <View style={styles.ticketBody}>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#111', marginBottom: 16 }}>{movie.title}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {[
            { l: 'SALA', v: ticket?.room },
            { l: 'FUNCIÓN', v: `${ticket?.showtime}h` },
            { l: 'ASIENTO', v: ticket?.seatNumber, hi: true },
            { l: 'TOTAL', v: `$${(ticket?.totalPrice || ticket?.price || 0).toFixed(2)}` },
          ].map(({ l, v, hi }) => (
            <View key={l} style={{ flex: 1, minWidth: '45%', backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#999', letterSpacing: 1, marginBottom: 4 }}>{l}</Text>
              <Text style={{ fontSize: hi ? 20 : 15, fontWeight: '800', color: hi ? '#E31E24' : '#111' }}>{v}</Text>
            </View>
          ))}
        </View>
        {ticket?.concessions?.length > 0 && (
          <View style={{ backgroundColor: '#fff5f5', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#fecaca' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#E31E24', marginBottom: 10 }}>🍿 DULCERÍA</Text>
            {ticket.concessions.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#333', fontSize: 13 }}>{c.name} ×{c.qty}</Text>
                <Text style={{ color: '#333', fontWeight: '700', fontSize: 13 }}>${(c.price * c.qty).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
        {ticket?.pointsEarned > 0 && (
          <View style={{ backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#fde68a', alignItems: 'center' }}>
            <Text style={{ fontSize: 28 }}>⭐</Text>
            <View><Text style={{ color: '#92400e', fontWeight: '800', fontSize: 14 }}>+{ticket.pointsEarned} CinePuntos</Text>
              <Text style={{ color: '#b45309', fontSize: 12 }}>Acreditados a tu cuenta</Text></View>
          </View>
        )}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${ticket?._id}&bgcolor=FFFFFF&color=000000` }}
            style={{ width: 160, height: 160, borderRadius: 8, marginBottom: 8 }} />
          <Text style={{ color: '#999', fontFamily: 'monospace', fontSize: 10 }} numberOfLines={1}>{ticket?._id}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} activeOpacity={0.85}>
          <LinearGradient colors={gradients.primary} style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>¡LISTO, A DISFRUTAR! 🍿</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: '#E31E24', fontWeight: '700', fontSize: 14 }}>Ver mis boletos →</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        {step < 2 && (
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()} style={styles.backNavBtn}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>←</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {STEPS.map((s, i) => (
                <View key={s} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
                  </View>
                  {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && { backgroundColor: colors.primary }]} />}
                </View>
              ))}
            </View>
            <View style={{ width: 40 }} />
          </View>
        )}
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 0 && renderDulceria()}
          {step === 1 && renderPayment()}
          {step === 2 && renderTicket()}
          <View style={{ height: 140 }} />
        </ScrollView>
        {step < 2 && (
          <View style={styles.bottomBar}>
            <View><Text style={{ color: colors.textMuted, fontSize: 12 }}>Total</Text>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>${total.toFixed(2)}</Text></View>
            <TouchableOpacity onPress={() => step === 0 ? setStep(1) : executeBooking()} disabled={processing} activeOpacity={0.85} style={{ flex: 1, maxWidth: 200 }}>
              <LinearGradient colors={gradients.primary} style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {processing ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>{step === 0 ? 'Continuar →' : '✅ CONFIRMAR'}</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
  backNavBtn: { width: 40, height: 40, backgroundColor: colors.glass, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.glassBorder },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepLine: { width: 32, height: 2, backgroundColor: colors.glassBorder, marginHorizontal: 4 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  stepEye: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 6 },
  stepTitle: { fontSize: 26, fontWeight: '900', color: 'white', marginBottom: 6 },
  stepSub: { color: colors.textMuted, fontSize: 14, marginBottom: 24 },
  catLabel: { fontSize: 13, fontWeight: '800', color: colors.textMuted, letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  concessionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.glassBorder },
  concessionEmoji: { fontSize: 28, width: 40, textAlign: 'center' },
  concessionInfo: { flex: 1 },
  concessionName: { color: 'white', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  concessionDesc: { color: colors.textMuted, fontSize: 11, marginBottom: 4 },
  concessionPrice: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 50, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.glassBorder },
  qtyBtnTxt: { color: colors.textSecondary, fontWeight: '800', fontSize: 16 },
  qtyVal: { color: colors.primary, fontWeight: '900', fontSize: 16, minWidth: 20, textAlign: 'center' },
  orderCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginTop: 20, borderWidth: 1, borderColor: colors.glassBorder, marginBottom: 16 },
  divider: { height: 1, backgroundColor: colors.glassBorder, marginVertical: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLbl: { color: colors.textSecondary, fontSize: 14 },
  priceVal: { color: 'white', fontWeight: '700', fontSize: 14 },
  pointsEarnCard: { backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', marginBottom: 16, alignItems: 'center' },
  payCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.glassBorder },
  payCardLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 14 },
  ticketHero: { borderRadius: 20, overflow: 'hidden', alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, marginBottom: 20 },
  ticketBody: { backgroundColor: 'white', borderRadius: 20, padding: 24 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, padding: 20, paddingBottom: 34, flexDirection: 'row', alignItems: 'center', gap: 16, borderTopWidth: 1, borderTopColor: colors.glassBorder },
});

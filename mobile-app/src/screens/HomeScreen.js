import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions,
  ScrollView, ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients } from '../theme/colors';
import { catalogApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const POSTER_W = (width - 48) / 2 - 8;
const HERO_H = height * 0.60;
const GENRES = ['Todos', 'Acción', 'Aventura', 'Ciencia Ficción', 'Terror', 'Drama', 'Comedia', 'Animación'];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGenre, setActiveGenre] = useState('Todos');
  const [search, setSearch] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef(null);
  const autoTimer = useRef(null);

  const fetchMovies = async () => {
    try {
      const res = await catalogApi.get('/');
      setMovies(res.data);
    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  const heroMovies = movies.filter(m => m.isHighlight).slice(0, 6);
  const allHeroes = heroMovies.length > 0 ? heroMovies : movies.slice(0, 5);

  useEffect(() => {
    if (allHeroes.length < 2) return;
    autoTimer.current = setInterval(() => {
      setHeroIndex(prev => {
        const next = (prev + 1) % allHeroes.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(autoTimer.current);
  }, [allHeroes.length]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchMovies(); }, []);

  const filteredMovies = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = activeGenre === 'Todos' || m.genres?.includes(activeGenre);
    return matchSearch && matchGenre;
  });

  const onPress = (movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('MovieDetail', { movie });
  };

  const renderHero = ({ item }) => (
    <View style={{ width, height: HERO_H }}>
      <Image source={{ uri: item.backdropUrl || item.posterUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={gradients.hero} style={StyleSheet.absoluteFill} />
      <View style={styles.heroContent}>
        <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>🔥 EN CARTELERA</Text></View>
        <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.heroMeta}>
          <View style={styles.ratingPill}><Text style={styles.ratingPillText}>{item.rating}</Text></View>
          <Text style={styles.heroMetaTxt}>★ {item.imdbRating?.toFixed(1) || '—'}</Text>
          <Text style={styles.heroMetaTxt}>· {item.duration} min</Text>
        </View>
        <Text style={styles.heroDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.heroActions}>
          <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.heroBuyBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.heroBuyText}>🎟️ Comprar</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPress(item)} style={styles.heroInfoBtn} activeOpacity={0.8}>
            <Text style={styles.heroInfoText}>ℹ️ Ver más</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCard = ({ item }) => (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardPosterWrap}>
        <Image source={{ uri: item.posterUrl }} style={styles.cardPoster} resizeMode="cover" />
        <LinearGradient colors={gradients.card} style={styles.cardGradient} />
        <View style={styles.cardBadges}>
          {item.isHighlight && <View style={styles.starBadge}><Text style={styles.starBadgeTxt}>★</Text></View>}
          <View style={styles.ratingChip}><Text style={styles.ratingChipTxt}>{item.rating}</Text></View>
        </View>
        <View style={styles.cardImdbWrap}><Text style={styles.cardImdb}>★ {item.imdbRating?.toFixed(1) || '0.0'}</Text></View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardMeta}>{item.year} · {item.duration} min</Text>
      <View style={styles.genreRow}>
        {item.genres?.slice(0, 2).map((g, i) => (
          <View key={i} style={styles.genreChip}><Text style={styles.genreChipTxt}>{g}</Text></View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar style="light" />
        <Text style={styles.loadingLogo}>🎬</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 12 }} />
        <Text style={styles.loadingTxt}>Cargando cartelera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

        {/* HERO */}
        {allHeroes.length > 0 && (
          <View style={{ height: HERO_H }}>
            <FlatList ref={heroRef} data={allHeroes} renderItem={renderHero} keyExtractor={i => i._id}
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => setHeroIndex(Math.round(e.nativeEvent.contentOffset.x / width))} />
            {allHeroes.length > 1 && (
              <View style={styles.dotsWrap}>
                {allHeroes.map((_, i) => <View key={i} style={[styles.dot, i === heroIndex && styles.dotActive]} />)}
              </View>
            )}
          </View>
        )}

        {/* GREETING */}
        <View style={styles.greetWrap}>
          <Text style={styles.greetTxt}>{user ? `¡Hola, ${user.email.split('@')[0]}! 👋` : '¡Bienvenido a CineSanza! 🎬'}</Text>
          {user && <Text style={styles.greetPts}>⭐ {user.points || 0} CinePuntos acumulados</Text>}
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch}
            placeholder="Buscar película..." placeholderTextColor={colors.textMuted} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text></TouchableOpacity>}
        </View>

        {/* GENRES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {GENRES.map(g => (
            <TouchableOpacity key={g} onPress={() => { setActiveGenre(g); Haptics.selectionAsync(); }}
              style={[styles.genreFilter, activeGenre === g && styles.genreFilterActive]}>
              <Text style={[styles.genreFilterTxt, activeGenre === g && styles.genreFilterTxtActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SECTION */}
        <View style={styles.sectionRow}>
          <View><Text style={styles.sectionEye}>EN CARTELERA</Text><Text style={styles.sectionTitle}>Estrenos de la Semana</Text></View>
          <Text style={styles.sectionCount}>{filteredMovies.length} films</Text>
        </View>

        {/* GRID */}
        <FlatList data={filteredMovies} renderItem={renderCard} keyExtractor={i => i._id}
          numColumns={2} columnWrapperStyle={styles.gridRow} contentContainerStyle={styles.grid}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🎬</Text>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>No hay resultados</Text>
            </View>
          } />
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingWrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  loadingLogo: { fontSize: 64, marginBottom: 20 },
  loadingTxt: { color: colors.textMuted, fontSize: 14, letterSpacing: 2 },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 28 },
  heroBadge: { backgroundColor: colors.primaryLight, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10, borderWidth: 1, borderColor: colors.primary },
  heroBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: 'white', fontSize: 28, fontWeight: '900', marginBottom: 10 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  ratingPill: { backgroundColor: colors.primary, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  ratingPillText: { color: 'white', fontWeight: '900', fontSize: 11 },
  heroMetaTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  heroDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  heroActions: { flexDirection: 'row', gap: 12 },
  heroBuyBtn: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  heroBuyText: { color: 'white', fontWeight: '800', fontSize: 14 },
  heroInfoBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.glassBorder },
  heroInfoText: { color: 'white', fontWeight: '600', fontSize: 14 },
  dotsWrap: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 24, backgroundColor: colors.gold },
  greetWrap: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  greetTxt: { color: 'white', fontSize: 18, fontWeight: '700' },
  greetPts: { color: colors.gold, fontSize: 13, marginTop: 4, fontWeight: '600' },
  searchWrap: { marginHorizontal: 16, marginTop: 16, backgroundColor: colors.card, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: colors.glassBorder },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 14, color: 'white', fontSize: 15 },
  genreFilter: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glassBorder },
  genreFilterActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  genreFilterTxt: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  genreFilterTxtActive: { color: colors.primary, fontWeight: '800' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
  sectionEye: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: 'white', marginTop: 2 },
  sectionCount: { color: colors.textMuted, fontSize: 13 },
  grid: { paddingHorizontal: 16 },
  gridRow: { justifyContent: 'space-between', marginBottom: 20 },
  card: { width: POSTER_W },
  cardPosterWrap: { borderRadius: 14, overflow: 'hidden', aspectRatio: 2 / 3, marginBottom: 10 },
  cardPoster: { width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  cardBadges: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', gap: 6 },
  starBadge: { backgroundColor: colors.gold, borderRadius: 50, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  starBadgeTxt: { color: 'black', fontSize: 11, fontWeight: '900' },
  ratingChip: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  ratingChipTxt: { color: 'white', fontSize: 10, fontWeight: '800' },
  cardImdbWrap: { position: 'absolute', bottom: 8, right: 8 },
  cardImdb: { color: colors.gold, fontSize: 11, fontWeight: '700' },
  cardTitle: { color: 'white', fontSize: 13, fontWeight: '700', marginBottom: 3 },
  cardMeta: { color: colors.textMuted, fontSize: 11, marginBottom: 6 },
  genreRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  genreChip: { backgroundColor: colors.glass, borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: colors.glassBorder },
  genreChipTxt: { color: colors.textSecondary, fontSize: 10 },
  empty: { alignItems: 'center', paddingVertical: 60 },
});

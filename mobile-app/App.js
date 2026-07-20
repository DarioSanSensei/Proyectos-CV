import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme/colors';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import WalletScreen from './src/screens/WalletScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎬" label="Cartelera" focused={focused} /> }} />
      <Tab.Screen name="Wallet" component={WalletScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💎" label="Mis Boletos" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <View style={styles.splashLogo}><Text style={styles.splashEmoji}>🎬</Text></View>
        <Text style={styles.splashTitle}>CINE<Text style={styles.splashThin}>SANZA</Text></Text>
        <Text style={styles.splashSub}>Tu experiencia VIP en tus manos</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={user ? 'Main' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  splashLogo: { width: 90, height: 90, borderRadius: 28, backgroundColor: colors.primaryLight, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  splashEmoji: { fontSize: 46 },
  splashTitle: { fontSize: 36, fontWeight: '900', color: 'white', letterSpacing: 3, marginBottom: 8 },
  splashThin: { fontWeight: '300', letterSpacing: 5 },
  splashSub: { color: colors.textMuted, fontSize: 13, letterSpacing: 1 },
  tabBar: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.glassBorder, height: 80 },
  tabIcon: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 16, minWidth: 80 },
  tabIconFocused: { backgroundColor: colors.primaryLight },
  tabEmoji: { fontSize: 24, marginBottom: 2 },
  tabLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  tabLabelFocused: { color: colors.primary, fontWeight: '800' },
});

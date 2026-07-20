import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATALOG_URL, AUTH_URL, BOOKING_URL, CONCESSIONS_URL, ROOM_URL } from './config';

const createClient = (baseURL) => {
  const client = axios.create({ baseURL, timeout: 10000 });
  client.interceptors.request.use(async (config) => {
    try {
      const token = await AsyncStorage.getItem('cinema_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {}
    return config;
  });
  return client;
};

export const catalogApi = createClient(CATALOG_URL);
export const authApi = createClient(AUTH_URL);
export const bookingApi = createClient(BOOKING_URL);
export const concessionsApi = createClient(CONCESSIONS_URL);
export const roomApi = createClient(ROOM_URL);

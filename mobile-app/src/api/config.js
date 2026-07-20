import Constants from 'expo-constants';

const getBaseUrl = (port) => {
  // Siempre usamos la IP local de tu computadora para que tu teléfono pueda conectarse
  return `http://192.168.0.197:${port}`;
};

export const CATALOG_URL = `${getBaseUrl(3002)}/api/movies`;
export const AUTH_URL = `${getBaseUrl(3001)}/api/auth`;
export const BOOKING_URL = `${getBaseUrl(3003)}/api/bookings`;
export const CONCESSIONS_URL = `${getBaseUrl(3002)}/api/concessions`;
export const ROOM_URL = `${getBaseUrl(3002)}/api/rooms`;
export const SOCKET_URL = getBaseUrl(3003);

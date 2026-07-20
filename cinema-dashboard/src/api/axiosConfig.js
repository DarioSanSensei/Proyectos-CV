// src/api/axiosConfig.js
import axios from 'axios';

// Instancia para el Catálogo (Puerto 3002 - películas)
const catalogApi = axios.create({
    baseURL: import.meta.env.VITE_CATALOG_SERVICE_URL,
});

// Instancia para las Reservas (Puerto 3003)
const bookingApi = axios.create({
    baseURL: import.meta.env.VITE_BOOKING_SERVICE_URL,
});

// Instancia para las Salas (Puerto 3002, pero endpoint /api/rooms)
const roomApi = axios.create({
    baseURL: import.meta.env.VITE_CATALOG_SERVICE_URL.replace('/api/movies', '/api/rooms'),
});

// Instancia para la Dulcería (Puerto 3002, pero endpoint /api/concessions)
const concessionsApi = axios.create({
    baseURL: import.meta.env.VITE_CATALOG_SERVICE_URL.replace('/api/movies', '/api/concessions'),
});

// Instancia para Autenticación/Perfil (Puerto 3001)
const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001/api/auth',
});

// Extraemos la lógica del interceptor a una función para no repetir código
const injectToken = (config) => {
    const token = localStorage.getItem('cinema_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// Le aplicamos el escudo JWT a TODOS los microservicios
catalogApi.interceptors.request.use(injectToken, (error) => Promise.reject(error));
bookingApi.interceptors.request.use(injectToken, (error) => Promise.reject(error));
roomApi.interceptors.request.use(injectToken, (error) => Promise.reject(error));
concessionsApi.interceptors.request.use(injectToken, (error) => Promise.reject(error));
authApi.interceptors.request.use(injectToken, (error) => Promise.reject(error));

export { catalogApi, bookingApi, roomApi, concessionsApi, authApi };

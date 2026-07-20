// src/utils/authUtils.js
import { jwtDecode } from 'jwt-decode';

export const getUserRole = () => {
    const token = localStorage.getItem('cinema_token');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.role; // Extraemos el rol que inyectamos en el backend
    } catch (error) {
        return null;
    }
};

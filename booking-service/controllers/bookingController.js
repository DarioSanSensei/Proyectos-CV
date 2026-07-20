const Ticket = require('../models/Ticket');
const axios = require('axios');

const createTicket = async (req, res) => {
    try {
        const { movieId, seatNumber, showtime, room, concessions = [] } = req.body;
        const userId = req.user.id; 

        // Validar campos obligatorios extra
        if (!showtime || !room) {
            return res.status(400).json({ message: 'El horario y la sala son obligatorios para generar el boleto.' });
        }

        // 1. RECONOCIMIENTO: Verificar que la película existe en el catálogo
        const CATALOG_BASE = process.env.CATALOG_SERVICE_URL.replace('/api/movies', '');
        try {
            await axios.get(`${process.env.CATALOG_SERVICE_URL}/${movieId}`); 
        } catch (error) {
            return res.status(404).json({ message: 'Operación abortada: La película solicitada no existe en cartelera.' });
        }

        // 2. PRECIO REAL: Obtener el precio base de la sala desde el catálogo
        let basePrice = 75.00; // fallback
        try {
            const roomRes = await axios.get(`${CATALOG_BASE}/api/rooms/name/${room}`);
            if (roomRes.data && roomRes.data.basePrice) {
                basePrice = roomRes.data.basePrice;
            }
        } catch (roomErr) {
            console.warn(`[Booking] No se pudo obtener precio de la sala '${room}', usando fallback $75`);
        }

        // 3. VALIDACIÓN: Prevenir colisión de asientos en MISMO horario y sala
        const existingTicket = await Ticket.findOne({ movieId, showtime, room, seatNumber });
        if (existingTicket) {
            return res.status(409).json({ message: `El asiento ${seatNumber} ya está ocupado para la función de las ${showtime} en ${room}.` });
        }

        // 4. CALCULAR PRECIO TOTAL (boleto + dulcería)
        const concessionsTotal = concessions.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
        let totalPrice = basePrice + concessionsTotal;

        // APLICAR DESCUENTO POR CUPÓN
        const { couponCode } = req.body;
        let discountApplied = 0;
        if (couponCode) {
            const upperCode = couponCode.trim().toUpperCase();
            if (upperCode === 'SANZA30') {
                discountApplied = totalPrice * 0.3;
            } else if (upperCode === 'CINE2X1') {
                discountApplied = totalPrice * 0.5;
            } else if (upperCode === 'COMBO50') {
                discountApplied = Math.min(totalPrice, 50);
            }
            totalPrice = Math.max(0, totalPrice - discountApplied);
        }
        
        // 5. CALCULAR CINEPUNTOS (1 punto por cada $10 gastados)
        const pointsEarned = Math.floor(totalPrice / 10);

        // 6. EJECUCIÓN: Generar el boleto
        const newTicket = new Ticket({
            userId,
            movieId,
            showtime,
            room,
            seatNumber,
            price: basePrice,
            concessions,
            totalPrice,
            pointsEarned
        });

        const savedTicket = await newTicket.save();
        
        // 7. TIEMPO REAL: Emitir evento con datos completos
        const io = req.app.get('io');
        if (io) {
            io.emit('ticket_sold', {
                movieId: savedTicket.movieId,
                showtime: savedTicket.showtime,
                room: savedTicket.room,
                seatNumber: savedTicket.seatNumber,
                price: savedTicket.price,
                totalPrice: savedTicket.totalPrice,
                pointsEarned: savedTicket.pointsEarned
            });
        }

        // 8. CINEPUNTOS: Notificar al Auth Service para acreditar puntos
        if (pointsEarned > 0) {
            try {
                const AUTH_BASE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
                await axios.patch(
                    `${AUTH_BASE}/api/auth/me/points`,
                    { points: pointsEarned },
                    { headers: { Authorization: req.headers.authorization } }
                );
            } catch (pointsErr) {
                console.warn(`[Booking] No se pudieron acreditar puntos al usuario ${userId}:`, pointsErr.message);
            }
        }
        
        res.status(201).json({
            message: "Boleto emitido con éxito.",
            ticket: savedTicket
        });

    } catch (error) {
        res.status(500).json({ message: 'Fallo crítico al procesar la reserva', error: error.message });
    }
};

const getMyTickets = async (req, res) => {
    try {
        // Solo buscamos los boletos que le pertenecen al ID del usuario actual
        const tickets = await Ticket.find({ userId: req.user.id });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error al recuperar el historial', error: error.message });
    }
};

// 👑 NUEVO: Controlador para que los Admins saquen toda la base de datos de boletos
const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({});
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error al recuperar boletos', error: error.message });
    }
};

// Controlador para obtener los asientos ocupados de una función específica
const getMovieTickets = async (req, res) => {
    try {
        const { movieId, showtime, room } = req.params;
        const tickets = await Ticket.find({ movieId, showtime, room }, 'seatNumber');
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error al recuperar asientos ocupados', error: error.message });
    }
};

module.exports = { createTicket, getMyTickets, getAllTickets, getMovieTickets };

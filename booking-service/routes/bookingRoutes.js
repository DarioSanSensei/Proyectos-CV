const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, getAllTickets, getMovieTickets } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ambas rutas son exclusivas para usuarios logueados
router.post('/', protect, createTicket);
router.get('/mis-boletos', protect, getMyTickets);

// Obtener asientos ocupados de una función específica (Película + Horario + Sala)
router.get('/movie/:movieId/showtime/:showtime/room/:room', getMovieTickets);

// 👑 NUEVA: Ruta protegida solo para los altos mandos
router.get('/all', protect, authorize('ADMIN', 'MANAGER'), getAllTickets);

module.exports = router;

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectMongoDB = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io); // Para acceder a socket.io desde los controladores

app.use(express.json());
app.use(cors());

connectMongoDB();

// Enlazamos las rutas bajo /api/bookings
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 3003;

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Booking Service Running on port ' + PORT });
});

io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado a Sockets (Booking): ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`[Booking Service] operando en el puerto ${PORT} con Sockets 🚀`);
});

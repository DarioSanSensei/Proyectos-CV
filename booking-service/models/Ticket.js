const mongoose = require('mongoose');

const concessionOrderSchema = new mongoose.Schema({
    itemId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, default: 1 }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
    // Guardamos el ID del usuario como String (viene de Postgres a través del JWT)
    userId: {
        type: String, 
        required: [true, 'El ID del usuario es obligatorio']
    },
    // Guardamos el ID de la película (viene del Catálogo de Mongo)
    movieId: {
        type: String,
        required: [true, 'El ID de la película es obligatorio']
    },
    showtime: {
        type: String,
        required: [true, 'El horario de la función es obligatorio']
    },
    room: {
        type: String,
        required: [true, 'La sala es obligatoria']
    },
    seatNumber: {
        type: String,
        required: [true, 'El asiento es obligatorio (ej. A-14)']
    },
    price: {
        type: Number,
        required: true,
        default: 75.00  // Precio base del boleto
    },
    concessions: {
        type: [concessionOrderSchema],
        default: []
    },
    totalPrice: {
        type: Number,
        default: 0  // boleto + dulcería
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['CONFIRMADO', 'CANCELADO'],
        default: 'CONFIRMADO'
    }
}, { timestamps: true, versionKey: false });

// Índice compuesto único para evitar doble reserva del mismo asiento en la misma función
ticketSchema.index(
    { movieId: 1, showtime: 1, room: 1, seatNumber: 1 },
    { 
        unique: true, 
        partialFilterExpression: { status: 'CONFIRMADO' } 
    }
);

module.exports = mongoose.model('Ticket', ticketSchema);

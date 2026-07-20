const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la sala es obligatorio (Ej. Sala 1, Sala VIP)'],
        unique: true
    },
    rows: {
        type: Number,
        required: [true, 'El número de filas es obligatorio (Ej. 5)'],
        min: 1
    },
    cols: {
        type: Number,
        required: [true, 'El número de columnas es obligatorio (Ej. 10)'],
        min: 1
    },
    basePrice: {
        type: Number,
        required: [true, 'El precio base es obligatorio'],
        default: 75.00
    },
    disabledSeats: {
        type: [String],
        default: []
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Room', roomSchema);

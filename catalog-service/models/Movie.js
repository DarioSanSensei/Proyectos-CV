// catalog-service/models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título es obligatorio.'],
        trim: true
    },
    originalTitle: { type: String, default: '' },
    director: {
        type: String,
        required: [true, 'El director es obligatorio.'],
        trim: true
    },
    cast: { type: [String], default: [] },
    year: {
        type: Number,
        required: true,
        min: 1888,
        max: new Date().getFullYear() + 5
    },
    duration: { type: Number, default: 120 }, // en minutos
    description: {
        type: String,
        required: true,
        minlength: 10
    },
    posterUrl: {
        type: String,
        required: [true, 'El póster es obligatorio.']
    },
    backdropUrl: { type: String, default: '' },
    trailerUrl: { type: String, default: '' },
    genres: {
        type: [String],
        validate: {
            validator: function(v) { return v && v.length > 0; },
            message: 'La película debe tener al menos un género.'
        }
    },
    rating: {
        type: String,
        enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR', 'A', 'B', 'B15', 'C', 'D'],
        default: 'NR'
    },
    imdbRating: { type: Number, min: 0, max: 10, default: 0 },
    language: { type: String, default: 'Español' },
    country: { type: String, default: 'EUA' },
    // 'COLECCION' = solo en archivo, 'CARTELERA' = activa en el cine
    status: {
        type: String,
        enum: ['COLECCION', 'CARTELERA'],
        default: 'CARTELERA'
    },
    isHighlight: { type: Boolean, default: false }, // película destacada en el hero
    format: {
        type: [String],
        default: ['2D']   // ['2D', '3D', 'IMAX', '4DX', 'ScreenX']
    },
    showtimes: [{
        time: { type: String, required: true },
        room: { type: String, required: true },
        date: { type: String, default: '' },   // 'HOY', 'MAÑANA', o fecha 'YYYY-MM-DD'
        format: { type: String, default: '2D' },
        language: { type: String, default: 'Español' }
    }]
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Movie', movieSchema);

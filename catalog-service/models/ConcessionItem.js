const mongoose = require('mongoose');

const concessionItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: 0
    },
    category: {
        type: String,
        enum: ['COMBO', 'SNACK', 'BEBIDA', 'ESPECIAL'],
        required: true
    },
    emoji: {
        type: String,
        default: '🍿'
    },
    available: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('ConcessionItem', concessionItemSchema);

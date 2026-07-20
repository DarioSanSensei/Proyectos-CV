const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ConcessionItem = require('./models/ConcessionItem');

dotenv.config();

const concessions = [
    // COMBOS
    { name: 'Combo Clásico', description: 'Palomitas medianas + refresco grande', price: 129.00, category: 'COMBO', emoji: '🍿' },
    { name: 'Combo Familiar', description: 'Palomitas jumbo + 2 refrescos + nachos', price: 219.00, category: 'COMBO', emoji: '👨‍👩‍👧' },
    { name: 'Combo VIP', description: 'Palomitas mantequilla XL + refresco + hot dog', price: 189.00, category: 'COMBO', emoji: '⭐' },
    { name: 'Combo Pareja', description: 'Palomitas grandes + 2 bebidas de tu elección', price: 169.00, category: 'COMBO', emoji: '💑' },
    // SNACKS
    { name: 'Palomitas Chicas', description: 'Palomitas de mantequilla (porción chica)', price: 55.00, category: 'SNACK', emoji: '🍿' },
    { name: 'Palomitas Medianas', description: 'Palomitas de mantequilla (porción mediana)', price: 75.00, category: 'SNACK', emoji: '🍿' },
    { name: 'Palomitas Jumbo', description: 'Palomitas de mantequilla (porción jumbo)', price: 99.00, category: 'SNACK', emoji: '🍿' },
    { name: 'Nachos con Queso', description: 'Totopos con salsa de queso caliente', price: 69.00, category: 'SNACK', emoji: '🧀' },
    { name: 'Hot Dog', description: 'Salchicha en pan con toppings a elección', price: 79.00, category: 'SNACK', emoji: '🌭' },
    { name: 'Churros', description: '3 churros azucarados con cajeta', price: 49.00, category: 'SNACK', emoji: '🥨' },
    // BEBIDAS
    { name: 'Refresco Grande', description: 'Coca-Cola, Sprite o Fanta (vaso grande)', price: 55.00, category: 'BEBIDA', emoji: '🥤' },
    { name: 'Agua Embotellada', description: 'Agua natural 600ml', price: 35.00, category: 'BEBIDA', emoji: '💧' },
    { name: 'Café Americano', description: 'Café negro caliente', price: 45.00, category: 'BEBIDA', emoji: '☕' },
    // ESPECIAL
    { name: 'Helado Sundae', description: 'Helado de vainilla con fudge de chocolate', price: 65.00, category: 'ESPECIAL', emoji: '🍨' },
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Conectado a MongoDB. Sembrando Dulcería...');
        await ConcessionItem.deleteMany({});
        console.log('Productos anteriores eliminados.');
        await ConcessionItem.insertMany(concessions);
        console.log(`✅ ${concessions.length} productos de dulcería creados exitosamente.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error al sembrar dulcería:', err);
        process.exit(1);
    });

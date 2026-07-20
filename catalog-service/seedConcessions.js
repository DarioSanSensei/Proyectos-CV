const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ConcessionItem = require('./models/ConcessionItem');

// Cargar variables de entorno
dotenv.config();

// Datos de semilla de la dulcería
const concessionsSeed = [
    {
        name: 'Combo Pareja Mágica',
        description: '2 Refrescos Grandes + 1 Palomitas Jumbo (Mantequilla) + 1 Nachos',
        price: 245.00,
        category: 'COMBO',
        emoji: '👫',
        available: true
    },
    {
        name: 'Combo Infantil',
        description: '1 Refresco Chico + 1 Palomitas Chicas + Juguete Sorpresa',
        price: 135.00,
        category: 'COMBO',
        emoji: '🧸',
        available: true
    },
    {
        name: 'Palomitas Jumbo (Mantequilla)',
        description: 'Nuestras clásicas palomitas bañadas en mantequilla.',
        price: 95.00,
        category: 'SNACK',
        emoji: '🍿',
        available: true
    },
    {
        name: 'Palomitas Grandes (Caramelo)',
        description: 'Palomitas crujientes bañadas en caramelo.',
        price: 105.00,
        category: 'SNACK',
        emoji: '🍿',
        available: true
    },
    {
        name: 'Nachos con Queso Extremo',
        description: 'Crujientes totopos con doble ración de nuestro queso jalapeño.',
        price: 85.00,
        category: 'SNACK',
        emoji: '🧀',
        available: true
    },
    {
        name: 'Refresco Grande',
        description: 'Cola, Cola Light, Limón o Naranja.',
        price: 65.00,
        category: 'BEBIDA',
        emoji: '🥤',
        available: true
    },
    {
        name: 'ICEE Extra Grande',
        description: 'Cereza, Frambuesa Azul o Combinado.',
        price: 85.00,
        category: 'BEBIDA',
        emoji: '❄️',
        available: true
    },
    {
        name: 'M&Ms Chocolate',
        description: 'Bolsa tamaño cine.',
        price: 55.00,
        category: 'ESPECIAL',
        emoji: '🍫',
        available: true
    }
];

const seedConcessions = async () => {
    try {
        console.log('🔗 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conexión establecida.');

        console.log('🗑️ Limpiando catálogo de dulcería...');
        await ConcessionItem.deleteMany({});
        
        console.log('🌱 Sembrando dulcería...');
        const inserted = await ConcessionItem.insertMany(concessionsSeed);
        console.log(`🍿 ¡Éxito! Se añadieron ${inserted.length} productos a la dulcería.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error sembrando la dulcería:', error);
        process.exit(1);
    }
};

seedConcessions();

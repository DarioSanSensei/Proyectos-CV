const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🎫 Conexión a MongoDB (Booking Service) establecida con éxito.');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB Booking:', error);
        process.exit(1);
    }
};

module.exports = connectMongoDB;

const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try {
        console.log("⏳ Intentando conectar a la nube de Atlas...");
        
        // Intentamos la conexión usando la variable de tu .env
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('🍃 Conexión REAL a MongoDB Atlas establecida con éxito.');
    } catch (error) {
        console.error('❌ ERROR FATAL DE CONEXIÓN A ATLAS:');
        console.error(error.message); // Esto nos dará la pista exacta
        process.exit(1); // Apagamos el servidor para no trabajar a ciegas
    }
};

module.exports = connectMongoDB;

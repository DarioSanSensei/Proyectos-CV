const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Conectado a MongoDB. Actualizando trailers...');
    
    // Asignar un trailer por defecto a todas las películas que no tengan uno
    const defaultTrailer = 'https://www.youtube.com/watch?v=zSWdZVtXT7E';
    const result = await Movie.updateMany(
      { $or: [{ trailerUrl: { $exists: false } }, { trailerUrl: '' }] },
      { $set: { trailerUrl: defaultTrailer } }
    );
    
    console.log(`Películas actualizadas: ${result.modifiedCount}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

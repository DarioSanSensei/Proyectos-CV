const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

const EMBEDDABLE_TRAILERS = [
  'https://www.youtube.com/watch?v=cqGjhVJWtEg', // Spider-Man
  'https://www.youtube.com/watch?v=U2Qp5pL3ovA', // Dune 2
  'https://www.youtube.com/watch?v=FV3bqvOHRQo', // Aquaman
  'https://www.youtube.com/watch?v=otNh9bTjXWg', // Wonka
  'https://www.youtube.com/watch?v=shW9i6k8cB0', // Spider-Man NWH
  'https://www.youtube.com/watch?v=d9MyW72ELq0'  // Avatar
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Conectado a MongoDB. Actualizando trailers con IDs incrustables...');
    
    const movies = await Movie.find({});
    let count = 0;
    
    for (const m of movies) {
      // Asignar un tráiler incrustable aleatorio
      const randomTrailer = EMBEDDABLE_TRAILERS[Math.floor(Math.random() * EMBEDDABLE_TRAILERS.length)];
      m.trailerUrl = randomTrailer;
      await m.save();
      count++;
    }
    
    console.log(`Películas actualizadas con trailers válidos: ${count}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

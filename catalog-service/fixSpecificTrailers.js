const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

const trailerMap = {
  'Misión: Imposible': 'https://www.youtube.com/watch?v=2m1drlOZSDw',
  'Spider-Man: A través del Spider-Verso': 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
  'Dune: Parte Dos': 'https://www.youtube.com/watch?v=U2Qp5pL3ovA',
  'Oppenheimer': 'https://www.youtube.com/watch?v=uYPbbksJxIg',
  'Godzilla x Kong': 'https://www.youtube.com/watch?v=lV1OOlGwExM',
  'Deadpool & Wolverine': 'https://www.youtube.com/watch?v=73_1biulkYk',
  'Inside Out 2': 'https://www.youtube.com/watch?v=LEjhY15eCx0',
  'Joker': 'https://www.youtube.com/watch?v=fiOGjfOPEQU',
  'Wicked': 'https://www.youtube.com/watch?v=6COmYeLsz4c',
  'Moana 2': 'https://www.youtube.com/watch?v=hDZ7y8RP5q4',
  'Gladiator II': 'https://www.youtube.com/watch?v=4rgYUipGJNo',
  'Nosferatu': 'https://www.youtube.com/watch?v=nulvFqOLLxE',
  'Mufasa': 'https://www.youtube.com/watch?v=o17MF9vnabg',
  'Sonic 3': 'https://www.youtube.com/watch?v=qSu6i2iFMO0'
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Actualizando TODAS las películas destacadas con su tráiler oficial...');
    let count = 0;
    
    for (const [title, url] of Object.entries(trailerMap)) {
      const result = await Movie.updateOne(
        { title: { $regex: new RegExp(title, 'i') } },
        { $set: { trailerUrl: url } }
      );
      if (result.modifiedCount > 0) count++;
    }
    
    console.log(`Completado. ${count} películas actualizadas.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

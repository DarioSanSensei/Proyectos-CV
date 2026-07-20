const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

// Salas disponibles
const ROOMS = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala VIP', 'MacroXE'];
const TIMES = ['13:00','14:30','16:00','17:15','18:30','19:00','20:00','21:15','22:00','23:30'];
const FORMATS_BY_ROOM = {
  'Sala 1': '2D', 'Sala 2': '2D', 'Sala 3': '2D', 'Sala VIP': '2D', 'MacroXE': 'IMAX'
};
const DATES = ['HOY', 'HOY', 'MAÑANA', 'MAÑANA', '+2 días', '+3 días'];

// Helper: generar horarios aleatorios para una película en cartelera
function generateShowtimes(numShowtimes = 4) {
  const slots = [];
  const usedSlots = new Set();
  for (let i = 0; i < numShowtimes; i++) {
    let attempts = 0;
    let time, room, key;
    do {
      time = TIMES[Math.floor(Math.random() * TIMES.length)];
      room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
      key = `${time}-${room}`;
      attempts++;
    } while (usedSlots.has(key) && attempts < 20);
    if (!usedSlots.has(key)) {
      usedSlots.add(key);
      const date = DATES[Math.floor(Math.random() * DATES.length)];
      slots.push({ time, room, date, format: FORMATS_BY_ROOM[room], language: 'Español' });
    }
  }
  return slots;
}

// ========================
// PELÍCULAS EN CARTELERA (30 películas actuales/populares)
// ========================
const cartelera = [
  {
    title: 'Misión: Imposible — La Sentencia Final Parte I',
    originalTitle: 'Mission: Impossible — Dead Reckoning Part One',
    director: 'Christopher McQuarrie',
    cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg'],
    year: 2023, duration: 163,
    description: 'Ethan Hunt y su equipo del FMI se embarcan en su misión más peligrosa: rastrear una nueva arma perturbadora que amenaza a toda la humanidad antes de que caiga en las manos equivocadas.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/sHl9JWkjXlpvFSb5RIbTUiPVTr3.jpg',
    genres: ['Acción', 'Aventura', 'Thriller'], rating: 'PG-13', imdbRating: 7.8,
    format: ['2D', 'IMAX'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'Spider-Man: A través del Spider-Verso',
    originalTitle: 'Spider-Man: Across the Spider-Verse',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    year: 2023, duration: 140,
    description: 'Miles Morales se embarca en un viaje a través del Multiverso para reunirse con Gwen Stacy y un nuevo equipo de Spider-People.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    genres: ['Animación', 'Acción', 'Aventura'], rating: 'PG', imdbRating: 8.6,
    format: ['2D', '3D'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Wonka',
    originalTitle: 'Wonka',
    director: 'Paul King',
    cast: ['Timothée Chalamet', 'Olivia Colman', 'Hugh Grant'],
    year: 2023, duration: 116,
    description: 'Con grandes sueños y muy poco dinero, un joven e ingenioso Willy Wonka descubre que las cosas complicadas a veces requieren un poco de magia.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qhb1qOilapqTPaskRitOwDVmetq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    genres: ['Comedia', 'Familia', 'Fantasía'], rating: 'PG', imdbRating: 7.0,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Dune: Parte Dos',
    originalTitle: 'Dune: Part Two',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Josh Brolin'],
    year: 2024, duration: 166,
    description: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia. Enfrentando una elección entre el amor de su vida y el destino del universo conocido.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    genres: ['Ciencia Ficción', 'Aventura', 'Drama'], rating: 'PG-13', imdbRating: 8.5,
    format: ['2D', 'IMAX'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'Aquaman y el Reino Perdido',
    originalTitle: 'Aquaman and the Lost Kingdom',
    director: 'James Wan',
    cast: ['Jason Momoa', 'Patrick Wilson', 'Amber Heard'],
    year: 2023, duration: 124,
    description: 'Arthur Curry, Aquaman, debe forjar una alianza incómoda con su hermano encarcelado Black Manta para proteger Atlantis.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9Va6vEHGCpNRJwNHikHuQawHCid.jpg',
    genres: ['Acción', 'Aventura', 'Fantasía'], rating: 'PG-13', imdbRating: 5.4,
    format: ['2D', '3D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(3)
  },
  {
    title: 'Los Juegos del Hambre: Balada de Pájaros Cantores y Serpientes',
    originalTitle: 'The Hunger Games: The Ballad of Songbirds & Snakes',
    director: 'Francis Lawrence',
    cast: ['Tom Blyth', 'Rachel Zegler', 'Viola Davis'],
    year: 2023, duration: 157,
    description: 'La historia de los primeros años de Coriolanus Snow, antes de convertirse en el tiránico presidente de Panem.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mBaXZ95R2OxueZhvQbcEWy2DqyO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rN5YZqvE4J5kQoWONk3CUYXJR15.jpg',
    genres: ['Acción', 'Aventura', 'Drama'], rating: 'PG-13', imdbRating: 7.2,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.', 'Florence Pugh'],
    year: 2023, duration: 180,
    description: 'La historia del científico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica durante el Proyecto Manhattan.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    genres: ['Drama', 'Historia', 'Thriller'], rating: 'R', imdbRating: 8.9,
    format: ['2D', 'IMAX'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Godzilla x Kong: El Nuevo Imperio',
    originalTitle: 'Godzilla x Kong: The New Empire',
    director: 'Adam Wingard',
    cast: ['Rebecca Hall', 'Brian Tyree Henry', 'Dan Stevens'],
    year: 2024, duration: 115,
    description: 'Godzilla y Kong deben unir fuerzas contra una colosal amenaza desconocida escondida en nuestro mundo.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/fY3lD0jM5AoHJMunjGWqJ0hRteI.jpg',
    genres: ['Acción', 'Ciencia Ficción', 'Aventura'], rating: 'PG-13', imdbRating: 6.0,
    format: ['2D', '3D', 'IMAX'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'Deadpool & Wolverine',
    originalTitle: 'Deadpool & Wolverine',
    director: 'Shawn Levy',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin'],
    year: 2024, duration: 128,
    description: 'Deadpool recluta a un reacio Wolverine para salvar su universo de la destrucción.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    genres: ['Acción', 'Comedia', 'Superhéroes'], rating: 'R', imdbRating: 7.8,
    format: ['2D'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'Twisters',
    originalTitle: 'Twisters',
    director: 'Lee Isaac Chung',
    cast: ['Daisy Edgar-Jones', 'Glen Powell', 'Anthony Ramos'],
    year: 2024, duration: 122,
    description: 'Kate Cooper se enfrenta a sus demonios al ser atraída de regreso a las planicies de Oklahoma con un nuevo equipo.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/pjnD08FlMAIXsfOLKQbovhFbixq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rnjDDGuQ9tXrMnOzW4KLYMU7Wdl.jpg',
    genres: ['Acción', 'Aventura', 'Drama'], rating: 'PG-13', imdbRating: 7.2,
    format: ['2D', 'IMAX'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Inside Out 2',
    originalTitle: 'Inside Out 2',
    director: 'Kelsey Mann',
    cast: ['Amy Poehler', 'Phyllis Smith', 'Lewis Black', 'Maya Hawke'],
    year: 2024, duration: 100,
    description: 'Riley entra a la adolescencia y el cuartel general de las emociones recibe una imprevista expansión para dar cabida a emociones completamente nuevas.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xg27NrXi7VXCGUr7MlcbMauChMb.jpg',
    genres: ['Animación', 'Familia', 'Comedia'], rating: 'PG', imdbRating: 7.8,
    format: ['2D', '3D'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'Alien: Romulus',
    originalTitle: 'Alien: Romulus',
    director: 'Fede Álvarez',
    cast: ['Cailee Spaeny', 'David Jonsson', 'Archie Renaux'],
    year: 2024, duration: 119,
    description: 'Un grupo de colonizadores espaciales se encuentran cara a cara con la forma de vida más aterradora del universo.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg',
    genres: ['Terror', 'Ciencia Ficción', 'Thriller'], rating: 'R', imdbRating: 7.3,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'A Quiet Place: Día Uno',
    originalTitle: 'A Quiet Place: Day One',
    director: 'Michael Sarnoski',
    cast: ['Lupita Nyong\'o', 'Joseph Quinn', 'Alex Wolff'],
    year: 2024, duration: 99,
    description: 'La historia de origen de cómo el mundo se hundió en el silencio en el primer día de la invasión alienígena.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/yrpPYKijwdMHyTGIOd1iK1h0Wo6.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/eKi9dVLX0r3OA1nFJiFHlpHsiG.jpg',
    genres: ['Terror', 'Ciencia Ficción', 'Drama'], rating: 'PG-13', imdbRating: 7.0,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(3)
  },
  {
    title: 'Furiosa: De la Saga Mad Max',
    originalTitle: 'Furiosa: A Mad Max Saga',
    director: 'George Miller',
    cast: ['Anya Taylor-Joy', 'Chris Hemsworth', 'Tom Burke'],
    year: 2024, duration: 148,
    description: 'El origen de Furiosa: cómo la joven Furiosa cayó en manos de una gran Horda de Motoristas y la lucha para encontrar su camino a casa.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/oBIQDKcqNxKckjugtmzpIIOgoc4.jpg',
    genres: ['Acción', 'Aventura'], rating: 'R', imdbRating: 7.8,
    format: ['2D', 'IMAX'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(3)
  },
  {
    title: 'El Planeta del Simio: Nuevo Reino',
    originalTitle: 'Kingdom of the Planet of the Apes',
    director: 'Wes Ball',
    cast: ['Owen Teague', 'Freya Allan', 'Kevin Durand'],
    year: 2024, duration: 145,
    description: 'Muchas generaciones en el futuro después del reinado de César, los simios son la especie dominante de la Tierra.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/fqv8v6AycXKsivp1T5yKtLbGXce.jpg',
    genres: ['Acción', 'Aventura', 'Ciencia Ficción'], rating: 'PG-13', imdbRating: 6.8,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Joker: Folie à Deux',
    originalTitle: 'Joker: Folie à Deux',
    director: 'Todd Phillips',
    cast: ['Joaquin Phoenix', 'Lady Gaga', 'Brendan Gleeson'],
    year: 2024, duration: 138,
    description: 'Arthur Fleck está institucionalizado en Arkham a la espera de su juicio por sus crímenes como el Joker.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lje6UhupyXhN64TKSIYMZMCqYE8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9Va6vEHGCpNRJwNHikHuQawHCid.jpg',
    genres: ['Drama', 'Crimen', 'Musical'], rating: 'R', imdbRating: 5.5,
    format: ['2D'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Venom: El Último Baile',
    originalTitle: 'Venom: The Last Dance',
    director: 'Kelly Marcel',
    cast: ['Tom Hardy', 'Chiwetel Ejiofor', 'Juno Temple'],
    year: 2024, duration: 109,
    description: 'Eddie y Venom huyen mientras son perseguidos por sus propios mundos, tomando decisiones que los llevarán a su fin.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/3V4kLQg0kSqe6yBgo7butfx7vck.jpg',
    genres: ['Acción', 'Ciencia Ficción', 'Superhéroes'], rating: 'PG-13', imdbRating: 6.0,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(3)
  },
  {
    title: 'Transformers One',
    originalTitle: 'Transformers One',
    director: 'Josh Cooley',
    cast: ['Chris Hemsworth', 'Brian Tyree Henry', 'Scarlett Johansson'],
    year: 2024, duration: 104,
    description: 'La historia de origen de Optimus Prime y Megatron, antes de ser archienemigos.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qbkn2oXComkMeNnKnj8m5XivioE.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/q54qEgagGOYCq5D1903eBVMNkbo.jpg',
    genres: ['Animación', 'Acción', 'Aventura'], rating: 'PG', imdbRating: 7.2,
    format: ['2D', '3D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Terrifier 3',
    originalTitle: 'Terrifier 3',
    director: 'Damien Leone',
    cast: ['Lauren LaVera', 'David Howard Thornton', 'Antonella Rose'],
    year: 2024, duration: 125,
    description: 'Art the Clown regresa en Nochebuena para llevar el terror a Millennial, Nueva York.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/63xYQj1BwRFielxsBDXvHIJyXVm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/mMh0kAhGXhBf2JuFGi7EtGCdMCi.jpg',
    genres: ['Terror', 'Slasher'], rating: 'NC-17', imdbRating: 6.8,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(3)
  },
  {
    title: 'Megalopolis',
    originalTitle: 'Megalopolis',
    director: 'Francis Ford Coppola',
    cast: ['Adam Driver', 'Giancarlo Esposito', 'Nathalie Emmanuel', 'Aubrey Plaza'],
    year: 2024, duration: 138,
    description: 'Una épica fábula romana situada en una ciudad estado americana imaginaria. Un genio artístico quiere construir una utopía futurista.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/rOfKujJxYeN9G6JEPdbZhcnkdPT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/aDR3Ah5PK6wguTEJjPLMGBJGjOq.jpg',
    genres: ['Ciencia Ficción', 'Drama'], rating: 'R', imdbRating: 5.0,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(2)
  },
  {
    title: 'Wicked',
    originalTitle: 'Wicked',
    director: 'Jon M. Chu',
    cast: ['Cynthia Erivo', 'Ariana Grande', 'Jeff Goldblum'],
    year: 2024, duration: 160,
    description: 'La historia de la amistad entre la joven Elphaba y la popular Glinda en el Land of Oz.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/c5Tqxeo1UpBvnAc3csUm7j3hlQl.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/bHtISRcpHCNnPyOiEBEHXjMoiWj.jpg',
    genres: ['Musical', 'Fantasía', 'Comedia'], rating: 'PG', imdbRating: 7.9,
    format: ['2D', 'IMAX'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'Moana 2',
    originalTitle: 'Moana 2',
    director: 'David Derrick Jr.',
    cast: ['Auli\'i Cravalho', 'Dwayne Johnson', 'Alan Tudyk'],
    year: 2024, duration: 100,
    description: 'Moana emprende una nueva y épica aventura junto a un diverso equipo de marineros polinesios.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/yh64qeNR7ksU4YoudYBF8MKQZSQ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/5GnhFRQJ1iYKJzYp1JCJRdbCkZ8.jpg',
    genres: ['Animación', 'Aventura', 'Familia'], rating: 'PG', imdbRating: 6.9,
    format: ['2D', '3D'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'Gladiator II',
    originalTitle: 'Gladiator II',
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Denzel Washington', 'Pedro Pascal', 'Connie Nielsen'],
    year: 2024, duration: 148,
    description: 'Décadas después de la muerte de Maximus, Lucio es empujado a las arenas del Coliseo para salvar a Roma.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg',
    genres: ['Acción', 'Drama', 'Historia'], rating: 'R', imdbRating: 7.1,
    format: ['2D', 'IMAX'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'Nosferatu',
    originalTitle: 'Nosferatu',
    director: 'Robert Eggers',
    cast: ['Bill Skarsgård', 'Lily-Rose Depp', 'Nicholas Hoult', 'Willem Dafoe'],
    year: 2024, duration: 132,
    description: 'El remake del clásico de 1922 que cuenta la historia del Conde Orlok, un vampiro que obsesiona a una joven recién casada.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5qGIxdEO841C0tdY8vKpShdcppi.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/dhpKvTqIBlc0DF3KVBLpq5xMBgT.jpg',
    genres: ['Terror', 'Gótico', 'Drama'], rating: 'R', imdbRating: 7.7,
    format: ['2D'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(4)
  },
  {
    title: 'Mufasa: El Rey León',
    originalTitle: 'Mufasa: The Lion King',
    director: 'Barry Jenkins',
    cast: ['Aaron Pierre', 'Kelvin Harrison Jr.', 'Seth Rogen'],
    year: 2024, duration: 118,
    description: 'La historia de origen de Mufasa, el icónico rey de las Tierras del Orgullo.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lurEK87kukWNaHd0zYnsi3yzJrs.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/fqv8v6AycXKsivp1T5yKtLbGXce.jpg',
    genres: ['Animación', 'Aventura', 'Familia', 'Drama'], rating: 'PG', imdbRating: 6.9,
    format: ['2D', '3D', 'IMAX'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
  {
    title: 'The Substance',
    originalTitle: 'The Substance',
    director: 'Coralie Fargeat',
    cast: ['Demi Moore', 'Margaret Qualley', 'Dennis Quaid'],
    year: 2024, duration: 140,
    description: 'Una estrella de Hollywood usa una sustancia misteriosa que crea una versión más joven y perfecta de sí misma.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lqoMzCcZYEFK729d6qzt349fB4o.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/ebFo4Htlq9UXJyqbObp2UHEGwYO.jpg',
    genres: ['Terror', 'Ciencia Ficción', 'Drama'], rating: 'R', imdbRating: 7.4,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(3)
  },
  {
    title: 'Conclave',
    originalTitle: 'Conclave',
    director: 'Edward Berger',
    cast: ['Ralph Fiennes', 'Stanley Tucci', 'John Lithgow'],
    year: 2024, duration: 120,
    description: 'Tras la inesperada muerte del Papa, el Cardenal Lawrence supervisa uno de los rituales más secretos y complejos del mundo.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/m5ZXmExrFkZVxiqISwB4F3GoVvq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/eTVDFmNDtDjFtRPCYPBFGv6BLzY.jpg',
    genres: ['Thriller', 'Drama', 'Misterio'], rating: 'PG', imdbRating: 7.5,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(3)
  },
  {
    title: 'Kraven el Cazador',
    originalTitle: 'Kraven the Hunter',
    director: 'J.C. Chandor',
    cast: ['Aaron Taylor-Johnson', 'Russell Crowe', 'Ariana DeBose'],
    year: 2024, duration: 127,
    description: 'El cazador más peligroso del mundo debe enfrentar su propia oscuridad.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/i47IUSsN126K11JUzqQIOi1Mg1M.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/2Nti3gYAX513wvurbsC3QV7HmTz.jpg',
    genres: ['Acción', 'Aventura', 'Superhéroes'], rating: 'R', imdbRating: 4.8,
    format: ['2D'], status: 'CARTELERA', isHighlight: false,
    showtimes: generateShowtimes(3)
  },
  {
    title: 'Sonic 3: La Película',
    originalTitle: 'Sonic the Hedgehog 3',
    director: 'Jeff Fowler',
    cast: ['Ben Schwartz', 'Jim Carrey', 'Idris Elba', 'Keanu Reeves'],
    year: 2024, duration: 110,
    description: 'Sonic, Knuckles y Tails se reúnen contra un nuevo y poderoso adversario: Shadow the Hedgehog.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oO7G9FpFaXr4MOp0g7fmJI6MWRQ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/wn1nFXBqbIiqhfOHWRCDYoarGKI.jpg',
    genres: ['Acción', 'Aventura', 'Familia', 'Comedia'], rating: 'PG', imdbRating: 7.5,
    format: ['2D', '3D'], status: 'CARTELERA', isHighlight: true,
    showtimes: generateShowtimes(5)
  },
];

// ========================
// COLECCIÓN (70 clásicos y películas de culto)
// ========================
const coleccion = [
  { title: 'El Caballero Oscuro', director: 'Christopher Nolan', cast: ['Christian Bale','Heath Ledger','Aaron Eckhart'], year: 2008, duration: 152, description: 'Batman se enfrenta al Joker, un criminal que quiere hundir Gotham en el caos absoluto.', posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', genres: ['Acción','Crimen','Drama'], rating: 'PG-13', imdbRating: 9.0, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Inception', director: 'Christopher Nolan', cast: ['Leonardo DiCaprio','Joseph Gordon-Levitt','Elliot Page'], year: 2010, duration: 148, description: 'Un ladrón que roba secretos corporativos a través de tecnología de compartición de sueños recibe la tarea inversa.', posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', genres: ['Acción','Ciencia Ficción','Thriller'], rating: 'PG-13', imdbRating: 8.8, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'El Padrino', director: 'Francis Ford Coppola', cast: ['Marlon Brando','Al Pacino','James Caan'], year: 1972, duration: 175, description: 'El patriarca de una dinastía del crimen organizado transfiere el control de su empire a su reacio hijo.', posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLeBHka4yL7g.jpg', genres: ['Crimen','Drama'], rating: 'R', imdbRating: 9.2, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Pulp Fiction', director: 'Quentin Tarantino', cast: ['John Travolta','Uma Thurman','Samuel L. Jackson'], year: 1994, duration: 154, description: 'Las vidas de dos sicarios, un boxeador y la esposa de un gánster se entrelazan en cuatro historias violentas.', posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', genres: ['Crimen','Drama','Thriller'], rating: 'R', imdbRating: 8.9, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'The Shawshank Redemption', director: 'Frank Darabont', cast: ['Tim Robbins','Morgan Freeman'], year: 1994, duration: 142, description: 'Dos hombres en prisión forjan una amistad a lo largo de varios años en la prisión estatal de Shawshank.', posterUrl: 'https://image.tmdb.org/t/p/w500/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg', genres: ['Drama'], rating: 'R', imdbRating: 9.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Interstellar', director: 'Christopher Nolan', cast: ['Matthew McConaughey','Anne Hathaway','Jessica Chastain'], year: 2014, duration: 169, description: 'Un equipo de exploradores viaja a través de un agujero de gusano en búsqueda de un nuevo hogar para la humanidad.', posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genres: ['Ciencia Ficción','Drama','Aventura'], rating: 'PG-13', imdbRating: 8.7, format: ['2D','IMAX'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Matrix', director: 'Lana Wachowski', cast: ['Keanu Reeves','Laurence Fishburne','Carrie-Anne Moss'], year: 1999, duration: 136, description: 'Un hacker descubre que el mundo que conoce es una simulación controlada por máquinas inteligentes.', posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', genres: ['Acción','Ciencia Ficción'], rating: 'R', imdbRating: 8.7, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Parasite', director: 'Bong Joon Ho', cast: ['Song Kang-ho','Lee Sun-kyun','Cho Yeo-jeong'], year: 2019, duration: 132, description: 'La codicia y la discriminación de clase amenazan la relación simbiótica entre una familia rica y una pobre.', posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', genres: ['Drama','Thriller','Comedia'], rating: 'R', imdbRating: 8.5, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Gladiador', director: 'Ridley Scott', cast: ['Russell Crowe','Joaquin Phoenix','Connie Nielsen'], year: 2000, duration: 155, description: 'Un general romano busca venganza contra el corrupto emperador que envió a su familia a la muerte.', posterUrl: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', genres: ['Acción','Aventura','Drama'], rating: 'R', imdbRating: 8.5, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Joker', director: 'Todd Phillips', cast: ['Joaquin Phoenix','Robert De Niro','Zazie Beetz'], year: 2019, duration: 122, description: 'Arthur Fleck, un comediante fallido, se va convirtiendo lentamente en el Joker.', posterUrl: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', genres: ['Crimen','Drama','Thriller'], rating: 'R', imdbRating: 8.4, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Avengers: Endgame', director: 'Anthony Russo', cast: ['Robert Downey Jr.','Chris Evans','Mark Ruffalo'], year: 2019, duration: 181, description: 'Los Vengadores sobrevivientes deben reunirse para deshacer las acciones de Thanos y restaurar el universo.', posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', genres: ['Acción','Aventura','Ciencia Ficción'], rating: 'PG-13', imdbRating: 8.4, format: ['2D','3D','IMAX'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'El Señor de los Anillos: La Comunidad del Anillo', director: 'Peter Jackson', cast: ['Elijah Wood','Ian McKellen','Viggo Mortensen'], year: 2001, duration: 178, description: 'Un hobbit hereda un anillo poderoso y debe emprender una peligrosa misión para destruirlo.', posterUrl: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', genres: ['Aventura','Fantasía','Drama'], rating: 'PG-13', imdbRating: 8.9, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Titanic', director: 'James Cameron', cast: ['Leonardo DiCaprio','Kate Winslet','Billy Zane'], year: 1997, duration: 195, description: 'Un joven artista y una joven aristócrata se enamoran a bordo del Titanic en su viaje inaugural.', posterUrl: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', genres: ['Romance','Drama'], rating: 'PG-13', imdbRating: 7.9, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Forrest Gump', director: 'Robert Zemeckis', cast: ['Tom Hanks','Robin Wright','Gary Sinise'], year: 1994, duration: 142, description: 'Las presidencias, los conflictos y los movimientos culturales que fueron testigos de la vida extraordinaria de Forrest Gump.', posterUrl: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg', genres: ['Drama','Romance'], rating: 'PG-13', imdbRating: 8.8, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'El Rey León', director: 'Roger Allers', cast: ['Matthew Broderick','Jeremy Irons','James Earl Jones'], year: 1994, duration: 88, description: 'Un cachorro de león exiliado de su reino aprende lo que significa ser un verdadero rey.', posterUrl: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg', genres: ['Animación','Aventura','Drama','Familia'], rating: 'G', imdbRating: 8.5, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'El Viaje de Chihiro', director: 'Hayao Miyazaki', cast: ['Daveigh Chase','Suzanne Pleshette'], year: 2001, duration: 125, description: 'Una niña de 10 años se adentra en un mundo mágico gobernado por dioses, brujas y espíritus.', posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', genres: ['Animación','Aventura','Familia'], rating: 'PG', imdbRating: 8.6, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'La La Land', director: 'Damien Chazelle', cast: ['Ryan Gosling','Emma Stone'], year: 2016, duration: 128, description: 'Una aspirante a actriz y un músico de jazz se enamoran en Los Ángeles mientras persiguen sus sueños.', posterUrl: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', genres: ['Romance','Drama','Musical'], rating: 'PG-13', imdbRating: 8.0, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Mad Max: Furia en el Camino', director: 'George Miller', cast: ['Tom Hardy','Charlize Theron'], year: 2015, duration: 120, description: 'En un futuro post-apocalíptico, Max y Furiosa se unen para huir de un tirano en el desierto.', posterUrl: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', genres: ['Acción','Aventura','Ciencia Ficción'], rating: 'R', imdbRating: 8.1, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Gravity', director: 'Alfonso Cuarón', cast: ['Sandra Bullock','George Clooney'], year: 2013, duration: 91, description: 'Dos astronautas trabajan para sobrevivir después de que un accidente los deja solos en el espacio.', posterUrl: 'https://image.tmdb.org/t/p/w500/6LQFbpbDyQM7nFpgRyHO66k0zZ.jpg', genres: ['Ciencia Ficción','Thriller'], rating: 'PG-13', imdbRating: 7.7, format: ['2D','3D','IMAX'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Whiplash', director: 'Damien Chazelle', cast: ['Miles Teller','J.K. Simmons'], year: 2014, duration: 107, description: 'Un joven baterista de jazz aspirante es llevado a sus límites por su despiadado maestro.', posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', genres: ['Drama','Musical'], rating: 'R', imdbRating: 8.5, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Birdman', director: 'Alejandro González Iñárritu', cast: ['Michael Keaton','Edward Norton','Emma Stone'], year: 2014, duration: 119, description: 'Un actor conocido por su papel de superhéroe trata de regresar al mundo del teatro.', posterUrl: 'https://image.tmdb.org/t/p/w500/qAVMxSc8D1dAq5N5sLvPFf7H2DG.jpg', genres: ['Drama','Comedia'], rating: 'R', imdbRating: 7.7, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'The Revenant', director: 'Alejandro González Iñárritu', cast: ['Leonardo DiCaprio','Tom Hardy'], year: 2015, duration: 156, description: 'Un explorador en las tierras salvajes de América sobrevive a un salvaje ataque de oso y busca venganza.', posterUrl: 'https://image.tmdb.org/t/p/w500/ji3ecJphATlVgWNY0B0RVXZizdf.jpg', genres: ['Drama','Aventura','Thriller'], rating: 'R', imdbRating: 8.0, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Hereditary', director: 'Ari Aster', cast: ['Toni Collette','Milly Shapiro','Gabriel Byrne'], year: 2018, duration: 127, description: 'Una familia descubre secretos aterradores después de la muerte de su matriarca.', posterUrl: 'https://image.tmdb.org/t/p/w500/4O3wU4B1xrTsRPGnLIcRJP1vHFT.jpg', genres: ['Terror','Misterio','Drama'], rating: 'R', imdbRating: 7.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Get Out', director: 'Jordan Peele', cast: ['Daniel Kaluuya','Allison Williams'], year: 2017, duration: 104, description: 'Un hombre negro visita la familia de su novia blanca y descubre algo oscuro.', posterUrl: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', genres: ['Terror','Thriller','Misterio'], rating: 'R', imdbRating: 7.7, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Top Gun: Maverick', director: 'Joseph Kosinski', cast: ['Tom Cruise','Miles Teller','Jennifer Connelly'], year: 2022, duration: 131, description: 'Maverick regresa a entrenar a una nueva generación de pilotos Top Gun para una misión suicida.', posterUrl: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDabo8DiSGH5gkC.jpg', genres: ['Acción','Drama'], rating: 'PG-13', imdbRating: 8.3, format: ['2D','IMAX'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Everything Everywhere All at Once', director: 'Daniel Kwan', cast: ['Michelle Yeoh','Ke Huy Quan','Jamie Lee Curtis'], year: 2022, duration: 139, description: 'Una lavandera descubre que debe conectarse con versiones paralelas de sí misma para salvar el multiverso.', posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', genres: ['Acción','Ciencia Ficción','Comedia','Drama'], rating: 'R', imdbRating: 7.8, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Coco', director: 'Lee Unkrich', cast: ['Anthony Gonzalez','Gael García Bernal','Benjamin Bratt'], year: 2017, duration: 105, description: 'Un joven aspirante a músico es transportado misteriosamente a la Tierra de los Muertos en Día de Muertos.', posterUrl: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg', genres: ['Animación','Aventura','Familia','Musical'], rating: 'PG', imdbRating: 8.4, format: ['2D','3D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'La Lista de Schindler', director: 'Steven Spielberg', cast: ['Liam Neeson','Ralph Fiennes','Ben Kingsley'], year: 1993, duration: 195, description: 'En la Polonia ocupada por los nazis, un hombre de negocios arriesga todo para salvar a judíos del Holocausto.', posterUrl: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', genres: ['Drama','Historia','Bélica'], rating: 'R', imdbRating: 9.0, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'No Country for Old Men', director: 'Joel Coen', cast: ['Javier Bardem','Tommy Lee Jones','Josh Brolin'], year: 2007, duration: 122, description: 'Un cazador encuentra dinero en el desierto de Texas y es perseguido por un asesino implacable.', posterUrl: 'https://image.tmdb.org/t/p/w500/6d1msRHEkCyoKoCLDzYgCZvYJPF.jpg', genres: ['Crimen','Drama','Thriller'], rating: 'R', imdbRating: 8.2, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Moonlight', director: 'Barry Jenkins', cast: ['Mahershala Ali','Naomie Harris','Trevante Rhodes'], year: 2016, duration: 111, description: 'La historia de un joven afroamericano en tres etapas de su vida mientras busca su identidad.', posterUrl: 'https://image.tmdb.org/t/p/w500/dJHEfn4Kz2fDrD7dZvkVvXjB9KW.jpg', genres: ['Drama'], rating: 'R', imdbRating: 7.4, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Bohemian Rhapsody', director: 'Bryan Singer', cast: ['Rami Malek','Lucy Boynton','Gwilym Lee'], year: 2018, duration: 134, description: 'La historia de la banda de rock Queen y de su líder Freddie Mercury hasta el legendario concierto Live Aid.', posterUrl: 'https://image.tmdb.org/t/p/w500/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg', genres: ['Biografía','Drama','Musical'], rating: 'PG-13', imdbRating: 7.9, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Arrival', director: 'Denis Villeneuve', cast: ['Amy Adams','Jeremy Renner','Forest Whitaker'], year: 2016, duration: 116, description: 'Una lingüista es reclutada para comunicarse con alienígenas que llegan a la Tierra.', posterUrl: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg', genres: ['Ciencia Ficción','Drama','Misterio'], rating: 'PG-13', imdbRating: 7.9, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Black Panther', director: 'Ryan Coogler', cast: ['Chadwick Boseman','Michael B. Jordan','Lupita Nyong\'o'], year: 2018, duration: 134, description: 'T\'Challa regresa a Wakanda para reclamar el trono, pero su reinado es desafiado.', posterUrl: 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg', genres: ['Acción','Aventura','Ciencia Ficción','Superhéroes'], rating: 'PG-13', imdbRating: 7.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Blade Runner 2049', director: 'Denis Villeneuve', cast: ['Ryan Gosling','Harrison Ford','Ana de Armas'], year: 2017, duration: 164, description: 'Un nuevo agente de bladerunner descubre un secreto enterrado que podría hundir a la sociedad.', posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', genres: ['Ciencia Ficción','Drama','Misterio'], rating: 'R', imdbRating: 8.0, format: ['2D','IMAX'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Dunkirk', director: 'Christopher Nolan', cast: ['Fionn Whitehead','Tom Hardy','Mark Rylance'], year: 2017, duration: 106, description: 'El evacuation aliada de las playas de Dunkerque durante la Segunda Guerra Mundial.', posterUrl: 'https://image.tmdb.org/t/p/w500/ebSnODDg9lbsMIaWg2uAbjn7TO5.jpg', genres: ['Bélica','Historia','Drama'], rating: 'PG-13', imdbRating: 7.8, format: ['2D','IMAX'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Oldboy', director: 'Park Chan-wook', cast: ['Choi Min-sik','Yoo Ji-tae'], year: 2003, duration: 120, description: 'Un hombre es secuestrado y encarcelado misteriosamente durante 15 años y liberado sin explicación.', posterUrl: 'https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMktMmQ2wBiPGIF.jpg', genres: ['Acción','Misterio','Thriller'], rating: 'R', imdbRating: 8.4, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Pan\'s Labyrinth', director: 'Guillermo del Toro', cast: ['Ivana Baquero','Doug Jones','Sergi López'], year: 2006, duration: 118, description: 'En la España franquista, una niña descubre un mundo de fantasía alternativo a la crueldad de la realidad.', posterUrl: 'https://image.tmdb.org/t/p/w500/htMov9ZIXF1FNOhKgob56RZNe5C.jpg', genres: ['Fantasía','Drama','Guerra'], rating: 'R', imdbRating: 8.2, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Her', director: 'Spike Jonze', cast: ['Joaquin Phoenix','Scarlett Johansson'], year: 2013, duration: 126, description: 'Un hombre solitario desarrolla una relación con su sistema operativo de inteligencia artificial.', posterUrl: 'https://image.tmdb.org/t/p/w500/nnMC0BM6XbjCaQw0tblPRmMFKd8.jpg', genres: ['Romance','Ciencia Ficción','Drama'], rating: 'R', imdbRating: 8.0, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'The Grand Budapest Hotel', director: 'Wes Anderson', cast: ['Ralph Fiennes','Tony Revolori','Saoirse Ronan'], year: 2014, duration: 99, description: 'Las aventuras de Gustave H, el legendario conserje de un famoso hotel europeo.', posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', genres: ['Comedia','Misterio','Drama'], rating: 'R', imdbRating: 8.1, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'The Shape of Water', director: 'Guillermo del Toro', cast: ['Sally Hawkins','Michael Shannon','Doug Jones'], year: 2017, duration: 123, description: 'Una mujer muda trabaja en un laboratorio secreto del gobierno donde descubre una criatura acuática única.', posterUrl: 'https://image.tmdb.org/t/p/w500/k4FwHlMhuRR5BISY2Gm2QZHlH5Q.jpg', genres: ['Fantasía','Drama','Romance'], rating: 'R', imdbRating: 7.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Spotlight', director: 'Tom McCarthy', cast: ['Mark Ruffalo','Michael Keaton','Rachel McAdams'], year: 2015, duration: 128, description: 'El equipo Spotlight del Boston Globe investiga el encubrimiento de abuso de menores en la iglesia católica.', posterUrl: 'https://image.tmdb.org/t/p/w500/bkSBrcpAqUYtA5aFWPpXuaL0qMU.jpg', genres: ['Drama','Historia'], rating: 'R', imdbRating: 8.1, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: '12 Years a Slave', director: 'Steve McQueen', cast: ['Chiwetel Ejiofor','Michael Fassbender','Lupita Nyong\'o'], year: 2013, duration: 134, description: 'La historia verídica de Solomon Northup, un hombre libre que fue secuestrado y vendido como esclavo.', posterUrl: 'https://image.tmdb.org/t/p/w500/kb3X943WMIJYVg4SOAyK0pmWL5D.jpg', genres: ['Drama','Historia'], rating: 'R', imdbRating: 8.1, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Amadeus', director: 'Milos Forman', cast: ['F. Murray Abraham','Tom Hulce'], year: 1984, duration: 160, description: 'La historia de la rivalidad entre el compositor Antonio Salieri y el genio Wolfgang Amadeus Mozart.', posterUrl: 'https://image.tmdb.org/t/p/w500/qFOqeCsGUDqxiqVBE1KZAL2JG3d.jpg', genres: ['Biografía','Drama','Musical'], rating: 'R', imdbRating: 8.4, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Scarface', director: 'Brian De Palma', cast: ['Al Pacino','Michelle Pfeiffer','Mary Elizabeth Mastrantonio'], year: 1983, duration: 170, description: 'Un inmigrante cubano llega a Miami y sube hasta la cima del mundo del crimen organizado.', posterUrl: 'https://image.tmdb.org/t/p/w500/iQ5ztdjvteGeboxtmRdXEChJOHh.jpg', genres: ['Crimen','Drama'], rating: 'R', imdbRating: 8.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Goodfellas', director: 'Martin Scorsese', cast: ['Ray Liotta','Robert De Niro','Joe Pesci'], year: 1990, duration: 146, description: 'La vida del mafioso Henry Hill desde la infancia hasta su testigo en el programa de protección.', posterUrl: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', genres: ['Crimen','Drama'], rating: 'R', imdbRating: 8.7, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Amélie', director: 'Jean-Pierre Jeunet', cast: ['Audrey Tautou','Mathieu Kassovitz'], year: 2001, duration: 122, description: 'Una tímida mesera en Montmartre decide mejorar la vida de las personas a su alrededor de forma anónima.', posterUrl: 'https://image.tmdb.org/t/p/w500/fwBHLMnMuMTGOBfPBjgwi5k4VB9.jpg', genres: ['Comedia','Romance'], rating: 'R', imdbRating: 8.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Memento', director: 'Christopher Nolan', cast: ['Guy Pearce','Carrie-Anne Moss','Joe Pantoliano'], year: 2000, duration: 113, description: 'Un hombre con pérdida de memoria a corto plazo intenta encontrar al asesino de su esposa.', posterUrl: 'https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg', genres: ['Misterio','Thriller','Drama'], rating: 'R', imdbRating: 8.4, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Se7en', director: 'David Fincher', cast: ['Brad Pitt','Morgan Freeman','Kevin Spacey'], year: 1995, duration: 127, description: 'Dos detectives cazan a un asesino que usa los siete pecados capitales como sus motivaciones.', posterUrl: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg', genres: ['Crimen','Drama','Misterio'], rating: 'R', imdbRating: 8.6, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Fight Club', director: 'David Fincher', cast: ['Brad Pitt','Edward Norton','Helena Bonham Carter'], year: 1999, duration: 139, description: 'Un empleado insatisfecho forma un club de peleas clandestino que evoluciona en algo mucho más oscuro.', posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', genres: ['Drama','Thriller'], rating: 'R', imdbRating: 8.8, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Silence of the Lambs', director: 'Jonathan Demme', cast: ['Jodie Foster','Anthony Hopkins'], year: 1991, duration: 118, description: 'Una agente del FBI en entrenamiento busca la ayuda del Dr. Hannibal Lecter para atrapar a un asesino en serie.', posterUrl: 'https://image.tmdb.org/t/p/w500/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg', genres: ['Crimen','Drama','Thriller'], rating: 'R', imdbRating: 8.6, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Princess Mononoke', director: 'Hayao Miyazaki', cast: ['Yoji Matsuda','Yuriko Ishida'], year: 1997, duration: 134, description: 'Un joven príncipe busca una cura para su maldición y se encuentra atrapado en una guerra entre dioses del bosque y humanos.', posterUrl: 'https://image.tmdb.org/t/p/w500/pONHPQkHHFGNBBGGiN0vbzJa3a5.jpg', genres: ['Animación','Aventura','Fantasía'], rating: 'PG-13', imdbRating: 8.4, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Eternal Sunshine of the Spotless Mind', director: 'Michel Gondry', cast: ['Jim Carrey','Kate Winslet'], year: 2004, duration: 108, description: 'Una pareja decide borrarse el uno al otro de su memoria, pero durante el proceso reconsideran su amor.', posterUrl: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg', genres: ['Ciencia Ficción','Drama','Romance'], rating: 'R', imdbRating: 8.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Requiem for a Dream', director: 'Darren Aronofsky', cast: ['Ellen Burstyn','Jared Leto','Jennifer Connelly'], year: 2000, duration: 102, description: 'Las fantasías de cuatro personas son destruidas por diferentes formas de adicción.', posterUrl: 'https://image.tmdb.org/t/p/w500/nOd6vjEmzCT0k4VYqsA2hwyi87C.jpg', genres: ['Drama'], rating: 'R', imdbRating: 8.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Life of Pi', director: 'Ang Lee', cast: ['Suraj Sharma','Irrfan Khan'], year: 2012, duration: 127, description: 'Un joven sobreviviente de un naufragio comparte un bote salvavidas con un tigre de Bengala.', posterUrl: 'https://image.tmdb.org/t/p/w500/t0lLqJDgVYuEBkDQABmjkx1bLNk.jpg', genres: ['Aventura','Drama','Fantasía'], rating: 'PG', imdbRating: 7.9, format: ['2D','3D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'A Beautiful Mind', director: 'Ron Howard', cast: ['Russell Crowe','Ed Harris','Jennifer Connelly'], year: 2001, duration: 135, description: 'La historia real del matemático John Nash y su lucha contra la esquizofrenia.', posterUrl: 'https://image.tmdb.org/t/p/w500/zwzWCmH72OSC9NA0ipoqynmS9gy.jpg', genres: ['Biografía','Drama'], rating: 'PG-13', imdbRating: 8.2, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Django Unchained', director: 'Quentin Tarantino', cast: ['Jamie Foxx','Christoph Waltz','Leonardo DiCaprio'], year: 2012, duration: 165, description: 'Un esclavo liberado viaja con un cazarrecompensas para rescatar a su esposa de un despiadado propietario.', posterUrl: 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg', genres: ['Acción','Drama','Western'], rating: 'R', imdbRating: 8.4, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Inglourious Basterds', director: 'Quentin Tarantino', cast: ['Brad Pitt','Christoph Waltz','Mélanie Laurent'], year: 2009, duration: 153, description: 'En la Francia ocupada por los nazis, dos planes para asesinar a los líderes nazis convergen en un cine.', posterUrl: 'https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg', genres: ['Bélica','Drama','Aventura'], rating: 'R', imdbRating: 8.3, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'The Wolf of Wall Street', director: 'Martin Scorsese', cast: ['Leonardo DiCaprio','Jonah Hill','Margot Robbie'], year: 2013, duration: 180, description: 'La historia de Jordan Belfort, desde el ascenso hasta la caída en el mundo de la bolsa de valores.', posterUrl: 'https://image.tmdb.org/t/p/w500/34m2tygAYBGqA9MXKhRDtzOd4VR.jpg', genres: ['Crimen','Drama','Comedia'], rating: 'R', imdbRating: 8.2, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Jurassic Park', director: 'Steven Spielberg', cast: ['Sam Neill','Laura Dern','Jeff Goldblum'], year: 1993, duration: 127, description: 'Un parque temático de dinosaurones clonados en una isla remota sufre una falla de seguridad catastrófica.', posterUrl: 'https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg', genres: ['Aventura','Ciencia Ficción'], rating: 'PG-13', imdbRating: 8.1, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Home Alone', director: 'Chris Columbus', cast: ['Macaulay Culkin','Joe Pesci','Daniel Stern'], year: 1990, duration: 103, description: 'Un niño de 8 años es olvidado en casa durante las vacaciones de Navidad y debe protegerla de dos ladrones.', posterUrl: 'https://image.tmdb.org/t/p/w500/onTSipZ8R3bliBdKfPtsDaxA2wD.jpg', genres: ['Comedia','Familia'], rating: 'PG', imdbRating: 7.6, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
  { title: 'Catch Me If You Can', director: 'Steven Spielberg', cast: ['Leonardo DiCaprio','Tom Hanks'], year: 2002, duration: 141, description: 'Frank Abagnale Jr., uno de los mayores estafadores de la historia, es cazado por el agente del FBI Carl Hanratty.', posterUrl: 'https://image.tmdb.org/t/p/w500/6yFoLNQgFdVbA8TZMdfgVpszOla.jpg', genres: ['Crimen','Drama','Biográfico'], rating: 'PG-13', imdbRating: 8.1, format: ['2D'], status: 'COLECCION', isHighlight: false, showtimes: [] },
];

const allMovies = [...cartelera, ...coleccion];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Conectado a MongoDB. Iniciando Mega Seeder...');
    await Movie.deleteMany({});
    console.log('Películas anteriores eliminadas.');
    await Movie.insertMany(allMovies);
    const total = allMovies.length;
    const enCartelera = allMovies.filter(m => m.status === 'CARTELERA').length;
    const enColeccion = allMovies.filter(m => m.status === 'COLECCION').length;
    console.log(`✅ ${total} películas insertadas: ${enCartelera} en cartelera + ${enColeccion} en colección.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error en el mega seeder:', err);
    process.exit(1);
  });

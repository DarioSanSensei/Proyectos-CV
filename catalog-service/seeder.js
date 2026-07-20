const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

const movies = [
  {
    title: "El Caballero Oscuro (Batman)",
    director: "Christopher Nolan",
    year: 2008,
    description: "Con la ayuda del teniente Jim Gordon y el nuevo y comprometido fiscal del distrito, Harvey Dent, Batman se propone destruir para siempre el crimen organizado en Gotham City.",
    genres: ["Acción", "Crimen", "Drama"],
    posterUrl: "https://m.media-amazon.com/images/I/91KkWf50SoL._AC_SY879_.jpg",
    showtimes: [
      { time: "18:00", room: "Sala 1" },
      { time: "21:00", room: "Sala 2" }
    ]
  },
  {
    title: "Inception (El Origen)",
    director: "Christopher Nolan",
    year: 2010,
    description: "Un ladrón que roba secretos corporativos a través del uso de tecnología de compartir sueños, recibe la tarea inversa de plantar una idea en la mente de un director ejecutivo.",
    genres: ["Acción", "Aventura", "Ciencia Ficción"],
    posterUrl: "https://m.media-amazon.com/images/I/912AErFSBHL._AC_SY879_.jpg",
    showtimes: [
      { time: "16:00", room: "Sala 3" },
      { time: "20:30", room: "Sala 1" }
    ]
  },
  {
    title: "Dune: Parte Dos",
    director: "Denis Villeneuve",
    year: 2024,
    description: "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.",
    genres: ["Ciencia Ficción", "Aventura"],
    posterUrl: "https://m.media-amazon.com/images/I/71R2J3s+FvL._AC_SY879_.jpg",
    showtimes: [
      { time: "15:00", room: "Sala VIP" },
      { time: "19:00", room: "Sala VIP" }
    ]
  },
  {
    title: "El Padrino",
    director: "Francis Ford Coppola",
    year: 1972,
    description: "El anciano patriarca de una dinastía del crimen organizado transfiere el control de su imperio clandestino a su reacio hijo.",
    genres: ["Crimen", "Drama"],
    posterUrl: "https://m.media-amazon.com/images/I/81+H-wZ58PL._AC_SY879_.jpg",
    showtimes: [
      { time: "21:30", room: "Sala 4" }
    ]
  },
  {
    title: "Oppenheimer",
    director: "Christopher Nolan",
    year: 2023,
    description: "La historia del científico estadounidense J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.",
    genres: ["Drama", "Historia"],
    posterUrl: "https://m.media-amazon.com/images/I/81gH384zQKL._AC_SY879_.jpg",
    showtimes: [
      { time: "17:15", room: "Sala 2" },
      { time: "21:15", room: "Sala 3" }
    ]
  },
  {
    title: "Interstellar",
    director: "Christopher Nolan",
    year: 2014,
    description: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por garantizar la supervivencia de la humanidad.",
    genres: ["Ciencia Ficción", "Drama"],
    posterUrl: "https://m.media-amazon.com/images/I/A1JVqNMI7UL._AC_SY879_.jpg",
    showtimes: [
      { time: "16:45", room: "Sala 1" },
      { time: "20:00", room: "Sala 4" }
    ]
  },
  {
    title: "Gladiador",
    director: "Ridley Scott",
    year: 2000,
    description: "Un general romano convertido en esclavo busca venganza contra el corrupto emperador que asesinó a su familia y lo envió a la esclavitud.",
    genres: ["Acción", "Aventura", "Drama"],
    posterUrl: "https://m.media-amazon.com/images/I/81e5sPZcKjL._AC_SY879_.jpg",
    showtimes: [
      { time: "19:30", room: "Sala 2" }
    ]
  },
  {
    title: "Matrix",
    director: "Lana Wachowski, Lilly Wachowski",
    year: 1999,
    description: "Un hacker informático descubre de misteriosos rebeldes la verdadera naturaleza de su realidad y su papel en la guerra contra sus controladores.",
    genres: ["Acción", "Ciencia Ficción"],
    posterUrl: "https://m.media-amazon.com/images/I/813uV3nO2xL._AC_SY879_.jpg",
    showtimes: [
      { time: "18:30", room: "Sala 3" },
      { time: "22:00", room: "Sala 1" }
    ]
  },
  {
    title: "Parasite",
    director: "Bong Joon Ho",
    year: 2019,
    description: "La codicia y la discriminación de clase amenazan la recién formada relación simbiótica entre la adinerada familia Park y el empobrecido clan Kim.",
    genres: ["Drama", "Thriller"],
    posterUrl: "https://m.media-amazon.com/images/I/91tEqI8rEQL._AC_SY879_.jpg",
    showtimes: [
      { time: "17:00", room: "Sala 4" }
    ]
  },
  {
    title: "Spirited Away (El Viaje de Chihiro)",
    director: "Hayao Miyazaki",
    year: 2001,
    description: "Durante la mudanza de su familia a los suburbios, una niña de 10 años, huraña y obstinada, se adentra en un mundo gobernado por dioses, brujas y espíritus.",
    genres: ["Animación", "Aventura"],
    posterUrl: "https://m.media-amazon.com/images/I/71Yv8q2I9SL._AC_SY879_.jpg",
    showtimes: [
      { time: "14:00", room: "Sala 2" },
      { time: "16:30", room: "Sala 3" }
    ]
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Conectado a MongoDB Atlas. Iniciando Seeder...");
    
    // Opcional: borrar todas las películas anteriores
    // await Movie.deleteMany({});
    // console.log("Películas anteriores eliminadas.");

    await Movie.insertMany(movies);
    console.log(`¡Éxito! ${movies.length} películas han sido inyectadas en la base de datos.`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Error al poblar la base de datos:", err);
    process.exit(1);
  });

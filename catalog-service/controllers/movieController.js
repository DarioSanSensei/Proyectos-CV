const Movie = require('../models/Movie');

// Crear película
const createMovie = async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (error) {
        res.status(400).json({ message: "Error al guardar la película", error: error.message });
    }
};

// Obtener películas con filtros opcionales
// ?status=CARTELERA | ?status=COLECCION | sin param = todas
const getMovies = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.genre) filter.genres = req.query.genre;
        if (req.query.rating) filter.rating = req.query.rating;
        if (req.query.highlight === 'true') filter.isHighlight = true;

        const movies = await Movie.find(filter).sort({ isHighlight: -1, createdAt: -1 });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: "Error al consultar el catálogo", error: error.message });
    }
};

// Obtener película por ID
const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Película no encontrada" });
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar la película", error: error.message });
    }
};

// Actualizar película
const updateMovie = async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedMovie) return res.status(404).json({ message: "Película no encontrada." });
        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar", error: error.message });
    }
};

// Eliminar película
const deleteMovie = async (req, res) => {
    try {
        const deleted = await Movie.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "La película no existe." });
        res.status(200).json({ message: "Película eliminada del catálogo." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar", error: error.message });
    }
};

// NUEVO: Toggle CARTELERA ↔ COLECCION (Admin)
const toggleStatus = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Película no encontrada." });
        movie.status = movie.status === 'CARTELERA' ? 'COLECCION' : 'CARTELERA';
        if (movie.status === 'COLECCION') movie.showtimes = [];
        await movie.save();
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar estado", error: error.message });
    }
};

// NUEVO: Toggle isHighlight (Admin) — película destacada en el hero
const toggleHighlight = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Película no encontrada." });
        movie.isHighlight = !movie.isHighlight;
        await movie.save();
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar highlight", error: error.message });
    }
};

// NUEVO: Gestionar horarios de una película (reemplaza todos)
const updateShowtimes = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Película no encontrada." });
        movie.showtimes = req.body.showtimes || [];
        await movie.save();
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar horarios", error: error.message });
    }
};

module.exports = { createMovie, getMovies, getMovieById, updateMovie, deleteMovie, toggleStatus, toggleHighlight, updateShowtimes };

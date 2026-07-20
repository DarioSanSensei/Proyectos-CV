const express = require('express');
const router = express.Router();
const { createMovie, getMovies, getMovieById, updateMovie, deleteMovie, toggleStatus, toggleHighlight, updateShowtimes } = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Registra una nueva película en el catálogo
 *     tags: [Catálogo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "John Wick"
 *               director:
 *                 type: string
 *                 example: "Chad Stahelski"
 *               year:
 *                 type: number
 *                 example: 2014
 *               description:
 *                 type: string
 *                 example: "Un ex-asesino a sueldo sale del retiro para vengar a su perro."
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Acción", "Thriller"]
 *     responses:
 *       201:
 *         description: Película guardada exitosamente en MongoDB
 *       400:
 *         description: Fallo en la validación de Mongoose
 */
// 🔴 RUTAS PROTEGIDAS (Exigen Token JWT y rol ADMIN)
router.post('/', protect, authorize('ADMIN'), createMovie);

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Obtiene la lista completa de películas del catálogo
 *     tags: [Catálogo]
 *     responses:
 *       200:
 *         description: Arreglo de películas extraído de MongoDB Atlas
 *       500:
 *         description: Error en el servidor al consultar la cartelera
 */
// 🟢 RUTAS PÚBLICAS (Cualquiera puede leer el catálogo)
router.get('/', getMovies);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Obtiene una película por su ID
 *     tags: [Catálogo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la película
 *     responses:
 *       200:
 *         description: Datos de la película
 *       404:
 *         description: Película no encontrada
 *       500:
 *         description: Error en el servidor
 */
// 🟢 RUTAS PÚBLICAS (Cualquiera puede buscar una sola película)
router.get('/:id', getMovieById);

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     summary: Actualiza los datos de una película existente
 *     tags: [Catálogo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID alfanumérico de la película en MongoDB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               director:
 *                 type: string
 *               year:
 *                 type: number
 *               description:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Película actualizada con éxito
 *       404:
 *         description: Película no encontrada en los registros
 *       500:
 *         description: Error al actualizar los datos
 */
// 🔴 RUTAS PROTEGIDAS (Exigen Token JWT y rol ADMIN)
router.put('/:id', protect, authorize('ADMIN'), updateMovie);

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: Elimina una película del catálogo
 *     tags: [Catálogo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID alfanumérico de la película en MongoDB a destruir
 *     responses:
 *       200:
 *         description: Película eliminada con éxito del catálogo
 *       404:
 *         description: La película ya fue eliminada o no existe
 *       500:
 *         description: Fallo crítico al intentar borrar la película
 */
// 🔴 RUTAS PROTEGIDAS (Exigen Token JWT y rol ADMIN)
router.delete('/:id', protect, authorize('ADMIN'), deleteMovie);

// 🔴 ADMIN: Mover película entre CARTELERA y COLECCIÓN
router.patch('/:id/toggle-status', protect, authorize('ADMIN'), toggleStatus);

// 🔴 ADMIN: Marcar/desmarcar como película destacada (Hero Banner)
router.patch('/:id/toggle-highlight', protect, authorize('ADMIN'), toggleHighlight);

// 🔴 ADMIN: Actualizar horarios completos de una película
router.patch('/:id/showtimes', protect, authorize('ADMIN'), updateShowtimes);

module.exports = router;

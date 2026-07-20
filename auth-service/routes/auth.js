const express = require('express');
const router = express.Router();
const { register, login, getMe, addPoints } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario en el sistema
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: villano@cinemastack.com
 *               password:
 *                 type: string
 *                 example: SuperSecret123
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: El correo ya está registrado
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: villano@cinemastack.com
 *               password:
 *                 type: string
 *                 example: SuperSecret123
 *     responses:
 *       200:
 *         description: Autenticación exitosa (Devuelve el JWT)
 *       400:
 *         description: Faltan credenciales
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

// La ruta que está rebotando:
/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtiene los datos del perfil del usuario (Ruta Restringida)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso autorizado, devuelve los datos del payload del JWT
 *       401:
 *         description: Token inválido o expirado
 *       403:
 *         description: No se proporcionó token o el formato es incorrecto
 */
router.get('/perfil', verifyToken, (req, res) => {
    res.json({
        message: 'Acceso autorizado. Estás dentro de la zona restringida.',
        userData: req.user
    });
});

// Perfil del usuario con puntos CineSanza
router.get('/me', verifyToken, getMe);

// Acreditar CinePuntos (llamado por booking-service con el JWT del usuario)
router.patch('/me/points', verifyToken, addPoints);

module.exports = router;

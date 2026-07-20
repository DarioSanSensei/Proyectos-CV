const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // 👈 Añade esta importación en la parte superior
const pool = require('../config/db'); // Tu conexión automatizada a PostgreSQL

const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
        }

        // 1. Verificar si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // 2. Aplicar Hash Destructivo a la contraseña (10 rondas de salting)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Inyectar en la base de datos y devolver los datos limpios (sin el hash)
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at',
            [email, passwordHash]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Error en controlador de registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
        }

        // 1. Buscar al usuario en la base de datos
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // 2. Comparar la contraseña ingresada contra el Hash almacenado
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 3. Generar el gafete virtual (JWT) válido por 24 horas
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 4. Entregar el token al cliente
        res.json({
            message: 'Autenticación exitosa',
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Error en controlador de login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener perfil del usuario autenticado (con puntos)
const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, role, points, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Acreditar CinePuntos a un usuario (llamado por booking-service)
const addPoints = async (req, res) => {
    try {
        const { points } = req.body;
        if (!points || points <= 0) {
            return res.status(400).json({ error: 'Puntos inválidos' });
        }
        const result = await pool.query(
            'UPDATE users SET points = COALESCE(points, 0) + $1 WHERE id = $2 RETURNING id, email, points',
            [points, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: `${points} CinePuntos acreditados`, user: result.rows[0] });
    } catch (error) {
        console.error('Error en addPoints:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
// No olvides exportar la nueva función
module.exports = { register, login, getMe, addPoints };

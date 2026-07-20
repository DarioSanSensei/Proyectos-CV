require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

// 1. Importar herramientas visuales
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());
app.use(cors());

// 2. Configurar la Especificación de Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CinemaStack API - Seguridad",
            version: "1.0.0",
            description: "Microservicio de Autenticación para el ecosistema de cines"
        },
        servers: [
            { url: "http://localhost:3001" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./routes/*.js"], // Le dice a Swagger dónde buscar la documentación
};

// 3. Levantar la interfaz gráfica en la ruta /api-docs
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerOptions)));

// Tus rutas normales
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Auth Service Running' });
});

app.listen(PORT, () => {
    console.log(`[Auth Service] operando en el puerto ${PORT}`);
    console.log(`👁️  Interfaz gráfica disponible en: http://localhost:${PORT}/api-docs`);
});

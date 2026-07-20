require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectMongoDB = require('./config/db');

// 1. IMPORTAR LAS RUTAS
const movieRoutes = require('./routes/movieRoutes');
const roomRoutes = require('./routes/roomRoutes');
const concessionRoutes = require('./routes/concessionRoutes');

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
            title: "CinemaStack API - Catálogo (NoSQL)",
            version: "1.0.0",
            description: "API de gestión de películas con MongoDB Atlas"
        },
        servers: [
            {
                url: "http://localhost:3002"
            }
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
    apis: ["./routes/*.js"]
};
const swaggerSpecs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

connectMongoDB();

// 2. ACTIVAR LAS RUTAS EN EL ENDPOINT /api
app.use('/api/movies', movieRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/concessions', concessionRoutes);

const PORT = process.env.PORT || 3002;

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Catalog Service Running on port 3002' });
});

app.listen(PORT, () => {
    console.log(`[Catalog Service] operando en el puerto ${PORT}`);
});

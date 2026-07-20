require('dotenv').config();
const { Client } = require('pg');

async function setupDatabase() {
    // 1. Conexión a la base maestra para crear cinema_db
    const clientDefault = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: 'postgres' // Nos conectamos a la BD por defecto de instalación
    });

    try {
        await clientDefault.connect();
        console.log("🔌 Conectado a PostgreSQL maestro.");
        
        const res = await clientDefault.query("SELECT 1 FROM pg_database WHERE datname = 'cinema_db'");
        if (res.rowCount === 0) {
            await clientDefault.query('CREATE DATABASE cinema_db');
            console.log("✅ Base de datos 'cinema_db' creada exitosamente.");
        } else {
            console.log("⚡ La base de datos 'cinema_db' ya existe.");
        }
    } catch (error) {
        console.error("❌ Error al crear la base de datos:", error);
        process.exit(1);
    } finally {
        await clientDefault.end();
    }

    // 2. Conexión a la nueva BD para forjar la tabla de usuarios
    const clientCinema = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME // Ahora sí usamos cinema_db
    });

    try {
        await clientCinema.connect();
        console.log("🔌 Conectado a 'cinema_db'.");

        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'cliente',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        await clientCinema.query(createTableQuery);
        console.log("✅ Barrera de seguridad (Tabla 'users') levantada exitosamente.");
    } catch (error) {
        console.error("❌ Error al crear la tabla:", error);
    } finally {
        await clientCinema.end();
    }
}

setupDatabase();

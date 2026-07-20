const pool = require('./config/db');

async function addPointsColumn() {
  try {
    // Añadir columna points de forma no destructiva (IF NOT EXISTS)
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0
    `);
    console.log('✅ Columna "points" añadida (o ya existía) a la tabla users.');
    
    // Inicializar puntos en 0 para usuarios existentes sin puntos
    await pool.query(`
      UPDATE users SET points = 0 WHERE points IS NULL
    `);
    console.log('✅ Puntos inicializados en 0 para usuarios existentes.');
    process.exit(0);
  } catch (err) {
    console.error('Error al añadir columna points:', err);
    process.exit(1);
  }
}

addPointsColumn();

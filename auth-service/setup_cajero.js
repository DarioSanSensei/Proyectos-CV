const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function setupCajero() {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('cajero123', saltRounds);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('cajero@cinemastack.com', $1, 'POS') ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'POS' RETURNING *", 
      [passwordHash]
    );

    console.log(`Cajero creado exitosamente con rol POS: ${result.rows[0].email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear cajero:', error);
    process.exit(1);
  }
}

setupCajero();

const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function setupDario() {
  try {
    const passwordHash = await bcrypt.hash('dario', 10);
    
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('dario@dario.com', $1, 'CLIENT') ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'CLIENT' RETURNING *", 
      [passwordHash]
    );
    
    console.log("Usuario Dario creado con éxito.");
    process.exit(0);
  } catch (err) {
    console.error("Error al actualizar usuarios:", err);
    process.exit(1);
  }
}

setupDario();

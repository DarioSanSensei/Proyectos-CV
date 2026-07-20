const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function setupAdmin() {
  try {
    const passwordHash = await bcrypt.hash('Admin123', 10);
    
    // 1. Degradamos a villano a cliente regular
    await pool.query("UPDATE users SET role = 'CLIENT' WHERE email = 'villano@cinemastack.com'");
    
    // 2. Ascendemos a admin@admin.com a ADMIN y le seteamos la contraseña
    const result = await pool.query(
      "UPDATE users SET role = 'ADMIN', password_hash = $1 WHERE email = 'admin@admin.com' RETURNING *", 
      [passwordHash]
    );
    
    // Si por alguna razón admin@admin.com no existía, lo creamos desde cero
    if (result.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ('admin@admin.com', $1, 'ADMIN')", 
        [passwordHash]
      );
    }
    
    console.log("Jerarquía de usuarios actualizada con éxito.");
    process.exit(0);
  } catch (err) {
    console.error("Error al actualizar usuarios:", err);
    process.exit(1);
  }
}

setupAdmin();

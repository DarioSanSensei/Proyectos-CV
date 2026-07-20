const pool = require('./config/db');

async function alter() {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'CLIENT'");
    await pool.query("ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('ADMIN', 'POS', 'CLIENT', 'MANAGER'))");
    await pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'villano@cinemastack.com'"); // O el correo que usaste
    console.log("Tabla alterada con éxito");
    process.exit(0);
  } catch (err) {
    if (err.code === '42701') {
       console.log("La columna role ya existe.");
       try {
         await pool.query("ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('ADMIN', 'POS', 'CLIENT', 'MANAGER'))");
       } catch (e) {
           console.log("Constraint ya existe o error:", e.message);
       }
       await pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'villano@cinemastack.com'");
       process.exit(0);
    }
    console.error("Error alterando tabla:", err);
    process.exit(1);
  }
}
alter();

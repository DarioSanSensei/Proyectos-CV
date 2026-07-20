const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('Auth Service Tests', () => {
  afterAll(async () => {
    await pool.end(); // Cerrar la conexión a la base de datos para no dejar procesos colgados
  });

  describe('GET /health', () => {
    it('Debe retornar 200 y status OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });

  describe('POST /api/auth/register', () => {
    it('No debe permitir registrar un usuario sin correo', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: '123' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('No debe permitir login con contraseña incorrecta', async () => {
      // Usamos el usuario maestro que sabemos que existe en db
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@admin.com', password: 'wrongpassword' });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });
  });
});

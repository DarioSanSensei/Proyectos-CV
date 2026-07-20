const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');

describe('Booking Service Tests', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    server.close(); // Cerrar el servidor HTTP (Sockets)
  });

  describe('GET /health', () => {
    it('Debe retornar 200 y status OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });

  describe('GET /api/bookings/my-tickets', () => {
    it('Debe rechazar la petición si no hay token (401 o 403)', async () => {
      const res = await request(app).get('/api/bookings/mis-boletos');
      // Puede ser 401 o 403 dependiendo de authMiddleware
      expect([401, 403]).toContain(res.statusCode);
    });
  });
});

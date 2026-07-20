const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

describe('Catalog Service Tests', () => {
  afterAll(async () => {
    // Cerrar la conexión a MongoDB para evitar fugas de memoria
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  describe('GET /health', () => {
    it('Debe retornar 200 y status OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });

  describe('GET /api/movies', () => {
    it('Debe obtener una lista de películas', async () => {
      const res = await request(app).get('/api/movies');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('GET /api/concessions', () => {
    it('Debe obtener la lista de dulcería', async () => {
      const res = await request(app).get('/api/concessions');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });
});

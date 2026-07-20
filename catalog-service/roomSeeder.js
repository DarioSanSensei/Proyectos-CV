const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');

dotenv.config();

const rooms = [
    { name: 'Sala 1', rows: 8, cols: 10, basePrice: 65.00, disabledSeats: ['A5', 'A6', 'B5', 'B6', 'C5', 'C6', 'D5', 'D6'] },
    { name: 'Sala VIP', rows: 5, cols: 6, basePrice: 150.00, disabledSeats: ['C3', 'C4'] },
    { name: 'MacroXE', rows: 12, cols: 15, basePrice: 90.00, disabledSeats: [] }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Conectado a MongoDB. Poblando Salas...");
    
    await Room.deleteMany({});
    console.log('Salas antiguas eliminadas');

    for (const r of rooms) {
      await Room.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    }
    
    console.log("¡Salas creadas con éxito!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error al poblar salas:", err);
    process.exit(1);
  });

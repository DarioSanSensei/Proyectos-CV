const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// GET todas las salas
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET sala por nombre
router.get('/name/:name', async (req, res) => {
    try {
        const room = await Room.findOne({ name: req.params.name });
        if (!room) return res.status(404).json({ message: 'Sala no encontrada' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST crear sala
router.post('/', async (req, res) => {
    const room = new Room(req.body);
    try {
        const newRoom = await room.save();
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE sala
router.delete('/:id', async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sala eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

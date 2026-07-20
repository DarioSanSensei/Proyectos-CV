const express = require('express');
const router = express.Router();
const ConcessionItem = require('../models/ConcessionItem');

// GET todos los productos del menú (público)
router.get('/', async (req, res) => {
    try {
        const items = await ConcessionItem.find({ available: true }).sort({ category: 1, price: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET todos (incluye no disponibles, para admin)
router.get('/all', async (req, res) => {
    try {
        const items = await ConcessionItem.find().sort({ category: 1, price: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST crear producto (admin)
router.post('/', async (req, res) => {
    const item = new ConcessionItem(req.body);
    try {
        const saved = await item.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH togglear disponibilidad (admin)
router.patch('/:id/toggle', async (req, res) => {
    try {
        const item = await ConcessionItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Producto no encontrado' });
        item.available = !item.available;
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE producto (admin)
router.delete('/:id', async (req, res) => {
    try {
        await ConcessionItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

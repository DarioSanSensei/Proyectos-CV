import { useState, useEffect } from 'react';
import { concessionsApi } from '../api/axiosConfig';

const CATEGORY_EMOJIS = { COMBO: '🎉', SNACK: '🍿', BEBIDA: '🥤', ESPECIAL: '⭐' };

const ConcessionAdmin = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', price: 0, category: 'SNACK', emoji: '🍿', available: true });

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const res = await concessionsApi.get('/all');
            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await concessionsApi.post('/', formData);
            setIsCreating(false);
            setFormData({ name: '', description: '', price: 0, category: 'SNACK', emoji: '🍿', available: true });
            fetchItems();
        } catch (err) {
            alert('Error al crear producto');
        }
    };

    const handleToggle = async (id) => {
        try {
            await concessionsApi.patch(`/${id}/toggle`);
            fetchItems();
        } catch (err) {
            alert('Error al cambiar disponibilidad');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este producto de la dulcería?')) return;
        try {
            await concessionsApi.delete(`/${id}`);
            fetchItems();
        } catch (err) {
            alert('Error al eliminar producto');
        }
    };

    const grouped = Object.keys(CATEGORY_EMOJIS).map(cat => ({
        cat,
        items: items.filter(i => i.category === cat)
    })).filter(g => g.items.length > 0);

    if (loading) return <div style={{ padding: '40px', color: 'white' }}>Cargando dulcería...</div>;

    return (
        <div style={{ padding: '30px', color: 'white', overflowY: 'auto', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px' }}>
                        🍿 Gestor de Dulcería
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {items.length} productos · {items.filter(i => i.available).length} disponibles
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    style={{ background: isCreating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #E31E24, #B01219)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                >
                    {isCreating ? 'Cancelar' : '+ Nuevo Producto'}
                </button>
            </div>

            {/* Formulario de Nuevo Producto */}
            {isCreating && (
                <div style={{ background: 'var(--dark-card)', border: '1px solid rgba(227,30,36,0.3)', borderRadius: '16px', padding: '28px', marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>Agregar Producto al Menú</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre del Producto</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Combo Clásico..." style={{ width: '100%', padding: '10px 14px', background: 'var(--dark-surface)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Descripción</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Palomitas + refresco..." style={{ width: '100%', padding: '10px 14px', background: 'var(--dark-surface)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Precio ($)</label>
                                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} required style={{ width: '100%', padding: '10px 14px', background: 'var(--dark-surface)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Categoría</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: 'var(--dark-surface)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem' }}>
                                    <option value="COMBO">🎉 Combo</option>
                                    <option value="SNACK">🍿 Snack</option>
                                    <option value="BEBIDA">🥤 Bebida</option>
                                    <option value="ESPECIAL">⭐ Especial</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Emoji</label>
                                <input type="text" value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e.target.value })} placeholder="🍿" style={{ width: '100%', padding: '10px 14px', background: 'var(--dark-surface)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem' }} />
                            </div>
                        </div>
                        <button type="submit" style={{ padding: '12px 30px', background: 'linear-gradient(135deg, #E31E24, #B01219)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                            Guardar Producto
                        </button>
                    </form>
                </div>
            )}

            {/* Listado por categoría */}
            {grouped.map(({ cat, items: catItems }) => (
                <div key={cat} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '1.4rem' }}>{CATEGORY_EMOJIS[cat]}</span>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat}</h3>
                        <span style={{ background: 'var(--dark-surface)', padding: '2px 10px', borderRadius: '50px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{catItems.length}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {catItems.map(item => (
                            <div key={item._id} style={{
                                background: 'var(--dark-card)',
                                border: `1px solid ${item.available ? 'var(--glass-border)' : 'rgba(255,50,50,0.2)'}`,
                                borderRadius: '12px',
                                padding: '18px',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                                opacity: item.available ? 1 : 0.5,
                                transition: 'all 0.2s'
                            }}>
                                <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, marginBottom: '3px' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.description}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#E31E24' }}>${item.price.toFixed(2)}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <button onClick={() => handleToggle(item._id)} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, background: item.available ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: item.available ? '#10b981' : '#ef4444' }}>
                                        {item.available ? 'Activo' : 'Inactivo'}
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🍿</div>
                    <h3>Sin productos en la dulcería</h3>
                    <p>Crea el primer producto con el botón de arriba</p>
                </div>
            )}
        </div>
    );
};

export default ConcessionAdmin;

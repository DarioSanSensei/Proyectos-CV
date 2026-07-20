import { useState, useEffect } from 'react';
import { concessionsApi } from '../api/axiosConfig';
import './ConcessionMenu.css';

const CATEGORY_LABELS = {
    COMBO: { label: 'Combos Especiales', emoji: '🎉', color: '#E31E24' },
    SNACK: { label: 'Snacks', emoji: '🍿', color: '#FF8C00' },
    BEBIDA: { label: 'Bebidas', emoji: '🥤', color: '#0EA5E9' },
    ESPECIAL: { label: 'Especiales', emoji: '⭐', color: '#FFD700' },
};

const ConcessionMenu = ({ onConfirm, onSkip, seatNumber, showtime, room }) => {
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState({}); // { itemId: { ...item, qty } }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        concessionsApi.get('/').then(res => {
            setItems(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev[item._id];
            return {
                ...prev,
                [item._id]: existing
                    ? { ...existing, qty: existing.qty + 1 }
                    : { ...item, qty: 1 }
            };
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => {
            const existing = prev[itemId];
            if (!existing || existing.qty <= 1) {
                const next = { ...prev };
                delete next[itemId];
                return next;
            }
            return { ...prev, [itemId]: { ...existing, qty: existing.qty - 1 } };
        });
    };

    const cartItems = Object.values(cart);
    const cartTotal = cartItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

    const grouped = Object.entries(CATEGORY_LABELS).map(([cat, meta]) => ({
        ...meta,
        category: cat,
        items: items.filter(i => i.category === cat),
    })).filter(g => g.items.length > 0);

    const handleConfirm = () => {
        const concessions = cartItems.map(i => ({
            itemId: i._id,
            name: i.name,
            price: i.price,
            qty: i.qty
        }));
        onConfirm(concessions, cartTotal);
    };

    if (loading) {
        return (
            <div className="cm-loading">
                <div className="cm-spinner"></div>
                <p>Cargando el menú de la dulcería...</p>
            </div>
        );
    }

    return (
        <div className="cm-wrapper">
            {/* Header */}
            <div className="cm-header">
                <div className="cm-header-info">
                    <p className="cm-eyebrow">🍿 DULCERÍA</p>
                    <h2 className="cm-title">Agrega tu Antojo</h2>
                    <p className="cm-subtitle">Asiento {seatNumber} · {showtime} · {room}</p>
                </div>
                <button className="cm-skip-btn" onClick={onSkip}>
                    Saltar →
                </button>
            </div>

            <div className="cm-body">
                {/* Menú */}
                <div className="cm-menu">
                    {grouped.map(group => (
                        <div key={group.category} className="cm-category">
                            <div className="cm-category-header">
                                <span className="cm-category-emoji">{group.emoji}</span>
                                <span className="cm-category-label" style={{ color: group.color }}>{group.label}</span>
                            </div>
                            <div className="cm-items-grid">
                                {group.items.map(item => {
                                    const inCart = cart[item._id];
                                    return (
                                        <div key={item._id} className={`cm-item ${inCart ? 'in-cart' : ''}`}>
                                            <div className="cm-item-emoji">{item.emoji}</div>
                                            <div className="cm-item-info">
                                                <span className="cm-item-name">{item.name}</span>
                                                <span className="cm-item-desc">{item.description}</span>
                                                <span className="cm-item-price">${item.price.toFixed(2)}</span>
                                            </div>
                                            <div className="cm-item-controls">
                                                {inCart ? (
                                                    <>
                                                        <button className="cm-qty-btn minus" onClick={() => removeFromCart(item._id)}>−</button>
                                                        <span className="cm-qty">{inCart.qty}</span>
                                                        <button className="cm-qty-btn plus" onClick={() => addToCart(item)}>+</button>
                                                    </>
                                                ) : (
                                                    <button className="cm-add-btn" onClick={() => addToCart(item)}>+</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Carrito fijo */}
                <div className="cm-cart">
                    <h3 className="cm-cart-title">Tu Pedido</h3>
                    {cartItems.length === 0 ? (
                        <div className="cm-cart-empty">
                            <span>🛒</span>
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        <div className="cm-cart-items">
                            {cartItems.map(item => (
                                <div key={item._id} className="cm-cart-item">
                                    <span className="cm-cart-emoji">{item.emoji}</span>
                                    <div className="cm-cart-item-info">
                                        <span>{item.name}</span>
                                        <span className="cm-cart-qty">x{item.qty}</span>
                                    </div>
                                    <span className="cm-cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="cm-cart-total">
                                <span>Total Dulcería</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <button
                        className="cm-confirm-btn"
                        onClick={handleConfirm}
                    >
                        {cartCount > 0
                            ? `Agregar ${cartCount} item${cartCount > 1 ? 's' : ''} y Pagar`
                            : 'Continuar al Pago'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConcessionMenu;

import { useState, useEffect } from 'react';
import './PaymentGateway.css';

const PaymentGateway = ({ amount, onPaymentSuccess, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Contactando a Stripe...');
  
  // Lógica de Cupones / Ofertas
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (isProcessing) {
      const steps = [
        { progress: 20, text: 'Validando tarjeta con el banco emisor...' },
        { progress: 50, text: 'Aplicando promociones autorizadas...' },
        { progress: 85, text: 'Aprobando transacción segura...' },
        { progress: 100, text: '¡Pago exitoso!' }
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setProgress(steps[currentStep].progress);
          setStatusText(steps[currentStep].text);
          currentStep++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onPaymentSuccess(amount - discount, appliedCoupon);
          }, 800);
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [isProcessing, onPaymentSuccess, amount, discount, appliedCoupon]);

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    if (code === 'SANZA30') {
      const savings = amount * 0.3;
      setDiscount(savings);
      setAppliedCoupon('SANZA30 (30% Descuento)');
    } else if (code === 'CINE2X1') {
      const savings = amount * 0.5;
      setDiscount(savings);
      setAppliedCoupon('CINE2X1 (50% Descuento Especial)');
    } else if (code === 'COMBO50') {
      const savings = Math.min(amount, 50);
      setDiscount(savings);
      setAppliedCoupon('COMBO50 ($50.00 de descuento)');
    } else {
      setCouponError('Código de cupón inválido o expirado.');
      setDiscount(0);
      setAppliedCoupon('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.length < 16) {
      alert("Por favor ingresa una tarjeta válida de 16 dígitos.");
      return;
    }
    setIsProcessing(true);
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    setCardNumber(value);
  };

  const formatCardNumber = (number) => {
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const finalAmount = amount - discount;

  return (
    <div className="pg-overlay">
      <div className="pg-modal">
        {isProcessing ? (
          <div className="pg-processing">
            <div className="pg-spinner-wrapper">
              <div className="pg-spinner"></div>
              <div className="pg-spinner-inner"></div>
            </div>
            <h3>Procesando Pago Seguro</h3>
            <p>{statusText}</p>
            {appliedCoupon && (
              <p style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                🎟️ Cupón activo: {appliedCoupon}
              </p>
            )}
            <div className="pg-progress-bar">
              <div className="pg-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <>
            <div className="pg-header">
              <h2>Completar Pago</h2>
              <button className="pg-close-btn" onClick={onCancel}>×</button>
            </div>
            
            <div className="pg-amount-display" style={{ background: 'linear-gradient(135deg, var(--dark-surface), rgba(227,30,36,0.05))' }}>
              <span>Total a pagar</span>
              {discount > 0 ? (
                <div>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.2rem', marginRight: '10px' }}>
                    ${amount.toFixed(2)}
                  </span>
                  <h3 style={{ display: 'inline-block', color: 'var(--gold)' }}>
                    ${finalAmount.toFixed(2)} MXN
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>
                    ¡Ahorraste ${discount.toFixed(2)} con {appliedCoupon}!
                  </div>
                </div>
              ) : (
                <h3>${amount.toFixed(2)} MXN</h3>
              )}
            </div>

            {/* SECCIÓN DE CUPONES */}
            <div className="pg-coupon-section" style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>¿Tienes un código de descuento o cupón?</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Ej: SANZA30, CINE2X1" 
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'var(--dark-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Aplicar
                </button>
              </div>
              {couponError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{couponError}</span>}
              {appliedCoupon && <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ Cupón Aplicado</span>}
            </div>

            <form onSubmit={handleSubmit} className="pg-form">
              <div className="pg-card-preview" style={{ background: 'linear-gradient(135deg, #1f1f1f, #050505)', border: '1px solid var(--glass-border)' }}>
                <div className="pg-card-chip"></div>
                <div className="pg-card-number">
                  {cardNumber ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••'}
                </div>
                <div className="pg-card-details">
                  <div className="pg-card-name">{name || 'NOMBRE DEL TITULAR'}</div>
                  <div className="pg-card-expiry">{expiry || 'MM/AA'}</div>
                </div>
                <div className="pg-card-logo" style={{ color: 'var(--primary)' }}>VISA</div>
              </div>

              <div className="pg-input-group">
                <label>Número de Tarjeta</label>
                <div className="pg-input-wrapper">
                  <span className="pg-icon">💳</span>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000" 
                    value={formatCardNumber(cardNumber)}
                    onChange={handleCardNumberChange}
                    required
                  />
                </div>
              </div>

              <div className="pg-row">
                <div className="pg-input-group">
                  <label>Expiración</label>
                  <input 
                    type="text" 
                    placeholder="MM/AA" 
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    maxLength="5"
                    required
                  />
                </div>
                <div className="pg-input-group">
                  <label>CVC</label>
                  <input 
                    type="password" 
                    placeholder="123" 
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <div className="pg-input-group">
                <label>Nombre del Titular</label>
                <input 
                  type="text" 
                  placeholder="Ej. Darío Gómez" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="pg-stripe-badge">
                🔒 Pago Seguro Procesado por Stripe (Simulado)
              </div>

              <button type="submit" className="pg-submit-btn" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                Pagar ${finalAmount.toFixed(2)} MXN
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;

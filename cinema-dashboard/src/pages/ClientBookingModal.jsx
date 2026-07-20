import { useState, useEffect } from 'react';
import { bookingApi, roomApi } from '../api/axiosConfig';
import io from 'socket.io-client';
import PaymentGateway from './PaymentGateway';
import ConcessionMenu from './ConcessionMenu';
import './ClientBookingModal.css';

const SOCKET_URL = import.meta.env.VITE_BOOKING_SERVICE_URL.replace('/api/bookings', '');

// PASO 1: Selección de asiento
// PASO 2: Dulcería
// PASO 3: Pago
// PASO 4: Ticket final

const ClientBookingModal = ({ movie, onClose }) => {
  const [step, setStep] = useState(1); // 1=asiento, 2=dulcería, 3=pago, 4=ticket
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedConcessions, setSelectedConcessions] = useState([]);
  const [concessionsTotal, setConcessionsTotal] = useState(0);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    if (!selectedShowtime) return;

    let isMounted = true;
    setLoadingSeats(true);
    setOccupiedSeats([]);
    setSelectedSeat(null);
    setError('');

    const fetchOccupied = async () => {
      try {
        const roomRes = await roomApi.get(`/name/${selectedShowtime.room}`);
        if (isMounted) setRoomInfo(roomRes.data);

        const response = await bookingApi.get(`/movie/${movie._id}/showtime/${selectedShowtime.time}/room/${selectedShowtime.room}`);
        if (isMounted) setOccupiedSeats(response.data.map(t => t.seatNumber));
      } catch (err) {
        console.error("Error fetching seats", err);
        if (isMounted) setError("Error al conectar con la sala. Intenta de nuevo.");
      } finally {
        if (isMounted) setLoadingSeats(false);
      }
    };
    
    fetchOccupied();

    const socket = io(SOCKET_URL);
    socket.on('ticket_sold', (data) => {
      if (data.movieId === movie._id && data.showtime === selectedShowtime.time && data.room === selectedShowtime.room) {
        setOccupiedSeats(prev => [...prev, data.seatNumber]);
        setSelectedSeat(current => {
          if (current === data.seatNumber) {
            setError(`¡Ups! Alguien tomó el asiento ${data.seatNumber}. Selecciona otro.`);
            return null;
          }
          return current;
        });
      }
    });

    return () => { isMounted = false; socket.disconnect(); };
  }, [movie._id, selectedShowtime]);

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;
    setError('');
    setSelectedSeat(seatId);
  };

  const handleConcessionConfirm = (concessions, total) => {
    setSelectedConcessions(concessions);
    setConcessionsTotal(total);
    setStep(3); // ir a pago
  };

  const handleConcessionSkip = () => {
    setSelectedConcessions([]);
    setConcessionsTotal(0);
    setStep(3); // ir a pago igual
  };

  const executeBooking = async (finalAmount, couponCode) => {
    setStep(3);
    try {
      const response = await bookingApi.post('/', {
        movieId: movie._id,
        seatNumber: selectedSeat,
        showtime: selectedShowtime.time,
        room: selectedShowtime.room,
        concessions: selectedConcessions,
        couponCode: couponCode
      });
      setTicket(response.data.ticket);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Error crítico al emitir boleto.');
      setStep(1);
    }
  };

  const totalAmount = (roomInfo?.basePrice || 75) + concessionsTotal;
  const showtimes = movie.showtimes || [];

  // PASO 4: Ticket Final con QR
  if (step === 4 && ticket) {
    return (
      <div className="cp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="cp-modal" style={{ maxWidth: '480px', padding: '0', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #E31E24, #B01219)', padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎟️</div>
            <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>¡Boleto Confirmado!</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '6px 0 0' }}>Tu experiencia cinematográfica está asegurada</p>
          </div>

          <div style={{ padding: '24px', background: 'white', color: '#111' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: 800 }}>{movie.title}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'SALA', value: ticket.room },
                { label: 'FUNCIÓN', value: `${ticket.showtime} hrs` },
                { label: 'ASIENTO', value: ticket.seatNumber, highlight: true },
                { label: 'TOTAL', value: `$${ticket.totalPrice?.toFixed(2) || ticket.price?.toFixed(2)}` },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{ background: '#f5f5f5', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', color: '#999', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: highlight ? '1.4rem' : '1rem', fontWeight: 800, color: highlight ? '#E31E24' : '#111' }}>{value}</div>
                </div>
              ))}
            </div>

            {ticket.concessions?.length > 0 && (
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#E31E24', marginBottom: '8px' }}>🍿 DULCERÍA INCLUIDA</div>
                {ticket.concessions.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#333', marginBottom: '4px' }}>
                    <span>{c.name} x{c.qty}</span>
                    <span>${(c.price * c.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {ticket.pointsEarned > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>⭐</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.9rem' }}>+{ticket.pointsEarned} CinePuntos ganados</div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Se han acreditado a tu cuenta</div>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${ticket._id}`}
                alt="QR Boleto"
                style={{ borderRadius: '8px', border: '4px solid #f5f5f5' }}
              />
              <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '6px', fontFamily: 'monospace', letterSpacing: '1px' }}>
                {ticket._id}
              </p>
            </div>

            <button
              onClick={onClose}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #E31E24, #B01219)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
            >
              ¡LISTO, A DISFRUTAR! 🍿
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PASO 3: Pago
  if (step === 3) {
    return (
      <div className="cp-modal-overlay">
        <PaymentGateway
          amount={totalAmount}
          onPaymentSuccess={executeBooking}
          onCancel={() => setStep(2)}
        />
      </div>
    );
  }

  // PASO 2: Dulcería
  if (step === 2) {
    return (
      <div className="cp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="cp-modal" style={{ maxWidth: '860px', maxHeight: '88vh', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ConcessionMenu
            onConfirm={handleConcessionConfirm}
            onSkip={handleConcessionSkip}
            seatNumber={selectedSeat}
            showtime={selectedShowtime?.time}
            room={selectedShowtime?.room}
          />
        </div>
      </div>
    );
  }

  // PASO 1: Selección de asiento + función
  return (
    <div className="cp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cp-modal" style={{ position: 'relative', maxWidth: '800px' }}>
        <div className="cp-modal-poster-side" style={{ width: '300px' }}>
          <img src={movie.posterUrl} alt={movie.title} className="cp-modal-poster-img" />
        </div>

        <button className="cp-modal-close" onClick={onClose}>×</button>

        <div className="cp-modal-body" style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          {/* Indicador de pasos */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['Asiento', 'Dulcería', 'Pago'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: step >= i + 1 ? 'var(--primary)' : 'var(--dark-surface)',
                  border: `2px solid ${step >= i + 1 ? 'var(--primary)' : 'var(--glass-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: step >= i + 1 ? 'white' : 'var(--text-muted)'
                }}>{i + 1}</div>
                <span style={{ fontSize: '0.75rem', color: step === i + 1 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 700 : 400 }}>{label}</span>
                {i < 2 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>›</span>}
              </div>
            ))}
          </div>

          <p className="cp-modal-eyebrow">🎟️ RESERVAR BOLETO</p>
          <h2 className="cp-modal-title">{movie.title}</h2>

          {/* Selección de función */}
          <div className="cp-showtime-selector">
            <p>1. Selecciona la función</p>
            {showtimes.length === 0 ? (
              <div className="cp-error-msg" style={{ marginTop: '10px' }}>
                Esta película aún no tiene horarios programados.
              </div>
            ) : (
              <div className="cp-showtimes-list">
                {showtimes.map((st, index) => {
                  const isSelected = selectedShowtime?.time === st.time && selectedShowtime?.room === st.room;
                  return (
                    <button
                      key={index}
                      className={`cp-showtime-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedShowtime(st)}
                    >
                      <strong>{st.time}</strong>
                      <span>{st.room}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mapa de asientos */}
          {selectedShowtime && (
            <>
              <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                2. Selecciona tu asiento en {selectedShowtime.room}
              </p>
              {loadingSeats || !roomInfo ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Cargando arquitectura de la sala...
                </div>
              ) : (
                <div className="cp-seat-selection-area">
                  <div className="cp-screen-indicator">PANTALLA</div>
                  <div className="cp-seat-grid">
                    {Array.from({ length: roomInfo.rows }).map((_, rIndex) => {
                      const rowName = String.fromCharCode(65 + rIndex);
                      return (
                        <div key={rowName} className="cp-seat-row">
                          <div className="cp-seat-row-label">{rowName}</div>
                          {Array.from({ length: roomInfo.cols }).map((_, cIndex) => {
                            const seatId = `${rowName}${cIndex + 1}`;
                            const isDisabled = roomInfo.disabledSeats?.includes(seatId);
                            if (isDisabled) return <div key={seatId} style={{ width: '30px', height: '30px' }} />;
                            const isOccupied = occupiedSeats.includes(seatId);
                            const isSelected = selectedSeat === seatId;
                            let className = "cp-seat-btn";
                            if (isOccupied) className += " occupied";
                            else if (isSelected) className += " selected";
                            return (
                              <button key={seatId} className={className} disabled={isOccupied} onClick={() => handleSeatClick(seatId)} title={seatId} />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <div className="cp-seat-legend">
                    <div><span className="cp-seat-dot available"></span> Libre</div>
                    <div><span className="cp-seat-dot selected"></span> Tu Selección</div>
                    <div><span className="cp-seat-dot occupied"></span> Ocupado</div>
                  </div>
                </div>
              )}

              {error && <div className="cp-error-msg">⚠️ {error}</div>}

              <div className="cp-price-tag" style={{ marginTop: '10px' }}>
                <span className="cp-price-label">Asiento: {selectedSeat || '--'} | Total boleto</span>
                <span className="cp-price-amount">
                  <span className="cp-price-currency">$</span>{roomInfo?.basePrice?.toFixed(2) || '0.00'}
                  <span style={{ fontSize: '0.7rem', marginLeft: '4px', color: 'var(--text-muted)' }}>MXN</span>
                </span>
              </div>

              <button
                className="cp-buy-btn"
                onClick={() => setStep(2)}
                disabled={!selectedSeat || loadingSeats}
              >
                🍿 SIGUIENTE: AGREGA TU COMBO
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientBookingModal;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { authApi, bookingApi, catalogApi } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './MyTickets.css';

const TIERS = [
  { name: 'Bronce', min: 0, max: 199, color: '#CD7F32', emoji: '🥉', perks: 'Acceso básico, acumula puntos' },
  { name: 'Plata', min: 200, max: 499, color: '#C0C0C0', emoji: '🥈', perks: 'Prioridad en compras, descuentos especiales' },
  { name: 'Oro', min: 500, max: 999, color: '#FFD700', emoji: '🥇', perks: 'Sala VIP gratuita el día de tu cumpleaños' },
  { name: 'Diamante', min: 1000, max: Infinity, color: '#B9F2FF', emoji: '💎', perks: 'Acceso VIP, boleto gratis mensual' },
];

const getTier = (points) => TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];

const MyTickets = () => {
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('cinema_token');
    if (!token) { navigate('/login'); return; }

    const fetchAll = async () => {
      try {
        const [profileRes, ticketsRes, moviesRes] = await Promise.all([
          authApi.get('/me'),
          bookingApi.get('/mis-boletos'),
          catalogApi.get('/'),
        ]);
        setProfile(profileRes.data.user);
        setTickets(ticketsRes.data);
        setMovies(moviesRes.data);
      } catch (err) {
        setError('No pudimos recuperar tu perfil. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  const getMovieData = (movieId) => movies.find(m => m._id === movieId) || {};

  if (loading) return (
    <div className="cp-app">
      <div className="mt-loader-container">
        <div className="mt-loader"></div>
        <p>Cargando tu perfil CineSanza...</p>
      </div>
    </div>
  );

  const points = profile?.points || 0;
  const tier = getTier(points);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const progressToNext = nextTier
    ? Math.min(100, ((points - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <div className="cp-app mt-page">
      {/* Navbar */}
      <nav className="cp-navbar">
        <span className="cp-logo" onClick={() => navigate('/cartelera')} style={{ cursor: 'pointer' }}>
          CINE<span style={{ fontWeight: 300, letterSpacing: '1px', fontSize: '1.2rem' }}>SANZA</span>
        </span>
        <div className="cp-nav-actions">
          <button className="cp-nav-btn outline" onClick={() => navigate('/cartelera')}>
            ← Cartelera
          </button>
        </div>
      </nav>

      <div className="mt-container">
        {error && <div className="mt-error">{error}</div>}

        {/* === PANEL DE PERFIL / LEALTAD === */}
        {profile && (
          <div className="mt-profile-panel">
            <div className="mt-profile-left">
              <div className="mt-avatar" style={{ borderColor: tier.color }}>
                <span>{tier.emoji}</span>
              </div>
              <div>
                <p className="mt-profile-email">{profile.email}</p>
                <div className="mt-tier-badge" style={{ background: `${tier.color}22`, color: tier.color, borderColor: `${tier.color}55` }}>
                  {tier.emoji} Nivel {tier.name}
                </div>
                <p className="mt-tier-perks">{tier.perks}</p>
              </div>
            </div>

            <div className="mt-profile-right">
              <div className="mt-points-display">
                <span className="mt-points-number">{points.toLocaleString()}</span>
                <span className="mt-points-label">CinePuntos</span>
              </div>

              {nextTier && (
                <div className="mt-progress-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tier.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{nextTier.name} ({nextTier.min} pts)</span>
                  </div>
                  <div className="mt-progress-bar">
                    <div className="mt-progress-fill" style={{ width: `${progressToNext}%`, background: tier.color }} />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                    {nextTier.min - points} puntos para {nextTier.name}
                  </p>
                </div>
              )}

              <div className="mt-stats-row">
                <div className="mt-stat">
                  <span className="mt-stat-val">{tickets.length}</span>
                  <span className="mt-stat-label">Boletos</span>
                </div>
                <div className="mt-stat">
                  <span className="mt-stat-val">${tickets.reduce((s, t) => s + (t.totalPrice || t.price || 0), 0).toFixed(0)}</span>
                  <span className="mt-stat-label">Gastado</span>
                </div>
                <div className="mt-stat">
                  <span className="mt-stat-val">{tickets.reduce((s, t) => s + (t.concessions?.length || 0), 0)}</span>
                  <span className="mt-stat-label">Combos</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === CANJE (promo) === */}
        <div className="mt-redeem-banner">
          <div>
            <h3>💎 Canjea tus CinePuntos</h3>
            <p>Acumula 500 puntos y obtén un boleto gratis en cualquier función</p>
          </div>
          <button className="mt-redeem-btn" disabled title="Próximamente">
            Próximamente 🚀
          </button>
        </div>

        {/* === HISTORIAL DE BOLETOS === */}
        <header className="mt-header">
          <h2>Mis Boletos</h2>
          <p>Tu historial cinematográfico de primera clase</p>
        </header>

        {tickets.length === 0 ? (
          <div className="mt-empty-state">
            <div className="empty-icon">🎟️</div>
            <h2>Aún no tienes boletos</h2>
            <p>Descubre los últimos estrenos en nuestra cartelera y asegura tu lugar.</p>
            <button className="cp-btn-primary" onClick={() => navigate('/cartelera')}>
              Ver Cartelera
            </button>
          </div>
        ) : (
          <div className="mt-grid">
            {tickets.map(ticket => {
              const movie = getMovieData(ticket.movieId);
              const hasCombo = ticket.concessions?.length > 0;
              return (
                <div key={ticket._id} className="mt-ticket-card">
                  <div className="mt-ticket-poster">
                    <img src={movie.posterUrl || 'https://via.placeholder.com/200x300?text=No+Poster'} alt={movie.title} />
                    <div className="mt-ticket-overlay" />
                  </div>

                  <div className="mt-ticket-info">
                    <div className="mt-ticket-top">
                      <span className="mt-eyebrow">BOLETO CINESANZA</span>
                      <h2 className="mt-title">{movie.title || 'Película'}</h2>
                    </div>

                    <div className="mt-ticket-details">
                      <div className="mt-detail-block">
                        <span className="mt-label">ASIENTO</span>
                        <span className="mt-value highlight">{ticket.seatNumber}</span>
                      </div>
                      <div className="mt-detail-block">
                        <span className="mt-label">SALA</span>
                        <span className="mt-value">{ticket.room}</span>
                      </div>
                      <div className="mt-detail-block">
                        <span className="mt-label">FUNCIÓN</span>
                        <span className="mt-value">{ticket.showtime}h</span>
                      </div>
                      <div className="mt-detail-block">
                        <span className="mt-label">TOTAL</span>
                        <span className="mt-value">${(ticket.totalPrice || ticket.price || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {hasCombo && (
                      <div className="mt-combo-tag">
                        🍿 {ticket.concessions.map(c => c.name).join(', ')}
                      </div>
                    )}

                    {ticket.pointsEarned > 0 && (
                      <div className="mt-points-earned">
                        ⭐ +{ticket.pointsEarned} CinePuntos ganados
                      </div>
                    )}

                    <div className="mt-ticket-barcode">
                      <div className="mt-barcode-lines" />
                      <span className="mt-ticket-id">REF: {ticket._id.substring(ticket._id.length - 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;

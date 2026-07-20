// src/pages/PublicCatalog.jsx — Diseño Estratosférico Premium (Cinépolis Style)
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import ClientBookingModal from './ClientBookingModal';
import { authApi } from '../api/axiosConfig';
import { getUserRole } from '../utils/authUtils';
import ReactPlayer from 'react-player';
import './Cinepolis.css';

const GENRES_ALL = ['Todos', 'Acción', 'Aventura', 'Ciencia Ficción', 'Terror', 'Drama', 'Comedia', 'Fantasía', 'Thriller', 'Animación', 'Musical'];

const PublicCatalog = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeGenre, setActiveGenre] = useState('Todos');
  const [userPoints, setUserPoints] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [activeTrailer, setActiveTrailer] = useState(null); // URL del trailer activo
  const [activeHeroIndex, setActiveHeroIndex] = useState(0); // Índice del carrusel hero
  const navigate = useNavigate();
  const role = getUserRole();
  const token = localStorage.getItem('cinema_token');

  useEffect(() => {
    // Cargar películas en cartelera
    axios.get(`${import.meta.env.VITE_CATALOG_SERVICE_URL}?status=CARTELERA`)
      .then(res => setMovies(res.data))
      .catch(err => console.error("Error cargando películas", err))
      .finally(() => setLoading(false));

    // Cargar puntos del usuario si está logueado
    if (token) {
      authApi.get('/me')
        .then(res => {
          setUserPoints(res.data.user.points);
          setUserEmail(res.data.user.email);
        })
        .catch(err => console.error("Error al cargar puntos", err));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('cinema_token');
    window.location.reload();
  };

  const handleBuyTicket = (movie) => {
    if (!token) {
      navigate('/login');
    } else {
      setSelectedMovie(movie);
    }
  };

  // Películas destacadas en el hero (isHighlight o la primera con backdrop)
  const highlightMovies = movies.filter(m => m.isHighlight);
  const heroMovies = highlightMovies.length > 0 ? highlightMovies : (movies.length > 0 ? [movies[0]] : []);
  const heroMovie = heroMovies[activeHeroIndex] || null;

  // Auto-rotación del carrusel cada 10 segundos
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);
  
  const filteredMovies = activeGenre === 'Todos'
    ? movies
    : movies.filter(m => m.genres.includes(activeGenre));

  // Extractor de ID de YouTube
  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };
  const heroVideoId = heroMovie ? getYoutubeId(heroMovie.trailerUrl) : null;

  if (loading) {
    return (
      <div className="cp-app">
        <div className="cp-loader">
          <div className="cp-loader-spinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '2px' }}>CARGANDO CARTELERA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-app">
      {/* ===== NAVBAR ===== */}
      <nav className="cp-navbar">
        <span className="cp-logo">CINE<span style={{ fontWeight: 300, letterSpacing: '1px', fontSize: '1.2rem' }}>SANZA</span></span>

        <ul className="cp-nav-links">
          <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveGenre('Todos'); }}>Películas</a></li>
          <li><Link to="/mis-boletos">Club CinePuntos</Link></li>
          <li className="promo-nav-link" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>🍿 2x1 Martes</li>
        </ul>

        <div className="cp-nav-actions">
          {token && userPoints !== null && (
            <div className="cp-nav-points-badge" onClick={() => navigate('/mis-boletos')} style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '50px',
              padding: '6px 16px',
              marginRight: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: 'var(--gold)' }}>⭐</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold)' }}>{userPoints} CinePuntos</span>
            </div>
          )}

          {role === 'ADMIN' || role === 'MANAGER' ? (
            <Link to="/dashboard" className="cp-nav-btn admin" style={{ marginRight: '10px' }}>
              ⚙️ Panel Admin
            </Link>
          ) : null}

          {token ? (
            <>
              <Link to="/mis-boletos" className="cp-nav-btn outline" style={{ marginRight: '10px' }}>Mi Perfil</Link>
              <button className="cp-nav-btn outline" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="cp-nav-btn outline">Iniciar Sesión</Link>
              <Link to="/login" className="cp-nav-btn filled">Comprar Boletos</Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== HERO BANNER (NETFLIX STYLE) ===== */}
      {heroMovie && (
        <section className="cp-hero" style={{ overflow: 'hidden' }}>
          
          {/* Background Dinámico (Tráiler Auto-Play o Imagen) */}
          <div className="cp-hero-bg-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: 'transparent' }}>
            {heroVideoId ? (
              <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
                <iframe
                  key={heroVideoId}
                  src={`https://www.youtube-nocookie.com/embed/${heroVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${heroVideoId}&modestbranding=1&playsinline=1`}
                  title="Background Trailer"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  style={{
                    width: '100vw',
                    height: '56.25vw', /* Aspect ratio 16:9 */
                    minHeight: '100vh',
                    minWidth: '177.77vh', /* 16:9 ratio -> 16/9 = 1.7777 */
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}
                />
                {/* Overlay Oscuro para asegurar que el texto sea legible */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.9) 100%)' }} />
              </div>
            ) : (
              <div
                className="cp-hero-bg"
                style={{ 
                  backgroundImage: `url(${heroMovie.backdropUrl || heroMovie.posterUrl})`,
                  filter: 'brightness(0.35) contrast(1.1)',
                  width: '100%', height: '100%',
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }}
              />
            )}
          </div>

          <div className="cp-hero-content" style={{ position: 'relative', zIndex: 1 }}>
            <div className="cp-hero-badge">
              <span>🔥</span>
              <span>DESTACADA DE LA SEMANA</span>
            </div>

            <h1 className="cp-hero-title">{heroMovie.title}</h1>
            {heroMovie.originalTitle && (
              <p className="cp-hero-subtitle-orig" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '-10px 0 15px', fontStyle: 'italic', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {heroMovie.originalTitle}
              </p>
            )}

            <div className="cp-hero-meta" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <span className="cp-hero-year" style={{ background: 'var(--glass)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {heroMovie.year}
              </span>
              <span className="cp-hero-rating" style={{ background: '#E31E24', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '900' }}>
                {heroMovie.rating}
              </span>
              <span className="cp-hero-duration" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                🎬 {heroMovie.duration} min
              </span>
              <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.95rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                ★ {heroMovie.imdbRating?.toFixed(1) || '7.5'} IMDb
              </span>
            </div>

            <p className="cp-hero-desc" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>{heroMovie.description}</p>

            <div className="cp-hero-actions">
              <button
                className="cp-btn-primary"
                onClick={() => handleBuyTicket(heroMovie)}
              >
                <span className="play-icon">🎟️</span>
                Comprar Boleto
              </button>
              {heroMovie.trailerUrl && (
                <button className="cp-btn-secondary" onClick={() => setActiveTrailer(heroMovie.trailerUrl)}>
                  ▶ Reproducir Tráiler (Completo)
                </button>
              )}
            </div>
            
            {/* Controles de Navegación del Carrusel */}
            {heroMovies.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px' }}>
                <button 
                  onClick={() => setActiveHeroIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)}
                  style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7 }}
                >
                  ◀
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {heroMovies.map((_, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveHeroIndex(idx)}
                      style={{ 
                        width: activeHeroIndex === idx ? '24px' : '8px', 
                        height: '8px', 
                        borderRadius: '4px', 
                        background: activeHeroIndex === idx ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setActiveHeroIndex((prev) => (prev + 1) % heroMovies.length)}
                  style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7 }}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          <div className="cp-hero-scroll-hint" style={{ position: 'relative', zIndex: 1 }}>
            <span>CARTELERA ACTIVA</span>
            <span>↓</span>
          </div>
        </section>
      )}

      {/* ===== CATALOG SECTION ===== */}
      <section className="cp-catalog-section">
        <div className="cp-section-header">
          <div className="cp-section-title-block">
            <p className="cp-section-eyebrow">EN CARTELERA</p>
            <h2 className="cp-section-title">Estrenos de la Semana</h2>
          </div>
          <p className="cp-section-subtitle">{movies.length} películas disponibles</p>
        </div>

        {/* Filtros de Género */}
        <div className="cp-filter-bar">
          {GENRES_ALL.map(genre => (
            <button
              key={genre}
              className={`cp-filter-chip ${activeGenre === genre ? 'active' : ''}`}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Grid de Películas */}
        <div className="cp-movies-grid">
          {filteredMovies.map((movie, index) => (
            <div key={movie._id} className="cp-movie-card">
              <div className="cp-movie-poster-wrap">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="cp-movie-poster" 
                  onError={(e) => { 
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = 'https://placehold.co/500x750/111111/FFFFFF?text=Poster+No+Disponible'; 
                  }}
                />

                <div className="cp-movie-badges">
                  {movie.isHighlight && <span className="cp-badge new" style={{ background: 'var(--gold)', color: '#000' }}>DESTACADA</span>}
                  <span className="cp-badge rating">{movie.rating}</span>
                </div>

                <div className="cp-movie-overlay" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                  <button
                    className="cp-movie-quick-buy"
                    onClick={() => handleBuyTicket(movie)}
                  >
                    🎟️ COMPRAR BOLETO
                  </button>
                  {movie.trailerUrl && (
                    <button
                      className="cp-movie-quick-buy"
                      style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid white', color: 'white' }}
                      onClick={(e) => { e.stopPropagation(); setActiveTrailer(movie.trailerUrl); }}
                    >
                      ▶ VER TRÁILER
                    </button>
                  )}
                </div>
              </div>

              <div className="cp-movie-card-info">
                <h3 className="cp-movie-card-title" title={movie.title}>{movie.title}</h3>
                <div className="cp-movie-card-meta">
                  <span className="cp-movie-card-year">{movie.year} · {movie.duration} min</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.85rem' }}>★ {movie.imdbRating?.toFixed(1) || '0.0'}</span>
                </div>
                <p className="cp-movie-card-dir">Dir. {movie.director}</p>
                <div className="cp-genre-tags">
                  {movie.genres.slice(0, 3).map((g, i) => (
                    <span key={i} className="cp-genre-tag">{g}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== VIDEO TRAILER MODAL ===== */}
      {activeTrailer && (
        <div className="cp-modal-overlay" onClick={() => setActiveTrailer(null)} style={{ zIndex: 10000 }}>
          <div className="cp-modal" style={{ maxWidth: '800px', width: '90%', padding: '0', background: '#000', overflow: 'hidden', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button className="cp-modal-close" onClick={() => setActiveTrailer(null)} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>×</button>
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}>
              <iframe
                key={activeTrailer}
                src={`https://www.youtube.com/embed/${getYoutubeId(activeTrailer)}?autoplay=1&rel=0`}
                title="Movie Trailer"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== CTA STRIP ===== */}
      <div className="cp-cta-strip">
        <div className="cp-cta-strip-text">
          <h2>¿Listo para la experiencia?</h2>
          <p>Selecciona tu película, elige tu asiento y vive el cine como nunca.</p>
        </div>
        <button
          className="cp-btn-primary"
          onClick={() => heroMovie && handleBuyTicket(heroMovie)}
          style={{ flexShrink: 0 }}
        >
          🎬 COMPRAR AHORA
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="cp-footer">
        <p>© 2025 <strong>CineSanza SaaS</strong> · Plataforma construida con microservicios de clase empresarial</p>
      </footer>

      {/* ===== MODAL DE COMPRA ===== */}
      {selectedMovie && (
        <ClientBookingModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
};

export default PublicCatalog;

import { useState, useEffect } from 'react';
import { catalogApi as api } from '../api/axiosConfig';
import MovieModal from './MovieModal';
import { getUserRole } from '../utils/authUtils';
import './Dashboard.css';

const Dashboard = () => {
  const role = getUserRole();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  
  // Filtros locales
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CARTELERA, COLECCION

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await api.get('/'); 
      setMovies(response.data);
    } catch (err) {
      setError('Fallo al sincronizar con la base de datos de Atlas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Alerta: Estás seguro de borrar este registro de la base de datos?')) {
      try {
        await api.delete(`/${id}`);
        setMovies(movies.filter(movie => movie._id !== id));
      } catch (err) {
        alert('Error al intentar eliminar la película.');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await api.patch(`/${id}/toggle-status`);
      setMovies(movies.map(m => m._id === id ? { ...m, status: response.data.status, showtimes: response.data.showtimes } : m));
    } catch (err) {
      alert('Error al cambiar el estado de la cartelera.');
    }
  };

  const handleToggleHighlight = async (id) => {
    try {
      const response = await api.patch(`/${id}/toggle-highlight`);
      setMovies(movies.map(m => m._id === id ? { ...m, isHighlight: response.data.isHighlight } : m));
    } catch (err) {
      alert('Error al cambiar el destaque.');
    }
  };

  // Filtrado
  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.director.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container" style={{ padding: '30px', margin: 0, height: '100%', overflowY: 'auto' }}>
      <div className="dashboard-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Catálogo de Películas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            {movies.length} películas en total · {movies.filter(m => m.status === 'CARTELERA').length} en cartelera
          </p>
        </div>
        <div>
          {role === 'ADMIN' && (
            <button 
              className="btn-primary"
              onClick={() => {
                setCurrentMovie(null); 
                setIsModalOpen(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #E31E24, #B01219)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              + Nueva Película
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="admin-filters-bar" style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '35px',
        alignItems: 'center',
        background: 'var(--dark-card)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Buscar por título o director..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'var(--dark-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: 'ALL', label: 'Todas' },
            { value: 'CARTELERA', label: 'En Cartelera 🎟️' },
            { value: 'COLECCION', label: 'Colección/Archivo 📦' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1.5px solid',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: statusFilter === opt.value ? 'rgba(227, 30, 36, 0.12)' : 'transparent',
                color: statusFilter === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                borderColor: statusFilter === opt.value ? 'var(--primary)' : 'var(--glass-border)'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="status-message">Conectando con Atlas y recuperando datos...</div>}
      {error && <div className="status-message" style={{ color: '#f87171' }}>{error}</div>}

      {!loading && !error && filteredMovies.length === 0 && (
        <div className="status-message">No se encontraron películas que coincidan con la búsqueda.</div>
      )}

      <div className="movies-grid">
        {filteredMovies.map((movie) => (
          <div key={movie._id} className="movie-card" style={{
            background: 'var(--dark-card)',
            border: movie.status === 'CARTELERA' ? '1px solid rgba(227,30,36,0.25)' : '1px solid var(--glass-border)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s'
          }}>
            
            <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
              <img src={movie.posterUrl} alt={movie.title} className="movie-poster" style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                display: 'flex',
                gap: '6px'
              }}>
                <span style={{
                  background: movie.status === 'CARTELERA' ? '#E31E24' : '#444',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px'
                }}>
                  {movie.status === 'CARTELERA' ? 'CARTELERA' : 'ARCHIVADA'}
                </span>

                {movie.isHighlight && (
                  <span style={{
                    background: 'var(--gold)',
                    color: 'black',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    🌟 DESTACADA
                  </span>
                )}
              </div>

              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.8)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: 'var(--gold)'
              }}>
                ★ {movie.imdbRating?.toFixed(1) || '0.0'}
              </div>
            </div>
            
            <div className="movie-info" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="movie-header" style={{ marginBottom: '10px' }}>
                <h2 className="movie-title" style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'white' }}>{movie.title}</h2>
                <span className="movie-year" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{movie.year} · {movie.duration} min</span>
              </div>
              
              <div className="movie-director" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '10px' }}>
                Dir. {movie.director}
              </div>
              
              <div className="movie-description" style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4',
                marginBottom: '15px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flex: 1
              }}>
                {movie.description}
              </div>
              
              {/* Horarios activos */}
              {movie.status === 'CARTELERA' && (
                <div style={{ marginBottom: '15px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    Horarios Programados ({movie.showtimes?.length || 0}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {movie.showtimes?.slice(0, 4).map((st, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', background: 'var(--dark-surface)', border: '1px solid var(--glass-border)', padding: '2px 6px', borderRadius: '4px' }}>
                        {st.time} ({st.room})
                      </span>
                    ))}
                    {movie.showtimes?.length > 4 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{movie.showtimes.length - 4} más</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="card-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                <button 
                  onClick={() => handleToggleStatus(movie._id)}
                  style={{
                    gridColumn: '1 / span 2',
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: movie.status === 'CARTELERA' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: movie.status === 'CARTELERA' ? '#ef4444' : '#10b981',
                    border: `1px solid ${movie.status === 'CARTELERA' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`
                  }}
                >
                  {movie.status === 'CARTELERA' ? '📦 Archivar / Quitar de Cartelera' : '🎟️ Lanzar a Cartelera'}
                </button>

                <button 
                  onClick={() => handleToggleHighlight(movie._id)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: movie.isHighlight ? 'var(--gold)' : 'transparent',
                    color: movie.isHighlight ? 'black' : 'var(--text-secondary)'
                  }}
                >
                  ⭐ Destacar
                </button>

                <button 
                  onClick={() => {
                    setCurrentMovie(movie);
                    setIsModalOpen(true);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'transparent',
                    color: 'white'
                  }}
                >
                  📝 Editar / Horarios
                </button>

                {role === 'ADMIN' && (
                  <button 
                    onClick={() => handleDelete(movie._id)}
                    style={{
                      gridColumn: '1 / span 2',
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(239,68,68,0.2)',
                      color: '#ef4444',
                      marginTop: '4px'
                    }}
                  >
                    Eliminar Permanente
                  </button>
                )}
              </div>
            </div>
            
          </div>
        ))}
      </div>

      <MovieModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchMovies}
        movieToEdit={currentMovie}
      />
    </div>
  );
};

export default Dashboard;

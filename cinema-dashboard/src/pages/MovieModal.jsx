import { useState, useEffect } from 'react';
import { catalogApi as api, roomApi } from '../api/axiosConfig';
import './MovieModal.css';

const MovieModal = ({ isOpen, onClose, onSave, movieToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    originalTitle: '',
    director: '',
    cast: '',
    year: '',
    duration: 120,
    description: '',
    genres: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    rating: 'B',
    imdbRating: 7.0,
    status: 'CARTELERA',
    isHighlight: false,
    format: ['2D'],
    showtimes: []
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        ...movieToEdit,
        genres: movieToEdit.genres ? movieToEdit.genres.join(', ') : '',
        cast: movieToEdit.cast ? movieToEdit.cast.join(', ') : '',
        showtimes: movieToEdit.showtimes || []
      });
    } else {
      setFormData({
        title: '', originalTitle: '', director: '', cast: '', year: '', duration: 120,
        description: '', genres: '', posterUrl: '', backdropUrl: '', trailerUrl: '',
        rating: 'B', imdbRating: 7.0, status: 'CARTELERA', isHighlight: false, format: ['2D'], showtimes: []
      });
    }
    setError('');

    const fetchRooms = async () => {
      try {
        const response = await roomApi.get('/');
        setRooms(response.data);
      } catch (err) {
        console.error("No se pudieron cargar las salas");
      }
    };
    fetchRooms();
  }, [movieToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const addShowtime = () => {
    setFormData({
      ...formData,
      showtimes: [...formData.showtimes, { 
        time: '18:00', 
        room: rooms.length > 0 ? rooms[0].name : 'Sala 1', 
        date: 'HOY', 
        format: '2D', 
        language: 'Español' 
      }]
    });
  };

  const updateShowtime = (index, field, value) => {
    const newShowtimes = [...formData.showtimes];
    newShowtimes[index][field] = value;
    setFormData({ ...formData, showtimes: newShowtimes });
  };

  const removeShowtime = (index) => {
    const newShowtimes = formData.showtimes.filter((_, i) => i !== index);
    setFormData({ ...formData, showtimes: newShowtimes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      year: Number(formData.year),
      duration: Number(formData.duration),
      imdbRating: Number(formData.imdbRating),
      genres: formData.genres.split(',').map(g => g.trim()).filter(g => g !== ''),
      cast: formData.cast.split(',').map(c => c.trim()).filter(c => c !== '')
    };

    try {
      if (movieToEdit) {
        await api.put(`/${movieToEdit._id}`, payload);
      } else {
        await api.post('/', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar los datos de la película.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--dark-card)', border: '1px solid var(--glass-border)', color: 'white' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', color: 'var(--primary)' }}>
          {movieToEdit ? 'Editar Película' : 'Registrar Nueva Obra'}
        </h2>
        
        {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</div>}
        
        <form className="modal-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <div className="form-group">
            <label>Título en Español</label>
            <input name="title" value={formData.title} onChange={handleChange} className="glass-input" required />
          </div>

          <div className="form-group">
            <label>Título Original</label>
            <input name="originalTitle" value={formData.originalTitle} onChange={handleChange} className="glass-input" />
          </div>
          
          <div className="form-group">
            <label>Director</label>
            <input name="director" value={formData.director} onChange={handleChange} className="glass-input" required />
          </div>

          <div className="form-group">
            <label>Duración (minutos)</label>
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="glass-input" required />
          </div>
          
          <div className="form-group">
            <label>Año de Lanzamiento</label>
            <input type="number" name="year" value={formData.year} onChange={handleChange} className="glass-input" required />
          </div>

          <div className="form-group">
            <label>Clasificación (Rating)</label>
            <select name="rating" value={formData.rating} onChange={handleChange} className="glass-input">
              <option value="A">Clasificación A (Todo Público)</option>
              <option value="B">Clasificación B (12+ años)</option>
              <option value="B15">Clasificación B15 (15+ años)</option>
              <option value="C">Clasificación C (Adultos 18+)</option>
              <option value="D">Clasificación D (Adultos exclusivo)</option>
            </select>
          </div>

          <div className="form-group">
            <label>IMDb Rating (0.0 - 10.0)</label>
            <input type="number" step="0.1" name="imdbRating" value={formData.imdbRating} onChange={handleChange} className="glass-input" />
          </div>

          <div className="form-group">
            <label>Estado en el Cine</label>
            <select name="status" value={formData.status} onChange={handleChange} className="glass-input">
              <option value="CARTELERA">🎟️ En Cartelera Activa</option>
              <option value="COLECCION">📦 En Colección (Archivada)</option>
            </select>
          </div>
          
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>URL del Póster (Imagen vertical 2:3)</label>
            <input name="posterUrl" value={formData.posterUrl} onChange={handleChange} className="glass-input" required placeholder="https://ejemplo.com/poster.jpg" />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>URL del Backdrop (Imagen horizontal 16:9)</label>
            <input name="backdropUrl" value={formData.backdropUrl} onChange={handleChange} className="glass-input" placeholder="https://ejemplo.com/background.jpg" />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>URL del Tráiler de YouTube</label>
            <input name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="glass-input" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Géneros (separados por coma)</label>
            <input name="genres" placeholder="Ej. Acción, Ciencia Ficción, Aventura" value={formData.genres} onChange={handleChange} className="glass-input" required />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Reparto principal (separado por coma)</label>
            <input name="cast" placeholder="Ej. Tom Cruise, Glen Powell" value={formData.cast} onChange={handleChange} className="glass-input" />
          </div>
          
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Sinopsis / Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="glass-input" required style={{ minHeight: '80px' }} />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" name="isHighlight" checked={formData.isHighlight} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              <label style={{ margin: 0, cursor: 'pointer' }}>Marcar como película destacada en Banner Principal (Hero)</label>
            </div>
          </div>

          {/* Horarios y salas */}
          <div className="form-group" style={{ gridColumn: 'span 2', background: 'var(--dark-surface)', padding: '15px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ margin: 0 }}>Horarios, Salas y Formatos</label>
              <button type="button" onClick={addShowtime} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                + Añadir Horario
              </button>
            </div>
            
            {formData.showtimes.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay horarios programados. La película no aparecerá para la venta.</p>
            )}

            {formData.showtimes.map((st, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                <input 
                  type="time" 
                  value={st.time} 
                  onChange={(e) => updateShowtime(i, 'time', e.target.value)} 
                  className="glass-input" 
                  required 
                />
                
                <select 
                  value={st.room} 
                  onChange={(e) => updateShowtime(i, 'room', e.target.value)} 
                  className="glass-input"
                  required
                >
                  <option value="">-- Sala --</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r.name}>{r.name}</option>
                  ))}
                  {rooms.length === 0 && <option value="Sala 1">Sala 1</option>}
                </select>

                <select
                  value={st.date}
                  onChange={(e) => updateShowtime(i, 'date', e.target.value)}
                  className="glass-input"
                >
                  <option value="HOY">HOY</option>
                  <option value="MAÑANA">MAÑANA</option>
                  <option value="+2 días">+2 días</option>
                  <option value="+3 días">+3 días</option>
                </select>

                <select
                  value={st.format || '2D'}
                  onChange={(e) => updateShowtime(i, 'format', e.target.value)}
                  className="glass-input"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                  <option value="MacroXE">MacroXE</option>
                </select>

                <button type="button" onClick={() => removeShowtime(i)} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '10px 14px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="modal-actions" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="modal-btn cancel-btn" onClick={onClose} disabled={loading} style={{ padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white' }}>
              CANCELAR
            </button>
            <button type="submit" className="modal-btn save-btn" disabled={loading} style={{ padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(135deg, #E31E24, #B01219)', color: 'white', border: 'none', fontWeight: 'bold' }}>
              {loading ? 'Guardando...' : (movieToEdit ? 'ACTUALIZAR' : 'GUARDAR')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieModal;

import { useState, useEffect } from 'react';
import { roomApi } from '../api/axiosConfig';

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ name: '', rows: 5, cols: 10, basePrice: 75, disabledSeats: [] });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomApi.get('/');
      setRooms(response.data);
    } catch (err) {
      setError('Error al cargar salas');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatId) => {
    setFormData(prev => {
      const isCurrentlyDisabled = prev.disabledSeats.includes(seatId);
      if (isCurrentlyDisabled) {
        // Habilitarlo (quitarlo del array)
        return { ...prev, disabledSeats: prev.disabledSeats.filter(id => id !== seatId) };
      } else {
        // Deshabilitarlo (añadirlo al array)
        return { ...prev, disabledSeats: [...prev.disabledSeats, seatId] };
      }
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await roomApi.post('/', formData);
      setIsCreating(false);
      setFormData({ name: '', rows: 5, cols: 10, basePrice: 75, disabledSeats: [] });
      fetchRooms();
    } catch (err) {
      alert('Error al crear sala');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('¿Eliminar sala definitivamente?')) return;
    try {
      await roomApi.delete(`/${id}`);
      fetchRooms();
    } catch (err) {
      alert('Error al eliminar sala');
    }
  };

  if (loading) return <div style={{ padding: '30px', color: 'white' }}>Cargando Gestor de Salas...</div>;

  return (
    <div style={{ padding: '30px', color: 'white', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Gestor Visual de Salas</h1>
        <button className="cp-btn cp-btn-primary" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancelar' : '+ Nueva Sala (Constructor)'}
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>}

      {isCreating && (
        <div style={{ background: '#111', padding: '30px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--gold)' }}>🛠️ Constructor de Arquitectura</h3>
          
          <div style={{ display: 'flex', gap: '40px' }}>
            {/* Formulario */}
            <form onSubmit={handleCreate} style={{ flex: '0 0 300px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nombre de la Sala</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '6px' }} placeholder="Ej. MacroXE" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Filas</label>
                  <input type="number" min="1" max="26" value={formData.rows} onChange={e => setFormData({...formData, rows: parseInt(e.target.value), disabledSeats: []})} required style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Columnas</label>
                  <input type="number" min="1" max="30" value={formData.cols} onChange={e => setFormData({...formData, cols: parseInt(e.target.value), disabledSeats: []})} required style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                </div>
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Precio Base ($)</label>
                <input type="number" step="0.01" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})} required style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
              </div>
              
              <div style={{ background: '#222', padding: '15px', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '20px', borderLeft: '4px solid var(--gold)' }}>
                <strong>Instrucciones:</strong> Haz clic en los asientos de la cuadrícula de la derecha para desactivarlos. Útil para pasillos o columnas.
              </div>

              <button type="submit" className="cp-btn cp-btn-primary" style={{ width: '100%' }}>Guardar Arquitectura</button>
            </form>

            {/* Lienzo Visual (Canvas) */}
            <div style={{ flex: 1, background: '#1a1a1a', padding: '30px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#fff', color: '#000', width: '80%', padding: '5px', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '40px', boxShadow: '0 0 15px rgba(255,255,255,0.2)' }}>
                PANTALLA
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from({ length: formData.rows || 1 }).map((_, rIndex) => {
                  const rowName = String.fromCharCode(65 + rIndex);
                  return (
                    <div key={rowName} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', textAlign: 'right', fontWeight: 'bold', color: '#888' }}>{rowName}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {Array.from({ length: formData.cols || 1 }).map((_, cIndex) => {
                          const colNum = cIndex + 1;
                          const seatId = `${rowName}${colNum}`;
                          const isDisabled = formData.disabledSeats.includes(seatId);

                          return (
                            <div 
                              key={seatId} 
                              onClick={() => toggleSeat(seatId)}
                              style={{ 
                                width: '25px', 
                                height: '25px', 
                                borderRadius: '4px 4px 10px 10px', 
                                background: isDisabled ? 'transparent' : 'var(--gold)', 
                                border: isDisabled ? '1px dashed #444' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title={seatId}
                            />
                          );
                        })}
                      </div>
                      <div style={{ width: '20px', textAlign: 'left', fontWeight: 'bold', color: '#888' }}>{rowName}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Salas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {rooms.map(room => (
          <div key={room._id} style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333', position: 'relative' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--gold)' }}>{room.name}</h3>
            <p style={{ margin: '5px 0', color: '#aaa' }}>Dimensiones: {room.rows}x{room.cols}</p>
            <p style={{ margin: '5px 0', color: '#aaa' }}>Asientos Deshabilitados: {room.disabledSeats?.length || 0}</p>
            <p style={{ margin: '5px 0', color: '#10b981', fontWeight: 'bold' }}>Precio Base: ${room.basePrice.toFixed(2)}</p>
            
            <button onClick={() => handleDelete(room._id)} style={{ marginTop: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}>
              🗑️ Eliminar Sala
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomManager;

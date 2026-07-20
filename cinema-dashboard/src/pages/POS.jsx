import { useState, useEffect } from 'react';
import { catalogApi, bookingApi, roomApi } from '../api/axiosConfig';
import io from 'socket.io-client';
import './Dashboard.css'; 

const SOCKET_URL = import.meta.env.VITE_BOOKING_SERVICE_URL.replace('/api/bookings', '');

const POS = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  
  const [roomInfo, setRoomInfo] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Cargar Cartelera
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await catalogApi.get('/');
        setMovies(res.data);
      } catch (err) {
        setMessage('Error al cargar la cartelera.');
      }
    };
    fetchMovies();
  }, []);

  // 2. Cargar Asientos y Sala cuando se elige una función
  useEffect(() => {
    if (!selectedShowtime || !selectedMovie) return;
    
    let isMounted = true;
    setLoadingSeats(true);
    setOccupiedSeats([]);
    setSelectedSeat(null);
    setMessage('');

    const fetchOccupied = async () => {
      try {
        const roomRes = await roomApi.get(`/name/${selectedShowtime.room}`);
        if (isMounted) setRoomInfo(roomRes.data);

        const response = await bookingApi.get(`/movie/${selectedMovie._id}/showtime/${selectedShowtime.time}/room/${selectedShowtime.room}`);
        if (isMounted) setOccupiedSeats(response.data.map(t => t.seatNumber));
      } catch (err) {
        if (isMounted) setMessage("Error al conectar con la sala.");
      } finally {
        if (isMounted) setLoadingSeats(false);
      }
    };
    fetchOccupied();

    const socket = io(SOCKET_URL);
    socket.on('ticket_sold', (data) => {
      if (data.movieId === selectedMovie._id && data.showtime === selectedShowtime.time && data.room === selectedShowtime.room) {
        setOccupiedSeats(prev => [...prev, data.seatNumber]);
        setSelectedSeat(current => {
          if (current === data.seatNumber) {
            setMessage(`⚠️ Otro cajero o cliente acaba de vender el asiento ${data.seatNumber}.`);
            return null;
          }
          return current;
        });
      }
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [selectedMovie, selectedShowtime]);

  const handleSale = async () => {
    if(!selectedMovie || !selectedShowtime || !selectedSeat) return;
    setLoading(true);
    setMessage('');

    try {
      const response = await bookingApi.post('/', {
        movieId: selectedMovie._id,
        seatNumber: selectedSeat,
        showtime: selectedShowtime.time,
        room: selectedShowtime.room
      });
      setMessage(`[PRINT]`);
      // We keep selectedSeat to show it on the receipt before closing
    } catch (err) {
      setMessage(`❌ ERROR: ${err.response?.data?.message || 'Fallo en la transacción'}`);
      setSelectedSeat(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = (e) => {
    const mId = e.target.value;
    if(!mId) {
      setSelectedMovie(null);
      setSelectedShowtime(null);
      return;
    }
    const movie = movies.find(m => m._id === mId);
    setSelectedMovie(movie);
    setSelectedShowtime(null);
  };

  return (
    <div className="dashboard-container" style={{ padding: '30px', overflowY: 'auto', height: '100%' }}>
      <div className="dashboard-header" style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#60a5fa' }}>💻 Terminal POS: Venta Física</h1>
        <div>
          <button className="add-btn" style={{ background: 'rgba(156, 163, 175, 0.8)', marginRight: '10px' }} onClick={() => window.location.href = '/dashboard'}>Volver</button>
          <button className="action-btn delete-btn" onClick={() => { localStorage.removeItem('cinema_token'); window.location.href = '/login'; }}>Salir</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        {/* PANEL IZQUIERDO: SELECCIÓN Y PAGO */}
        <div style={{ flex: '0 0 350px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="form-group">
            <label>1. Seleccionar Película</label>
            <select className="glass-input" onChange={handleMovieSelect} value={selectedMovie?._id || ''}>
              <option value="">-- Elige una película --</option>
              {movies.map(movie => (
                <option key={movie._id} value={movie._id}>{movie.title}</option>
              ))}
            </select>
          </div>

          {selectedMovie && (
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>2. Seleccionar Horario y Sala</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {selectedMovie.showtimes.map((st, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedShowtime(st)}
                    style={{ 
                      padding: '8px 12px', 
                      background: selectedShowtime?.time === st.time && selectedShowtime?.room === st.room ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedShowtime?.time === st.time && selectedShowtime?.room === st.room ? '#60a5fa' : 'rgba(255,255,255,0.2)'}`,
                      color: selectedShowtime?.time === st.time && selectedShowtime?.room === st.room ? '#60a5fa' : 'white',
                      borderRadius: '6px', cursor: 'pointer' 
                    }}
                  >
                    {st.time} ({st.room})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <h3 style={{ color: '#aaa', margin: '0 0 10px 0', fontSize: '0.9rem' }}>RESUMEN DE VENTA</h3>
            <p style={{ margin: '5px 0' }}>Asiento: <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{selectedSeat || '--'}</span></p>
            <p style={{ margin: '5px 0' }}>Total a Cobrar: <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>${roomInfo?.basePrice ? roomInfo.basePrice.toFixed(2) : '0.00'}</span></p>
            
            <button 
              onClick={handleSale}
              disabled={!selectedSeat || loading}
              style={{ width: '100%', padding: '12px', background: '#60a5fa', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '6px', marginTop: '15px', cursor: (!selectedSeat || loading) ? 'not-allowed' : 'pointer', opacity: (!selectedSeat || loading) ? 0.5 : 1 }}
            >
              {loading ? 'EMITIENDO...' : 'IMPRIMIR BOLETO'}
            </button>
          </div>

          {message === '[PRINT]' ? (
            <div style={{ marginTop: '20px', padding: '20px', background: 'white', color: 'black', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #ccc', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative' }}>
              <div style={{ borderBottom: '2px dashed #ccc', paddingBottom: '10px', marginBottom: '10px', textAlign: 'center' }}>
                <h3 style={{ margin: '0' }}>CINE SANZA</h3>
                <p style={{ margin: '0', fontSize: '0.8rem' }}>Ticket de Venta (Taquilla)</p>
              </div>
              <p style={{ margin: '5px 0' }}><strong>Pelicula:</strong> {selectedMovie.title}</p>
              <p style={{ margin: '5px 0' }}><strong>Sala:</strong> {selectedShowtime.room}</p>
              <p style={{ margin: '5px 0' }}><strong>Horario:</strong> {selectedShowtime.time}</p>
              <p style={{ margin: '5px 0' }}><strong>Asiento:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedSeat}</span></p>
              <div style={{ borderTop: '2px dashed #ccc', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>TOTAL:</span>
                <span>${roomInfo?.basePrice?.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  setMessage('');
                  setSelectedSeat(null);
                }} 
                style={{ width: '100%', padding: '10px', marginTop: '15px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                NUEVA VENTA
              </button>
            </div>
          ) : message ? (
            <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', border: `1px solid #ef4444` }}>
              {message}
            </div>
          ) : null}
        </div>

        {/* PANEL DERECHO: MAPA DE ASIENTOS MASIVO */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {!selectedShowtime ? (
            <div style={{ color: '#666', marginTop: '100px' }}>Selecciona una función para ver el mapa de asientos.</div>
          ) : loadingSeats || !roomInfo ? (
            <div style={{ color: '#666', marginTop: '100px' }}>Cargando arquitectura de la sala...</div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', background: 'linear-gradient(to bottom, rgba(96, 165, 250, 0.2), transparent)', borderTop: '3px solid #60a5fa', color: '#60a5fa', fontSize: '0.8rem', letterSpacing: '5px', padding: '8px 0 15px 0', marginBottom: '30px', borderRadius: '8px 8px 0 0' }}>
                PANTALLA
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {Array.from({ length: roomInfo.rows }).map((_, rIndex) => {
                  const rowName = String.fromCharCode(65 + rIndex);
                  return (
                    <div key={rowName} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <div style={{ width: '20px', fontSize: '0.8rem', color: '#888', fontWeight: 'bold', textAlign: 'right', marginRight: '10px' }}>{rowName}</div>
                      {Array.from({ length: roomInfo.cols }).map((_, cIndex) => {
                        const colNum = cIndex + 1;
                        const seatId = `${rowName}${colNum}`;
                        
                        // Check if seat is part of architecture (pasillo)
                        const isDisabled = roomInfo.disabledSeats?.includes(seatId);
                        if (isDisabled) {
                          return <div key={seatId} style={{ width: '35px', height: '35px' }} />; // Espacio vacío
                        }

                        const isOccupied = occupiedSeats.includes(seatId);
                        const isSelected = selectedSeat === seatId;
                        
                        let bg = 'rgba(255,255,255,0.05)';
                        let border = 'rgba(255,255,255,0.2)';
                        if (isOccupied) {
                          bg = '#3f1515';
                          border = '#ef4444';
                        } else if (isSelected) {
                          bg = '#60a5fa';
                          border = '#fff';
                        }

                        return (
                          <button
                            key={seatId}
                            disabled={isOccupied}
                            onClick={() => setSelectedSeat(seatId)}
                            style={{
                              width: '26px', height: '26px', borderRadius: '6px 6px 4px 4px', cursor: isOccupied ? 'not-allowed' : 'pointer',
                              background: bg, border: `1px solid ${border}`, position: 'relative'
                            }}
                            title={seatId}
                          >
                            <div style={{ position: 'absolute', bottom: '3px', left: '3px', right: '3px', height: '3px', background: isOccupied ? 'rgba(0,0,0,0.5)' : (isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)'), borderRadius: '2px' }} />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POS;

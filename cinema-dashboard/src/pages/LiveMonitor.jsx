import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BOOKING_SERVICE_URL.replace('/api/bookings', '');

const LiveMonitor = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    // Initial connection
    socket.on('connect', () => {
      setLogs(prev => [{
        id: Date.now(),
        type: 'SYSTEM',
        msg: '🟢 Conexión segura establecida con los servidores de Sockets (Booking).',
        time: new Date().toLocaleTimeString()
      }, ...prev]);
    });

    // Listen to real-time ticket sales
    socket.on('ticket_sold', (data) => {
      setLogs(prev => [{
        id: Date.now(),
        type: 'SALE',
        data,
        msg: `💸 BOLETO VENDIDO | Película ID: ${data.movieId.substring(0, 8)}... | Asiento: ${data.seatNumber} | Monto: $${data.price}`,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 50)); // Keep only last 50
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ padding: '30px', color: 'white', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Monitor de Transacciones en Vivo 🔴</h2>
        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          Conectado - Escuchando Eventos
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Este panel muestra los eventos emitidos por el clúster en tiempo real a través de WebSockets. 
        No es necesario recargar la página.
      </p>

      <div style={{ 
        background: '#0a0a0a', 
        border: '1px solid #333', 
        borderRadius: '12px', 
        padding: '20px',
        height: '60vh',
        overflowY: 'auto',
        fontFamily: 'monospace'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>
            Esperando transacciones...
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{ 
              marginBottom: '10px', 
              padding: '12px', 
              background: log.type === 'SALE' ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255,255,255,0.02)',
              borderLeft: `4px solid ${log.type === 'SALE' ? 'var(--gold)' : '#10b981'}`,
              borderRadius: '4px'
            }}>
              <span style={{ color: '#888', marginRight: '15px' }}>[{log.time}]</span>
              <span style={{ color: log.type === 'SALE' ? '#fff' : '#10b981' }}>{log.msg}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveMonitor;

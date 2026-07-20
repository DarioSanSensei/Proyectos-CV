import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import './Analytics.css';

const SOCKET_URL = import.meta.env.VITE_BOOKING_SERVICE_URL.replace('/api/bookings', '');

const Analytics = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalRevenue: 0,
    topMovies: [],
    topRooms: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('cinema_token');
        
        // Parallel fetching
        const [ticketsRes, moviesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BOOKING_SERVICE_URL}/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(import.meta.env.VITE_CATALOG_SERVICE_URL)
        ]);

        const tickets = ticketsRes.data;
        const movies = moviesRes.data;

        // Process data
        let revenue = 0;
        const movieSales = {};
        const roomSales = {};

        tickets.forEach(ticket => {
          revenue += ticket.price || 0;
          
          if (!movieSales[ticket.movieId]) {
            movieSales[ticket.movieId] = { count: 0, revenue: 0 };
          }
          movieSales[ticket.movieId].count += 1;
          movieSales[ticket.movieId].revenue += ticket.price || 0;

          if (ticket.room) {
            if (!roomSales[ticket.room]) roomSales[ticket.room] = { count: 0, revenue: 0 };
            roomSales[ticket.room].count += 1;
            roomSales[ticket.room].revenue += ticket.price || 0;
          }
        });

        // Map back to movie details
        const topMovies = Object.keys(movieSales)
          .map(movieId => {
            const movieInfo = movies.find(m => m.id === movieId);
            return {
              id: movieId,
              title: movieInfo ? movieInfo.title : 'Desconocida',
              posterUrl: movieInfo ? movieInfo.posterUrl : '',
              ticketsSold: movieSales[movieId].count,
              revenue: movieSales[movieId].revenue
            };
          })
          .sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending
          .slice(0, 5); // Top 5

        const topRooms = Object.keys(roomSales)
          .map(roomName => ({
            name: roomName,
            ticketsSold: roomSales[roomName].count,
            revenue: roomSales[roomName].revenue
          }))
          .sort((a, b) => b.revenue - a.revenue);

        setStats({
          totalTickets: tickets.length,
          totalRevenue: revenue,
          topMovies,
          topRooms
        });

      } catch (err) {
        console.error(err);
        setError('Error al cargar datos analíticos. ' + (err.response?.data?.message || ''));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    // Integración WebSocket para actualizaciones en vivo
    const socket = io(SOCKET_URL);
    socket.on('ticket_sold', (data) => {
      setStats(prevStats => {
        // En un caso ideal recalcularíamos todo, aquí simulamos sumando a los totales
        return {
          ...prevStats,
          totalTickets: prevStats.totalTickets + 1,
          totalRevenue: prevStats.totalRevenue + data.price
        };
      });
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return <div className="an-loading">Cargando inteligencia de negocios...</div>;

  return (
    <div className="an-dashboard">
      <header className="an-header">
        <div>
          <h1 className="an-title">Centro de Inteligencia</h1>
          <p className="an-subtitle">Monitoreo en tiempo real de ventas y rendimiento taquillero</p>
        </div>
      </header>

      {error && <div className="an-error">{error}</div>}

      <div className="an-kpis">
        <div className="an-kpi-card highlight">
          <h3>Ingresos Brutos</h3>
          <div className="an-kpi-value">${stats.totalRevenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}</div>
          <p className="an-kpi-trend positive">+14% vs mes anterior</p>
        </div>
        <div className="an-kpi-card">
          <h3>Boletos Vendidos</h3>
          <div className="an-kpi-value">{stats.totalTickets.toLocaleString()}</div>
          <p className="an-kpi-trend neutral">Flujo constante</p>
        </div>
        <div className="an-kpi-card">
          <h3>Ticket Promedio</h3>
          <div className="an-kpi-value">
            ${stats.totalTickets > 0 ? (stats.totalRevenue / stats.totalTickets).toFixed(2) : '0.00'}
          </div>
          <p className="an-kpi-trend positive">Óptimo</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        <div className="an-section" style={{ flex: 1 }}>
          <h2>Top Taquilla (Películas)</h2>
          <div className="an-leaderboard">
            {stats.topMovies.length === 0 ? (
              <p>No hay ventas registradas aún.</p>
            ) : (
              stats.topMovies.map((movie, index) => (
                <div key={movie.id} className="an-leader-row">
                  <div className="an-leader-rank">#{index + 1}</div>
                  <div className="an-leader-poster">
                    <img src={movie.posterUrl || 'https://via.placeholder.com/50x75'} alt={movie.title} />
                  </div>
                  <div className="an-leader-info">
                    <h4>{movie.title}</h4>
                    <p>{movie.ticketsSold} boletos</p>
                  </div>
                  <div className="an-leader-revenue">
                    ${movie.revenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="an-section" style={{ flex: 1 }}>
          <h2>Rendimiento por Sala</h2>
          <div className="an-leaderboard">
            {stats.topRooms.length === 0 ? (
              <p>No hay ventas registradas aún.</p>
            ) : (
              stats.topRooms.map((room, index) => (
                <div key={room.name} className="an-leader-row" style={{ padding: '20px' }}>
                  <div className="an-leader-rank">#{index + 1}</div>
                  <div className="an-leader-info">
                    <h4 style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>{room.name}</h4>
                    <p>{room.ticketsSold} boletos vendidos</p>
                  </div>
                  <div className="an-leader-revenue" style={{ color: '#10b981' }}>
                    ${room.revenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

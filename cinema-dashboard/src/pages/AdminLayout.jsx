import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('cinema_token');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          CINE<span>SANZA</span>
          <div className="admin-badge">WORKSPACE</div>
        </div>

        <nav className="admin-nav">
          <Link 
            to="/dashboard" 
            className={`admin-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <span className="icon">🎬</span>
            Catálogo y Programación
          </Link>
          <Link 
            to="/rooms" 
            className={`admin-nav-item ${location.pathname === '/rooms' ? 'active' : ''}`}
          >
            <span className="icon">🪑</span>
            Gestor de Salas
          </Link>
          <Link 
            to="/analytics" 
            className={`admin-nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            <span className="icon">📊</span>
            Inteligencia
          </Link>
          <Link 
            to="/monitor" 
            className={`admin-nav-item ${location.pathname === '/monitor' ? 'active' : ''}`}
          >
            <span className="icon">🔴</span>
            Monitor Vivo
          </Link>
          <Link 
            to="/concessions" 
            className={`admin-nav-item ${location.pathname === '/concessions' ? 'active' : ''}`}
          >
            <span className="icon">🍿</span>
            Dulcería
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/pos" className="admin-nav-item" style={{ color: '#60a5fa' }}>
            <span className="icon">💻</span>
            Terminal POS
          </Link>
          <Link to="/cartelera" className="admin-nav-item" style={{ color: '#d4af37' }}>
            <span className="icon">👁️</span>
            Vista Cliente
          </Link>
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import PublicCatalog from './pages/PublicCatalog';
import MyTickets from './pages/MyTickets';
import Analytics from './pages/Analytics';
import AdminLayout from './pages/AdminLayout';
import LiveMonitor from './pages/LiveMonitor';
import RoomManager from './pages/RoomManager';
import ConcessionAdmin from './pages/ConcessionAdmin';
import { getUserRole } from './utils/authUtils';

// Importar CSS Globales
import './pages/Cinepolis.css';
import './App.css';

// Escudo con lógica de roles
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('cinema_token');
  const role = getUserRole();

  if (!token) return <Navigate to="/login" />;
  
  // Si la ruta requiere un rol específico y el usuario no lo tiene, al Dashboard (o login si ni al dashboard puede)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Cartelera pública para cualquier cliente o visitante */}
        <Route path="/cartelera" element={<PublicCatalog />} />

        {/* Billetera del Cliente */}
        <Route path="/mis-boletos" element={<MyTickets />} />
        
        {/* RUTAS DE ADMINISTRACIÓN (Con Sidebar) */}
        <Route element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><AdminLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms" element={<RoomManager />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/monitor" element={<LiveMonitor />} />
          <Route path="/concessions" element={<ConcessionAdmin />} />
        </Route>

        {/* POS accesible solo para ADMIN, MANAGER y POS */}
        <Route path="/pos" element={
          <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'POS']}>
            <POS />
          </PrivateRoute>
        } />
        
        {/* Cartelera pública para cualquier cliente o visitante */}
        <Route path="/cartelera" element={<PublicCatalog />} />
        
        <Route path="/" element={<Navigate to="/cartelera" />} />
        <Route path="*" element={<Navigate to="/cartelera" />} />
      </Routes>
    </Router>
  );
}

export default App;

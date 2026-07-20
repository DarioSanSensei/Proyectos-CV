import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Impactamos el microservicio de Auth (Puerto 3001)
      const response = await axios.post(`${import.meta.env.VITE_AUTH_SERVICE_URL}/login`, {
        email,
        password
      });

      // Si Postgres nos da el visto bueno, extraemos el token
      const token = response.data.token;
      
      // Lo resguardamos en la bóveda del navegador
      localStorage.setItem('cinema_token', token);
      
      // Leemos el rol para saber a dónde mandarlo
      const decoded = jwtDecode(token);
      if (decoded.role === 'ADMIN' || decoded.role === 'MANAGER') {
        navigate('/dashboard');
      } else if (decoded.role === 'POS') {
        navigate('/pos');
      } else {
        // Si es CLIENT (o cualquier otro), lo mandamos a la Vista Pública
        navigate('/cartelera');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Fallo crítico al intentar conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card">
        <h2>CINEMA ADMIN</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              className="glass-input"
              placeholder="admin@cinema.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="glass-btn" disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'INGRESAR AL SISTEMA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

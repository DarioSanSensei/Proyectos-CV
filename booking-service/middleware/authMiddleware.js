const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 🎯 LA CLAVE: Extraemos el ID y Rol de Postgres y lo pegamos en la petición
            req.user = { id: decoded.id, role: decoded.role }; 
            
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Firma de token inválida o expirada.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Se requiere autenticación.' });
    }
};

// Middleware para autorizar roles específicos (RBAC)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}` });
        }
        next();
    };
};

module.exports = { protect, authorize };

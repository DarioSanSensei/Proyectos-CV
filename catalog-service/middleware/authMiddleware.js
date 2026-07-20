const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Verificamos si la petición trae la cabecera de Autorización con formato Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraemos solo el token (quitamos la palabra "Bearer ")
            token = req.headers.authorization.split(' ')[1];
            
            // Verificamos la firma usando tu JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = decoded; // Guardamos el payload en la request
            
            // Si es válido, dejamos pasar la petición al controlador
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Acceso denegado. El token es inválido o ha expirado.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se detectó un token de seguridad.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user viene del paso anterior donde verificamos el JWT
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Acceso denegado: No tienes permisos suficientes." });
        }
        next();
    };
};

module.exports = { protect, authorize };

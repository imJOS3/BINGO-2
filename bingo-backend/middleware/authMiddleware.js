import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.id;
        req.nickname = decoded.nickname;
        next();
    });
};

/** Usa el JWT si viene; si no, deja pasar (compatibilidad con frontend actual). */
export const optionalAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err && decoded) {
            req.userId = decoded.id;
            req.nickname = decoded.nickname;
        }
        next();
    });
};

import jwt from 'jsonwebtoken';

// Verifies the JWT locally so every request doesn't need a network round
// trip to a user-service. Requires all services to share JWT_SECRET
// (or, better, verify with a public key if user-service signs with RS256).
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 401, message: 'Access token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ status: 403, message: 'Invalid or expired token' });
        }
        req.user = decoded; // expects { id, ... } same shape as the monolith
        next();
    });
};

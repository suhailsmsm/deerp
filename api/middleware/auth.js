const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const generateToken = (userId, tenantId, expiresIn = '24h') => {
  return jwt.sign(
    { userId, tenantId },
    JWT_SECRET,
    { expiresIn }
  );
};

const generateRefreshToken = (userId, tenantId) => {
  return jwt.sign(
    { userId, tenantId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { authMiddleware, generateToken, generateRefreshToken };

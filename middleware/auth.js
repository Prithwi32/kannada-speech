// middleware/auth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "default_jwt_secret_change_in_production";

// Generate JWT token
function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
}

// Verify JWT token middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { generateToken, verifyToken };

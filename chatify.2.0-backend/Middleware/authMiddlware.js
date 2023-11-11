const jwt = require('jsonwebtoken');

// Middleware function to authenticate requests
const authenticate = (req, res, next) => {
  // Get the token from the request headers or query parameters
  const token = req.headers.authorization || req.query.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded; // Add the user information to the request

    next(); // Proceed to the next middleware or route
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Failed to authenticate token.' });
  }
};

module.exports = authenticate;
